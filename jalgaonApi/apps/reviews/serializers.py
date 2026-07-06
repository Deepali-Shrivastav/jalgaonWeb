from rest_framework import serializers
from .models import ShopReview
from apps.accounts.serializers import UserSerializer

class ShopReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    business_name = serializers.CharField(source='shop_listing.business_name', read_only=True)
    business_slug = serializers.CharField(source='shop_listing.slug', read_only=True)

    class Meta:
        model = ShopReview
        fields = ['id', 'user_name', 'user_avatar', 'rating_star', 'user_review', 'timestamp', 'is_helpful_count', 'status', 'business_name', 'business_slug']
        read_only_fields = ['status', 'is_helpful_count']

    def get_user_name(self, obj):
        if obj.user.first_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return "User"

    def get_user_avatar(self, obj):
        if obj.user.profile_pic:
            return obj.user.profile_pic.url
        return None

class ShopReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopReview
        fields = ['rating_star', 'user_review']
