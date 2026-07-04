from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    NGOCategoryListView, NGOListView, NGODetailView, NGOCreateView, UserNGOListView,
    AdminNGOViewSet, AdminNGOCategoryViewSet
)

router = SimpleRouter()
router.register(r'admin/ngos', AdminNGOViewSet, basename='admin-ngos')
router.register(r'admin/categories', AdminNGOCategoryViewSet, basename='admin-ngo-categories')


urlpatterns = [
    path('categories/', NGOCategoryListView.as_view(), name='ngo-categories'),
    path('my-ngos/', UserNGOListView.as_view(), name='my-ngos'),
    path('submit/', NGOCreateView.as_view(), name='submit-ngo'),
    path('', include(router.urls)),
    path('<slug:slug>/', NGODetailView.as_view(), name='ngo-detail'),
    path('', NGOListView.as_view(), name='ngo-list'),
]
