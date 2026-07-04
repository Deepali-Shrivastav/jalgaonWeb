from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.ads.models import AdsListing, AdSlot

User = get_user_model()

class AdsBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone_number='9876543210',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        self.admin = User.objects.create_superuser(
            phone_number='9999999999',
            password='adminpassword123',
            role='super_admin'
        )
        
        # Valid 1x1 GIF image for Pillow
        gif_bytes = b'GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
        self.test_image = SimpleUploadedFile(
            name='test_ad.gif',
            content=gif_bytes,
            content_type='image/gif'
        )

    def test_ad_submission(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            'name': 'Sample Ad Campaign',
            'contact_number': '9876543210',
            'contact_email': 'test@example.com',
            'ad_type': 'BA',
            'target_page': 'hero_banner',
            'package': 'standard',
            'ad_image': self.test_image
        }
        response = self.client.post('/api/v1/ads/submit/', payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AdsListing.objects.count(), 1)
        ad = AdsListing.objects.first()
        self.assertEqual(ad.status, 'pending')
        self.assertEqual(ad.target_page, 'hero_banner')
        self.assertEqual(ad.package, 'standard')

    def test_track_impression_and_click(self):
        ad = AdsListing.objects.create(
            user=self.user,
            name='Tracking Ad',
            contact_number='9876543210',
            contact_email='track@example.com',
            ad_type='BA',
            target_page='hero_banner',
            status='active',
            ad_image=self.test_image
        )
        # Track Impression
        imp_resp = self.client.post(f'/api/v1/ads/{ad.id}/track-impression/')
        self.assertEqual(imp_resp.status_code, status.HTTP_200_OK)
        ad.refresh_from_db()
        self.assertEqual(ad.impressions, 1)

        # Track Click
        click_resp = self.client.post(f'/api/v1/ads/{ad.id}/track-click/')
        self.assertEqual(click_resp.status_code, status.HTTP_200_OK)
        ad.refresh_from_db()
        self.assertEqual(ad.clicks, 1)

    def test_advertiser_analytics(self):
        self.client.force_authenticate(user=self.user)
        ad = AdsListing.objects.create(
            user=self.user,
            name='Analytics Ad',
            contact_number='9876543210',
            contact_email='analytics@example.com',
            ad_type='BA',
            target_page='hero_banner',
            status='active',
            impressions=100,
            clicks=10,
            ad_image=self.test_image
        )
        response = self.client.get('/api/v1/ads/my-analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['total_impressions'], 100)
        self.assertEqual(data['total_clicks'], 10)
        self.assertEqual(data['overall_ctr'], 10.0)

    def test_ads_by_slot(self):
        AdSlot.objects.create(slot_name='hero_banner', is_enabled=True, max_ads=5)
        ad = AdsListing.objects.create(
            user=self.user,
            name='Hero Ad',
            contact_number='9876543210',
            contact_email='hero@example.com',
            ad_type='BA',
            target_page='hero_banner',
            status='active',
            ad_image=self.test_image
        )

        # Active Slot
        response = self.client.get('/api/v1/ads/by-slot/?slot=hero_banner')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['is_enabled'])
        self.assertEqual(len(response.json()['ads']), 1)

        # Disable Slot
        slot = AdSlot.objects.get(slot_name='hero_banner')
        slot.is_enabled = False
        slot.save()

        response = self.client.get('/api/v1/ads/by-slot/?slot=hero_banner')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()['is_enabled'])
        self.assertEqual(len(response.json()['ads']), 0)

    def test_admin_revision_request(self):
        self.client.force_authenticate(user=self.admin)
        ad = AdsListing.objects.create(
            user=self.user,
            name='Pending Ad',
            contact_number='9876543210',
            contact_email='pending@example.com',
            ad_type='BA',
            status='pending',
            ad_image=self.test_image
        )
        response = self.client.patch(
            f'/api/v1/admin-panel/ads/{ad.id}/',
            {'action': 'request_revision', 'rejection_reason': 'Please upload higher resolution image.'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ad.refresh_from_db()
        self.assertEqual(ad.status, 'revision_requested')
        self.assertEqual(ad.rejection_reason, 'Please upload higher resolution image.')
