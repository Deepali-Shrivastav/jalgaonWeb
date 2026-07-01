from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType

from apps.directory.models import MainCategory, SubCategory, ShopListing, CategoryImg
from apps.directory.serializers import MainCategorySerializer, ShopListingSerializer
from .models import AdminSetting, ModerationQueue

User = get_user_model()


# ──────────────────────────────────────────────
# Dashboard Stats
# ──────────────────────────────────────────────

class DashboardStatsSerializer(serializers.Serializer):
    """Read-only serializer for the admin dashboard overview cards."""
    total_users = serializers.IntegerField()
    total_listings = serializers.IntegerField()
    approved_listings = serializers.IntegerField()
    pending_listings = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    pending_moderation = serializers.IntegerField()


# ──────────────────────────────────────────────
# User Management
# ──────────────────────────────────────────────

class AdminUserListSerializer(serializers.ModelSerializer):
    """Compact user listing for the admin users table."""
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'phone_number', 'date_joined', 'last_login']


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Full user detail for the admin user edit view."""
    listings_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'first_name', 'last_name',
            'profile_pic', 'role', 'is_active', 'is_staff',
            'date_joined', 'last_login', 'listings_count'
        ]
        read_only_fields = ['id', 'phone_number', 'date_joined', 'last_login']

    def get_listings_count(self, obj):
        return ShopListing.objects.filter(user=obj).count()


class AdminUserRoleSerializer(serializers.Serializer):
    """Serializer for changing a user's role (super_admin only)."""
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)


# ──────────────────────────────────────────────
# Listing Management
# ──────────────────────────────────────────────

class AdminListingSerializer(serializers.ModelSerializer):
    """Listing details for the admin listings table."""
    owner_phone = serializers.CharField(source='user.phone_number', read_only=True)
    owner_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='main_category.main_category', read_only=True)

    class Meta:
        model = ShopListing
        fields = [
            'id', 'business_name', 'business_address', 'business_banner',
            'is_valid', 'owner_phone', 'owner_name', 'category_name',
            'main_category', 'sub_category'
        ]
        read_only_fields = ['id', 'owner_phone', 'owner_name', 'category_name']

    def get_owner_name(self, obj):
        parts = [obj.user.first_name or '', obj.user.last_name or '']
        full = ' '.join(p for p in parts if p)
        return full or obj.user.phone_number


class AdminListingActionSerializer(serializers.Serializer):
    """Serializer for approve/reject listing actions."""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')


# ──────────────────────────────────────────────
# Category Management
# ──────────────────────────────────────────────

class AdminCategoryCreateSerializer(serializers.ModelSerializer):
    """For creating/updating categories."""
    class Meta:
        model = MainCategory
        fields = ['id', 'main_category', 'category_img']


class AdminSubCategorySerializer(serializers.ModelSerializer):
    """For managing subcategories."""
    class Meta:
        model = SubCategory
        fields = ['id', 'sub_category', 'sub_category_img', 'main_category']


# ──────────────────────────────────────────────
# Moderation Queue
# ──────────────────────────────────────────────

class ModerationQueueSerializer(serializers.ModelSerializer):
    """Serializer for the moderation queue list."""
    content_type_name = serializers.SerializerMethodField()
    submitted_by_phone = serializers.CharField(source='submitted_by.phone_number', read_only=True)
    reviewed_by_phone = serializers.CharField(
        source='reviewed_by.phone_number', read_only=True, default=None
    )
    content_preview = serializers.SerializerMethodField()

    class Meta:
        model = ModerationQueue
        fields = [
            'id', 'content_type', 'content_type_name', 'object_id',
            'status', 'submitted_by', 'submitted_by_phone',
            'reviewed_by', 'reviewed_by_phone',
            'submitted_at', 'reviewed_at', 'rejection_reason',
            'notes', 'content_preview'
        ]
        read_only_fields = [
            'id', 'content_type', 'object_id', 'submitted_by',
            'submitted_at', 'content_type_name', 'content_preview'
        ]

    def get_content_type_name(self, obj):
        return obj.content_type.model

    def get_content_preview(self, obj):
        """Return a brief preview of the moderated content."""
        try:
            content_obj = obj.content_object
            if content_obj is None:
                return {'deleted': True}
            if hasattr(content_obj, 'business_name'):
                return {
                    'type': 'listing',
                    'name': content_obj.business_name,
                    'address': content_obj.business_address,
                }
            if hasattr(content_obj, 'name'):
                return {'type': 'ad', 'name': content_obj.name}
            return {'type': obj.content_type.model, 'str': str(content_obj)[:100]}
        except Exception:
            return {'error': 'Could not load content'}


class ModerationActionSerializer(serializers.Serializer):
    """Serializer for approving/rejecting moderation items."""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')


# ──────────────────────────────────────────────
# Admin Settings
# ──────────────────────────────────────────────

class AdminSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminSetting
        fields = ['id', 'key', 'value', 'description', 'updated_at']
        read_only_fields = ['id', 'updated_at']
