from django.db import models
from django.conf import settings

class BlogCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blog_category'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    class Meta:
        db_table = 'blog_tag'
        
    def __str__(self):
        return self.name


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('review', 'Editor Review'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    short_description = models.CharField(max_length=300)
    content = models.TextField()  # HTML content / body
    featured_image = models.ImageField(upload_to='blog/featured/', null=True, blank=True)

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, related_name='posts')
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    publish_date = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)

    view_count = models.PositiveIntegerField(default=0)

    # SEO
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'blog_post'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['status']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
        ]
        
    def __str__(self):
        return self.title


class BlogComment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    body = models.TextField(max_length=2000)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blog_comment'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"
