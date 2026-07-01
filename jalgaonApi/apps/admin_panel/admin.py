from django.contrib import admin
from .models import AdminSetting, ModerationQueue


@admin.register(AdminSetting)
class AdminSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'updated_at', 'updated_by')
    search_fields = ('key',)
    readonly_fields = ('updated_at',)


@admin.register(ModerationQueue)
class ModerationQueueAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_type', 'object_id', 'status', 'submitted_by', 'submitted_at')
    list_filter = ('status', 'content_type')
    search_fields = ('object_id',)
    readonly_fields = ('submitted_at',)
