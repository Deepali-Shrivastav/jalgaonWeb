from rest_framework import generics, viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_GET
from django.utils import timezone
from django.db.models import F

from core.permissions import IsNewsEditor, IsContentManager, IsModerator, IsAdminRole

from .models import (
    ArticleModel, ActiveArticle,
    NewsCategory, NewsArticle, NewsComment, NewsTag
)
from .serializers import (
    ArticleModelSerializer, ActiveArticleSerializer,
    NewsCategorySerializer, NewsArticleListSerializer,
    NewsArticleDetailSerializer, NewsArticleAdminSerializer,
    NewsCommentSerializer, NewsCommentCreateSerializer,
    NewsCommentAdminSerializer
)

# --- Legacy Views ---

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

# --- Public Views ---

class NewsCategoryListView(generics.ListAPIView):
    queryset = NewsCategory.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = NewsCategorySerializer
    permission_classes = [AllowAny]

class PublicNewsListView(generics.ListAPIView):
    serializer_class = NewsArticleListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'tags__name']
    ordering_fields = ['published_at', 'view_count']

    def get_queryset(self):
        queryset = NewsArticle.objects.filter(status='published').order_by('-published_at')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset

class BreakingNewsListView(generics.ListAPIView):
    serializer_class = NewsArticleListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return NewsArticle.objects.filter(status='published', is_breaking=True).order_by('-published_at')[:5]

class TrendingNewsListView(generics.ListAPIView):
    serializer_class = NewsArticleListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # In a real app we'd filter by views in last 24h, for now just top by view_count
        return NewsArticle.objects.filter(status='published').order_by('-view_count')[:5]

class PublicNewsDetailView(generics.RetrieveAPIView):
    queryset = NewsArticle.objects.filter(status='published')
    serializer_class = NewsArticleDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        NewsArticle.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        # Re-fetch to get updated count
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class NewsArticleCommentsView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NewsCommentCreateSerializer
        return NewsCommentSerializer

    def get_queryset(self):
        article_slug = self.kwargs.get('slug')
        return NewsComment.objects.filter(article__slug=article_slug, status='approved').order_by('-created_at')

    def perform_create(self, serializer):
        article_slug = self.kwargs.get('slug')
        article = generics.get_object_or_404(NewsArticle, slug=article_slug, status='published')
        # Comment is pending by default
        serializer.save(user=self.request.user, article=article)

# --- Admin Views ---

class AdminNewsArticleViewSet(viewsets.ModelViewSet):
    queryset = NewsArticle.objects.all().order_by('-created_at')
    serializer_class = NewsArticleAdminSerializer
    permission_classes = [IsNewsEditor]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        import uuid
        
        title = serializer.validated_data.get('title', 'article')
        base_slug = slugify(title)
        slug = base_slug
        
        # Ensure unique slug
        if NewsArticle.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
            
        serializer.save(author=self.request.user, slug=slug)
        
    def perform_destroy(self, instance):
        if not self.request.user.role in ('super_admin', 'admin'):
            raise exceptions.PermissionDenied("Only admins can delete articles.")
        instance.delete()

    @action(detail=True, methods=['patch'], permission_classes=[IsContentManager])
    def status(self, request, pk=None):
        article = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(NewsArticle.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        article.status = new_status
        if new_status == 'published' and not article.published_at:
            article.published_at = timezone.now()
        article.save()
        return Response({'status': article.status})
        
    @action(detail=True, methods=['patch'], permission_classes=[IsContentManager])
    def breaking(self, request, pk=None):
        article = self.get_object()
        is_breaking = request.data.get('is_breaking')
        if is_breaking is not None:
            article.is_breaking = bool(is_breaking)
            article.save()
            return Response({'is_breaking': article.is_breaking})
        return Response({'error': 'is_breaking field is required'}, status=status.HTTP_400_BAD_REQUEST)

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = NewsCategory.objects.all()
    serializer_class = NewsCategorySerializer
    permission_classes = [IsNewsEditor]

class AdminCommentViewSet(viewsets.ModelViewSet):
    queryset = NewsComment.objects.all().order_by('-created_at')
    serializer_class = NewsCommentAdminSerializer
    permission_classes = [IsNewsEditor]
