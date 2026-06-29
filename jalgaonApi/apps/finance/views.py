from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import FinanceData
from .serializers import FinanceDataSerializer

class FinanceTickleView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            financeData = FinanceData.objects.all()
            serializer = FinanceDataSerializer(financeData, many=True)
            return Response({"financeData": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "An error occurred while fetching finance data."}, status=status.HTTP_400_BAD_REQUEST)
