from django.contrib import admin
from .models import CategoryImg, MainCategory, SubCategory, ShopListing, LikedShops

admin.site.register(CategoryImg)
admin.site.register(MainCategory)
admin.site.register(SubCategory)
admin.site.register(ShopListing)
admin.site.register(LikedShops)
