from django.urls import path
from .views import (
    AdminOverviewAnalyticsView,
    AdminTrafficAnalyticsView,
    AdminTopListingsView,
    AdminTopSearchesView,
    AdminUserGrowthView,
    AdminAdsOverviewView,
    BusinessOwnerListingAnalyticsView,
    BusinessOwnerListingChartAnalyticsView,
    AdvertiserAdsAnalyticsView,
    AdvertiserAdChartAnalyticsView,
)

urlpatterns = [
    # Admin endpoints
    path('overview/', AdminOverviewAnalyticsView.as_view(), name='admin-analytics-overview'),
    path('traffic/', AdminTrafficAnalyticsView.as_view(), name='admin-analytics-traffic'),
    path('top-listings/', AdminTopListingsView.as_view(), name='admin-analytics-top-listings'),
    path('top-searches/', AdminTopSearchesView.as_view(), name='admin-analytics-top-searches'),
    path('user-growth/', AdminUserGrowthView.as_view(), name='admin-analytics-user-growth'),
    path('ads-overview/', AdminAdsOverviewView.as_view(), name='admin-analytics-ads-overview'),

    # Business Owner endpoints
    path('my-listing/<slug:slug>/', BusinessOwnerListingAnalyticsView.as_view(), name='business-listing-analytics'),
    path('my-listing/<slug:slug>/chart/', BusinessOwnerListingChartAnalyticsView.as_view(), name='business-listing-chart'),

    # Advertiser endpoints
    path('my-ads/', AdvertiserAdsAnalyticsView.as_view(), name='advertiser-ads-analytics'),
    path('my-ads/<int:pk>/chart/', AdvertiserAdChartAnalyticsView.as_view(), name='advertiser-ad-chart'),
]
