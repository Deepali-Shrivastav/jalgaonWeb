from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, login, logout, authenticate
from app.serializers import *
from app.models import *
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt

import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            return Response({'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']
            login(request, user)
            token = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(token.access_token)    
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogout(APIView):
    def post(self, request):
        try:
            logout(request)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)

from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    if request.method == 'GET':
        return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})
    else:
        # Handle other HTTP methods if needed
        return JsonResponse({'detail': f'Method "{request.method}" not allowed.'}, status=405)



class CategoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            categories = MainCategory.objects.all()
            serializer = MainCategorySerializer(categories, many=True)
            return Response({"categories": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error occurred: {e}")
            return Response({"error": "An error occurred while fetching categories."}, status=status.HTTP_400_BAD_REQUEST)


class SubCategoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            subCategories = SubCategory.objects.all()
            serializer = SubCategorySerializer(subCategories, many=True)
            return Response({"categories": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error occurred: {e}")
            return Response({"error": "An error occurred while fetching categories."}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes


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
    print("Shop listing data received")  # Fixed typo here

    try:
        # Ensure parser is used to handle multipart form data
        serializer = ShopListingSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Return validation errors if serializer is not valid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        # Handle unexpected exceptions
        print(f"Unexpected error: {e}")
        return Response({'message': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny



class ObtainTokenKeyView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this view

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(username=phone_number, password=password)

        if user:
            # Create or get the token for the user
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid phone number or password'}, status=status.HTTP_400_BAD_REQUEST)



class FinanceTickleView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            print("ok")
            financeData = FinanceData.objects.all()
            serializer = FinanceDataSerializer(financeData, many=True)
            return Response({"financeData": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error occurred: {e}")
            return Response({"error": "An error occurred while fetching finance data. n"}, status=status.HTTP_400_BAD_REQUEST)


class HomeCrouselAdsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            ads = HomeCrouselAds.objects.all()
            serializer = HomeCrouselAdsSerializer(ads, many=True)
            return Response({"ads": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error occurred: {e}")
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
            print(f"Error occurred: {e}")
            return Response({"error": "An error occurred while fetching banner ads."}, status=status.HTTP_400_BAD_REQUEST)


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

class AdsListingCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request, *args, **kwargs):
        logger.debug(f"Received data: {request.data}")
        
        serializer = AdsListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ArticleListView(generics.ListAPIView):
    permission_classes = [AllowAny]

    queryset = ArticleModel.objects.all()
    serializer_class = ArticleModelSerializer


class ActiveArticleListView(generics.ListAPIView):
    queryset = ActiveArticle.objects.all()
    serializer_class = ActiveArticleSerializer
    permission_classes = [AllowAny]



from django.views.decorators.http import require_GET


@require_GET
def get_article_by_id(request):
    article_id = request.GET.get('articleId')
    
    if not article_id:
        return JsonResponse({'error': 'articleId parameter is missing'}, status=400)

    try:
        article = ArticleModel.objects.get(id=article_id)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Article not found'}, status=404)

    # Serialize the article instance
    serializer = ArticleModelSerializer(article)
    
    return JsonResponse(serializer.data, safe=False)


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

            # Check if the instance already exists
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


# # views.py
# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from .models import ShopListing
# from .serializers import ShopListingSerializer

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def submit_review(request):
    user = request.user
    shop_listing_id = request.data.get('shop_listing')
    shop_listing = ShopListing.objects.get(id=shop_listing_id)
    data = {
        'user': user.id,  # Pass user ID instead of user object
        'shop_listing': shop_listing.id,
        'rating_star': request.data.get('rating_star'),
        'user_review': request.data.get('user_review'),
    }
    serializer = ShopReviewCreateSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=user, status='approved')  # Explicitly pass user to save method
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def get_shop_reviews(request):
    shop_id = request.data.get('shop_listing')
    reviews = ShopReview.objects.all()
    # reviews = ShopReview.objects.filter(shop_listing=shop_id)
    serializer = ShopReviewSerializer(reviews, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


from rest_framework.filters import SearchFilter
class ShopSearchView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    queryset = ShopListing.objects.all()
    serializer_class = ShopListingSerializer  # Corrected this line
    filter_backends = [SearchFilter]
    search_fields = ['business_name']
