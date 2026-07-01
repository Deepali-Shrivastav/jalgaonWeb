from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ArticleListView, ActiveArticleListView, get_article_by_id,
    NewsCategoryListView, PublicNewsListView, BreakingNewsListView,
    TrendingNewsListView, PublicNewsDetailView, NewsArticleCommentsView,
    AdminNewsArticleViewSet, AdminCategoryViewSet, AdminCommentViewSet
)

router = DefaultRouter()
router.register(r'admin/articles', AdminNewsArticleViewSet, basename='admin-articles')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-categories')
router.register(r'admin/comments', AdminCommentViewSet, basename='admin-comments')

urlpatterns = [
    # Legacy endpoints
    path('articles/', ArticleListView.as_view(), name='articles'),
    path('active/', ActiveArticleListView.as_view(), name='active_articles'),
    path('detail/', get_article_by_id, name='article_detail'),

    # Public endpoints
    path('categories/', NewsCategoryListView.as_view(), name='public-categories'),
    path('breaking/', BreakingNewsListView.as_view(), name='public-breaking'),
    path('trending/', TrendingNewsListView.as_view(), name='public-trending'),
    
    # Admin endpoints
    path('', include(router.urls)),
    
    # Note: placing these lower so they don't match 'categories' or 'admin' 
    path('', PublicNewsListView.as_view(), name='public-news-list'),
    path('<slug:slug>/', PublicNewsDetailView.as_view(), name='public-news-detail'),
    path('<slug:slug>/comments/', NewsArticleCommentsView.as_view(), name='public-news-comments'),
]
