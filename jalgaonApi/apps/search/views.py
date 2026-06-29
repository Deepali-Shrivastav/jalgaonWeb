from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter
from apps.directory.models import ShopListing
from apps.directory.serializers import ShopListingSerializer

class ShopSearchView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    queryset = ShopListing.objects.all()
    serializer_class = ShopListingSerializer
    filter_backends = [SearchFilter]
    search_fields = ['business_name']
