from rest_framework import serializers
from .models import ArticleModel, ActiveArticle, NewsCategory, NewsTag, NewsArticle, NewsComment

# --- Legacy Serializers ---
class ArticleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleModel
        fields = '__all__'

class ActiveArticleSerializer(serializers.ModelSerializer):
    article = ArticleModelSerializer(read_only=True)

    class Meta:
        model = ActiveArticle
        fields = ['article']

# --- New Serializers ---
class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ['id', 'name', 'slug', 'description', 'sort_order']

class NewsTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsTag
        fields = ['id', 'name', 'slug']

class NewsArticleListSerializer(serializers.ModelSerializer):
    category = NewsCategorySerializer(read_only=True)
    tags = NewsTagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True, default='Admin')

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'short_description', 'featured_image',
            'category', 'tags', 'author_name', 'status', 'is_breaking',
            'published_at', 'view_count', 'created_at'
        ]

class NewsCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='User')

    class Meta:
        model = NewsComment
        fields = ['id', 'user_name', 'body', 'created_at']

class NewsArticleDetailSerializer(NewsArticleListSerializer):
    comments = serializers.SerializerMethodField()
    
    class Meta(NewsArticleListSerializer.Meta):
        fields = NewsArticleListSerializer.Meta.fields + [
            'content', 'meta_title', 'meta_description', 'comments'
        ]

    def get_comments(self, obj):
        comments = obj.comments.filter(status='approved')
        return NewsCommentSerializer(comments, many=True).data

class NewsArticleAdminSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=NewsCategory.objects.all(), required=False, allow_null=True)
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = NewsArticle
        fields = '__all__'

class NewsCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsComment
        fields = ['body']

class NewsCommentAdminSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='User')
    article_title = serializers.CharField(source='article.title', read_only=True)

    class Meta:
        model = NewsComment
        fields = '__all__'
