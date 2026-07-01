from django.urls import path
from .views import (
    UserRegister, UserLogin, UserLogout, LogoutAllDevicesView,
    UserView, get_csrf_token
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    # --- Password-based auth (current system, to be replaced by OTP in next phase) ---
    path('register/', UserRegister.as_view(), name='register'),
    path('login/', UserLogin.as_view(), name='login'),

    # --- Session management ---
    path('logout/', UserLogout.as_view(), name='logout'),
    path('logout-all/', LogoutAllDevicesView.as_view(), name='logout-all'),

    # --- JWT token management ---
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # --- User profile ---
    path('user/', UserView.as_view(), name='user'),

    # --- Utilities ---
    path('csrf-token/', get_csrf_token, name='csrf-token'),
]
