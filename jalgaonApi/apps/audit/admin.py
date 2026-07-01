from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('actor', 'action', 'target_type', 'target_id', 'timestamp', 'ip_address')
    list_filter = ('action', 'target_type', 'timestamp')
    search_fields = ('actor__phone_number', 'target_id')
    readonly_fields = ('actor', 'action', 'target_type', 'target_id', 'changes', 'ip_address', 'timestamp')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
