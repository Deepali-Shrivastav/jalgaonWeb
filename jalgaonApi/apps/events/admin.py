from django.contrib import admin
from .models import EventCategory, Event


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'sort_order', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('is_active',)
    search_fields = ('name',)
    ordering = ('sort_order', 'name')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'status', 'is_featured',
        'start_datetime', 'organizer_name', 'submitted_by', 'view_count'
    )
    list_filter = ('status', 'is_featured', 'category', 'start_datetime')
    search_fields = ('title', 'short_description', 'organizer_name', 'venue_name')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('submitted_by', 'created_at', 'updated_at', 'view_count')
    date_hierarchy = 'start_datetime'

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'category', 'short_description', 'description', 'featured_image')
        }),
        ('Schedule & Venue', {
            'fields': ('start_datetime', 'end_datetime', 'venue_name', 'venue_address', 'venue_lat', 'venue_lng', 'maps_url')
        }),
        ('Organizer & Links', {
            'fields': ('organizer_name', 'organizer_contact', 'registration_link')
        }),
        ('Moderation & Status', {
            'fields': ('status', 'is_featured', 'submitted_by', 'rejection_reason')
        }),
        ('SEO & Analytics', {
            'fields': ('meta_title', 'meta_description', 'view_count', 'created_at', 'updated_at')
        }),
    )

    actions = ['approve_events', 'reject_events', 'feature_events']

    @admin.action(description='Approve selected events')
    def approve_events(self, request, queryset):
        queryset.update(status='approved')

    @admin.action(description='Reject selected events')
    def reject_events(self, request, queryset):
        queryset.update(status='rejected')

    @admin.action(description='Toggle featured flag for selected events')
    def feature_events(self, request, queryset):
        for event in queryset:
            event.is_featured = not event.is_featured
            event.save()
