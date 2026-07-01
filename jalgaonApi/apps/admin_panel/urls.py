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

    # Category Management
    path('categories/', views.AdminCategoryListView.as_view(), name='category-list'),
    path('categories/<int:category_id>/', views.AdminCategoryDetailView.as_view(), name='category-detail'),

    # Moderation Queue
    path('moderation/', views.ModerationListView.as_view(), name='moderation-list'),
    path('moderation/<int:item_id>/', views.ModerationActionView.as_view(), name='moderation-action'),
]
