from rest_framework import serializers
from .models import FinanceData

class FinanceDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinanceData
        fields = '__all__'
