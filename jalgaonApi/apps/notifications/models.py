from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('listing_approved', 'Listing Approved'),
        ('listing_rejected', 'Listing Rejected'),
        ('job_application', 'New Job Application'),
        ('application_status', 'Job Application Status Update'),
        ('ad_approved', 'Ad Approved'),
        ('ad_rejected', 'Ad Rejected'),
        ('general', 'General Notification'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='general')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.title} - Read: {self.is_read}"
