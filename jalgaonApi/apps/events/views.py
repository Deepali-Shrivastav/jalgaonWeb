import uuid
from django.utils.text import slugify
from django.utils import timezone
from django.db.models import F
from rest_framework import generics, viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsContentManager, IsAdminRole
from apps.audit.models import AuditLog

from .models import EventCategory, Event
from .serializers import (
    EventCategorySerializer, EventListSerializer,
    EventDetailSerializer, EventCreateSerializer,
    EventAdminSerializer
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

        is_featured = self.request.query_params.get('featured')
        if is_featured in ('true', '1', 'True'):
            queryset = queryset.filter(is_featured=True)

        # Date range filtering for calendar view (FR-EVT-04)
        from_date = self.request.query_params.get('from')
        to_date = self.request.query_params.get('to')
        if from_date:
            queryset = queryset.filter(start_datetime__gte=from_date)
        if to_date:
            queryset = queryset.filter(start_datetime__lte=to_date)

        return queryset


class PastEventsListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'venue_name']
    ordering_fields = ['start_datetime', 'view_count']

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
    queryset = Event.objects.filter(status='approved')
    serializer_class = EventDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Atomic view_count increment
        Event.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# --- Authenticated User Views ---

class EventSubmitView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EventCreateSerializer

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
    permission_classes = [IsAuthenticated]
    serializer_class = EventListSerializer

    def get_queryset(self):
        queryset = Event.objects.filter(submitted_by=self.request.user).order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


# --- Admin Views ---

class AdminEventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventAdminSerializer
    permission_classes = [IsContentManager]

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', 'event')
        slug = generate_unique_slug(title, Event)
        event = serializer.save(submitted_by=self.request.user, slug=slug)

        AuditLog.objects.create(
            actor=self.request.user,
            action='event.admin_create',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(self.request),
            changes={'title': event.title, 'status': event.status}
        )

    def perform_destroy(self, instance):
        AuditLog.objects.create(
            actor=self.request.user,
            action='event.delete',
            target_type='Event',
            target_id=str(instance.id),
            ip_address=_get_client_ip(self.request),
            changes={'title': instance.title}
        )
        instance.delete()

    @action(detail=True, methods=['patch'], permission_classes=[IsContentManager])
    def approve(self, request, pk=None):
        event = self.get_object()
        event.status = 'approved'
        event.rejection_reason = ''
        event.save()

        AuditLog.objects.create(
            actor=request.user,
            action='event.approve',
            target_type='Event',
            target_id=str(event.id),
            ip_address=_get_client_ip(request),
        )
        return Response({'status': event.status, 'message': 'Event approved successfully.'})

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
