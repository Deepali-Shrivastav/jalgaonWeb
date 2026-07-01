from django.contrib import admin
from .models import (
    ArticleModel, ActiveArticle,
    NewsCategory, NewsTag, NewsArticle, NewsComment
)

admin.site.register(ArticleModel)
admin.site.register(ActiveArticle)

@admin.register(NewsCategory)
class NewsCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'sort_order')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(NewsTag)
class NewsTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'is_breaking', 'published_at', 'view_count')
    list_filter = ('status', 'is_breaking', 'category', 'published_at')
    search_fields = ('title', 'short_description')
    prepopulated_fields = {'slug': ('title',)}
    autocomplete_fields = ('author', 'tags')

@admin.register(NewsComment)
class NewsCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'article', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('body', 'user__username', 'article__title')
    actions = ['approve_comments', 'reject_comments']

    @admin.action(description='Approve selected comments')
    def approve_comments(self, request, queryset):
        queryset.update(status='approved')

    @admin.action(description='Reject selected comments')
    def reject_comments(self, request, queryset):
        queryset.update(status='rejected')
