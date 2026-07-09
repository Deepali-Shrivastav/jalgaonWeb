from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClubCategoryListView,
    PublicClubListView,
    FeaturedClubListView,
    PublicClubDetailView,
    SubmitClubView,
    UserClubListView,
    AdminClubViewSet,
    AdminClubCategoryViewSet,
    AdminClubActivityViewSet,
    AdminClubMemberViewSet,
    AdminClubPhotoViewSet
)

router = DefaultRouter()
router.register(r'admin/clubs', AdminClubViewSet, basename='admin-clubs')
router.register(r'admin/categories', AdminClubCategoryViewSet, basename='admin-categories')
router.register(r'admin/activities', AdminClubActivityViewSet, basename='admin-activities')
router.register(r'admin/members', AdminClubMemberViewSet, basename='admin-members')
router.register(r'admin/photos', AdminClubPhotoViewSet, basename='admin-photos')

urlpatterns = [
    # Public endpoints
    path('categories/', ClubCategoryListView.as_view(), name='public-club-categories'),
    path('featured/', FeaturedClubListView.as_view(), name='public-club-featured'),
    path('', PublicClubListView.as_view(), name='public-club-list'),
    path('submit/', SubmitClubView.as_view(), name='club-submit'),
    path('my-clubs/', UserClubListView.as_view(), name='user-club-list'),
    
    # Admin endpoints (router)
    path('', include(router.urls)),
    
    # Detail
    path('<slug:slug>/', PublicClubDetailView.as_view(), name='public-club-detail'),
]
