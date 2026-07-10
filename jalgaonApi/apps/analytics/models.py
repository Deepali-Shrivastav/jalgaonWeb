from django.db import models
from django.conf import settings

class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('page_view',       'Page View'),
        ('listing_view',    'Listing Profile View'),
        ('listing_search',  'Search Query'),
        ('listing_click',   'Listing Card Click'),
        ('ad_impression',   'Ad Impression'),
        ('ad_click',        'Ad Click'),
        ('job_view',        'Job View'),
        ('news_view',       'News Article View'),
        ('event_view',      'Event View'),
        ('contact_click',   'Contact Button Click'),
        ('review_submit',   'Review Submitted'),
    ]

    event_type   = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    session_id   = models.CharField(max_length=64, blank=True)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    user_agent   = models.TextField(blank=True)

    # Linked content
    listing      = models.ForeignKey('directory.ShopListing', null=True, blank=True, on_delete=models.SET_NULL)
    ad           = models.ForeignKey('ads.AdsListing', null=True, blank=True, on_delete=models.SET_NULL)
    news_article = models.ForeignKey('news.NewsArticle', null=True, blank=True, on_delete=models.SET_NULL)
    job          = models.ForeignKey('jobs.Job', null=True, blank=True, on_delete=models.SET_NULL)

    search_query = models.CharField(max_length=255, blank=True)
    referrer     = models.URLField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'analytics_event'
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['listing', 'created_at']),
            models.Index(fields=['ad', 'created_at']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.created_at}"


class DailyReport(models.Model):
    REPORT_TYPES = [
        ('platform',  'Platform-Wide'),
        ('listing',   'Per Listing'),
        ('ad',        'Per Ad Campaign'),
    ]

    report_type  = models.CharField(max_length=20, choices=REPORT_TYPES)
    date         = models.DateField(db_index=True)

    # FK targets
    listing      = models.ForeignKey('directory.ShopListing', null=True, blank=True, on_delete=models.CASCADE)
    ad           = models.ForeignKey('ads.AdsListing', null=True, blank=True, on_delete=models.CASCADE)

    # Metrics
    total_views       = models.IntegerField(default=0)
    unique_views      = models.IntegerField(default=0)
    search_queries    = models.IntegerField(default=0)
    ad_impressions    = models.IntegerField(default=0)
    ad_clicks         = models.IntegerField(default=0)
    contact_clicks    = models.IntegerField(default=0)
    new_listings      = models.IntegerField(default=0)
    new_users         = models.IntegerField(default=0)
    new_reviews       = models.IntegerField(default=0)

    class Meta:
        db_table = 'analytics_daily_report'
        unique_together = ('report_type', 'date', 'listing', 'ad')

    def __str__(self):
        return f"{self.report_type} report for {self.date}"
