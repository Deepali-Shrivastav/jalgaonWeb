from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model, login, logout
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
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
            return Response(
                {'error': f'Invalid credentials. {max(0, remaining)} attempts remaining before lockout.'},
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

@ensure_csrf_cookie
def get_csrf_token(request):
    if request.method == 'GET':
        return JsonResponse({'csrfToken': request.META.get('CSRF_COOKIE', '')})
    else:
        return JsonResponse({'detail': f'Method "{request.method}" not allowed.'}, status=405)
