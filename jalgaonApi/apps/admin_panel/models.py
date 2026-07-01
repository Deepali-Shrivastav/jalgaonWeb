from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class AdminSetting(models.Model):
    """
    Key-value store for platform-wide configuration.
    Examples: maintenance_mode, default_listing_status, max_upload_size, etc.
    """
    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField(blank=True, default='')
    description = models.CharField(max_length=255, blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='admin_settings_updated'
    )

    class Meta:
        db_table = 'admin_panel_setting'
        ordering = ['key']

    def __str__(self):
        return f"{self.key} = {self.value[:50]}"


class ModerationQueue(models.Model):
    """
    Unified moderation queue using GenericForeignKey.
    Can track approval status for any model (ShopListing, AdsListing, etc.)
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    # Generic relation to any model (ShopListing, AdsListing, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending', db_index=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='moderation_submissions'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='moderation_reviews'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='', help_text='Internal admin notes')

    class Meta:
        db_table = 'admin_panel_moderation_queue'
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['status', 'submitted_at']),
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"[{self.status}] {self.content_type.model} #{self.object_id}"
