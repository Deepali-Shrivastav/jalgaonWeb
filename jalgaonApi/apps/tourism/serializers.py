from rest_framework import serializers
from .models import TouristPlace
from core.utils import get_absolute_media_url


class TouristPlaceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    rating = serializers.FloatField(default=4.5)
    reviews_count = serializers.IntegerField(default=100)
    highlights = serializers.SerializerMethodField()

    class Meta:
        model = TouristPlace
        fields = [
            'id',
            'name',
            'category',
            'rating',
            'reviews_count',
            'distance',
            'image_url',
            'timings',
            'description',
            'highlights',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        default_img = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
        if obj.image:
            return get_absolute_media_url(obj.image, request, default=default_img)
        if obj.image_url:
            return get_absolute_media_url(obj.image_url, request, default=default_img)
        return default_img

    def get_highlights(self, obj):
        if isinstance(obj.highlights, list) and obj.highlights:
            return obj.highlights
        return ["Popular Spot", "Scenic View"]

