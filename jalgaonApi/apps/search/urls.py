from django.urls import path
from .views import ShopSearchView, SearchAutocompleteView, PopularSearchesView, SubcategoryChipsView

urlpatterns = [
    path('', ShopSearchView.as_view(), name='search'),
    path('autocomplete/', SearchAutocompleteView.as_view(), name='search-autocomplete'),
    path('popular/', PopularSearchesView.as_view(), name='search-popular'),
    path('subcategories/', SubcategoryChipsView.as_view(), name='search-subcategories'),
]
