from django.urls import path
from .views import (
    CategoryListView, ListingListView, ListingDetailView, ListingCreateView,
    ListingUpdateView, ListingDeleteView, ListingSearchView, TrendingListingsView,
    ListingReviewListView, ListingReviewCreateView, LikedShopsView, UserListedShops,
    BusinessClaimCreateView, BusinessReportCreateView, ReviewManageView, UserBusinessReviewsView
)

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='categories'),
    
    # Listings
    path('', ListingListView.as_view(), name='listing-list'),
    path('search/', ListingSearchView.as_view(), name='listing-search'),
    path('trending/', TrendingListingsView.as_view(), name='listing-trending'),
    path('create/', ListingCreateView.as_view(), name='listing-create'),
    path('<slug:slug>/', ListingDetailView.as_view(), name='listing-detail'),
    path('<slug:slug>/update/', ListingUpdateView.as_view(), name='listing-update'),
    path('<slug:slug>/delete/', ListingDeleteView.as_view(), name='listing-delete'),
    
    # Reviews
    path('<slug:slug>/reviews/', ListingReviewListView.as_view(), name='listing-reviews'),
    path('<slug:slug>/reviews/create/', ListingReviewCreateView.as_view(), name='listing-review-create'),
    path('reviews/<int:pk>/manage/', ReviewManageView.as_view(), name='review-manage'),
    
    # Claims
    path('<slug:slug>/claim/', BusinessClaimCreateView.as_view(), name='listing-claim'),
    
    # Reports
    path('<slug:slug>/report/', BusinessReportCreateView.as_view(), name='listing-report'),
    
    # User Specific
    path('user/my-listings/', UserListedShops.as_view(), name='my-listings'),
    path('user/favorites/', LikedShopsView.as_view(), name='favorites'),
    path('user/business-reviews/', UserBusinessReviewsView.as_view(), name='user-business-reviews'),
]
