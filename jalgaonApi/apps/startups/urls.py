from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StartupIndustryListView,
    PublicStartupListView,
    FeaturedStartupListView,
    PublicStartupDetailView,
    SubmitStartupView,
    UserStartupListView,
    AdminStartupViewSet,
    AdminStartupIndustryViewSet,
    AdminFounderViewSet
)

router = DefaultRouter()
router.register(r'admin/startups', AdminStartupViewSet, basename='admin-startups')
router.register(r'admin/industries', AdminStartupIndustryViewSet, basename='admin-industries')
router.register(r'admin/founders', AdminFounderViewSet, basename='admin-founders')

urlpatterns = [
    # Public endpoints
    path('industries/', StartupIndustryListView.as_view(), name='public-startup-industries'),
    path('featured/', FeaturedStartupListView.as_view(), name='public-startup-featured'),
    path('', PublicStartupListView.as_view(), name='public-startup-list'),
    path('submit/', SubmitStartupView.as_view(), name='startup-submit'),
    path('my-startups/', UserStartupListView.as_view(), name='user-startup-list'),
    
    # Admin endpoints (router)
    path('', include(router.urls)),
    
    # Detail
    path('<slug:slug>/', PublicStartupDetailView.as_view(), name='public-startup-detail'),
]
