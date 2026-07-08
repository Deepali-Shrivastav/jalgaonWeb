from rest_framework import generics, viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F

from core.permissions import IsContentManager
from .models import StartupIndustry, Startup, Founder
from .serializers import (
    StartupIndustrySerializer,
    FounderSerializer,
    StartupListSerializer,
    StartupDetailSerializer,
    StartupSubmitSerializer,
    StartupAdminSerializer
)

class StartupIndustryListView(generics.ListAPIView):
    queryset = StartupIndustry.objects.filter(is_active=True).order_by('name')
    serializer_class = StartupIndustrySerializer
    permission_classes = [AllowAny]


class PublicStartupListView(generics.ListAPIView):
    serializer_class = StartupListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'founders__name']

    def get_queryset(self):
        queryset = Startup.objects.filter(status='approved').order_by('-created_at')
        industry_slug = self.request.query_params.get('industry')
        if industry_slug:
            queryset = queryset.filter(industry__slug=industry_slug)
        stage = self.request.query_params.get('stage')
        if stage:
            queryset = queryset.filter(stage=stage)
        return queryset


class FeaturedStartupListView(generics.ListAPIView):
    serializer_class = StartupListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        featured = Startup.objects.filter(status='approved', is_featured=True).order_by('-created_at')
        if not featured.exists():
            return Startup.objects.filter(status='approved').order_by('-created_at')[:4]
        return featured[:4]


class PublicStartupDetailView(generics.RetrieveAPIView):
    queryset = Startup.objects.filter(status='approved')
    serializer_class = StartupDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Startup.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SubmitStartupView(generics.CreateAPIView):
    serializer_class = StartupSubmitSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserStartupListView(generics.ListAPIView):
    serializer_class = StartupListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Startup.objects.filter(submitted_by=self.request.user).order_by('-created_at')


class AdminStartupViewSet(viewsets.ModelViewSet):
    queryset = Startup.objects.all().order_by('-created_at')
    serializer_class = StartupAdminSerializer
    permission_classes = [IsContentManager]

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk=None):
        startup = self.get_object()
        startup.status = 'approved'
        startup.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject(self, request, pk=None):
        startup = self.get_object()
        startup.status = 'rejected'
        startup.save()
        return Response({'status': 'rejected'})


class AdminStartupIndustryViewSet(viewsets.ModelViewSet):
    queryset = StartupIndustry.objects.all().order_by('name')
    serializer_class = StartupIndustrySerializer
    permission_classes = [IsContentManager]


class AdminFounderViewSet(viewsets.ModelViewSet):
    queryset = Founder.objects.all()
    serializer_class = FounderSerializer
    permission_classes = [IsContentManager]

    def get_queryset(self):
        queryset = super().get_queryset()
        startup_id = self.request.query_params.get('startup')
        if startup_id:
            queryset = queryset.filter(startup_id=startup_id)
        return queryset
