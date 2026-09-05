"""
apps/jalgaon_glimpse/urls.py
----------------------------
URL patterns for the Jalgaon Glimpse section.
Mounted at /api/v1/jalgaon-glimpse/ in jalgaonApi/urls.py.
"""

from django.urls import path
from .views import YouTubeVideoListView, YouTubeVideoDetailView, YouTubeChannelInfoView

app_name = 'jalgaon_glimpse'

urlpatterns = [
    path('videos/', YouTubeVideoListView.as_view(), name='video-list'),
    path('videos/<str:video_id>/', YouTubeVideoDetailView.as_view(), name='video-detail'),
    path('channel/', YouTubeChannelInfoView.as_view(), name='channel-info'),
]
