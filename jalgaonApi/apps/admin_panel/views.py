from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q

from apps.directory.models import MainCategory, SubCategory, ShopListing
from core.permissions import IsAdminRole, IsSuperAdmin, IsModerator, IsContentManager
from .models import AdminSetting, ModerationQueue
from .serializers import (
    DashboardStatsSerializer,
    AdminUserListSerializer, AdminUserDetailSerializer, AdminUserRoleSerializer,
    AdminListingSerializer, AdminListingActionSerializer,
    AdminCategoryCreateSerializer, AdminSubCategorySerializer,
    ModerationQueueSerializer, ModerationActionSerializer,
    AdminSettingSerializer, AdminBusinessClaimSerializer,
    AdminBusinessReportSerializer
)
from apps.ads.models import AdsListing, AdSlot
from apps.ads.serializers import AdsListingSerializer, AdSlotSerializer
from apps.audit.utils import log_audit_action

User = get_user_model()


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ──────────────────────────────────────────────
# Dashboard Stats
# ──────────────────────────────────────────────

class DashboardStatsView(APIView):
    """GET /api/v1/admin-panel/stats/ — Aggregated dashboard stats."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        data = {
            'total_users': User.objects.count(),
            'total_listings': ShopListing.objects.count(),
            'approved_listings': ShopListing.objects.filter(status='active').count(),
            'pending_listings': ShopListing.objects.filter(status='pending').count(),
            'total_categories': MainCategory.objects.count(),
            'pending_moderation': ModerationQueue.objects.filter(status='pending').count(),
            'total_ads': AdsListing.objects.count(),
            'pending_ads': AdsListing.objects.filter(status='pending').count(),
            'active_ads': AdsListing.objects.filter(status='active').count(),
        }
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)



# ──────────────────────────────────────────────
# User Management
# ──────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/users/ — Paginated user list with search."""
    permission_classes = [IsAdminRole]
    serializer_class = AdminUserListSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(phone_number__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        role = self.request.query_params.get('role', '').strip()
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminUserDetailView(APIView):
    """
    GET  /api/v1/admin-panel/users/<id>/ — User detail.
    PATCH /api/v1/admin-panel/users/<id>/ — Update user fields (is_active, name, etc.)
    """
    permission_classes = [IsAdminRole]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminUserDetailSerializer(user)
        return Response(serializer.data)

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminUserDetailSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_audit_action(
                actor=request.user,
                action='update_user',
                target_type='User',
                target_id=user.id,
                changes=serializer.validated_data,
                request=request
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserRoleView(APIView):
    """PATCH /api/v1/admin-panel/users/<id>/role/ — Change user role (super_admin only)."""
    permission_classes = [IsSuperAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.id == request.user.id:
            return Response(
                {'error': 'You cannot change your own role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AdminUserRoleSerializer(data=request.data)
        if serializer.is_valid():
            old_role = user.role
            user.role = serializer.validated_data['role']
            user.save(update_fields=['role', 'is_staff', 'is_superuser'])
            
            log_audit_action(
                actor=request.user,
                action='change_user_role',
                target_type='User',
                target_id=user.id,
                changes={'old_role': old_role, 'new_role': user.role},
                request=request
            )
            
            return Response({
                'message': f"Role updated to '{user.get_role_display()}'",
                'user': AdminUserListSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ──────────────────────────────────────────────
# Listing Management
# ──────────────────────────────────────────────

class AdminListingListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/listings/ — All listings with filters."""
    permission_classes = [IsAdminRole]
    serializer_class = AdminListingSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = ShopListing.objects.select_related(
            'user', 'main_category', 'sub_category'
        ).order_by('-id')

        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(business_name__icontains=search) |
                Q(business_address__icontains=search) |
                Q(user__phone_number__icontains=search)
            )

        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter == 'approved' or status_filter == 'active':
            qs = qs.filter(status='active')
        elif status_filter == 'pending':
            qs = qs.filter(status='pending')
        elif status_filter == 'rejected':
            qs = qs.filter(status='rejected')

        trending_filter = self.request.query_params.get('trending', '').strip()
        if trending_filter == 'true':
            qs = qs.filter(is_trending=True).order_by('-trending_priority')

        category = self.request.query_params.get('category', '').strip()
        if category:
            qs = qs.filter(main_category_id=category)

        return qs


class AdminListingActionView(APIView):
    """
    GET    /api/v1/admin-panel/listings/<id>/ — Single listing detail.
    PATCH  /api/v1/admin-panel/listings/<id>/ — Approve or reject a listing.
    DELETE /api/v1/admin-panel/listings/<id>/ — Delete a listing.
    """
    permission_classes = [IsAdminRole]

    def get(self, request, listing_id):
        try:
            listing = ShopListing.objects.select_related(
                'user', 'main_category', 'sub_category'
            ).get(id=listing_id)
        except ShopListing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)
        from apps.directory.serializers import ListingDetailSerializer
        serializer = ListingDetailSerializer(listing)
        return Response(serializer.data)

    def patch(self, request, listing_id):
        try:
            listing = ShopListing.objects.get(id=listing_id)
        except ShopListing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminListingActionSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action']
            if action == 'approve':
                listing.status = 'active'
                listing.save(update_fields=['status'])
                
                log_audit_action(
                    actor=request.user,
                    action='approve_listing',
                    target_type='ShopListing',
                    target_id=listing.id,
                    request=request
                )
                
                return Response({'message': 'Listing approved', 'status': 'active'})
            elif action == 'reject':
                listing.status = 'rejected'
                listing.save(update_fields=['status'])
                
                reason = serializer.validated_data.get('rejection_reason', '')
                log_audit_action(
                    actor=request.user,
                    action='reject_listing',
                    target_type='ShopListing',
                    target_id=listing.id,
                    changes={'reason': reason},
                    request=request
                )
                
                return Response({
                    'message': 'Listing rejected',
                    'status': 'rejected',
                    'reason': reason
                })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, listing_id):
        try:
            listing = ShopListing.objects.get(id=listing_id)
        except ShopListing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)
            
        log_audit_action(
            actor=request.user,
            action='delete_listing',
            target_type='ShopListing',
            target_id=listing.id,
            changes={'business_name': listing.business_name},
            request=request
        )
        
        listing.delete()
        return Response({'message': 'Listing deleted'}, status=status.HTTP_204_NO_CONTENT)

class AdminTrendingActionView(APIView):
    """
    PATCH /api/v1/admin-panel/listings/<id>/trending/ — Manage trending status
    """
    permission_classes = [IsAdminRole]

    def patch(self, request, listing_id):
        try:
            listing = ShopListing.objects.get(id=listing_id)
        except ShopListing.DoesNotExist:
            return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

        is_trending = request.data.get('is_trending', listing.is_trending)
        trending_priority = request.data.get('trending_priority', listing.trending_priority)
        trending_until = request.data.get('trending_until', listing.trending_until)

        listing.is_trending = is_trending
        listing.trending_priority = trending_priority
        if trending_until:
            listing.trending_until = trending_until
        elif is_trending == False:
            listing.trending_until = None

        listing.save(update_fields=['is_trending', 'trending_priority', 'trending_until'])

        log_audit_action(
            actor=request.user,
            action='update_trending',
            target_type='ShopListing',
            target_id=listing.id,
            changes={'is_trending': is_trending, 'trending_priority': trending_priority},
            request=request
        )

        return Response({'message': 'Trending status updated successfully'})


# ──────────────────────────────────────────────
# Category Management
# ──────────────────────────────────────────────

class AdminCategoryListView(APIView):
    """
    GET  /api/v1/admin-panel/categories/ — All categories with subcategories count.
    POST /api/v1/admin-panel/categories/ — Create a new category.
    """
    permission_classes = [IsAdminRole]

    def get(self, request):
        categories = MainCategory.objects.select_related('category_img').all().order_by('id')
        data = []
        for cat in categories:
            sub_count = SubCategory.objects.filter(main_category=cat).count()
            data.append({
                'id': cat.id,
                'main_category': cat.main_category,
                'category_img': cat.category_img.category_img.url if cat.category_img and cat.category_img.category_img else None,
                'subcategories_count': sub_count,
            })
        return Response(data)

    def post(self, request):
        data = request.data.copy()
        
        # Handle file upload for category image
        if 'category_img' in request.FILES:
            from apps.directory.models import CategoryImg
            img_file = request.FILES['category_img']
            cat_img = CategoryImg.objects.create(
                category_img=img_file,
                img_name=data.get('main_category', 'Category Image')
            )
            data['category_img'] = cat_img.id
            
        serializer = AdminCategoryCreateSerializer(data=data)
        if serializer.is_valid():
            category = serializer.save()
            log_audit_action(
                actor=request.user,
                action='create_category',
                target_type='MainCategory',
                target_id=category.id,
                changes=serializer.validated_data,
                request=request
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCategoryDetailView(APIView):
    """
    PATCH  /api/v1/admin-panel/categories/<id>/ — Update category.
    DELETE /api/v1/admin-panel/categories/<id>/ — Delete category.
    GET    /api/v1/admin-panel/categories/<id>/ — Category detail with subcategories.
    """
    permission_classes = [IsAdminRole]

    def get(self, request, category_id):
        try:
            category = MainCategory.objects.select_related('category_img').get(id=category_id)
        except MainCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        subcategories = SubCategory.objects.filter(main_category=category)
        sub_serializer = AdminSubCategorySerializer(subcategories, many=True)
        return Response({
            'id': category.id,
            'main_category': category.main_category,
            'category_img': category.category_img.category_img.url if category.category_img and category.category_img.category_img else None,
            'subcategories': sub_serializer.data,
        })

    def patch(self, request, category_id):
        try:
            category = MainCategory.objects.get(id=category_id)
        except MainCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        
        # Handle file upload for category image if provided
        if 'category_img' in request.FILES:
            from apps.directory.models import CategoryImg
            img_file = request.FILES['category_img']
            cat_img = CategoryImg.objects.create(
                category_img=img_file,
                img_name=data.get('main_category', category.main_category)
            )
            data['category_img'] = cat_img.id

        serializer = AdminCategoryCreateSerializer(category, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_audit_action(
                actor=request.user,
                action='update_category',
                target_type='MainCategory',
                target_id=category.id,
                changes=serializer.validated_data,
                request=request
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, category_id):
        try:
            category = MainCategory.objects.get(id=category_id)
        except MainCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        listings_count = ShopListing.objects.filter(main_category=category).count()
        if listings_count > 0:
            return Response(
                {'error': f'Cannot delete: {listings_count} listings use this category'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        log_audit_action(
            actor=request.user,
            action='delete_category',
            target_type='MainCategory',
            target_id=category.id,
            changes={'main_category': category.main_category},
            request=request
        )
        category.delete()
        return Response({'message': 'Category deleted'}, status=status.HTTP_204_NO_CONTENT)

# ──────────────────────────────────────────────
# SubCategory Management
# ──────────────────────────────────────────────

class AdminSubCategoryListView(APIView):
    """
    POST /api/v1/admin-panel/subcategories/ — Create a new subcategory.
    """
    permission_classes = [IsAdminRole]

    def post(self, request):
        data = request.data.copy()
        
        # Handle file upload for subcategory image
        if 'sub_category_img' not in request.FILES:
            return Response({'error': 'Subcategory image is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = AdminSubCategorySerializer(data=data)
        if serializer.is_valid():
            subcategory = serializer.save()
            log_audit_action(
                actor=request.user,
                action='create_subcategory',
                target_type='SubCategory',
                target_id=subcategory.id,
                changes={'sub_category': subcategory.sub_category, 'main_category': subcategory.main_category.id},
                request=request
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminSubCategoryDetailView(APIView):
    """
    PATCH  /api/v1/admin-panel/subcategories/<id>/ — Update subcategory.
    DELETE /api/v1/admin-panel/subcategories/<id>/ — Delete subcategory.
    """
    permission_classes = [IsAdminRole]

    def patch(self, request, subcategory_id):
        try:
            subcategory = SubCategory.objects.get(id=subcategory_id)
        except SubCategory.DoesNotExist:
            return Response({'error': 'SubCategory not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminSubCategorySerializer(subcategory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_audit_action(
                actor=request.user,
                action='update_subcategory',
                target_type='SubCategory',
                target_id=subcategory.id,
                changes={'sub_category': subcategory.sub_category},
                request=request
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, subcategory_id):
        try:
            subcategory = SubCategory.objects.get(id=subcategory_id)
        except SubCategory.DoesNotExist:
            return Response({'error': 'SubCategory not found'}, status=status.HTTP_404_NOT_FOUND)

        listings_count = ShopListing.objects.filter(sub_category=subcategory).count()
        if listings_count > 0:
            return Response(
                {'error': f'Cannot delete: {listings_count} listings use this subcategory'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        log_audit_action(
            actor=request.user,
            action='delete_subcategory',
            target_type='SubCategory',
            target_id=subcategory.id,
            changes={'sub_category': subcategory.sub_category},
            request=request
        )
        subcategory.delete()
        return Response({'message': 'SubCategory deleted'}, status=status.HTTP_204_NO_CONTENT)

# ──────────────────────────────────────────────
# Moderation Queue
# ──────────────────────────────────────────────

class ModerationListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/moderation/ — Paginated moderation queue."""
    permission_classes = [IsModerator]
    serializer_class = ModerationQueueSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = ModerationQueue.objects.select_related(
            'content_type', 'submitted_by', 'reviewed_by'
        ).order_by('-submitted_at')

        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            # Default: show pending items first
            qs = qs.filter(status='pending')

        content_type = self.request.query_params.get('type', '').strip()
        if content_type:
            qs = qs.filter(content_type__model=content_type)

        return qs


class ModerationActionView(APIView):
    """PATCH /api/v1/admin-panel/moderation/<id>/ — Approve or reject a queued item."""
    permission_classes = [IsModerator]

    def patch(self, request, item_id):
        try:
            item = ModerationQueue.objects.select_related('content_type').get(id=item_id)
        except ModerationQueue.DoesNotExist:
            return Response({'error': 'Moderation item not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ModerationActionSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action']
            item.reviewed_by = request.user
            item.reviewed_at = timezone.now()
            item.notes = serializer.validated_data.get('notes', '')

            if action == 'approve':
                item.status = 'approved'
                content_obj = item.content_object
                if content_obj:
                    if hasattr(content_obj, 'status'):
                        if type(content_obj).__name__ == 'ShopListing':
                            content_obj.status = 'active'
                        else:
                            content_obj.status = 'approved'
                        content_obj.save(update_fields=['status'])
                    elif hasattr(content_obj, 'is_valid'):
                        content_obj.is_valid = True
                        content_obj.save(update_fields=['is_valid'])
            elif action == 'reject':
                item.status = 'rejected'
                item.rejection_reason = serializer.validated_data.get('rejection_reason', '')
                content_obj = item.content_object
                if content_obj:
                    if hasattr(content_obj, 'status'):
                        content_obj.status = 'rejected'
                        content_obj.save(update_fields=['status'])
                    elif hasattr(content_obj, 'is_valid'):
                        content_obj.is_valid = False
                        content_obj.save(update_fields=['is_valid'])

            item.save()
            
            log_audit_action(
                actor=request.user,
                action=f'moderation_{action}',
                target_type='ModerationQueue',
                target_id=item.id,
                changes={'status': item.status, 'notes': item.notes},
                request=request
            )
            
            return Response(ModerationQueueSerializer(item).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminBusinessClaimListView(generics.ListAPIView):
    permission_classes = [IsModerator]
    serializer_class = AdminBusinessClaimSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        from apps.directory.models import BusinessClaim
        qs = BusinessClaim.objects.select_related('shop_listing', 'user').order_by('-created_at')
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

class AdminBusinessClaimActionView(APIView):
    permission_classes = [IsModerator]

    def patch(self, request, claim_id):
        from apps.directory.models import BusinessClaim
        try:
            claim = BusinessClaim.objects.get(id=claim_id)
        except BusinessClaim.DoesNotExist:
            return Response({'error': 'Claim not found'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            claim.status = 'approved'
            claim.save()
            
            # Transfer ownership
            shop = claim.shop_listing
            shop.user = claim.user
            shop.is_claimed = True
            shop.save(update_fields=['user', 'is_claimed'])
            
            log_audit_action(
                actor=request.user, action='approve_claim', target_type='BusinessClaim',
                target_id=claim.id, request=request
            )
            return Response({'message': 'Claim approved, ownership transferred.', 'status': 'approved'})
            
        elif action == 'reject':
            claim.status = 'rejected'
            claim.save()
            
            log_audit_action(
                actor=request.user, action='reject_claim', target_type='BusinessClaim',
                target_id=claim.id, request=request
            )
            return Response({'message': 'Claim rejected', 'status': 'rejected'})
            
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class AdminBusinessReportListView(generics.ListAPIView):
    permission_classes = [IsModerator]
    serializer_class = AdminBusinessReportSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        from apps.directory.models import BusinessReport
        qs = BusinessReport.objects.select_related('shop_listing', 'reported_by').order_by('-created_at')
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

class AdminBusinessReportActionView(APIView):
    permission_classes = [IsModerator]

    def patch(self, request, report_id):
        from apps.directory.models import BusinessReport
        try:
            report = BusinessReport.objects.get(id=report_id)
        except BusinessReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'resolve':
            report.status = 'resolved'
            report.save()
            log_audit_action(
                actor=request.user, action='resolve_report', target_type='BusinessReport',
                target_id=report.id, request=request
            )
            return Response({'message': 'Report marked as resolved', 'status': 'resolved'})
        elif action == 'dismiss':
            report.status = 'dismissed'
            report.save()
            log_audit_action(
                actor=request.user, action='dismiss_report', target_type='BusinessReport',
                target_id=report.id, request=request
            )
            return Response({'message': 'Report dismissed', 'status': 'dismissed'})
            
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

# ──────────────────────────────────────────────
# Ads Moderation
# ──────────────────────────────────────────────

class AdminAdsListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/ads/ — All ads with filters."""
    permission_classes = [IsAdminRole]
    serializer_class = AdsListingSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = AdsListing.objects.select_related('user', 'shop_listing').order_by('-created_at')
        status_filter = self.request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

class AdminAdsActionView(APIView):
    """PATCH /api/v1/admin-panel/ads/<id>/ — Approve, reject, or request revision for an ad."""
    permission_classes = [IsAdminRole]

    def patch(self, request, ad_id):
        try:
            ad = AdsListing.objects.get(id=ad_id)
        except AdsListing.DoesNotExist:
            return Response({'error': 'Ad not found'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        update_fields = ['status', 'rejection_reason']

        if 'start_date' in request.data:
            ad.start_date = request.data['start_date']
            update_fields.append('start_date')
        if 'end_date' in request.data:
            ad.end_date = request.data['end_date']
            update_fields.append('end_date')
        if 'target_page' in request.data:
            ad.target_page = request.data['target_page']
            update_fields.append('target_page')
        if 'package' in request.data:
            ad.package = request.data['package']
            update_fields.append('package')

        if action == 'approve':
            ad.status = 'active'
            ad.rejection_reason = None
            ad.save(update_fields=list(set(update_fields)))
            
            log_audit_action(
                actor=request.user, action='approve_ad', target_type='AdsListing',
                target_id=ad.id, request=request
            )
            return Response({'message': 'Ad approved', 'status': 'active'})
            
        elif action == 'reject':
            ad.status = 'rejected'
            ad.rejection_reason = request.data.get('rejection_reason', '')
            ad.save(update_fields=list(set(update_fields)))
            
            log_audit_action(
                actor=request.user, action='reject_ad', target_type='AdsListing',
                target_id=ad.id, changes={'reason': ad.rejection_reason}, request=request
            )
            return Response({'message': 'Ad rejected', 'status': 'rejected'})

        elif action == 'request_revision':
            ad.status = 'revision_requested'
            ad.rejection_reason = request.data.get('rejection_reason', '')
            ad.save(update_fields=list(set(update_fields)))

            log_audit_action(
                actor=request.user, action='request_revision_ad', target_type='AdsListing',
                target_id=ad.id, changes={'reason': ad.rejection_reason}, request=request
            )
            return Response({'message': 'Revision requested', 'status': 'revision_requested'})
            
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, ad_id):
        try:
            ad = AdsListing.objects.get(id=ad_id)
        except AdsListing.DoesNotExist:
            return Response({'error': 'Ad not found'}, status=status.HTTP_404_NOT_FOUND)
            
        log_audit_action(
            actor=request.user,
            action='delete_ad',
            target_type='AdsListing',
            target_id=ad.id,
            changes={'name': ad.name},
            request=request
        )
        
        ad.delete()
        return Response({'message': 'Ad deleted'}, status=status.HTTP_204_NO_CONTENT)

class AdminAdSlotListView(APIView):
    """GET /api/v1/admin-panel/ad-slots/ — List all ad slots."""
    permission_classes = [IsAdminRole]

    def get(self, request):
        # Ensure default slots are seeded if missing
        default_slots = ['hero_banner', 'category_banner', 'sidebar', 'listing_interstitial']
        for slot_key in default_slots:
            AdSlot.objects.get_or_create(slot_name=slot_key)
        
        slots = AdSlot.objects.all().order_by('id')
        serializer = AdSlotSerializer(slots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminAdSlotDetailView(APIView):
    """PATCH /api/v1/admin-panel/ad-slots/<id>/ — Toggle or edit an ad slot."""
    permission_classes = [IsAdminRole]

    def patch(self, request, slot_id):
        try:
            slot = AdSlot.objects.get(id=slot_id)
        except AdSlot.DoesNotExist:
            return Response({'error': 'Ad slot not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdSlotSerializer(slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_audit_action(
                actor=request.user, action='update_ad_slot', target_type='AdSlot',
                target_id=slot.id, changes=serializer.validated_data, request=request
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from apps.ads.models import FloatingVideoAdvertisement
from apps.ads.serializers import FloatingVideoAdvertisementSerializer
from apps.ads.floating_ad_utils import parse_and_validate_ad_url

class AdminFloatingVideoAdView(APIView):
    """
    Admin/Superadmin endpoint for Floating Video Advertisement management.
    GET  /api/v1/admin-panel/floating-video-ad/ - List all floating ads with counts and status filtering
    POST /api/v1/admin-panel/floating-video-ad/ - Create a new floating video ad
    """
    permission_classes = [IsAdminRole]

    def get(self, request):
        today = timezone.now().date()
        qs = FloatingVideoAdvertisement.objects.all().order_by('-created_at')

        # Status filter
        status_filter = request.query_params.get('status', '').strip().upper()
        
        # Calculate overall counts before filtering
        all_ads = list(qs)
        active_count = sum(1 for ad in all_ads if ad.status == 'ACTIVE')
        scheduled_count = sum(1 for ad in all_ads if ad.status == 'SCHEDULED')
        expired_count = sum(1 for ad in all_ads if ad.status == 'EXPIRED')
        disabled_count = sum(1 for ad in all_ads if ad.status == 'DISABLED')

        if status_filter and status_filter != 'ALL':
            all_ads = [ad for ad in all_ads if ad.status == status_filter]

        search = request.query_params.get('search', '').strip()
        if search:
            all_ads = [
                ad for ad in all_ads 
                if search.lower() in ad.title.lower() or search.lower() in ad.video_url.lower()
            ]

        serializer = FloatingVideoAdvertisementSerializer(all_ads, many=True)
        return Response({
            "ads": serializer.data,
            "total": len(serializer.data),
            "counts": {
                "all": len(qs),
                "active": active_count,
                "scheduled": scheduled_count,
                "expired": expired_count,
                "disabled": disabled_count
            }
        }, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        title = data.get('title', '').strip() or 'Feature of the day'
        platform = data.get('platform', 'youtube').strip().lower()
        video_url = data.get('video_url', data.get('url', '')).strip()
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        is_enabled = bool(data.get('is_enabled', data.get('enabled', True)))

        # Validation 1: Required URL
        if not video_url:
            return Response({"error": "Video / Reel URL is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validation 2: URL format
        val = parse_and_validate_ad_url(video_url, platform)
        if not val["valid"]:
            return Response({"error": val["error"]}, status=status.HTTP_400_BAD_REQUEST)

        # Validation 3: Required Start and End dates
        if not start_date_str or not end_date_str:
            return Response({"error": "Start Date and End Date are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validation 4: Date logic (Start Date cannot be after End Date)
        try:
            start_date = timezone.datetime.strptime(str(start_date_str).split('T')[0], '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(str(end_date_str).split('T')[0], '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if start_date > end_date:
            return Response({"error": "Start Date cannot be after End Date."}, status=status.HTTP_400_BAD_REQUEST)

        ad = FloatingVideoAdvertisement.objects.create(
            title=title,
            platform=val["platform"] or platform,
            video_url=video_url,
            start_date=start_date,
            end_date=end_date,
            is_enabled=is_enabled
        )

        log_audit_action(
            actor=request.user,
            action='create_floating_video_ad',
            target_type='FloatingVideoAdvertisement',
            target_id=ad.id,
            changes={'title': ad.title, 'url': ad.video_url, 'start_date': str(start_date), 'end_date': str(end_date)},
            request=request
        )

        serializer = FloatingVideoAdvertisementSerializer(ad)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminFloatingVideoAdDetailView(APIView):
    """
    GET    /api/v1/admin-panel/floating-video-ad/<ad_id>/ - Retrieve single ad
    PUT    /api/v1/admin-panel/floating-video-ad/<ad_id>/ - Update ad
    PATCH  /api/v1/admin-panel/floating-video-ad/<ad_id>/ - Partial update ad
    DELETE /api/v1/admin-panel/floating-video-ad/<ad_id>/ - Delete ad
    """
    permission_classes = [IsAdminRole]

    def get_object(self, ad_id):
        try:
            return FloatingVideoAdvertisement.objects.get(id=ad_id)
        except FloatingVideoAdvertisement.DoesNotExist:
            return None

    def get(self, request, ad_id):
        ad = self.get_object(ad_id)
        if not ad:
            return Response({'error': 'Advertisement not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = FloatingVideoAdvertisementSerializer(ad)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, ad_id):
        return self.patch(request, ad_id)

    def patch(self, request, ad_id):
        ad = self.get_object(ad_id)
        if not ad:
            return Response({'error': 'Advertisement not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'title' in data:
            ad.title = data.get('title', '').strip() or 'Feature of the day'

        if 'video_url' in data or 'url' in data:
            url_val = data.get('video_url', data.get('url', '')).strip()
            if url_val:
                val = parse_and_validate_ad_url(url_val)
                if not val["valid"]:
                    return Response({"error": val["error"]}, status=status.HTTP_400_BAD_REQUEST)
                ad.video_url = url_val
                if val["platform"]:
                    ad.platform = val["platform"]

        if 'platform' in data and not data.get('video_url'):
            ad.platform = data.get('platform')

        if 'is_enabled' in data or 'enabled' in data:
            ad.is_enabled = bool(data.get('is_enabled', data.get('enabled')))

        # Date validations if updated
        start_date = ad.start_date
        end_date = ad.end_date

        if 'start_date' in data and data['start_date']:
            try:
                start_date = timezone.datetime.strptime(str(data['start_date']).split('T')[0], '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid start_date format."}, status=status.HTTP_400_BAD_REQUEST)

        if 'end_date' in data and data['end_date']:
            try:
                end_date = timezone.datetime.strptime(str(data['end_date']).split('T')[0], '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid end_date format."}, status=status.HTTP_400_BAD_REQUEST)

        if start_date > end_date:
            return Response({"error": "Start Date cannot be after End Date."}, status=status.HTTP_400_BAD_REQUEST)

        ad.start_date = start_date
        ad.end_date = end_date
        ad.save()

        log_audit_action(
            actor=request.user,
            action='update_floating_video_ad',
            target_type='FloatingVideoAdvertisement',
            target_id=ad.id,
            changes={'title': ad.title, 'is_enabled': ad.is_enabled},
            request=request
        )

        serializer = FloatingVideoAdvertisementSerializer(ad)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, ad_id):
        ad = self.get_object(ad_id)
        if not ad:
            return Response({'error': 'Advertisement not found'}, status=status.HTTP_404_NOT_FOUND)

        log_audit_action(
            actor=request.user,
            action='delete_floating_video_ad',
            target_type='FloatingVideoAdvertisement',
            target_id=ad.id,
            changes={'title': ad.title},
            request=request
        )

        ad.delete()
        return Response({'message': 'Advertisement deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class AdminFloatingVideoAdToggleView(APIView):
    """
    PATCH /api/v1/admin-panel/floating-video-ad/<ad_id>/toggle/ - Toggle enabled state
    """
    permission_classes = [IsAdminRole]

    def patch(self, request, ad_id):
        try:
            ad = FloatingVideoAdvertisement.objects.get(id=ad_id)
        except FloatingVideoAdvertisement.DoesNotExist:
            return Response({'error': 'Advertisement not found'}, status=status.HTTP_404_NOT_FOUND)

        ad.is_enabled = not ad.is_enabled
        ad.save(update_fields=['is_enabled', 'updated_at'])

        log_audit_action(
            actor=request.user,
            action='toggle_floating_video_ad',
            target_type='FloatingVideoAdvertisement',
            target_id=ad.id,
            changes={'is_enabled': ad.is_enabled},
            request=request
        )

        serializer = FloatingVideoAdvertisementSerializer(ad)
        return Response(serializer.data, status=status.HTTP_200_OK)



