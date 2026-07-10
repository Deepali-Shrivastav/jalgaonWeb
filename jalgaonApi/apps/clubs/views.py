from rest_framework import generics, viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F

from core.permissions import IsContentManager
from .models import ClubCategory, Club, ClubActivity, ClubMember, ClubPhoto
from .serializers import (
    ClubCategorySerializer,
    ClubActivitySerializer,
    ClubPhotoSerializer,
    ClubMemberSerializer,
    ClubListSerializer,
    ClubDetailSerializer,
    ClubSubmitSerializer,
    ClubAdminSerializer
)

class ClubCategoryListView(generics.ListAPIView):
    queryset = ClubCategory.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = ClubCategorySerializer
    permission_classes = [AllowAny]


class PublicClubListView(generics.ListAPIView):
    serializer_class = ClubListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'short_description', 'address']

    def get_queryset(self):
        queryset = Club.objects.filter(status='approved').order_by('-is_featured', '-created_at')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset


class FeaturedClubListView(generics.ListAPIView):
    serializer_class = ClubListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        featured = Club.objects.filter(status='approved', is_featured=True).order_by('-created_at')
        if not featured.exists():
            return Club.objects.filter(status='approved').order_by('-created_at')[:4]
        return featured[:4]


class PublicClubDetailView(generics.RetrieveAPIView):
    queryset = Club.objects.filter(status='approved')
    serializer_class = ClubDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Club.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SubmitClubView(generics.CreateAPIView):
    serializer_class = ClubSubmitSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserClubListView(generics.ListAPIView):
    serializer_class = ClubListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Club.objects.filter(submitted_by=self.request.user).order_by('-created_at')


class AdminClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all().order_by('-created_at')
    serializer_class = ClubAdminSerializer
    permission_classes = [IsContentManager]

    @action(detail=True, methods=['patch'], url_path='approve')
    def approve(self, request, pk=None):
        club = self.get_object()
        club.status = 'approved'
        club.rejection_reason = None
        club.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['patch'], url_path='reject')
    def reject(self, request, pk=None):
        club = self.get_object()
        club.status = 'rejected'
        reason = request.data.get('rejection_reason', '')
        club.rejection_reason = reason
        club.save()
        return Response({'status': 'rejected', 'rejection_reason': reason})


class AdminClubCategoryViewSet(viewsets.ModelViewSet):
    queryset = ClubCategory.objects.all().order_by('sort_order', 'name')
    serializer_class = ClubCategorySerializer
    permission_classes = [IsContentManager]


class AdminClubActivityViewSet(viewsets.ModelViewSet):
    queryset = ClubActivity.objects.all()
    serializer_class = ClubActivitySerializer
    permission_classes = [IsContentManager]

    def get_queryset(self):
        queryset = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            queryset = queryset.filter(club_id=club_id)
        return queryset

    def perform_create(self, serializer):
        club_id = self.request.data.get('club_id')
        if club_id:
            serializer.save(club_id=club_id)
        else:
            serializer.save()


class AdminClubMemberViewSet(viewsets.ModelViewSet):
    queryset = ClubMember.objects.all()
    serializer_class = ClubMemberSerializer
    permission_classes = [IsContentManager]

    def get_queryset(self):
        queryset = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            queryset = queryset.filter(club_id=club_id)
        return queryset

    def perform_create(self, serializer):
        club_id = self.request.data.get('club_id')
        if club_id:
            serializer.save(club_id=club_id)
        else:
            serializer.save()


class AdminClubPhotoViewSet(viewsets.ModelViewSet):
    queryset = ClubPhoto.objects.all()
    serializer_class = ClubPhotoSerializer
    permission_classes = [IsContentManager]

    def get_queryset(self):
        queryset = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            queryset = queryset.filter(club_id=club_id)
        return queryset

    def perform_create(self, serializer):
        club_id = self.request.data.get('club_id')
        if club_id:
            serializer.save(club_id=club_id)
        else:
            serializer.save()
