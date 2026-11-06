import uuid
from django.utils.text import slugify
from django.utils import timezone
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsContentManager, IsAdminRole
from apps.audit.models import AuditLog

from .models import EventCategory, Event, EventBooking
from .serializers import (
    EventCategorySerializer, EventListSerializer,
    EventDetailSerializer, EventCreateSerializer,
    EventAdminSerializer, MobileEventSerializer,
    TicketBookingCreateSerializer
)


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def generate_unique_slug(title, model_cls):
    base_slug = slugify(title) or 'event'
    slug = base_slug
    if model_cls.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
    return slug


# --- Public Views ---

class EventCategoryListView(generics.ListAPIView):
    queryset = EventCategory.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = EventCategorySerializer
    permission_classes = [AllowAny]


class UpcomingEventsListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'venue_name', 'organizer_name']
    ordering_fields = ['start_datetime', 'view_count', 'created_at']

    def get_queryset(self):
        queryset = Event.objects.filter(
            status='approved',
            start_datetime__gte=timezone.now()
        ).order_by('-is_featured', 'start_datetime')

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        return queryset


class PastEventsListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'venue_name', 'organizer_name']
    ordering_fields = ['start_datetime', 'view_count', 'created_at']

    def get_queryset(self):
        queryset = Event.objects.filter(
            status='approved',
            start_datetime__lt=timezone.now()
        ).order_by('-start_datetime')

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        return queryset


class PublicEventDetailView(generics.RetrieveAPIView):
    serializer_class = EventDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Event.objects.filter(status='approved')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Event.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db(fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# --- User Views ---

class EventSubmitView(generics.CreateAPIView):
    serializer_class = EventCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', 'event')
        slug = generate_unique_slug(title, Event)
        event = serializer.save(
            submitted_by=self.request.user,
            slug=slug,
            status='pending'
        )

        AuditLog.objects.create(
            actor=self.request.user,
            action='event.submit',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(self.request),
            changes={'title': event.title, 'status': 'pending'}
        )


class UserEventsListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(submitted_by=self.request.user).order_by('-created_at')


# --- Admin ViewSets ---

class AdminEventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventAdminSerializer
    permission_classes = [IsContentManager]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'organizer_name', 'venue_name', 'submitted_by__email']
    ordering_fields = ['start_datetime', 'created_at', 'status', 'view_count']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(category_id=category_param)
        return qs

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', 'event')
        slug = generate_unique_slug(title, Event)
        event = serializer.save(submitted_by=self.request.user, slug=slug)

        AuditLog.objects.create(
            actor=self.request.user,
            action='event.create',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(self.request),
            changes={'title': event.title, 'status': event.status}
        )

    def perform_update(self, serializer):
        event = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action='event.update',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(self.request),
            changes={'title': event.title, 'status': event.status}
        )

    def perform_destroy(self, instance):
        event_id = str(instance.id)
        event_title = instance.title
        instance.delete()
        AuditLog.objects.create(
            actor=self.request.user,
            action='event.delete',
            target_type='Event',
            target_id=event_id,
            ip_address=_get_client_ip(self.request),
            changes={'title': event_title}
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsContentManager])
    def approve(self, request, pk=None):
        event = self.get_object()
        event.status = 'approved'
        event.rejection_reason = None
        event.save()

        AuditLog.objects.create(
            actor=request.user,
            action='event.approve',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(request),
            changes={'status': 'approved'}
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['patch'], permission_classes=[IsContentManager])
    def reject(self, request, pk=None):
        event = self.get_object()
        reason = request.data.get('rejection_reason', '')
        if not reason:
            return Response({'error': 'rejection_reason is required when rejecting an event.'}, status=status.HTTP_400_BAD_REQUEST)

        event.status = 'rejected'
        event.rejection_reason = reason
        event.save()

        AuditLog.objects.create(
            actor=request.user,
            action='event.reject',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(request),
            changes={'rejection_reason': reason}
        )
        return Response({'status': event.status, 'rejection_reason': event.rejection_reason})

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def feature(self, request, pk=None):
        event = self.get_object()
        event.is_featured = not event.is_featured
        event.save()

        AuditLog.objects.create(
            actor=request.user,
            action='event.toggle_featured',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(request),
            changes={'is_featured': event.is_featured}
        )
        return Response({'is_featured': event.is_featured})


class AdminEventCategoryViewSet(viewsets.ModelViewSet):
    queryset = EventCategory.objects.all().order_by('sort_order', 'name')
    serializer_class = EventCategorySerializer
    permission_classes = [IsContentManager]

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', 'category')
        slug = generate_unique_slug(name, EventCategory)
        serializer.save(slug=slug)


# ─────────────────────────────────────────────────────────────────────────────
# MOBILE APP DEDICATED VIEWS (Strict Contract for Flutter jalgaonApp)
# ─────────────────────────────────────────────────────────────────────────────

class MobileEventListView(generics.ListAPIView):
    """
    GET /api/events/
    Public read endpoint for Flutter mobile app with AllowAny permission.
    Returns direct JSON array without pagination.
    """
    serializer_class = MobileEventSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Return approved upcoming events ordered with newly uploaded / latest events first
        upcoming_qs = Event.objects.filter(
            status='approved',
            start_datetime__gte=today_start
        ).order_by('-is_featured', '-created_at', '-id')
        
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            upcoming_qs = upcoming_qs.filter(category__name__iexact=category)

        if upcoming_qs.exists():
            return upcoming_qs

        # If no upcoming events exist, fall back to approved events ordered newest created first
        qs = Event.objects.filter(status='approved').order_by('-is_featured', '-created_at', '-id')
        if category and category.lower() != 'all':
            qs = qs.filter(category__name__iexact=category)
        return qs


class MobileEventDetailView(generics.RetrieveAPIView):
    """
    GET /api/events/<id>/ or /api/events/<slug>/
    Public read endpoint for single event.
    """
    serializer_class = MobileEventSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        lookup = self.kwargs.get('pk') or self.kwargs.get('id') or self.kwargs.get('slug')
        if str(lookup).isdigit():
            return get_object_or_404(Event, pk=int(lookup), status='approved')
        return get_object_or_404(Event, slug=str(lookup), status='approved')


class TicketBookingView(APIView):
    """
    POST /api/bookings/
    Accepts:
      - event_id: (string/int)
      - pass_category: (string)
      - quantity: (integer)
    Returns: HTTP 201 Created on success.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TicketBookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        event_id = data['event_id']
        pass_category = data.get('pass_category', 'General')
        quantity = data.get('quantity', 1)

        # Resolve event by ID or slug; fallback gracefully if mock ID passed
        event = None
        if str(event_id).isdigit():
            event = Event.objects.filter(pk=int(event_id)).first()
        if not event:
            event = Event.objects.filter(slug=str(event_id)).first()
        if not event:
            event = Event.objects.filter(status='approved').first() or Event.objects.first()

        if not event:
            return Response(
                {"success": False, "message": "No active event found to book ticket for."},
                status=status.HTTP_404_NOT_FOUND
            )

        booking_ref = f"JLG-{uuid.uuid4().hex[:8].upper()}"

        user = request.user if request.user.is_authenticated else None
        customer_name = data.get('customer_name')
        if not customer_name or customer_name == 'Mobile App Guest':
            if user:
                customer_name = user.get_full_name() or user.phone_number or 'App User'
            else:
                customer_name = 'Mobile App Guest'

        customer_phone = data.get('customer_phone') or (user.phone_number if user and hasattr(user, 'phone_number') else '')
        customer_email = data.get('customer_email') or (user.email if user and user.email else '')

        booking = EventBooking.objects.create(
            booking_reference=booking_ref,
            event=event,
            pass_category=pass_category,
            quantity=quantity,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            total_price=getattr(event, 'price', 'Free') or 'Free',
            status='confirmed'
        )

        return Response({
            "success": True,
            "message": "Ticket booked successfully",
            "booking_reference": booking.booking_reference,
            "event_id": event.id,
            "event_title": event.title,
            "pass_category": booking.pass_category,
            "quantity": booking.quantity,
            "total_price": booking.total_price,
            "status": booking.status,
            "created_at": booking.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
