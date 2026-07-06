from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlogCategoryListView, PublicBlogPostListView, FeaturedBlogPostListView,
    PublicBlogPostDetailView, BlogPostCommentsView,
    AdminBlogPostViewSet, AdminBlogCategoryViewSet, AdminBlogCommentViewSet
)

router = DefaultRouter()
router.register(r'admin/posts', AdminBlogPostViewSet, basename='admin-posts')
router.register(r'admin/categories', AdminBlogCategoryViewSet, basename='admin-categories')
router.register(r'admin/comments', AdminBlogCommentViewSet, basename='admin-comments')

urlpatterns = [
    # Public endpoints
    path('categories/', BlogCategoryListView.as_view(), name='public-blog-categories'),
    path('featured/', FeaturedBlogPostListView.as_view(), name='public-blog-featured'),
    path('posts/', PublicBlogPostListView.as_view(), name='public-blog-list'),
    
    # Admin endpoints
    path('', include(router.urls)),
    
    # Detail / Comments
    path('<slug:slug>/', PublicBlogPostDetailView.as_view(), name='public-blog-detail'),
    path('<slug:slug>/comments/', BlogPostCommentsView.as_view(), name='public-blog-comments'),
]
