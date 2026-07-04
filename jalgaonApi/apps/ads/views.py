import logging
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import HomeCrouselAds, BannerAds, AdsListing
from .serializers import HomeCrouselAdsSerializer, BannerAdsSerializer, AdsListingSerializer

logger = logging.getLogger(__name__)

class HomeCrouselAdsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            ads = HomeCrouselAds.objects.all()
            serializer = HomeCrouselAdsSerializer(ads, many=True)
            return Response({"ads": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "An error occurred while fetching ads."}, status=status.HTTP_400_BAD_REQUEST)

class BannerAdsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            banner_ad = BannerAds.objects.first()
            if banner_ad:
                serializer = BannerAdsSerializer(banner_ad)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "No banner ads available."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "An error occurred while fetching banner ads."}, status=status.HTTP_400_BAD_REQUEST)

class AdsListingCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = AdsListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, status='pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserAdsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop_id = request.query_params.get('shop_id')
        ads = AdsListing.objects.filter(user=request.user)
        if shop_id:
            ads = ads.filter(shop_listing_id=shop_id)
        
        serializer = AdsListingSerializer(ads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PublicAdsListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ads = AdsListing.objects.filter(status='active').order_by('-updated_at')
        serializer = AdsListingSerializer(ads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
