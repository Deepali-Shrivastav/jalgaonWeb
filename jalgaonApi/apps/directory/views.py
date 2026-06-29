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

class CategoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            categories = MainCategory.objects.all()
            serializer = MainCategorySerializer(categories, many=True)
            return Response({"categories": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "An error occurred while fetching categories."}, status=status.HTTP_400_BAD_REQUEST)

class SubCategoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            subCategories = SubCategory.objects.all()
            serializer = SubCategorySerializer(subCategories, many=True)
            return Response({"categories": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "An error occurred while fetching categories."}, status=status.HTTP_400_BAD_REQUEST)

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

class LikedShopsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id', None)
        if not user_id:
            return Response({"error": "User ID not provided"}, status=400)

        liked_shops = LikedShops.objects.filter(user=user_id)
        serializer = LikedShopsSerializer(liked_shops, many=True)
        return Response(serializer.data)

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

class UserListedShops(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id', None)
        if not user_id:
            return Response({"error": "User ID not provided"}, status=400)
        listed_shops = ShopListing.objects.filter(user=user_id)
        serializer = ShopListingSerializer(listed_shops, many=True)
        return Response(serializer.data)

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
