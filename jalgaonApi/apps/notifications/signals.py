from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from apps.directory.models import ShopListing
from apps.jobs.models import JobApplication
from apps.ads.models import AdsListing
from .models import Notification

# Shop Listing signals
@receiver(pre_save, sender=ShopListing)
def shop_listing_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=ShopListing)
def shop_listing_post_save(sender, instance, created, **kwargs):
    old_status = getattr(instance, '_old_status', None)
    if old_status and old_status != instance.status:
        status_display = instance.status.capitalize()
        Notification.objects.create(
            user=instance.user,
            title="Listing Status Update",
            message=f"Your business listing '{instance.business_name}' status has been updated to {status_display}.",
            notification_type='listing_approved' if instance.status == 'active' else 'listing_rejected',
            link="/account/my-listings"
        )

# Job Application signals
@receiver(pre_save, sender=JobApplication)
def job_application_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=JobApplication)
def job_application_post_save(sender, instance, created, **kwargs):
    if created:
        job = instance.job
        Notification.objects.create(
            user=job.posted_by,
            title="New Job Application",
            message=f"A candidate has applied for your job posting: '{job.title}'.",
            notification_type='job_application',
            link="/account/my-jobs"
        )
    else:
        old_status = getattr(instance, '_old_status', None)
        if old_status and old_status != instance.status:
            status_display = instance.status.capitalize()
            Notification.objects.create(
                user=instance.applicant,
                title="Application Status Update",
                message=f"Your application status for '{instance.job.title}' has been updated to '{status_display}'.",
                notification_type='application_status',
                link="/account/applications"
            )

# Ad Listing signals
@receiver(pre_save, sender=AdsListing)
def ad_listing_pre_save(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=AdsListing)
def ad_listing_post_save(sender, instance, created, **kwargs):
    old_status = getattr(instance, '_old_status', None)
    if old_status and old_status != instance.status:
        status_display = instance.status.capitalize()
        rejection_info = f" Reason: {instance.rejection_reason}" if instance.status == 'rejected' and instance.rejection_reason else ""
        Notification.objects.create(
            user=instance.user,
            title="Ad Campaign Status Update",
            message=f"Your advertisement campaign '{instance.name}' status has been updated to {status_display}.{rejection_info}",
            notification_type='ad_approved' if instance.status == 'active' else 'ad_rejected',
            link="/account/ads"
        )
