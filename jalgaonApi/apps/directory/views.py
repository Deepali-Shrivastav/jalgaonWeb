from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import Cos, Sin, Radians, ACos
from .models import MainCategory, SubCategory, ShopListing, LikedShops, BusinessPhoto, BusinessClaim, BusinessReport
from apps.reviews.models import ShopReview
from apps.reviews.serializers import ShopReviewSerializer, ShopReviewCreateSerializer
from .serializers import (
    MainCategorySerializer, SubCategorySerializer, ListingListSerializer,
    ListingDetailSerializer, ShopListingCreateSerializer, LikedShopsSerializer,
    LikedShopsCreateSerializer, BusinessPhotoSerializer, BusinessClaimSerializer,
    BusinessReportSerializer
)
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = MainCategory.objects.all().order_by('sort_order')
    serializer_class = MainCategorySerializer
    pagination_class = None

class ListingListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ListingListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = ShopListing.objects.filter(status='active')
        category_slug = self.request.query_params.get('category', None)
        subcategory_slug = self.request.query_params.get('subcategory', None)
        sort_by = self.request.query_params.get('sort', 'newest')
        
        if category_slug:
            queryset = queryset.filter(main_category__slug=category_slug)
        if subcategory_slug:
            queryset = queryset.filter(sub_category__slug=subcategory_slug)
            
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 10)

        if lat and lng:
            try:
                lat_float = float(lat)
                lng_float = float(lng)
                radius_float = float(radius)
                queryset = queryset.exclude(lat__isnull=True).exclude(lng__isnull=True).annotate(
                    distance=ExpressionWrapper(
                        6371.0 * ACos(
                            Cos(Radians(lat_float)) * Cos(Radians('lat')) * Cos(Radians('lng') - Radians(lng_float)) +
                            Sin(Radians(lat_float)) * Sin(Radians('lat'))
                        ),
                        output_field=FloatField()
                    )
                ).filter(distance__lte=radius_float)
                
                if sort_by == 'distance':
                    queryset = queryset.order_by('distance')
            except ValueError:
                pass

        if sort_by == 'rating':
            queryset = queryset.order_by('-avg_rating', '-review_count')
        elif sort_by == 'trending':
            queryset = queryset.order_by('-trending_priority', '-created_at')
        elif sort_by != 'distance':
            # default to newest
            queryset = queryset.order_by('-created_at')
            
        return queryset

class ListingSearchView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ListingListSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        q = self.request.query_params.get('q', '')
        category = self.request.query_params.get('category', '')
        subcategory = self.request.query_params.get('subcategory', '')
        sort_by = self.request.query_params.get('sort', 'relevance')
        
        # Record search query count for Popular Searches
        if q:
            from apps.search.models import SearchQuery
            SearchQuery.record(q)
            
            # Passive analytics event tracking
            try:
                from apps.analytics.models import AnalyticsEvent
                from apps.analytics.utils import get_client_ip
                AnalyticsEvent.objects.create(
                    event_type='listing_search',
                    search_query=q,
                    user=self.request.user if self.request.user.is_authenticated else None,
                    ip_address=get_client_ip(self.request),
                    user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
                    session_id=self.request.session.session_key or ''
                )
            except Exception:
                pass

        queryset = ShopListing.objects.filter(status='active')
        
        if category:
            queryset = queryset.filter(main_category__slug=category)
            
        if subcategory:
            queryset = queryset.filter(sub_category__slug=subcategory)
            
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 10)

        if lat and lng:
            try:
                lat_float = float(lat)
                lng_float = float(lng)
                radius_float = float(radius)
                queryset = queryset.exclude(lat__isnull=True).exclude(lng__isnull=True).annotate(
                    distance=ExpressionWrapper(
                        6371.0 * ACos(
                            Cos(Radians(lat_float)) * Cos(Radians('lat')) * Cos(Radians('lng') - Radians(lng_float)) +
                            Sin(Radians(lat_float)) * Sin(Radians('lat'))
                        ),
                        output_field=FloatField()
                    )
                ).filter(distance__lte=radius_float)
            except ValueError:
                pass

        if q:
            # Expand query with synonyms (FR-SRCH-07)
            from apps.search.models import SearchSynonym
            try:
                term_clean = q.strip().lower()
                
                # Simple normalization (stemming) to handle basic plurals
                normalized_q = term_clean
                if term_clean.endswith('ies') and len(term_clean) > 4:
                    normalized_q = term_clean[:-3] + 'y'   # pharmacies -> pharmacy
                elif term_clean.endswith('ves') and len(term_clean) > 4:
                    normalized_q = term_clean[:-3] + 'f'   # knives -> knife
                elif term_clean.endswith('es') and len(term_clean) > 3:
                    normalized_q = term_clean[:-2]          # clinics -> clinic
                elif term_clean.endswith('s') and len(term_clean) > 3:
                    normalized_q = term_clean[:-1]          # doctors -> doctor

                synonym_obj = SearchSynonym.objects.filter(
                    is_active=True
                ).filter(
                    Q(term__iexact=term_clean) | Q(term__iexact=normalized_q)
                ).first()
                
                if synonym_obj:
                    all_terms = [q] + synonym_obj.synonyms
                else:
                    all_terms = [q]
            except Exception:
                all_terms = [q]

            # Try PostgreSQL trigram similarity for typo tolerance (FR-SRCH-02)
            # Fall back to standard icontains if pg_trgm is not active/available (e.g. SQLite)
            try:
                from django.contrib.postgres.search import TrigramSimilarity
                queryset = queryset.annotate(
                    name_sim=TrigramSimilarity('business_name', q),
                    desc_sim=TrigramSimilarity('business_description', q),
                )
                
                q_filter = Q()
                for term in all_terms:
                    q_filter |= (
                        Q(name_sim__gte=0.15) |
                        Q(desc_sim__gte=0.10) |
                        Q(business_name__icontains=term) |
                        Q(business_description__icontains=term) |
                        Q(main_category__main_category__icontains=term) |
                        Q(sub_category__sub_category__icontains=term)
                    )
                queryset = queryset.filter(q_filter)
            except Exception:
                # Standard icontains fallback (compatible with SQLite)
                q_filter = Q()
                for term in all_terms:
                    q_filter |= (
                        Q(business_name__icontains=term) |
                        Q(business_description__icontains=term) |
                        Q(main_category__main_category__icontains=term) |
                        Q(sub_category__sub_category__icontains=term)
                    )
                queryset = queryset.filter(q_filter)
        elif not category and not (lat and lng):
            # If neither q, category, nor location is provided, return empty
            return ShopListing.objects.none()
            
        if lat and lng:
            if sort_by == 'distance':
                return queryset.order_by('distance', '-avg_rating')
            elif sort_by == 'rating':
                return queryset.order_by('-avg_rating', '-review_count', 'distance')
            elif sort_by == 'newest':
                return queryset.order_by('-created_at', 'distance')
            else: # relevance
                return queryset.order_by('-is_trending', 'distance', '-avg_rating')
        else:
            if sort_by == 'rating':
                return queryset.order_by('-avg_rating', '-review_count')
            elif sort_by == 'newest':
                return queryset.order_by('-created_at')
            else: # relevance (default)
                return queryset.order_by('-is_trending', '-avg_rating', '-created_at')


class TrendingListingsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ListingListSerializer
    pagination_class = None

    def get_queryset(self):
        return ShopListing.objects.filter(
            status='active', 
            is_trending=True
        ).order_by('-trending_priority', '-created_at')[:10]

class ListingDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ListingDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ShopListing.objects.filter(Q(status='active') | Q(user=self.request.user) | Q(status='pending', user=self.request.user) | Q(status='rejected', user=self.request.user))
        return ShopListing.objects.filter(status='active')

    def get_object(self):
        obj = super().get_object()
        # Increment views only if active
        if obj.status == 'active':
            obj.views += 1
            obj.save(update_fields=['views'])
            
            # Passive analytics event tracking
            try:
                from apps.analytics.models import AnalyticsEvent
                from apps.analytics.utils import get_client_ip
                AnalyticsEvent.objects.create(
                    event_type='listing_view',
                    listing=obj,
                    user=self.request.user if self.request.user.is_authenticated else None,
                    ip_address=get_client_ip(self.request),
                    user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
                    session_id=self.request.session.session_key or ''
                )
            except Exception:
                pass
        return obj

class ListingCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopListingCreateSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ListingUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopListingCreateSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_staff_role:
            return ShopListing.objects.all()
        return ShopListing.objects.filter(user=self.request.user)

class ListingDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_staff_role:
            return ShopListing.objects.all()
        return ShopListing.objects.filter(user=self.request.user)

# --- Reviews ---

class ListingReviewListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ShopReviewSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        user = self.request.user
        if user.is_authenticated:
            shop = ShopListing.objects.filter(slug=slug).first()
            if shop and shop.user == user:
                return ShopReview.objects.filter(shop_listing__slug=slug).order_by('-timestamp')
        return ShopReview.objects.filter(shop_listing__slug=slug, status='approved').order_by('-timestamp')

class ReviewManageView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopReviewSerializer

    def get_queryset(self):
        return ShopReview.objects.filter(shop_listing__user=self.request.user)

    def perform_update(self, serializer):
        status_val = self.request.data.get('status')
        instance = serializer.save()
        if status_val in ['approved', 'pending', 'rejected']:
            instance.status = status_val
            instance.save()


class ListingReviewCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopReviewCreateSerializer

    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        shop = get_object_or_404(ShopListing, slug=slug, status='active')
        serializer.save(user=self.request.user, shop_listing=shop, status='approved')

# --- Favorites / Liked Shops ---

class LikedShopsView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return LikedShops.objects.select_related('shop_listing', 'shop_listing__main_category').filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LikedShopsCreateSerializer
        return LikedShopsSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            shop_id = serializer.validated_data['shop_listing_id']
            shop = get_object_or_404(ShopListing, id=shop_id)
            if LikedShops.objects.filter(user=request.user, shop_listing=shop).exists():
                return Response({"error": "Already liked"}, status=400)
            liked_shop = LikedShops.objects.create(user=request.user, shop_listing=shop)
            return Response(LikedShopsSerializer(liked_shop).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        shop_id = request.data.get('shop_listing_id') or request.query_params.get('shop_listing_id')
        if not shop_id:
            return Response({"error": "shop_listing_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        liked_shop = LikedShops.objects.filter(user=request.user, shop_listing_id=shop_id).first()
        if not liked_shop:
            return Response({"error": "Not favorited"}, status=status.HTTP_404_NOT_FOUND)
        liked_shop.delete()
        return Response({"message": "Successfully removed from favorites"}, status=status.HTTP_200_OK)

class UserListedShops(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ListingListSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        return ShopListing.objects.filter(user=self.request.user).order_by('-created_at')

class UserBusinessReviewsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopReviewSerializer

    def get_queryset(self):
        return ShopReview.objects.filter(shop_listing__user=self.request.user).order_by('-timestamp')

class BusinessClaimCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BusinessClaimSerializer

    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        shop = get_object_or_404(ShopListing, slug=slug, status='active')
        
        # Check if already claimed
        if shop.is_claimed:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("This business is already claimed.")
            
        # Check if user already has a pending claim for this shop
        if BusinessClaim.objects.filter(shop_listing=shop, user=self.request.user, status='pending').exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have a pending claim for this business.")

        serializer.save(user=self.request.user, shop_listing=shop)

class BusinessReportCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BusinessReportSerializer

    def perform_create(self, serializer):
        slug = self.kwargs.get('slug')
        shop = get_object_or_404(ShopListing, slug=slug, status='active')
        
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(reported_by=user, shop_listing=shop)
