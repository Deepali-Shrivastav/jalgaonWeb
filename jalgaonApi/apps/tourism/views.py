from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import TouristPlace
from .serializers import TouristPlaceSerializer


class TouristPlaceListView(generics.ListAPIView):
    """
    Public GET endpoint returning list of tourist places.
    permission_classes = [AllowAny]
    Returns a direct JSON array of place objects.
    """
    permission_classes = [AllowAny]
    serializer_class = TouristPlaceSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = TouristPlace.objects.filter(is_active=True).order_by('sort_order', 'id')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)
        return queryset


class TouristPlaceDetailView(generics.RetrieveAPIView):
    """
    Public GET endpoint returning single place detail by id or slug.
    permission_classes = [AllowAny]
    """
    permission_classes = [AllowAny]
    serializer_class = TouristPlaceSerializer

    def get_object(self):
        lookup = self.kwargs.get('pk') or self.kwargs.get('slug')
        if str(lookup).isdigit():
            return get_object_or_404(TouristPlace, pk=int(lookup), is_active=True)
        return get_object_or_404(TouristPlace, slug=str(lookup), is_active=True)
