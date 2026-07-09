from django.contrib import admin
from .models import CategoryImg, MainCategory, SubCategory, ShopListing, LikedShops

@admin.register(ShopListing)
class ShopListingAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'user', 'city', 'status', 'is_featured', 'is_trending')
    list_filter = ('status', 'city', 'is_featured', 'is_trending', 'main_category')
    search_fields = ('business_name', 'city', 'slug')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'business_name', 'slug', 'main_category', 'sub_category', 'business_description')
        }),
        ('Location & Contact', {
            'fields': ('city', 'business_address', 'business_no', 'whatsapp', 'business_email', 'gmap_link', 'lat', 'lng')
        }),
        ('SEO Metadata', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'description': 'These fields control how this business appears in Google Search results.'
        }),
        ('Media & Links', {
            'fields': ('business_banner', 'social_links', 'business_hours')
        }),
        ('Status & Moderation', {
            'fields': ('status', 'is_claimed', 'is_featured', 'is_trending', 'trending_priority')
        }),
        ('Analytics', {
            'fields': ('avg_rating', 'review_count', 'views'),
            'classes': ('collapse',)
        }),
    )

admin.site.register(CategoryImg)
admin.site.register(MainCategory)
admin.site.register(SubCategory)
admin.site.register(LikedShops)
