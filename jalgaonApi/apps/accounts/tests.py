from django.test import TestCase
from django.contrib.auth import get_user_model
from core.permissions import IsSuperAdmin
from unittest.mock import Mock

User = get_user_model()

class UserRoleSynchronizationTests(TestCase):
    def test_user_role_sync_on_save(self):
        # 1. Registered user
        user = User.objects.create_user(phone_number="9999999999", password="TestPassword123!")
        self.assertEqual(user.role, 'registered_user')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        # 2. Promote to Admin
        user.role = 'admin'
        user.save(update_fields=['role'])
        user.refresh_from_db()
        self.assertEqual(user.role, 'admin')
        self.assertTrue(user.is_staff)
        self.assertFalse(user.is_superuser)

        # 3. Promote to Super Admin
        user.role = 'super_admin'
        user.save(update_fields=['role'])
        user.refresh_from_db()
        self.assertEqual(user.role, 'super_admin')
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

        # 4. Demote back to registered_user
        user.role = 'registered_user'
        user.save(update_fields=['role'])
        user.refresh_from_db()
        self.assertEqual(user.role, 'registered_user')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_is_super_admin_permission(self):
        permission = IsSuperAdmin()
        request = Mock()

        # Unauthenticated user
        request.user = None
        self.assertFalse(permission.has_permission(request, None))

        # Admin user (not super_admin and not is_superuser)
        admin_user = User.objects.create_user(phone_number="8888888888", password="TestPassword123!", role="admin")
        request.user = admin_user
        self.assertFalse(permission.has_permission(request, None))

        # Super Admin via role
        super_admin_user = User.objects.create_user(phone_number="7777777777", password="TestPassword123!", role="super_admin")
        request.user = super_admin_user
        self.assertTrue(permission.has_permission(request, None))

        # Super Admin via is_superuser=True
        superuser_only = User.objects.create_user(phone_number="6666666666", password="TestPassword123!", role="admin")
        superuser_only.is_superuser = True
        request.user = superuser_only
        self.assertTrue(permission.has_permission(request, None))


class PasswordResetAPITests(TestCase):
    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.user = User.objects.create_user(
            phone_number="9876543210",
            email="testuser@example.com",
            password="OldPassword123!"
        )

    def test_password_reset_request_with_valid_email(self):
        response = self.client.post(
            '/api/v1/auth/password-reset/',
            {'email': 'testuser@example.com'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)

    def test_password_reset_request_with_valid_phone(self):
        response = self.client.post(
            '/api/v1/auth/password-reset/',
            {'phone_number': '9876543210'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)

    def test_password_reset_request_nonexistent_user(self):
        response = self.client.post(
            '/api/v1/auth/password-reset/',
            {'email': 'nonexistent@example.com'},
            format='json'
        )
        # Should still return 200 to prevent user enumeration
        self.assertEqual(response.status_code, 200)

    def test_password_reset_confirm_flow(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            '/api/v1/auth/password-reset-confirm/',
            {
                'uid': uid,
                'token': token,
                'new_password': 'NewPassword123!',
                'confirm_password': 'NewPassword123!'
            },
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.data)

        # Verify user password was changed in DB
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!'))
        self.assertFalse(self.user.check_password('OldPassword123!'))


