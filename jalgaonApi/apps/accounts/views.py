from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model, login, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserRegisterSerializer, UserLoginSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import LoginAttempt
from apps.audit.models import AuditLog

import logging


User = get_user_model()
logger = logging.getLogger(__name__)

class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            
            # Log registration audit event
            ip_address = self._get_client_ip(request)
            AuditLog.objects.create(
                actor=user,
                action='auth.register',
                target_type='User',
                target_id=str(user.id),
                ip_address=ip_address,
            )
            
            return Response({'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

class UserLogin(APIView):
    """
    POST /api/v1/auth/login/
    Password-based login with brute-force protection (IS-05, IS-06).
    Account is temporarily locked after 5 failed attempts within 15 minutes.
    """
    permission_classes = (permissions.AllowAny,)

    MAX_ATTEMPTS = 5
    LOCKOUT_WINDOW_MINUTES = 15

    def post(self, request):
        phone_number = request.data.get('phone_number', '')
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Check if account is locked (too many recent failures)
        if LoginAttempt.is_locked(phone_number, self.MAX_ATTEMPTS, self.LOCKOUT_WINDOW_MINUTES):
            logger.warning(
                f"Login blocked for {phone_number} from {ip_address} — account locked."
            )
            return Response(
                {
                    'error': (
                        f'Account temporarily locked due to too many failed attempts. '
                        f'Please try again in {self.LOCKOUT_WINDOW_MINUTES} minutes.'
                    )
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)

            # Record successful attempt
            LoginAttempt.objects.create(
                phone_number=phone_number,
                ip_address=ip_address,
                user_agent=user_agent,
                was_successful=True
            )

            # Log audit event
            AuditLog.objects.create(
                actor=user,
                action='auth.login',
                target_type='User',
                target_id=str(user.id),
                ip_address=ip_address,
            )

            refresh = RefreshToken.for_user(user)
            logger.info(f"User {phone_number} logged in successfully from {ip_address}.")

            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        else:
            # Record failed attempt
            LoginAttempt.objects.create(
                phone_number=phone_number,
                ip_address=ip_address,
                user_agent=user_agent,
                was_successful=False
            )
            
            # Log failed login audit event
            AuditLog.objects.create(
                actor=None,
                action='auth.login_failed',
                target_type='User',
                target_id='',
                ip_address=ip_address,
                changes={'phone_number': phone_number}
            )
            
            failed_count = LoginAttempt.get_failed_count(phone_number, self.LOCKOUT_WINDOW_MINUTES)
            remaining = self.MAX_ATTEMPTS - failed_count
            logger.warning(
                f"Failed login for {phone_number} from {ip_address}. "
                f"{remaining} attempts remaining."
            )
            
            error_msg = f'Invalid credentials. {max(0, remaining)} attempts remaining before lockout.'
            if serializer.errors and 'non_field_errors' in serializer.errors:
                err_text = str(serializer.errors['non_field_errors'][0])
                if "not found" in err_text.lower():
                    error_msg = err_text
                    
            return Response(
                {'error': error_msg},
                status=status.HTTP_401_UNAUTHORIZED
            )

    def _get_client_ip(self, request):
        """Get the real client IP, accounting for reverse proxies."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

class UserLogout(APIView):
    """
    POST /api/v1/auth/logout/
    Properly blacklists the refresh token on logout.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required to logout.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as e:
            return Response(
                {'error': 'Invalid or already expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Log audit event
        AuditLog.objects.create(
            actor=request.user,
            action='auth.logout',
            target_type='User',
            target_id=str(request.user.id),
            ip_address=self._get_client_ip(request),
        )

        logout(request)
        logger.info(f"User {request.user.phone_number} logged out. Token blacklisted.")
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

class LogoutAllDevicesView(APIView):
    """
    POST /api/v1/auth/logout-all/
    Blacklists ALL outstanding refresh tokens for the current user.
    FR-AUTH-09: Logout from all devices.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
        
        tokens = OutstandingToken.objects.filter(user=request.user)
        blacklisted_count = 0
        for token in tokens:
            _, created = BlacklistedToken.objects.get_or_create(token=token)
            if created:
                blacklisted_count += 1

        # Log audit event
        AuditLog.objects.create(
            actor=request.user,
            action='auth.logout_all',
            target_type='User',
            target_id=str(request.user.id),
            ip_address=self._get_client_ip(request),
        )

        logout(request)
        logger.info(f"User {request.user.phone_number} logged out from all devices. {blacklisted_count} tokens blacklisted.")
        return Response(
            {'message': f'Logged out from all devices. {blacklisted_count} sessions terminated.'},
            status=status.HTTP_200_OK
        )

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data}, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'user': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@ensure_csrf_cookie
def get_csrf_token(request):
    if request.method == 'GET':
        return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})
    else:
        return JsonResponse({'detail': f'Method "{request.method}" not allowed.'}, status=405)


class PasswordResetRequestView(APIView):
    """
    POST /api/v1/auth/password-reset/
    Generates a password reset token and sends an email with the reset link.
    Accepts: { "email": "user@example.com" } OR { "phone_number": "9876543210" }
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data.get('email', '').strip()
        phone_number = serializer.validated_data.get('phone_number', '').strip()

        # Try looking up user by email or phone_number
        user = None
        if email:
            user = User.objects.filter(email__iexact=email).first()
        elif phone_number:
            from .serializers import validate_phone_number
            try:
                phone_clean = validate_phone_number(phone_number)
                user = User.objects.filter(phone_number=phone_clean).first()
            except Exception:
                pass

        generic_response = Response(
            {
                'message': (
                    'If an account with that information exists, we have sent instructions '
                    'to reset your password. Please check your inbox or spam folder.'
                )
            },
            status=status.HTTP_200_OK
        )

        if not user:
            # Return generic message to prevent user enumeration
            return generic_response

        # Generate reset token and uid
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

        # Target email: use provided email or user's registered email
        target_email = email if email else user.email

        # Always print link to terminal console during development for easy testing
        logger.info(f"PASSWORD RESET LINK generated for {user.phone_number}: {reset_link}")
        print(f"\n======================================================================")
        print(f"[DEVELOPMENT RESET LINK] User: {user.phone_number}")
        print(f"LINK: {reset_link}")
        print(f"======================================================================\n")

        if target_email:
            subject = "Password Reset Request — Jalgaon Portal"
            message = (
                f"Hello,\n\n"
                f"We received a request to reset the password for your Jalgaon Portal account.\n\n"
                f"Please click the link below to set a new password:\n"
                f"{reset_link}\n\n"
                f"If you did not request this, please ignore this email.\n\n"
                f"Regards,\n"
                f"Jalgaon Portal Team"
            )
            html_message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #0f172a; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                    We received a request to reset the password for your <strong>Jalgaon Portal</strong> account. Click the button below to set a new password:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{reset_link}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Reset Password</a>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                    If the button above does not work, copy and paste this link into your browser:<br>
                    <a href="{reset_link}" style="color: #2563eb; word-break: break-all;">{reset_link}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                    If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>
            """
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    recipient_list=[target_email],
                    html_message=html_message,
                    fail_silently=False,
                )
                logger.info(f"Password reset email sent to {target_email} for user {user.phone_number}.")
            except Exception as e:
                logger.error(f"Failed to send password reset email to {target_email}: {str(e)}")


        # Log audit event
        ip_address = self._get_client_ip(request)
        AuditLog.objects.create(
            actor=user,
            action='auth.password_reset_requested',
            target_type='User',
            target_id=str(user.id),
            ip_address=ip_address,
        )

        return generic_response

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class PasswordResetConfirmView(APIView):
    """
    POST /api/v1/auth/password-reset-confirm/
    Validates the password reset token and updates the user's password.
    Accepts: { "uid": "...", "token": "...", "new_password": "...", "confirm_password": "..." }
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid reset link or user does not exist.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Password reset link is invalid or has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        # Log audit event
        ip_address = self._get_client_ip(request)
        AuditLog.objects.create(
            actor=user,
            action='auth.password_reset_confirmed',
            target_type='User',
            target_id=str(user.id),
            ip_address=ip_address,
        )

        logger.info(f"Password reset successfully for user {user.phone_number}.")
        return Response(
            {'message': 'Your password has been reset successfully. You can now log in with your new password.'},
            status=status.HTTP_200_OK
        )

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

