from django.urls import path
from .views import ShopSearchView

urlpatterns = [
    path('', ShopSearchView.as_view(), name='search'),
]
