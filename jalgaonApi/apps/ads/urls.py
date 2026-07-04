from django.urls import path
from .views import (
    HomeCrouselAdsView, BannerAdsView, AdsListingCreateAPIView,
    UserAdsListView, PublicAdsListView, TrackImpressionView,
    TrackClickView, AdvertiserAnalyticsView, AdsBySlotView
)

urlpatterns = [
    path('carousel/', HomeCrouselAdsView.as_view(), name='carousel'),
    path('banners/', BannerAdsView.as_view(), name='banners'),
    path('submit/', AdsListingCreateAPIView.as_view(), name='submit'),
    path('my-ads/', UserAdsListView.as_view(), name='my-ads'),
    path('list/', PublicAdsListView.as_view(), name='ads-list'),
    path('by-slot/', AdsBySlotView.as_view(), name='by-slot'),
    path('my-analytics/', AdvertiserAnalyticsView.as_view(), name='my-analytics'),
    path('<int:ad_id>/track-impression/', TrackImpressionView.as_view(), name='track-impression'),
    path('<int:ad_id>/track-click/', TrackClickView.as_view(), name='track-click'),
]
