from rest_framework import serializers
from .models import HomeCrouselAds, BannerAds, AdsListing, AdSlot, FloatingVideoAdvertisement
from .floating_ad_utils import parse_and_validate_ad_url

class HomeCrouselAdsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeCrouselAds
        fields = '__all__'

class BannerAdsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BannerAds
        fields = '__all__'

class AdSlotSerializer(serializers.ModelSerializer):
    slot_name_display = serializers.CharField(source='get_slot_name_display', read_only=True)

    class Meta:
        model = AdSlot
        fields = ['id', 'slot_name', 'slot_name_display', 'is_enabled', 'max_ads', 'updated_at']

class AdsListingSerializer(serializers.ModelSerializer):
    target_page_display = serializers.CharField(source='get_target_page_display', read_only=True)
    package_display = serializers.CharField(source='get_package_display', read_only=True)
    ctr = serializers.SerializerMethodField()

    class Meta:
        model = AdsListing
        fields = '__all__'
        read_only_fields = [
            'status', 'rejection_reason', 'user', 'created_at', 'updated_at',
            'impressions', 'clicks'
        ]

    def get_ctr(self, obj):
        if obj.impressions > 0:
            return round((obj.clicks / obj.impressions) * 100, 2)
        return 0.0

class FloatingVideoAdvertisementSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    embed_url = serializers.SerializerMethodField()
    video_id = serializers.SerializerMethodField()
    parsed_platform = serializers.SerializerMethodField()

    class Meta:
        model = FloatingVideoAdvertisement
        fields = [
            'id', 'title', 'platform', 'video_url', 'start_date', 'end_date',
            'is_enabled', 'status', 'embed_url', 'video_id', 'parsed_platform',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_embed_url(self, obj):
        val = parse_and_validate_ad_url(obj.video_url, obj.platform)
        return val.get('embed_url', '')

    def get_video_id(self, obj):
        val = parse_and_validate_ad_url(obj.video_url, obj.platform)
        return val.get('video_id', '')

    def get_parsed_platform(self, obj):
        val = parse_and_validate_ad_url(obj.video_url, obj.platform)
        return val.get('platform') or obj.platform

