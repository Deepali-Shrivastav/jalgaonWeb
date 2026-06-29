from django.urls import path
from .views import (
    UserRegister, UserLogin, UserLogout, UserView,
    get_csrf_token, ObtainTokenKeyView
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserRegister.as_view(), name='register'),
    path('login/', UserLogin.as_view(), name='login'),
    path('logout/', UserLogout.as_view(), name='logout'),
    path('user/', UserView.as_view(), name='user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('csrf-token/', get_csrf_token, name='csrf-token'),
    path('token-key/', ObtainTokenKeyView.as_view(), name='token-key'),
]
