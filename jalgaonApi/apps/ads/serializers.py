from rest_framework import serializers
from .models import HomeCrouselAds, BannerAds, AdsListing, AdSlot, FloatingVideoAdvertisement, Banner
from .floating_ad_utils import parse_and_validate_ad_url
from urllib.parse import urlparse

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

    def validate_ad_image(self, value):
        if value and hasattr(value, 'size') and value.size > 1.0 * 1024 * 1024:
            size_mb = round(value.size / (1024 * 1024), 2)
            raise serializers.ValidationError(f"Banner image file size cannot exceed 1 MB (uploaded size: {size_mb} MB).")
        return value

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


class BannerSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()
    created_by_name = serializers.SerializerMethodField()
    ctr = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = [
            'id', 'client_name', 'website_url', 'banner_image',
            'title', 'subtitle', 'badge_text', 'cta_text',
            'start_date', 'expiry_date', 'is_enabled', 'status',
            'clicks', 'impressions', 'ctr', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'clicks', 'impressions', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return "System"

    def get_ctr(self, obj):
        if obj.impressions > 0:
            return round((obj.clicks / obj.impressions) * 100, 2)
        return 0.0

    def validate_website_url(self, value):
        if not value:
            return ""
        url = value.strip()
        if not url:
            return ""
        
        # Add default scheme if missing
        if not (url.startswith('http://') or url.startswith('https://') or url.startswith('/')):
            url = f"https://{url}"

        parsed = urlparse(url)
        if parsed.scheme and parsed.scheme.lower() not in ['http', 'https']:
            raise serializers.ValidationError("Unsafe website URL scheme. Only HTTP and HTTPS are allowed.")
        
        return url

    def validate_banner_image(self, value):
        if value and hasattr(value, 'size') and value.size > 1.0 * 1024 * 1024:
            size_mb = round(value.size / (1024 * 1024), 2)
            raise serializers.ValidationError(f"Banner image file size cannot exceed 1 MB (uploaded size: {size_mb} MB).")
        return value

    def validate(self, data):
        start_date = data.get('start_date') or (self.instance.start_date if self.instance else None)
        expiry_date = data.get('expiry_date') or (self.instance.expiry_date if self.instance else None)

        if start_date and expiry_date and start_date > expiry_date:
            raise serializers.ValidationError({"expiry_date": "Expiry Date cannot be earlier than Start Date."})

        return data


