from django.urls import path
from .views import HomeCrouselAdsView, BannerAdsView, AdsListingCreateAPIView

urlpatterns = [
    path('carousel/', HomeCrouselAdsView.as_view(), name='carousel'),
    path('banners/', BannerAdsView.as_view(), name='banners'),
    path('submit/', AdsListingCreateAPIView.as_view(), name='submit'),
]
