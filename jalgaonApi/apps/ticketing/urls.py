from django.urls import path
from apps.ticketing.views import (
    VenueListView, EventShowListView, ShowSeatMapView, HoldSeatsView,
    BookingDetailView, InitiatePaymentView, VerifyPaymentView, CancelBookingView,
    MyBookingsView, MyTicketsView, TicketDetailView, StaffTicketScanView,
    AdminMarketingHoldCreateView, AdminMarketingHoldReleaseView,
    AdminMarketingHoldListView, AdminMarketingHoldAuditLogView
)

app_name = 'ticketing'

urlpatterns = [
    # Public & Customer Catalog Routes
    path('venues/', VenueListView.as_view(), name='venue-list'),
    path('events/<slug:slug>/shows/', EventShowListView.as_view(), name='event-shows'),
    path('shows/<int:show_id>/seats/', ShowSeatMapView.as_view(), name='show-seat-map'),

    # Checkout & Booking Flow
    path('shows/<int:show_id>/hold/', HoldSeatsView.as_view(), name='hold-seats'),
    path('bookings/<str:booking_reference>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<str:booking_reference>/initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('bookings/<str:booking_reference>/verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('bookings/<str:booking_reference>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),

    # User History & Digital Ticket Pass
    path('my-bookings/', MyBookingsView.as_view(), name='my-bookings'),
    path('my-tickets/', MyTicketsView.as_view(), name='my-tickets'),
    path('tickets/<str:ticket_code>/', TicketDetailView.as_view(), name='ticket-detail'),

    # Gate Staff Turnstile Scanner
    path('staff/scan/', StaffTicketScanView.as_view(), name='staff-scan-ticket'),

    # Admin & SuperAdmin Marketing Hold Panel
    path('admin/shows/<int:show_id>/marketing-hold/', AdminMarketingHoldCreateView.as_view(), name='admin-marketing-hold-create'),
    path('admin/marketing-holds/<int:hold_id>/release/', AdminMarketingHoldReleaseView.as_view(), name='admin-marketing-hold-release'),
    path('admin/marketing-holds/', AdminMarketingHoldListView.as_view(), name='admin-marketing-hold-list'),
    path('admin/marketing-holds/audit-logs/', AdminMarketingHoldAuditLogView.as_view(), name='admin-marketing-hold-audit-logs'),
]
