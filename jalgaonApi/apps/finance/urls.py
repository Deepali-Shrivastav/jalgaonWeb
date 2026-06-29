from django.urls import path
from .views import FinanceTickleView

urlpatterns = [
    path('data/', FinanceTickleView.as_view(), name='finance-data'),
]
