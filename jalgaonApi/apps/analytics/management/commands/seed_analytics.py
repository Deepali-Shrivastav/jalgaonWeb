import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.directory.models import ShopListing
from apps.ads.models import AdsListing
from apps.accounts.models import User
from apps.analytics.models import AnalyticsEvent, DailyReport

class Command(BaseCommand):
    help = 'Seeds mock analytics events and daily reports for the past 30 days.'

    def handle(self, *args, **options):
        self.stdout.write('Deleting existing analytics events and reports...')
        AnalyticsEvent.objects.all().delete()
        DailyReport.objects.all().delete()

        self.stdout.write('Fetching listings, ads, and users...')
        listings = list(ShopListing.objects.all())
        ads = list(AdsListing.objects.all())
        users = list(User.objects.all())

        if not listings:
            self.stdout.write(self.style.WARNING('No listings found in the database. Please seed listings first.'))
        if not ads:
            self.stdout.write(self.style.WARNING('No advertisements found in the database. Please seed ads first.'))

        now = timezone.now()
        self.stdout.write('Seeding analytics events and daily reports for the past 30 days...')

        search_queries_pool = [
            'plumber', 'restaurant', 'hospital', 'hotel', 'grocery', 'electrician',
            'school', 'salon', 'cafe', 'garment', 'pharmacy', 'jeweller', 'gym'
        ]

        # Loop through past 30 days
        for day_offset in range(30, -1, -1):
            day_date = (now - timedelta(days=day_offset)).date()
            self.stdout.write(f"Generating data for {day_date}...")

            # 1. Platform-wide aggregates
            views = random.randint(150, 450)
            searches = random.randint(80, 200)
            impressions = random.randint(300, 800)
            clicks = random.randint(15, 60)
            contact_clicks = random.randint(10, 35)
            new_listings = random.randint(1, 5)
            new_users = random.randint(2, 10)
            new_reviews = random.randint(1, 8)

            DailyReport.objects.create(
                report_type='platform',
                date=day_date,
                total_views=views,
                search_queries=searches,
                ad_impressions=impressions,
                ad_clicks=clicks,
                contact_clicks=contact_clicks,
                new_listings=new_listings,
                new_users=new_users,
                new_reviews=new_reviews
            )

            # Generate individual events for top lists & queries
            for _ in range(random.randint(10, 30)):
                AnalyticsEvent.objects.create(
                    event_type='listing_search',
                    search_query=random.choice(search_queries_pool),
                    created_at=timezone.make_aware(timezone.datetime.combine(day_date, timezone.datetime.min.time())) + timedelta(hours=random.randint(0, 23)),
                    user=random.choice(users) if users and random.random() > 0.5 else None,
                    ip_address=f"192.168.1.{random.randint(2, 254)}"
                )

            # 2. Individual listing metrics
            for listing in listings[:10]: # Seed first 10 listings
                listing_views = random.randint(5, 30)
                listing_contact_clicks = random.randint(0, 5)
                listing_reviews = random.randint(0, 2)

                DailyReport.objects.create(
                    report_type='listing',
                    date=day_date,
                    listing=listing,
                    total_views=listing_views,
                    contact_clicks=listing_contact_clicks,
                    new_reviews=listing_reviews
                )

                # Generate individual view events so view ranking query works
                for _ in range(listing_views):
                    AnalyticsEvent.objects.create(
                        event_type='listing_view',
                        listing=listing,
                        created_at=timezone.make_aware(timezone.datetime.combine(day_date, timezone.datetime.min.time())) + timedelta(hours=random.randint(0, 23)),
                        ip_address=f"192.168.1.{random.randint(2, 254)}"
                    )

            # 3. Individual ad metrics
            for ad in ads:
                ad_impressions = random.randint(20, 100)
                ad_clicks = random.randint(0, 8)

                DailyReport.objects.create(
                    report_type='ad',
                    date=day_date,
                    ad=ad,
                    ad_impressions=ad_impressions,
                    ad_clicks=ad_clicks
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded analytics data!'))
