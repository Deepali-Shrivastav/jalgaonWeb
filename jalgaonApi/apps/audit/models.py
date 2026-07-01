from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='audit_actions'
    )
    action = models.CharField(max_length=100)  # e.g., 'approve_listing', 'update_user_role'
    target_type = models.CharField(max_length=100) # e.g., 'ShopListing', 'User'
    target_id = models.CharField(max_length=50) # Use CharField to handle UUIDs or integer IDs
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_audit_log'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.actor} did {self.action} on {self.target_type} {self.target_id}"
