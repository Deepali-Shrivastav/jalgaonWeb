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
    AdminSettingSerializer,
)
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
            'approved_listings': ShopListing.objects.filter(is_valid=True).count(),
            'pending_listings': ShopListing.objects.filter(is_valid=False).count(),
            'total_categories': MainCategory.objects.count(),
            'pending_moderation': ModerationQueue.objects.filter(status='pending').count(),
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
            user.save(update_fields=['role'])
            
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
        if status_filter == 'approved':
            qs = qs.filter(is_valid=True)
        elif status_filter == 'pending':
            qs = qs.filter(is_valid=False)

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
        from apps.directory.serializers import ShopListingSerializer
        serializer = ShopListingSerializer(listing)
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
                listing.is_valid = True
                listing.save(update_fields=['is_valid'])
                
                log_audit_action(
                    actor=request.user,
                    action='approve_listing',
                    target_type='ShopListing',
                    target_id=listing.id,
                    request=request
                )
                
                return Response({'message': 'Listing approved', 'is_valid': True})
            elif action == 'reject':
                listing.is_valid = False
                listing.save(update_fields=['is_valid'])
                
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
                    'is_valid': False,
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
        serializer = AdminCategoryCreateSerializer(data=request.data)
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

        serializer = AdminCategoryCreateSerializer(category, data=request.data, partial=True)
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
                if content_obj and hasattr(content_obj, 'is_valid'):
                    content_obj.is_valid = True
                    content_obj.save(update_fields=['is_valid'])
            elif action == 'reject':
                item.status = 'rejected'
                item.rejection_reason = serializer.validated_data.get('rejection_reason', '')
                content_obj = item.content_object
                if content_obj and hasattr(content_obj, 'is_valid'):
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
