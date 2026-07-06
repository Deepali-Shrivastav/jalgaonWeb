from django.contrib import admin
from .models import BlogCategory, BlogTag, BlogPost, BlogComment

@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'sort_order', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'is_featured', 'published_at', 'view_count')
    list_filter = ('status', 'category', 'is_featured', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'short_description', 'content')
    raw_id_fields = ('author',)
    date_hierarchy = 'created_at'

@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('body', 'user__first_name', 'user__last_name', 'post__title')
