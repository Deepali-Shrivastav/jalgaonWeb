from rest_framework import serializers
from .models import HomeCrouselAds, BannerAds, AdsListing

class HomeCrouselAdsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeCrouselAds
        fields = '__all__'

class BannerAdsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BannerAds
        fields = '__all__'

class AdsListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdsListing
        fields = '__all__'
        read_only_fields = ['status', 'rejection_reason', 'user', 'created_at', 'updated_at']
