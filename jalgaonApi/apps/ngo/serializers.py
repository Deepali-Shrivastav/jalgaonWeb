from rest_framework import serializers
from .models import NGOCategory, NGO

class NGOCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NGOCategory
        fields = ['id', 'name', 'slug', 'description']

class NGOSerializer(serializers.ModelSerializer):
    category = NGOCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=NGOCategory.objects.all(), source='category', write_only=True
    )
    
    class Meta:
        model = NGO
        fields = [
            'id', 'name', 'slug', 'category', 'category_id', 'registration_number',
            'established_date', 'description', 'mission_statement', 'address',
            'contact_phone', 'contact_email', 'website', 'logo', 'is_verified',
            'created_at'
        ]
        read_only_fields = ['slug', 'is_verified', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['managed_by'] = request.user
        return super().create(validated_data)
