from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from core.permissions import IsAdminRole, IsStaffRole
from apps.directory.models import ShopListing
from apps.ads.models import AdsListing
from apps.accounts.models import User
from .models import AnalyticsEvent, DailyReport
from .serializers import AnalyticsEventSerializer, DailyReportSerializer

from datetime import datetime, timedelta

def parse_days_param(request):
    try:
        return int(request.query_params.get('days', 30))
    except ValueError:
        return 30

class Command:
    pass

class AdminOverviewAnalyticsView(APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, *args, **kwargs):
        # Basic Stats
        total_users = User.objects.count()
        total_listings = ShopListing.objects.filter(status='active').count()
        total_views = AnalyticsEvent.objects.filter(event_type='listing_view').count()
        total_searches = AnalyticsEvent.objects.filter(event_type='listing_search').count()
        total_impressions = AnalyticsEvent.objects.filter(event_type='ad_impression').count()
        total_clicks = AnalyticsEvent.objects.filter(event_type='ad_click').count()
        
        overall_ctr = 0.0
        if total_impressions > 0:
            overall_ctr = round((total_clicks / total_impressions * 100), 2)

        new_reviews = AnalyticsEvent.objects.filter(event_type='review_submit').count()

        # Growth (percentage comparison: last 7 days vs previous 7 days)
        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        prev_7_days = now - timedelta(days=14)

        views_last_7 = AnalyticsEvent.objects.filter(
            event_type='listing_view', created_at__gte=last_7_days
        ).count()
        views_prev_7 = AnalyticsEvent.objects.filter(
            event_type='listing_view', created_at__range=(prev_7_days, last_7_days)
        ).count()

        views_growth = 0
        if views_prev_7 > 0:
            views_growth = round(((views_last_7 - views_prev_7) / views_prev_7) * 100, 1)

        users_last_7 = User.objects.filter(date_joined__gte=last_7_days).count()
        users_prev_7 = User.objects.filter(date_joined__range=(prev_7_days, last_7_days)).count()

        users_growth = 0
        if users_prev_7 > 0:
            users_growth = round(((users_last_7 - users_prev_7) / users_prev_7) * 100, 1)

        listings_last_7 = ShopListing.objects.filter(status='active', created_at__gte=last_7_days).count()
        listings_prev_7 = ShopListing.objects.filter(status='active', created_at__range=(prev_7_days, last_7_days)).count()

        listings_growth = 0
        if listings_prev_7 > 0:
            listings_growth = round(((listings_last_7 - listings_prev_7) / listings_prev_7) * 100, 1)

        # Top Searches
        top_searches_qs = AnalyticsEvent.objects.filter(
            event_type='listing_search'
        ).values('search_query').annotate(
            count=Count('id')
        ).exclude(search_query='').order_by('-count')[:5]

        top_searches = [
            {'query': item['search_query'], 'count': item['count']} for item in top_searches_qs
        ]

        data = {
            'total_users': total_users,
            'users_growth': users_growth,
            'total_listings': total_listings,
            'listings_growth': listings_growth,
            'total_views': total_views,
            'views_growth': views_growth,
            'total_searches': total_searches,
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'overall_ctr': overall_ctr,
            'new_listings': total_listings,
            'new_users': total_users,
            'new_reviews': new_reviews,
            'revenue': 45200,  # Placeholder/Mock revenue until payments app is implemented
            'revenue_growth': 12.5,
            'top_searches': top_searches,
        }
        return Response(data)


class AdminTrafficAnalyticsView(APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, *args, **kwargs):
        days = parse_days_param(request)
        start_date = timezone.now().date() - timedelta(days=days)

        # Try to read aggregated reports
        reports = DailyReport.objects.filter(
            report_type='platform', date__gte=start_date
        ).order_by('date')

        if reports.exists():
            data = [
                {
                    'date': report.date.strftime('%Y-%m-%d'),
                    'views': report.total_views,
                    'searches': report.search_queries,
                    'ad_clicks': report.ad_clicks
                }
                for report in reports
            ]
        else:
            # Fallback to calculating from raw events directly for development convenience
            # Group events by day
            events = AnalyticsEvent.objects.filter(
                created_at__date__gte=start_date
            ).values('created_at__date', 'event_type').annotate(
                count=Count('id')
            ).order_by('created_at__date')

            # Aggregate by day
            aggregated_by_day = {}
            for i in range(days + 1):
                d = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
                aggregated_by_day[d] = {'views': 0, 'searches': 0, 'ad_clicks': 0}

            for e in events:
                d_str = e['created_at__date'].strftime('%Y-%m-%d')
                if d_str in aggregated_by_day:
                    etype = e['event_type']
                    if etype in ('page_view', 'listing_view'):
                        aggregated_by_day[d_str]['views'] += e['count']
                    elif etype == 'listing_search':
                        aggregated_by_day[d_str]['searches'] += e['count']
                    elif etype == 'ad_click':
                        aggregated_by_day[d_str]['ad_clicks'] += e['count']

            data = [
                {
                    'date': d,
                    'views': metrics['views'],
                    'searches': metrics['searches'],
                    'ad_clicks': metrics['ad_clicks']
                }
                for d, metrics in sorted(aggregated_by_day.items())
            ]

        return Response(data)


class AdminTopListingsView(APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, *args, **kwargs):
        # We can rank by total page_views / views recorded in the listing model
        top_listings = ShopListing.objects.filter(status='active').order_by('-views')[:10]
        data = [
            {
                'id': item.id,
                'business_name': item.business_name,
                'slug': item.slug,
                'views': item.views,
                'category': item.main_category.main_category,
                'rating': item.avg_rating,
                'review_count': item.review_count,
            }
            for item in top_listings
        ]
        return Response(data)


class AdminTopSearchesView(APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, *args, **kwargs):
        top_searches_qs = AnalyticsEvent.objects.filter(
            event_type='listing_search'
        ).values('search_query').annotate(
            count=Count('id')
        ).exclude(search_query='').order_by('-count')[:20]

        data = [
            {'query': item['search_query'], 'count': item['count']} for item in top_searches_qs
        ]
        return Response(data)


class AdminUserGrowthView(APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, *args, **kwargs):
        # Group new users by date joined for last 30 days
        days = parse_days_param(request)
        start_date = timezone.now().date() - timedelta(days=days)

        users = User.objects.filter(
            date_joined__date__gte=start_date
        ).values('date_joined__date').annotate(
            count=Count('id')
        ).order_by('date_joined__date')

        aggregated = {}
        for i in range(days + 1):
            d = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
            aggregated[d] = 0

        for u in users:
            d_str = u['date_joined__date'].strftime('%Y-%m-%d')
            if d_str in aggregated:
                aggregated[d_str] = u['count']

        data = [
            {'date': d, 'new_users': count} for d, count in sorted(aggregated.items())
        ]
        return Response(data)


class AdminAdsOverviewView(APIView):
    permission_classes = [IsStaffRole]

    def get(self, request, *args, **kwargs):
        ads = AdsListing.objects.all().order_by('-impressions')[:20]
        data = [
            {
                'id': ad.id,
                'name': ad.name,
                'status': ad.status,
                'impressions': ad.impressions,
                'clicks': ad.clicks,
                'ctr': round((ad.clicks / ad.impressions * 100), 2) if ad.impressions > 0 else 0.0,
                'package': ad.get_package_display()
            }
            for ad in ads
        ]
        return Response(data)


class BusinessOwnerListingAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug, *args, **kwargs):
        # Retrieve ShopListing, verifying ownership (or staff permission)
        listing = get_object_or_404(ShopListing, slug=slug)
        if listing.user != request.user and not request.user.is_staff_role:
            return Response({'detail': 'You do not own this listing.'}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        last_30_days = now - timedelta(days=30)

        # Raw counts from Events
        views = AnalyticsEvent.objects.filter(
            listing=listing, event_type='listing_view'
        ).count()

        clicks = AnalyticsEvent.objects.filter(
            listing=listing, event_type='listing_click'
        ).count()

        contact_clicks = AnalyticsEvent.objects.filter(
            listing=listing, event_type='contact_click'
        ).count()

        review_submits = AnalyticsEvent.objects.filter(
            listing=listing, event_type='review_submit'
        ).count()

        conversion_rate = 0.0
        if views > 0:
            conversion_rate = round((contact_clicks / views * 100), 1)

        data = {
            'listing_id': listing.id,
            'business_name': listing.business_name,
            'slug': listing.slug,
            'total_views': views,
            'total_contact_clicks': contact_clicks,
            'total_reviews': review_submits,
            'conversion_rate': conversion_rate,
            'average_rating': float(listing.avg_rating),
        }
        return Response(data)


class BusinessOwnerListingChartAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug, *args, **kwargs):
        listing = get_object_or_404(ShopListing, slug=slug)
        if listing.user != request.user and not request.user.is_staff_role:
            return Response({'detail': 'You do not own this listing.'}, status=status.HTTP_403_FORBIDDEN)

        days = parse_days_param(request)
        start_date = timezone.now().date() - timedelta(days=days)

        # Let's read from DailyReport
        reports = DailyReport.objects.filter(
            report_type='listing', listing=listing, date__gte=start_date
        ).order_by('date')

        if reports.exists():
            data = [
                {
                    'date': report.date.strftime('%Y-%m-%d'),
                    'views': report.total_views,
                    'contact_clicks': report.contact_clicks,
                }
                for report in reports
            ]
        else:
            # Fallback to raw events
            events = AnalyticsEvent.objects.filter(
                listing=listing, created_at__date__gte=start_date
            ).values('created_at__date', 'event_type').annotate(
                count=Count('id')
            )

            aggregated_by_day = {}
            for i in range(days + 1):
                d = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
                aggregated_by_day[d] = {'views': 0, 'contact_clicks': 0}

            for e in events:
                d_str = e['created_at__date'].strftime('%Y-%m-%d')
                if d_str in aggregated_by_day:
                    etype = e['event_type']
                    if etype == 'listing_view':
                        aggregated_by_day[d_str]['views'] += e['count']
                    elif etype == 'contact_click':
                        aggregated_by_day[d_str]['contact_clicks'] += e['count']

            data = [
                {
                    'date': d,
                    'views': metrics['views'],
                    'contact_clicks': metrics['contact_clicks']
                }
                for d, metrics in sorted(aggregated_by_day.items())
            ]

        return Response(data)


class AdvertiserAdsAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Return all ads owned by current user
        ads = AdsListing.objects.filter(user=request.user)
        data = [
            {
                'id': ad.id,
                'name': ad.name,
                'status': ad.status,
                'impressions': ad.impressions,
                'clicks': ad.clicks,
                'ctr': round((ad.clicks / ad.impressions * 100), 2) if ad.impressions > 0 else 0.0,
                'package': ad.get_package_display()
            }
            for ad in ads
        ]
        return Response(data)


class AdvertiserAdChartAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        ad = get_object_or_404(AdsListing, pk=pk)
        if ad.user != request.user and not request.user.is_staff_role:
            return Response({'detail': 'You do not own this campaign.'}, status=status.HTTP_403_FORBIDDEN)

        days = parse_days_param(request)
        start_date = timezone.now().date() - timedelta(days=days)

        reports = DailyReport.objects.filter(
            report_type='ad', ad=ad, date__gte=start_date
        ).order_by('date')

        if reports.exists():
            data = [
                {
                    'date': report.date.strftime('%Y-%m-%d'),
                    'impressions': report.ad_impressions,
                    'clicks': report.ad_clicks
                }
                for report in reports
            ]
        else:
            # Fallback to raw events
            events = AnalyticsEvent.objects.filter(
                ad=ad, created_at__date__gte=start_date
            ).values('created_at__date', 'event_type').annotate(
                count=Count('id')
            )

            aggregated_by_day = {}
            for i in range(days + 1):
                d = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
                aggregated_by_day[d] = {'impressions': 0, 'clicks': 0}

            for e in events:
                d_str = e['created_at__date'].strftime('%Y-%m-%d')
                if d_str in aggregated_by_day:
                    etype = e['event_type']
                    if etype == 'ad_impression':
                        aggregated_by_day[d_str]['impressions'] += e['count']
                    elif etype == 'ad_click':
                        aggregated_by_day[d_str]['clicks'] += e['count']

            data = [
                {
                    'date': d,
                    'impressions': metrics['impressions'],
                    'clicks': metrics['clicks']
                }
                for d, metrics in sorted(aggregated_by_day.items())
            ]

        return Response(data)
