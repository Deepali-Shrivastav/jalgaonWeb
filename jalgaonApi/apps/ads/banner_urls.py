from django.urls import path
from .views import PublicBannerListView, TrackBannerClickView

urlpatterns = [
    path('active/', PublicBannerListView.as_view(), name='public-active-banners'),
    path('<int:banner_id>/track-click/', TrackBannerClickView.as_view(), name='track-banner-click'),
]
