from django.contrib import admin
from .models import StartupIndustry, Startup, Founder

class FounderInline(admin.TabularInline):
    model = Founder
    extra = 1

@admin.register(StartupIndustry)
class StartupIndustryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Startup)
class StartupAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'stage', 'status', 'is_verified', 'is_featured', 'view_count', 'created_at')
    list_filter = ('stage', 'status', 'is_verified', 'is_featured', 'industry')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [FounderInline]
    readonly_fields = ('view_count', 'created_at', 'updated_at')

@admin.register(Founder)
class FounderAdmin(admin.ModelAdmin):
    list_display = ('name', 'startup', 'role', 'sort_order')
    list_filter = ('startup', 'role')
    search_fields = ('name', 'role', 'startup__name')
