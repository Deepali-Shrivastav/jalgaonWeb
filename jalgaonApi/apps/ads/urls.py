from django.urls import path
from .views import HomeCrouselAdsView, BannerAdsView, AdsListingCreateAPIView, UserAdsListView, PublicAdsListView

urlpatterns = [
    path('carousel/', HomeCrouselAdsView.as_view(), name='carousel'),
    path('banners/', BannerAdsView.as_view(), name='banners'),
    path('submit/', AdsListingCreateAPIView.as_view(), name='submit'),
    path('my-ads/', UserAdsListView.as_view(), name='my-ads'),
    path('list/', PublicAdsListView.as_view(), name='ads-list'),
]
