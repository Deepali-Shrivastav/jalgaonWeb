from django.contrib import admin
from .models import TouristPlace


@admin.register(TouristPlace)
class TouristPlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'rating', 'reviews_count', 'distance', 'timings', 'is_active', 'sort_order']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description', 'category', 'distance']
    list_editable = ['is_active', 'sort_order', 'rating']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['sort_order', 'name']
