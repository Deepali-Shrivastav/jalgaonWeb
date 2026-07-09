from celery import shared_task
from django.utils import timezone
from datetime import timedelta, date

from apps.directory.models import ShopListing
from apps.ads.models import AdsListing
from apps.accounts.models import User
from .models import AnalyticsEvent, DailyReport

@shared_task
def aggregate_daily_reports():
    """
    Runs every night via Celery Beat.
    Aggregates AnalyticsEvent logs from yesterday into DailyReport records.
    """
    yesterday = timezone.now().date() - timedelta(days=1)
    
    # 1. Platform-wide metrics
    total_views = AnalyticsEvent.objects.filter(
        event_type__in=['page_view', 'listing_view'], created_at__date=yesterday
    ).count()

    search_queries = AnalyticsEvent.objects.filter(
        event_type='listing_search', created_at__date=yesterday
    ).count()

    ad_impressions = AnalyticsEvent.objects.filter(
        event_type='ad_impression', created_at__date=yesterday
    ).count()

    ad_clicks = AnalyticsEvent.objects.filter(
        event_type='ad_click', created_at__date=yesterday
    ).count()

    contact_clicks = AnalyticsEvent.objects.filter(
        event_type='contact_click', created_at__date=yesterday
    ).count()

    new_listings = ShopListing.objects.filter(
        created_at__date=yesterday
    ).count()

    new_users = User.objects.filter(
        date_joined__date=yesterday
    ).count()

    new_reviews = AnalyticsEvent.objects.filter(
        event_type='review_submit', created_at__date=yesterday
    ).count()

    DailyReport.objects.update_or_create(
        report_type='platform',
        date=yesterday,
        listing=None,
        ad=None,
        defaults={
            'total_views': total_views,
            'search_queries': search_queries,
            'ad_impressions': ad_impressions,
            'ad_clicks': ad_clicks,
            'contact_clicks': contact_clicks,
            'new_listings': new_listings,
            'new_users': new_users,
            'new_reviews': new_reviews,
        }
    )

    # 2. Per-Listing metrics
    active_listings = ShopListing.objects.filter(status='active')
    for listing in active_listings:
        listing_views = AnalyticsEvent.objects.filter(
            listing=listing, event_type='listing_view', created_at__date=yesterday
        ).count()

        listing_contact_clicks = AnalyticsEvent.objects.filter(
            listing=listing, event_type='contact_click', created_at__date=yesterday
        ).count()

        listing_reviews = AnalyticsEvent.objects.filter(
            listing=listing, event_type='review_submit', created_at__date=yesterday
        ).count()

        # Only create report if there was activity to conserve space
        if listing_views > 0 or listing_contact_clicks > 0 or listing_reviews > 0:
            DailyReport.objects.update_or_create(
                report_type='listing',
                date=yesterday,
                listing=listing,
                ad=None,
                defaults={
                    'total_views': listing_views,
                    'contact_clicks': listing_contact_clicks,
                    'new_reviews': listing_reviews,
                }
            )

    # 3. Per-Ad Campaign metrics
    active_ads = AdsListing.objects.filter(status='active')
    for ad in active_ads:
        impressions = AnalyticsEvent.objects.filter(
            ad=ad, event_type='ad_impression', created_at__date=yesterday
        ).count()

        clicks = AnalyticsEvent.objects.filter(
            ad=ad, event_type='ad_click', created_at__date=yesterday
        ).count()

        if impressions > 0 or clicks > 0:
            DailyReport.objects.update_or_create(
                report_type='ad',
                date=yesterday,
                listing=None,
                ad=ad,
                defaults={
                    'ad_impressions': impressions,
                    'ad_clicks': clicks,
                }
            )

    return f"Completed nightly analytics aggregation for {yesterday}"
