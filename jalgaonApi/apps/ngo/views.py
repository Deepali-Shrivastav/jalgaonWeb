from rest_framework import generics, permissions, viewsets
from core.permissions import IsContentManager
from .models import NGOCategory, NGO
from .serializers import NGOCategorySerializer, NGOSerializer

class NGOCategoryListView(generics.ListAPIView):
    queryset = NGOCategory.objects.all()
    serializer_class = NGOCategorySerializer
    permission_classes = [permissions.AllowAny]

class NGOListView(generics.ListAPIView):
    queryset = NGO.objects.filter(is_verified=True).select_related('category')
    serializer_class = NGOSerializer
    permission_classes = [permissions.AllowAny]

class NGODetailView(generics.RetrieveAPIView):
    queryset = NGO.objects.filter(is_verified=True).select_related('category')
    serializer_class = NGOSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class NGOCreateView(generics.CreateAPIView):
    queryset = NGO.objects.all()
    serializer_class = NGOSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserNGOListView(generics.ListAPIView):
    serializer_class = NGOSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NGO.objects.filter(managed_by=self.request.user).select_related('category')

class AdminNGOCategoryViewSet(viewsets.ModelViewSet):
    queryset = NGOCategory.objects.all().order_by('name')
    serializer_class = NGOCategorySerializer
    permission_classes = [IsContentManager]

class AdminNGOViewSet(viewsets.ModelViewSet):
    queryset = NGO.objects.all().order_by('-created_at')
    serializer_class = NGOSerializer
    permission_classes = [IsContentManager]

