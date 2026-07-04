from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from apps.events.models import EventCategory, Event
from apps.audit.models import AuditLog

User = get_user_model()


class EventCategoryModelTest(APITestCase):
    def setUp(self):
        self.category = EventCategory.objects.create(
            name="Cultural Festivals",
            slug="cultural-festivals",
            description="Music, dance, and cultural events",
            sort_order=1
        )

    def test_category_creation(self):
        self.assertEqual(str(self.category), "Cultural Festivals")
        self.assertEqual(self.category.slug, "cultural-festivals")
        self.assertTrue(self.category.is_active)


class EventModelTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+919876543210",
            password="testpassword123",
            first_name="John",
            last_name="Doe"
        )
        self.category = EventCategory.objects.create(
            name="Sports",
            slug="sports"
        )
        self.event = Event.objects.create(
            title="Jalgaon Marathon 2026",
            slug="jalgaon-marathon-2026",
            description="Annual city marathon event.",
            short_description="Run for Jalgaon health.",
            organizer_name="Jalgaon Sports Club",
            venue_name="MJ College Ground",
            venue_address="NH 6, Jalgaon, Maharashtra",
            start_datetime=timezone.now() + timedelta(days=10),
            category=self.category,
            submitted_by=self.user
        )

    def test_event_creation_defaults(self):
        self.assertEqual(str(self.event), "Jalgaon Marathon 2026")
        self.assertEqual(self.event.status, "pending")
        self.assertFalse(self.event.is_featured)
        self.assertEqual(self.event.view_count, 0)


class EventPublicAPITest(APITestCase):
    def setUp(self):
        self.category = EventCategory.objects.create(name="Tech", slug="tech")
        now = timezone.now()

        # Upcoming approved event
        self.upcoming_event = Event.objects.create(
            title="Tech Hackathon 2026",
            slug="tech-hackathon-2026",
            description="Coding competition.",
            short_description="Code and win prizes.",
            organizer_name="IT Association",
            venue_name="Town Hall",
            venue_address="Station Road, Jalgaon",
            start_datetime=now + timedelta(days=5),
            category=self.category,
            status="approved",
            is_featured=True
        )

        # Pending event (should be hidden publicly)
        self.pending_event = Event.objects.create(
            title="Pending Event",
            slug="pending-event",
            description="Pending approval.",
            short_description="Pending.",
            organizer_name="Org",
            venue_name="Venue",
            venue_address="Address",
            start_datetime=now + timedelta(days=3),
            status="pending"
        )

        # Past approved event
        self.past_event = Event.objects.create(
            title="Past Music Fest",
            slug="past-music-fest",
            description="Old event.",
            short_description="Past music fest.",
            organizer_name="Music Club",
            venue_name="Open Auditorium",
            venue_address="Ring Road, Jalgaon",
            start_datetime=now - timedelta(days=10),
            status="approved"
        )

    def _get_results(self, response_data):
        if isinstance(response_data, dict):
            return response_data.get('results', [])
        return response_data

    def test_upcoming_events_list(self):
        response = self.client.get('/api/v1/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response.data)
        slugs = [item['slug'] for item in results]
        self.assertIn('tech-hackathon-2026', slugs)
        self.assertNotIn('pending-event', slugs)
        self.assertNotIn('past-music-fest', slugs)

    def test_past_events_list(self):
        response = self.client.get('/api/v1/events/past/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response.data)
        slugs = [item['slug'] for item in results]
        self.assertIn('past-music-fest', slugs)
        self.assertNotIn('tech-hackathon-2026', slugs)

    def test_event_category_filter(self):
        response = self.client.get('/api/v1/events/?category=tech')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = self._get_results(response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['slug'], 'tech-hackathon-2026')

    def test_event_detail_and_view_count(self):
        url = f'/api/v1/events/{self.upcoming_event.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Tech Hackathon 2026")
        self.assertIn('schema_json_ld', response.data)
        self.assertEqual(response.data['schema_json_ld']['@type'], 'Event')

        # Check view count increment
        self.upcoming_event.refresh_from_db()
        self.assertEqual(self.upcoming_event.view_count, 1)


class EventSubmissionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+919876543211",
            password="userpassword123",
            role="registered_user"
        )
        self.category = EventCategory.objects.create(name="Community", slug="community")

    def test_unauthenticated_submit_fails(self):
        data = {
            "title": "Community Cleanup",
            "short_description": "Clean Jalgaon initiative.",
            "description": "Volunteers gathering for cleanup.",
            "organizer_name": "Eco Club",
            "venue_name": "Mehrun Lake",
            "venue_address": "Mehrun, Jalgaon",
            "start_datetime": (timezone.now() + timedelta(days=7)).isoformat(),
        }
        response = self.client.post('/api/v1/events/submit/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_submit_success(self):
        self.client.force_authenticate(user=self.user)
        data = {
            "title": "Community Cleanup Drive",
            "short_description": "Clean Jalgaon initiative.",
            "description": "Volunteers gathering for cleanup.",
            "organizer_name": "Eco Club",
            "venue_name": "Mehrun Lake",
            "venue_address": "Mehrun, Jalgaon",
            "start_datetime": (timezone.now() + timedelta(days=7)).isoformat(),
            "category": self.category.id
        }
        response = self.client.post('/api/v1/events/submit/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_event = Event.objects.get(title="Community Cleanup Drive")
        self.assertEqual(created_event.status, "pending")
        self.assertEqual(created_event.submitted_by, self.user)
        self.assertTrue(created_event.slug.startswith("community-cleanup-drive"))

        # Verify audit log recorded
        self.assertTrue(AuditLog.objects.filter(action='event.submit', target_id=str(created_event.id)).exists())


class AdminEventViewSetTest(APITestCase):
    def setUp(self):
        self.regular_user = User.objects.create_user(
            phone_number="+919876543212",
            password="pass",
            role="registered_user"
        )
        self.content_manager = User.objects.create_user(
            phone_number="+919876543213",
            password="pass",
            role="content_manager"
        )
        self.admin_user = User.objects.create_user(
            phone_number="+919876543214",
            password="pass",
            role="admin"
        )
        self.event = Event.objects.create(
            title="Pending Expo",
            slug="pending-expo",
            description="Exhibition.",
            short_description="Expo.",
            organizer_name="Expo Pvt Ltd",
            venue_name="Exhibition Ground",
            venue_address="Jalgaon",
            start_datetime=timezone.now() + timedelta(days=2),
            status="pending",
            submitted_by=self.regular_user
        )

    def test_regular_user_cannot_access_admin_endpoints(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/v1/events/admin/events/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_content_manager_approve_event(self):
        self.client.force_authenticate(user=self.content_manager)
        url = f'/api/v1/events/admin/events/{self.event.id}/approve/'
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.event.refresh_from_db()
        self.assertEqual(self.event.status, "approved")

    def test_content_manager_reject_event(self):
        self.client.force_authenticate(user=self.content_manager)
        url = f'/api/v1/events/admin/events/{self.event.id}/reject/'

        # Without reason fails
        res_fail = self.client.patch(url, {})
        self.assertEqual(res_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # With reason succeeds
        res_success = self.client.patch(url, {"rejection_reason": "Incomplete venue address"})
        self.assertEqual(res_success.status_code, status.HTTP_200_OK)

        self.event.refresh_from_db()
        self.assertEqual(self.event.status, "rejected")
        self.assertEqual(self.event.rejection_reason, "Incomplete venue address")

    def test_admin_toggle_featured(self):
        self.client.force_authenticate(user=self.admin_user)
        url = f'/api/v1/events/admin/events/{self.event.id}/feature/'
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.event.refresh_from_db()
        self.assertTrue(self.event.is_featured)
