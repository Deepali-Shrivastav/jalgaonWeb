from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .models import ShopReview
from .serializers import ShopReviewCreateSerializer, ShopReviewSerializer
from apps.directory.models import ShopListing

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def submit_review(request):
    user = request.user
    shop_listing_id = request.data.get('shop_listing')
    shop_listing = ShopListing.objects.get(id=shop_listing_id)
    data = {
        'user': user.id,
        'shop_listing': shop_listing.id,
        'rating_star': request.data.get('rating_star'),
        'user_review': request.data.get('user_review'),
    }
    serializer = ShopReviewCreateSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_shop_reviews(request):
    reviews = ShopReview.objects.all()
    serializer = ShopReviewSerializer(reviews, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
