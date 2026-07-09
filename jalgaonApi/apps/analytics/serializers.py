from rest_framework import serializers
from .models import AnalyticsEvent, DailyReport
from apps.directory.models import ShopListing
from apps.ads.models import AdsListing

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = '__all__'


class DailyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReport
        fields = '__all__'


class ListingMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopListing
        fields = ['id', 'business_name', 'slug', 'city']


class AdMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdsListing
        fields = ['id', 'name', 'package', 'status']
