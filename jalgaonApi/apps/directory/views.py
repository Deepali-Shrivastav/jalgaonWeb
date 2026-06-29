from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .models import MainCategory, SubCategory, ShopListing, LikedShops
from .serializers import (
    MainCategorySerializer, SubCategorySerializer, ShopListingSerializer,
    LikedShopsSerializer, LikedShopsCreateSerializer
)
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CategoryView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = MainCategory.objects.select_related('category_img').all()
    serializer_class = MainCategorySerializer
    pagination_class = StandardResultsSetPagination

class SubCategoryView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = SubCategory.objects.select_related('main_category').all()
    serializer_class = SubCategorySerializer
    pagination_class = StandardResultsSetPagination

@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
class ShopListingCreateView(APIView):
    def post(self, request, format=None):
        serializer = ShopListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def shop_listing(request):
    try:
        serializer = ShopListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_products_by_category(request):
    main_category = request.GET.get('mainCategoryId')
    if main_category:
        shop_listing = ShopListing.objects.filter(main_category=main_category)
        shop_listing_list = list(shop_listing.values())
        return JsonResponse(shop_listing_list, safe=False)
    return JsonResponse({'error': 'mainCategory parameter is missing'}, status=400)

class ProductDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        product_id = request.GET.get('productId')
        if product_id:
            try:
                shop_listing = ShopListing.objects.get(id=product_id)
                serializer = ShopListingSerializer(shop_listing)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'productId parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)

class LikedShopsView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LikedShopsSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            return LikedShops.objects.select_related('shop_listing', 'shop_listing__main_category', 'shop_listing__sub_category').filter(user=user_id)
        return LikedShops.objects.none()

    def post(self, request, *args, **kwargs):
        serializer = LikedShopsCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            shop_listing = serializer.validated_data['shop_listing']
            if LikedShops.objects.filter(user=user, shop_listing=shop_listing).exists():
                return Response({"error": "This shop listing is already liked by this user"}, status=400)

            liked_shop = LikedShops.objects.create(user=user, shop_listing=shop_listing)
            return Response(LikedShopsSerializer(liked_shop).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListedShops(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShopListingSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            return ShopListing.objects.select_related('main_category', 'sub_category').filter(user=user_id)
        return ShopListing.objects.none()

class UserListedShopsEdit(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        shop_id = request.query_params.get('shop_id', None)
        if not shop_id:
            return Response({"error": "Shop ID not provided"}, status=400)

        try:
            listed_shop = ShopListing.objects.get(id=shop_id)
        except ShopListing.DoesNotExist:
            return Response({"error": "Shop not found"}, status=404)

        serializer = ShopListingSerializer(listed_shop)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
class UpdateShopListingView(APIView):
    def put(self, request, *args, **kwargs):
        shop_id = request.query_params.get('shop_id')
        try:
            shop_listing = ShopListing.objects.get(pk=shop_id)
        except ShopListing.DoesNotExist:
            return Response({'error': 'ShopListing not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ShopListingSerializer(shop_listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
