from rest_framework import serializers
from .models import ShopReview
from apps.accounts.serializers import UserSerializer

class ShopReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopReview
        fields = ['user', 'shop_listing', 'rating_star', 'user_review', 'timestamp']

    def create(self, validated_data):
        return ShopReview.objects.create(**validated_data)

class ShopReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True, source='user.phone_number')

    class Meta:
        model = ShopReview
        fields = ['user', 'shop_listing', 'rating_star', 'user_review', 'timestamp']
