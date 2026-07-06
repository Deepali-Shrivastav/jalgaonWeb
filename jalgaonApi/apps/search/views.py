from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from apps.directory.models import ShopListing, MainCategory
from apps.directory.views import ListingSearchView
from apps.directory.serializers import ListingListSerializer
from .models import SearchQuery

# Re-export the proper full-text search view
ShopSearchView = ListingSearchView


class SearchAutocompleteView(APIView):
    """
    GET /api/v1/search/autocomplete/?q=<query>&limit=8
    Returns business name and category suggestions for typeahead.
    FR-SRCH-03: Autocomplete suggestions as user types.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        limit = min(int(request.query_params.get('limit', 8)), 15)

        if len(q) < 2:
            return Response({'businesses': [], 'categories': []})

        # Business suggestions
        businesses = (
            ShopListing.objects
            .filter(status='active', business_name__icontains=q)
            .values('business_name', 'slug', 'main_category__main_category')
            .order_by('-is_trending', '-avg_rating')
            [:limit]
        )

        # Category suggestions
        categories = (
            MainCategory.objects
            .filter(main_category__icontains=q)
            .values('main_category', 'slug')
            [:4]
        )

        return Response({
            'businesses': list(businesses),
            'categories': list(categories),
        })


class PopularSearchesView(APIView):
    """
    GET /api/v1/search/popular/?limit=8
    Returns top searched queries.
    FR-SRCH-06: Popular searches displayed below empty search bar.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 8)), 20)
        from django.utils import timezone
        from datetime import timedelta
        
        # Filter popular searches from the last 30 days
        cutoff = timezone.now() - timedelta(days=30)
        popular = (
            SearchQuery.objects
            .filter(last_searched__gte=cutoff)
            .order_by('-count', '-last_searched')
            .values_list('query', flat=True)[:limit]
        )
        
        # Fallback: if no recent searches, return all-time top
        if not popular:
            popular = SearchQuery.objects.order_by('-count', '-last_searched').values_list('query', flat=True)[:limit]
            
        return Response({'popular': list(popular)})


class SubcategoryChipsView(APIView):
    """
    GET /api/v1/search/subcategories/?category=<slug>
    Returns subcategories for a given main category slug.
    FR-SRCH-08: Used to populate subcategory filter chips.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category_slug = request.query_params.get('category', '').strip()
        from apps.directory.models import SubCategory
        
        qs = SubCategory.objects.all()
        if category_slug:
            qs = qs.filter(main_category__slug=category_slug)
            
        data = qs.values('sub_category', 'slug')
        return Response({'subcategories': list(data)})
