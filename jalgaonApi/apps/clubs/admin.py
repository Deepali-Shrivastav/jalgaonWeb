from django.contrib import admin
from .models import ClubCategory, Club, ClubActivity, ClubMember, ClubPhoto

class ClubActivityInline(admin.TabularInline):
    model = ClubActivity
    extra = 1

class ClubMemberInline(admin.TabularInline):
    model = ClubMember
    extra = 1

class ClubPhotoInline(admin.TabularInline):
    model = ClubPhoto
    extra = 1

@admin.register(ClubCategory)
class ClubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'sort_order')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'is_verified', 'is_featured', 'view_count', 'created_at')
    list_filter = ('status', 'is_verified', 'is_featured', 'category')
    search_fields = ('name', 'description', 'address')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ClubActivityInline, ClubMemberInline, ClubPhotoInline]
    readonly_fields = ('view_count', 'created_at', 'updated_at')


@admin.register(ClubActivity)
class ClubActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'activity_date', 'activity_type', 'is_featured')
    list_filter = ('activity_type', 'is_featured', 'club')
    search_fields = ('title', 'description', 'club__name')


@admin.register(ClubMember)
class ClubMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'club', 'role', 'sort_order')
    list_filter = ('club',)
    search_fields = ('name', 'role', 'club__name')


@admin.register(ClubPhoto)
class ClubPhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'club', 'caption', 'sort_order', 'uploaded_at')
    list_filter = ('club',)
    search_fields = ('caption', 'club__name')
