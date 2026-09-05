from rest_framework import generics, viewsets, filters, status, exceptions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import F

from core.permissions import IsNewsEditor, IsContentManager

from .models import BlogCategory, BlogTag, BlogPost, BlogComment
from .serializers import (
    BlogCategorySerializer, BlogTagSerializer,
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostAdminSerializer,
    BlogCommentSerializer, BlogCommentCreateSerializer, BlogCommentAdminSerializer
)

class BlogCategoryListView(generics.ListAPIView):
    queryset = BlogCategory.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]

class PublicBlogPostListView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'short_description', 'tags__name']
    ordering_fields = ['published_at', 'view_count']

    def get_queryset(self):
        queryset = BlogPost.objects.filter(status='published').order_by('-published_at', '-created_at')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        return queryset

class FeaturedBlogPostListView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Return featured first, then fallback to latest
        featured = BlogPost.objects.filter(status='published', is_featured=True).order_by('-published_at', '-created_at')
        if not featured.exists():
            return BlogPost.objects.filter(status='published').order_by('-published_at', '-created_at')[:3]
        return featured[:3]

class PublicBlogPostDetailView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.filter(status='published')
    serializer_class = BlogPostDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        BlogPost.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class BlogPostCommentsView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BlogCommentCreateSerializer
        return BlogCommentSerializer

    def get_queryset(self):
        post_slug = self.kwargs.get('slug')
        return BlogComment.objects.filter(post__slug=post_slug, status='approved').order_by('-created_at')

    def perform_create(self, serializer):
        post_slug = self.kwargs.get('slug')
        post = generics.get_object_or_404(BlogPost, slug=post_slug, status='published')
        # Comment is pending by default (or approved automatically if set, following news commenting pattern: status='approved')
        serializer.save(user=self.request.user, post=post, status='approved')

# --- Admin Views ---

class AdminBlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostAdminSerializer
    permission_classes = [IsNewsEditor]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        import uuid
        
        title = serializer.validated_data.get('title', 'post')
        base_slug = slugify(title)
        slug = base_slug
        
        if BlogPost.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
            
        # Check if creating as published
        published_at = None
        if serializer.validated_data.get('status') == 'published':
            published_at = timezone.now()
            
        serializer.save(author=self.request.user, slug=slug, published_at=published_at)

    def perform_update(self, serializer):
        instance = self.get_object()
        # If changing to published and it doesn't have a published_at date yet
        if serializer.validated_data.get('status') == 'published' and not instance.published_at:
            serializer.save(published_at=timezone.now())
        else:
            serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.role in ('super_admin', 'admin'):
            raise exceptions.PermissionDenied("Only admins can delete posts.")
        instance.delete()

    @action(detail=True, methods=['patch'], permission_classes=[IsNewsEditor])
    def status(self, request, pk=None):
        post = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(BlogPost.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        post.status = new_status
        if new_status == 'published' and not post.published_at:
            post.published_at = timezone.now()
        post.save()
        return Response({'status': post.status})

class AdminBlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all().order_by('sort_order', 'name')
    serializer_class = BlogCategorySerializer
    permission_classes = [IsNewsEditor]

class AdminBlogCommentViewSet(viewsets.ModelViewSet):
    queryset = BlogComment.objects.all().order_by('-created_at')
    serializer_class = BlogCommentAdminSerializer
    permission_classes = [IsNewsEditor]
