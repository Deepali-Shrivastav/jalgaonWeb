from django.db import models
from django.conf import settings

class ArticleModel(models.Model):
    title = models.CharField(max_length=50) 
    short_desc = models.CharField(max_length=100)
    blog_img = models.ImageField(upload_to='static/assets/article_imgs')
    para_one = models.CharField(max_length=1000) 
    para_two = models.CharField(max_length=1000) 
    para_trhee = models.CharField(max_length=1000) 
    para_four = models.CharField(max_length=1000) 
    para_five = models.CharField(max_length=1000)

    class Meta:
        db_table = 'app_articlemodel'

    def __str__(self):
        return self.title
     

class ActiveArticle(models.Model):
    article = models.ForeignKey(ArticleModel, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_activearticle'

class NewsCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'news_category'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class NewsTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    class Meta:
        db_table = 'news_tag'
        
    def __str__(self):
        return self.name


class NewsArticle(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Editor Review'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    # Core fields
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    short_description = models.CharField(max_length=300)
    content = models.TextField()  # Rich text / markdown body
    featured_image = models.ImageField(upload_to='news/featured/')

    # Relations
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(NewsCategory, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(NewsTag, blank=True)

    # Publishing workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_breaking = models.BooleanField(default=False)
    publish_date = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)

    # Analytics
    view_count = models.PositiveIntegerField(default=0)

    # SEO
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'news_article'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
        ]
        
    def __str__(self):
        return self.title


class NewsComment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField(max_length=2000)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'news_comment'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.article}"
