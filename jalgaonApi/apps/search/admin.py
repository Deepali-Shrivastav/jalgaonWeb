from django.contrib import admin
from .models import SearchQuery, SearchSynonym


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ['query', 'count', 'last_searched']
    ordering = ['-count']
    search_fields = ['query']
    readonly_fields = ['count', 'last_searched']


@admin.register(SearchSynonym)
class SearchSynonymAdmin(admin.ModelAdmin):
    list_display = ['term', 'synonyms', 'is_active']
    list_editable = ['is_active']
    search_fields = ['term']
