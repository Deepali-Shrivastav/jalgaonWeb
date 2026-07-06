from rest_framework import serializers
from .models import BlogCategory, BlogTag, BlogPost, BlogComment

class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'sort_order']

class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']

class BlogPostListSerializer(serializers.ModelSerializer):
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True, default='Admin')
    featured_image = serializers.SerializerMethodField()

    def get_featured_image(self, obj):
        if not obj.featured_image:
            return None
        request = self.context.get('request')
        url = obj.featured_image.url
        if request is not None:
            absolute = request.build_absolute_uri(url)
        else:
            absolute = url
        # Guarantee HTTPS where relevant, but allow http for local dev
        if absolute.startswith('http://') and 'localhost' not in absolute and '127.0.0.1' not in absolute:
            absolute = 'https://' + absolute[7:]
        return absolute

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'short_description', 'featured_image',
            'category', 'tags', 'author_name', 'status', 'is_featured',
            'published_at', 'view_count', 'created_at'
        ]

class BlogCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='User')

    class Meta:
        model = BlogComment
        fields = ['id', 'user_name', 'body', 'created_at']

class BlogPostDetailSerializer(BlogPostListSerializer):
    comments = serializers.SerializerMethodField()
    
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + [
            'content', 'meta_title', 'meta_description', 'comments'
        ]

    def get_comments(self, obj):
        comments = obj.comments.filter(status='approved')
        return BlogCommentSerializer(comments, many=True).data

class BlogPostAdminSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=BlogCategory.objects.all(), required=False, allow_null=True)
    author = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = BlogPost
        fields = '__all__'

class BlogCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['body']

class BlogCommentAdminSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='User')
    post_title = serializers.CharField(source='post.title', read_only=True)

    class Meta:
        model = BlogComment
        fields = '__all__'
