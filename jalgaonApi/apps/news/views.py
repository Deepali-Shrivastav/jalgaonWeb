from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_GET
from .models import ArticleModel, ActiveArticle
from .serializers import ArticleModelSerializer, ActiveArticleSerializer

class ArticleListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = ArticleModel.objects.all()
    serializer_class = ArticleModelSerializer

class ActiveArticleListView(generics.ListAPIView):
    queryset = ActiveArticle.objects.all()
    serializer_class = ActiveArticleSerializer
    permission_classes = [AllowAny]

@require_GET
def get_article_by_id(request):
    article_id = request.GET.get('articleId')
    
    if not article_id:
        return JsonResponse({'error': 'articleId parameter is missing'}, status=400)

    try:
        article = ArticleModel.objects.get(id=article_id)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Article not found'}, status=404)

    serializer = ArticleModelSerializer(article)
    return JsonResponse(serializer.data, safe=False)
