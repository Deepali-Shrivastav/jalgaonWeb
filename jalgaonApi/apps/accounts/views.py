from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, login, logout, authenticate
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny

import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.save()
            return Response({'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data['user']
            login(request, user)
            token = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(token.access_token)    
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogout(APIView):
    def post(self, request):
        try:
            logout(request)
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

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
        # Handle other HTTP methods if needed
        return JsonResponse({'detail': f'Method "{request.method}" not allowed.'}, status=405)


class ObtainTokenKeyView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this view

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(username=phone_number, password=password)

        if user:
            # Create or get the token for the user
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid phone number or password'}, status=status.HTTP_400_BAD_REQUEST)
