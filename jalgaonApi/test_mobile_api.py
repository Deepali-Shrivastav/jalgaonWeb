import json
from django.utils import timezone
from rest_framework.test import APITestCase
from apps.accounts.models import User
from apps.events.models import Event, EventCategory, EventBooking
from apps.tourism.models import TouristPlace
from apps.directory.models import MainCategory, SubCategory, ShopListing
from apps.news.models import NewsArticle, NewsCategory


class MobileAppAPITestCase(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            phone_number="+919876543210",
            password="pass",
            role="admin"
        )

        # Create category & subcategory
        self.category = MainCategory.objects.create(
            main_category="Automotive",
            slug="automotive"
        )
        self.sub_category = SubCategory.objects.create(
            main_category=self.category,
            sub_category="Two-Wheelers",
            slug="two-wheelers"
        )

        # Create business
        self.business = ShopListing.objects.create(
            user=self.user,
            main_category=self.category,
            sub_category=self.sub_category,
            business_name="Test Motors",
            slug="test-motors",
            business_address="MIDC, Jalgaon",
            business_description="Authorized automobile showroom",
            business_no="+919876543210",
            status="active"
        )

        # Create event category and event
        self.event_cat = EventCategory.objects.create(
            name="Comedy",
            slug="comedy"
        )
        self.event = Event.objects.create(
            title="Standup Night",
            slug="standup-night",
            description="Comedy show",
            short_description="Laughs",
            organizer_name="Jalgaon Club",
            venue_name="Sambhaji Natyagruh",
            venue_address="Jalgaon",
            start_datetime=timezone.now() + timezone.timedelta(days=5),
            status="approved",
            price="₹199",
            category=self.event_cat
        )

        # Create tourist place
        self.place = TouristPlace.objects.create(
            name='Ajanta Caves',
            category='Heritage',
            rating=4.9,
            reviews_count=1420,
            distance='Approx. 55 km from Jalgaon',
            image_url='https://images.unsplash.com/photo-1600100397608-f010f4439c23',
            timings='9:00 AM - 5:30 PM (Closed Mondays)',
            description='UNESCO World Heritage rock-cut cave monuments.',
            highlights=['UNESCO Heritage', 'Ancient Rock Caves'],
            sort_order=1
        )

        # Create news article
        self.news_cat = NewsCategory.objects.create(
            name="City News",
            slug="city-news"
        )
        self.news = NewsArticle.objects.create(
            title="Jalgaon Smart City Update",
            slug="jalgaon-smart-city-update",
            short_description="Development updates in the city",
            content="Detailed content about new road projects",
            category=self.news_cat,
            author=self.user,
            status="published"
        )

    def test_events_list(self):
        res = self.client.get('/api/events/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        events = res.json()
        self.assertIsInstance(events, list)
        self.assertGreater(len(events), 0)
        e = events[0]
        self.assertEqual(e['title'], "Standup Night")
        self.assertEqual(e['price'], "₹199")

    def test_places_list(self):
        res = self.client.get('/api/places/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        places = res.json()
        self.assertIsInstance(places, list)
        self.assertGreater(len(places), 0)
        sample = places[0]
        for key in ['id', 'name', 'category', 'rating', 'reviews_count', 'distance', 'image_url', 'timings', 'description', 'highlights']:
            self.assertIn(key, sample)
        self.assertTrue(sample['image_url'].startswith(('http://', 'https://')))

    def test_ticket_booking(self):
        payload = {
            'event_id': self.event.id,
            'pass_category': 'VIP',
            'quantity': 2,
            'customer_name': 'Test User',
        }
        res = self.client.post('/api/bookings/', data=json.dumps(payload), content_type='application/json', HTTP_HOST='jalgaon.com')
        self.assertIn(res.status_code, [200, 201])
        data = res.json()
        self.assertTrue(data.get('success'))
        self.assertIn('booking_reference', data)

    def test_categories_list(self):
        res = self.client.get('/api/categories/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_category_detail(self):
        res = self.client.get('/api/categories/automotive/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get('slug'), 'automotive')
        self.assertIn('businesses', data)
        self.assertGreater(len(data['businesses']), 0)

    def test_businesses_list(self):
        res = self.client.get('/api/businesses/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)
        self.assertGreater(len(res.json()), 0)

    def test_business_detail(self):
        res = self.client.get(f'/api/businesses/{self.business.id}/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data['name'], 'Test Motors')
        self.assertTrue(data['image_url'].startswith(('http://', 'https://')))

    def test_news_list(self):
        res = self.client.get('/api/news/', HTTP_HOST='jalgaon.com')
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)
        self.assertGreater(len(res.json()), 0)

    def test_cors_options(self):
        res = self.client.options('/api/events/', HTTP_ORIGIN='https://flutterapp.local', HTTP_ACCESS_CONTROL_REQUEST_METHOD='GET')
        origin = res.headers.get('Access-Control-Allow-Origin')
        self.assertIn(origin, ['*', 'https://flutterapp.local'])
