from django.urls import path, include
from apps.events.views import (
    MobileEventListView, MobileEventDetailView, TicketBookingView
)
from apps.tourism.views import (
    TouristPlaceListView, TouristPlaceDetailView
)
from apps.directory.mobile_views import (
    MobileCategoryListView, MobileCategoryDetailView,
    MobileBusinessListView, MobileBusinessDetailView
)
from apps.news.views import (
    MobileNewsListView, PublicNewsListView,
    BreakingNewsListView, TrendingNewsListView, PublicNewsDetailView
)

urlpatterns = [
    # ─── A. Events & Ticket Booking ──────────────────────────────────────────
    path('events/', MobileEventListView.as_view(), name='api-events-list'),
    path('events/<int:pk>/', MobileEventDetailView.as_view(), name='api-event-detail-pk'),
    path('events/<slug:slug>/', MobileEventDetailView.as_view(), name='api-event-detail-slug'),
    path('bookings/', TicketBookingView.as_view(), name='api-ticket-booking'),

    # ─── B. Tourist Places ───────────────────────────────────────────────────
    path('places/', TouristPlaceListView.as_view(), name='api-places-list'),
    path('places/<int:pk>/', TouristPlaceDetailView.as_view(), name='api-places-detail-pk'),
    path('places/<slug:slug>/', TouristPlaceDetailView.as_view(), name='api-places-detail-slug'),

    # ─── C. Categories & Businesses ─────────────────────────────────────────
    path('categories/', MobileCategoryListView.as_view(), name='api-categories-list'),
    path('categories/<slug:slug>/', MobileCategoryDetailView.as_view(), name='api-category-detail'),
    path('businesses/', MobileBusinessListView.as_view(), name='api-businesses-list'),
    path('businesses/<str:business_id>/', MobileBusinessDetailView.as_view(), name='api-business-detail'),

    # ─── D. News Endpoints ───────────────────────────────────────────────────
    path('news/', MobileNewsListView.as_view(), name='api-news-list'),
    path('news/latest/', PublicNewsListView.as_view(), name='api-news-latest'),
    path('news/breaking/', BreakingNewsListView.as_view(), name='api-news-breaking'),
    path('news/trending/', TrendingNewsListView.as_view(), name='api-news-trending'),
    path('news/<slug:slug>/', PublicNewsDetailView.as_view(), name='api-news-detail-slug'),

    # ─── E. Complementary City Ecosystem Endpoints ───────────────────────────
    path('startups/', include('apps.startups.urls')),
    path('jobs/', include('apps.jobs.urls')),
    path('ngos/', include('apps.ngo.urls')),
]
