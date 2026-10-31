from django.urls import path
from .views import TouristPlaceListView, TouristPlaceDetailView

urlpatterns = [
    path('', TouristPlaceListView.as_view(), name='places-list'),
    path('<int:pk>/', TouristPlaceDetailView.as_view(), name='places-detail-pk'),
    path('<slug:slug>/', TouristPlaceDetailView.as_view(), name='places-detail-slug'),
]

