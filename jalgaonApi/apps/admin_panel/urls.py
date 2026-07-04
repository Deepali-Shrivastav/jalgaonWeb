from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    # Dashboard
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),

    # User Management
    path('users/', views.AdminUserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/', views.AdminUserDetailView.as_view(), name='user-detail'),
    path('users/<int:user_id>/role/', views.AdminUserRoleView.as_view(), name='user-role'),

    # Listing Management
    path('listings/', views.AdminListingListView.as_view(), name='listing-list'),
    path('listings/<int:listing_id>/', views.AdminListingActionView.as_view(), name='listing-action'),
    path('listings/<int:listing_id>/trending/', views.AdminTrendingActionView.as_view(), name='trending-action'),

    # Category Management
    path('categories/', views.AdminCategoryListView.as_view(), name='category-list'),
    path('categories/<int:category_id>/', views.AdminCategoryDetailView.as_view(), name='category-detail'),

    # Subcategory Management
    path('subcategories/', views.AdminSubCategoryListView.as_view(), name='subcategory-list'),
    path('subcategories/<int:subcategory_id>/', views.AdminSubCategoryDetailView.as_view(), name='subcategory-detail'),

    # Business Claims
    path('business-claims/', views.AdminBusinessClaimListView.as_view(), name='business-claim-list'),
    path('business-claims/<int:claim_id>/', views.AdminBusinessClaimActionView.as_view(), name='business-claim-action'),

    # Business Reports
    path('business-reports/', views.AdminBusinessReportListView.as_view(), name='business-report-list'),
    path('business-reports/<int:report_id>/', views.AdminBusinessReportActionView.as_view(), name='business-report-action'),

    # Moderation Queue
    path('moderation/', views.ModerationListView.as_view(), name='moderation-list'),
    path('moderation/<int:item_id>/', views.ModerationActionView.as_view(), name='moderation-action'),

    # Ads Moderation & Slots
    path('ads/', views.AdminAdsListView.as_view(), name='ads-list'),
    path('ads/<int:ad_id>/', views.AdminAdsActionView.as_view(), name='ads-action'),
    path('ad-slots/', views.AdminAdSlotListView.as_view(), name='ad-slot-list'),
    path('ad-slots/<int:slot_id>/', views.AdminAdSlotDetailView.as_view(), name='ad-slot-detail'),
]

