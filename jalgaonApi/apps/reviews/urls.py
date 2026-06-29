from django.urls import path
from .views import submit_review, get_shop_reviews

urlpatterns = [
    path('', submit_review, name='submit_review'),
    path('by-shop/', get_shop_reviews, name='get_shop_reviews'),
]
