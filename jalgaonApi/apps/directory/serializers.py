from rest_framework import serializers
from .models import CategoryImg, MainCategory, SubCategory, ShopListing, LikedShops
from django.contrib.auth import get_user_model

User = get_user_model()

class CategoryImgSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryImg
        fields = '__all__'

class MainCategorySerializer(serializers.ModelSerializer):
    category_img = CategoryImgSerializer()

    class Meta:
        model = MainCategory
        fields = '__all__'

class SubCategorySerializer(serializers.ModelSerializer):
    main_category = serializers.SerializerMethodField()

    class Meta:
        model = SubCategory
        fields = ['id', 'sub_category', 'sub_category_img', 'main_category']

    def get_main_category(self, obj):
        return obj.main_category.main_category


class ShopListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopListing
        fields = '__all__'

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class LikedShopsSerializer(serializers.ModelSerializer):
    shop_listing = ShopListingSerializer()

    class Meta:
        model = LikedShops
        fields = ['user', 'shop_listing']

class LikedShopsCreateSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    shop_listing = serializers.PrimaryKeyRelatedField(queryset=ShopListing.objects.all())
    
    def create(self, validated_data):
        return LikedShops.objects.create(**validated_data)
