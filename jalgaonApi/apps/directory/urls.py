from django.urls import path
from .views import (
    CategoryView, SubCategoryView, ShopListingCreateView, shop_listing,
    get_products_by_category, ProductDetailView, LikedShopsView,
    UserListedShops, UserListedShopsEdit, UpdateShopListingView
)

urlpatterns = [
    path('categories/', CategoryView.as_view(), name='categories'),
    path('subcategories/', SubCategoryView.as_view(), name='subcategories'),
    path('', ShopListingCreateView.as_view(), name='shop-listing'),
    path('update/', UpdateShopListingView.as_view(), name='update-shop'),
    path('by-category/', get_products_by_category, name='by-category'),
    path('detail/', ProductDetailView.as_view(), name='detail'),
    path('my-listings/', UserListedShops.as_view(), name='my-listings'),
    path('edit-data/', UserListedShopsEdit.as_view(), name='edit-data'),
    path('favorites/', LikedShopsView.as_view(), name='favorites'),
]
