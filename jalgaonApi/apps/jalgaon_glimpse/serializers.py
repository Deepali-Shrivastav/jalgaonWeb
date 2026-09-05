"""
apps/jalgaon_glimpse/serializers.py
-----------------------------------
Serializers for Jalgaon Glimpse video & channel data.
"""

from rest_framework import serializers


class YouTubeVideoSerializer(serializers.Serializer):
    """Serializes a normalized video dict returned by YouTubeService."""
    video_id         = serializers.CharField()
    title            = serializers.CharField()
    description      = serializers.CharField(allow_blank=True)
    thumbnail_url    = serializers.URLField(allow_blank=True)
    published_at     = serializers.CharField()
    youtube_url      = serializers.URLField()
    embed_url        = serializers.URLField()
    duration_seconds = serializers.IntegerField()
    is_short         = serializers.BooleanField()
    view_count       = serializers.CharField(default='0', required=False)
    like_count       = serializers.CharField(default='0', required=False)


class YouTubeVideoDetailSerializer(YouTubeVideoSerializer):
    """Extended serializer for single video detail — adds stats and tags."""
    view_count    = serializers.CharField(default='0')
    like_count    = serializers.CharField(default='0')
    channel_title = serializers.CharField(allow_blank=True)
    tags          = serializers.ListField(child=serializers.CharField(), default=list)


class YouTubeVideoListResponseSerializer(serializers.Serializer):
    """Wraps a paginated list of videos."""
    total_results    = serializers.IntegerField()
    next_page_token  = serializers.CharField(allow_null=True, allow_blank=True)
    prev_page_token  = serializers.CharField(allow_null=True, allow_blank=True)
    results          = YouTubeVideoSerializer(many=True)


class YouTubeChannelSerializer(serializers.Serializer):
    """Serializes channel metadata."""
    channel_id       = serializers.CharField()
    title            = serializers.CharField()
    description      = serializers.CharField(allow_blank=True)
    custom_url       = serializers.CharField(allow_blank=True)
    thumbnail_url    = serializers.URLField(allow_blank=True)
    subscriber_count = serializers.CharField()
    video_count      = serializers.CharField()
    view_count       = serializers.CharField()
    youtube_url      = serializers.URLField()
