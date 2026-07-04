import logging
from django.db.models import F, Q, Sum
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import HomeCrouselAds, BannerAds, AdsListing, AdSlot
from .serializers import HomeCrouselAdsSerializer, BannerAdsSerializer, AdsListingSerializer, AdSlotSerializer

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

class TrackImpressionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, ad_id):
        try:
            updated = AdsListing.objects.filter(id=ad_id, status='active').update(impressions=F('impressions') + 1)
            if updated:
                return Response({'message': 'Impression tracked'}, status=status.HTTP_200_OK)
            return Response({'error': 'Ad not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error tracking impression: {e}")
            return Response({'error': 'Failed to track impression'}, status=status.HTTP_400_BAD_REQUEST)

class TrackClickView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, ad_id):
        try:
            updated = AdsListing.objects.filter(id=ad_id, status='active').update(clicks=F('clicks') + 1)
            if updated:
                return Response({'message': 'Click tracked'}, status=status.HTTP_200_OK)
            return Response({'error': 'Ad not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error tracking click: {e}")
            return Response({'error': 'Failed to track click'}, status=status.HTTP_400_BAD_REQUEST)

class AdvertiserAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_ads = AdsListing.objects.filter(user=request.user)
        totals = user_ads.aggregate(
            total_impressions=Sum('impressions'),
            total_clicks=Sum('clicks')
        )
        total_impressions = totals['total_impressions'] or 0
        total_clicks = totals['total_clicks'] or 0
        overall_ctr = round((total_clicks / total_impressions) * 100, 2) if total_impressions > 0 else 0.0

        ads_serializer = AdsListingSerializer(user_ads, many=True)

        return Response({
            'total_ads': user_ads.count(),
            'active_ads': user_ads.filter(status='active').count(),
            'pending_ads': user_ads.filter(status='pending').count(),
            'rejected_ads': user_ads.filter(status='rejected').count(),
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'overall_ctr': overall_ctr,
            'ads': ads_serializer.data
        }, status=status.HTTP_200_OK)

class AdsBySlotView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        slot_name = request.query_params.get('slot', 'hero_banner')
        today = timezone.now().date()

        # Check if global slot is enabled
        try:
            ad_slot = AdSlot.objects.get(slot_name=slot_name)
            if not ad_slot.is_enabled:
                return Response({'slot': slot_name, 'is_enabled': False, 'ads': []}, status=status.HTTP_200_OK)
            max_ads = ad_slot.max_ads
        except AdSlot.DoesNotExist:
            max_ads = 5

        # Query active ads for target_page
        qs = AdsListing.objects.filter(
            status='active',
            target_page=slot_name
        ).filter(
            Q(start_date__isnull=True) | Q(start_date__lte=today)
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=today)
        ).order_by('-updated_at')[:max_ads]

        serializer = AdsListingSerializer(qs, many=True)
        return Response({
            'slot': slot_name,
            'is_enabled': True,
            'ads': serializer.data
        }, status=status.HTTP_200_OK)
