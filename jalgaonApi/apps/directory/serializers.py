from rest_framework import serializers
from .models import CategoryImg, MainCategory, SubCategory, ShopListing, LikedShops, BusinessPhoto, BusinessClaim, BusinessReport
from apps.reviews.serializers import ShopReviewSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CategoryImgSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryImg
        fields = '__all__'

class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'sub_category', 'sub_category_img', 'slug', 'sort_order']

class MainCategorySerializer(serializers.ModelSerializer):
    category_img = CategoryImgSerializer(read_only=True)
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = MainCategory
        fields = ['id', 'main_category', 'slug', 'sort_order', 'category_img', 'subcategories']

    def get_subcategories(self, obj):
        subs = SubCategory.objects.filter(main_category=obj).order_by('sort_order')
        return SubCategorySerializer(subs, many=True).data

class BusinessPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessPhoto
        fields = ['id', 'image', 'caption']

class ListingListSerializer(serializers.ModelSerializer):
    main_category_name = serializers.CharField(source='main_category.main_category', read_only=True)
    main_category_slug = serializers.CharField(source='main_category.slug', read_only=True)
    sub_category_name = serializers.CharField(source='sub_category.sub_category', read_only=True)
    sub_category_slug = serializers.CharField(source='sub_category.slug', read_only=True)
    
    class Meta:
        model = ShopListing
        fields = [
            'id', 'slug', 'business_name', 'main_category_name', 'main_category_slug', 
            'sub_category_name', 'sub_category_slug', 'business_banner', 
            'city', 'business_address', 'business_no', 'whatsapp', 
            'is_trending', 'is_featured', 'avg_rating', 'review_count', 'business_description', 'status'
        ]

class ListingDetailSerializer(serializers.ModelSerializer):
    main_category_name = serializers.CharField(source='main_category.main_category', read_only=True)
    main_category_slug = serializers.CharField(source='main_category.slug', read_only=True)
    sub_category_name = serializers.CharField(source='sub_category.sub_category', read_only=True)
    gallery_photos = BusinessPhotoSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = ShopListing
        exclude = ['user', 'is_valid', 'business_img_one', 'business_img_two', 'business_img_three']

    def get_reviews(self, obj):
        # Only return approved reviews
        approved_reviews = obj.reviews.filter(status='approved').order_by('-timestamp')[:5]
        return ShopReviewSerializer(approved_reviews, many=True).data

class ShopListingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopListing
        exclude = ['user', 'slug', 'status', 'is_claimed', 'is_trending', 'trending_until', 'trending_priority', 'avg_rating', 'review_count', 'views', 'created_at', 'updated_at', 'is_valid', 'business_img_one', 'business_img_two', 'business_img_three']

class LikedShopsSerializer(serializers.ModelSerializer):
    shop_listing = ListingListSerializer(read_only=True)

    class Meta:
        model = LikedShops
        fields = ['id', 'user', 'shop_listing']

class LikedShopsCreateSerializer(serializers.Serializer):
    shop_listing_id = serializers.IntegerField()

class BusinessClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessClaim
        fields = ['id', 'shop_listing', 'user', 'message', 'contact_number', 'status', 'created_at']
        read_only_fields = ['id', 'shop_listing', 'user', 'status', 'created_at']

class BusinessReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessReport
        fields = ['id', 'shop_listing', 'reported_by', 'reason', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'shop_listing', 'reported_by', 'status', 'created_at']
