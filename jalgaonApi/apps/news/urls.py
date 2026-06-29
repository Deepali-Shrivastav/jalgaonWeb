from django.urls import path
from .views import ArticleListView, ActiveArticleListView, get_article_by_id

urlpatterns = [
    path('articles/', ArticleListView.as_view(), name='articles'),
    path('active/', ActiveArticleListView.as_view(), name='active_articles'),
    path('detail/', get_article_by_id, name='article_detail'),
]
