from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.ticketing.models import (
    Venue, EventShow, ShowSeat, Booking, Ticket,
    MarketingHold, MarketingHoldAuditLog
)
from apps.ticketing.serializers import (
    VenueSerializer, EventShowSerializer, ShowSeatSerializer,
    SeatHoldRequestSerializer, BookingSerializer, PaymentVerifySerializer,
    TicketSerializer, StaffScanRequestSerializer,
    MarketingHoldCreateSerializer, MarketingHoldSerializer,
    MarketingHoldAuditLogSerializer
)
from apps.ticketing.services.seat_service import hold_seats, release_expired_holds, SeatUnavailableError
from apps.ticketing.services.marketing_hold_service import (
    apply_marketing_hold, release_marketing_hold, release_expired_marketing_holds
)
from apps.ticketing.services.payment_service import (
    create_razorpay_order, confirm_booking, process_cancellation_and_refund,
    PaymentVerificationError
)
from apps.ticketing.services.ticket_service import scan_ticket


class IsAdminOrStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'role', '') in ['admin', 'super_admin', 'superadmin', 'event_manager']))


class IsGateStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or getattr(request.user, 'role', '') in ['gate_staff', 'venue_staff', 'admin', 'super_admin', 'superadmin', 'event_manager']))


# ── PUBLIC VIEWS ──────────────────────────────────────────────────────────────

class VenueListView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Venue.objects.filter(is_active=True).prefetch_related('sections__rows__seats')
    serializer_class = VenueSerializer


class EventShowListView(ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EventShowSerializer

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        return EventShow.objects.filter(
            event__slug=slug,
            status__in=[EventShow.Status.SCHEDULED, EventShow.Status.BOOKING_OPEN]
        ).select_related('event', 'venue').prefetch_related('categories__section')


class ShowSeatMapView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, show_id):
        # Auto-release any expired holds before returning seat map
        release_expired_holds()
        release_expired_marketing_holds()

        show = get_object_or_404(EventShow.objects.select_related('event', 'venue'), id=show_id)
        seats = ShowSeat.objects.filter(show=show).select_related(
            'venue_seat__row__section', 'category'
        )

        serializer = ShowSeatSerializer(seats, many=True, context={'request': request})
        
        # Group by section for frontend canvas rendering
        sections_dict = {}
        for s_data in serializer.data:
            sec_name = s_data['section_name']
            sec_id = s_data['section_id']
            if sec_id not in sections_dict:
                sections_dict[sec_id] = {
                    'section_id': sec_id,
                    'section_name': sec_name,
                    'seats': []
                }
            sections_dict[sec_id]['seats'].append(s_data)

        return Response({
            'show_id': show.id,
            'event_title': show.event.title,
            'venue_name': show.venue.name,
            'show_datetime': show.show_datetime,
            'sections': list(sections_dict.values())
        })


# ── USER CHECKOUT VIEWS ───────────────────────────────────────────────────────

class HoldSeatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, show_id):
        serializer = SeatHoldRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            booking = hold_seats(
                show_id=show_id,
                seat_ids=data['seat_ids'],
                user=request.user if request.user.is_authenticated else None,
                customer_name=data.get('customer_name', ''),
                customer_email=data.get('customer_email', ''),
                customer_phone=data.get('customer_phone', ''),
                send_whatsapp=data.get('send_whatsapp', True)
            )
            b_serializer = BookingSerializer(booking)
            return Response(b_serializer.data, status=status.HTTP_201_CREATED)
        except SeatUnavailableError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BookingDetailView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = BookingSerializer
    lookup_field = 'booking_reference'
    queryset = Booking.objects.prefetch_related('items__show_seat__venue_seat__row__section', 'show__event', 'show__venue')


class InitiatePaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, booking_reference):
        booking = get_object_or_404(Booking, booking_reference=booking_reference)
        
        # Check hold expiration
        release_expired_holds()
        booking.refresh_from_db()

        if booking.status != Booking.Status.PENDING:
            return Response(
                {'error': f"Booking is no longer active (Status: {booking.status})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment = create_razorpay_order(booking)

        return Response({
            'booking_reference': booking.booking_reference,
            'razorpay_order_id': payment.razorpay_order_id,
            'amount_paisa': payment.amount_paisa,
            'currency': payment.currency,
            'customer_name': booking.customer_name,
            'customer_email': booking.customer_email,
            'customer_phone': booking.customer_phone
        })


class VerifyPaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, booking_reference):
        booking = get_object_or_404(Booking, booking_reference=booking_reference)
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            ticket = confirm_booking(
                booking=booking,
                razorpay_payment_id=data['razorpay_payment_id'],
                razorpay_signature=data['razorpay_signature']
            )
            t_serializer = TicketSerializer(ticket)
            return Response({
                'message': 'Payment successful. Booking confirmed.',
                'ticket': t_serializer.data
            }, status=status.HTTP_200_OK)
        except PaymentVerificationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CancelBookingView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, booking_reference):
        booking = get_object_or_404(Booking, booking_reference=booking_reference)
        try:
            process_cancellation_and_refund(booking, user=request.user)
            return Response({
                'message': 'Booking cancelled successfully. Refund initiated if eligible.',
                'status': 'CANCELLED'
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MyBookingsView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')


class MyTicketsView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        return Ticket.objects.filter(booking__user=self.request.user).order_by('-created_at')


class TicketDetailView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TicketSerializer
    lookup_field = 'ticket_code'
    queryset = Ticket.objects.prefetch_related('booking__items__show_seat__venue_seat__row__section')


# ── STAFF SCANNER VIEWS ───────────────────────────────────────────────────────

class StaffTicketScanView(APIView):
    permission_classes = [IsGateStaffUser]

    def post(self, request):
        serializer = StaffScanRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        result = scan_ticket(
            ticket_code=data['ticket_code'],
            staff_user=request.user,
            show_id=data.get('show_id'),
            ip_address=request.META.get('REMOTE_ADDR', '')
        )

        status_code = status.HTTP_200_OK if result['result'] == 'SUCCESS' else status.HTTP_400_BAD_REQUEST
        return Response(result, status=status_code)


# ── ADMIN & MARKETING HOLD VIEWS ──────────────────────────────────────────────

class AdminMarketingHoldCreateView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def post(self, request, show_id):
        serializer = MarketingHoldCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            m_hold = apply_marketing_hold(
                show_id=show_id,
                seat_ids=data.get('seat_ids'),
                row_ids=data.get('row_ids'),
                section_ids=data.get('section_ids'),
                admin_user=request.user,
                reason=data['reason'],
                hold_type=data.get('hold_type', MarketingHold.HoldType.PROMOTIONAL),
                expires_at=data.get('expires_at'),
                ip_address=request.META.get('REMOTE_ADDR', '')
            )
            h_serializer = MarketingHoldSerializer(m_hold)
            return Response(h_serializer.data, status=status.HTTP_201_CREATED)
        except SeatUnavailableError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminMarketingHoldReleaseView(APIView):
    permission_classes = [IsAdminOrStaffUser]

    def post(self, request, hold_id):
        notes = request.data.get('notes', '')
        try:
            released_count = release_marketing_hold(
                marketing_hold_id=hold_id,
                admin_user=request.user,
                notes=notes,
                ip_address=request.META.get('REMOTE_ADDR', '')
            )
            return Response({
                'message': f"Marketing Hold released. {released_count} seats set to AVAILABLE.",
                'released_count': released_count
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminMarketingHoldListView(ListAPIView):
    permission_classes = [IsAdminOrStaffUser]
    serializer_class = MarketingHoldSerializer

    def get_queryset(self):
        show_id = self.request.query_params.get('show_id')
        qs = MarketingHold.objects.all().order_by('-created_at')
        if show_id:
            qs = qs.filter(show_id=show_id)
        return qs


class AdminMarketingHoldAuditLogView(ListAPIView):
    permission_classes = [IsAdminOrStaffUser]
    serializer_class = MarketingHoldAuditLogSerializer

    def get_queryset(self):
        hold_id = self.request.query_params.get('hold_id')
        qs = MarketingHoldAuditLog.objects.all().order_by('-performed_at')
        if hold_id:
            qs = qs.filter(marketing_hold_id=hold_id)
        return qs
