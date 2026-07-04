from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventCategoryListView, UpcomingEventsListView, PastEventsListView,
    PublicEventDetailView, EventSubmitView, UserEventsListView,
    AdminEventViewSet, AdminEventCategoryViewSet
)

router = DefaultRouter()
router.register(r'admin/events', AdminEventViewSet, basename='admin-events')
router.register(r'admin/categories', AdminEventCategoryViewSet, basename='admin-event-categories')

urlpatterns = [
    # Public endpoints
    path('', UpcomingEventsListView.as_view(), name='upcoming-events'),
    path('past/', PastEventsListView.as_view(), name='past-events'),
    path('categories/', EventCategoryListView.as_view(), name='event-categories'),

    # User endpoints
    path('submit/', EventSubmitView.as_view(), name='event-submit'),
    path('my-events/', UserEventsListView.as_view(), name='my-events'),

    # Admin endpoints via router
    path('', include(router.urls)),

    # Public detail (slug catch-all at bottom so fixed paths match first)
    path('<slug:slug>/', PublicEventDetailView.as_view(), name='event-detail'),
]
