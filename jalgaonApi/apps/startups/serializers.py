from rest_framework import serializers
from .models import StartupIndustry, Startup, Founder

class StartupIndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = StartupIndustry
        fields = ['id', 'name', 'slug', 'description', 'is_active']
        read_only_fields = ['slug']


class FounderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Founder
        fields = ['id', 'name', 'role', 'photo', 'linkedin', 'bio', 'sort_order']


class StartupListSerializer(serializers.ModelSerializer):
    industry = StartupIndustrySerializer(read_only=True)
    founder_count = serializers.SerializerMethodField()

    class Meta:
        model = Startup
        fields = [
            'id', 'name', 'slug', 'industry', 'logo', 'founding_year', 
            'stage', 'status', 'website', 'linkedin', 'twitter', 
            'is_featured', 'is_verified', 'view_count', 'founder_count',
            'created_at'
        ]

    def get_founder_count(self, obj):
        return obj.founders.count()


class StartupDetailSerializer(serializers.ModelSerializer):
    industry = StartupIndustrySerializer(read_only=True)
    founders = FounderSerializer(many=True, read_only=True)

    class Meta:
        model = Startup
        fields = [
            'id', 'name', 'slug', 'industry', 'logo', 'description', 
            'founding_year', 'stage', 'status', 'website', 'linkedin', 
            'twitter', 'email', 'phone', 'address', 'is_featured', 
            'is_verified', 'view_count', 'founders', 'meta_title', 
            'meta_description', 'created_at', 'updated_at'
        ]


class FounderSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Founder
        fields = ['name', 'role', 'photo', 'linkedin', 'bio', 'sort_order']


class StartupSubmitSerializer(serializers.ModelSerializer):
    industry_id = serializers.PrimaryKeyRelatedField(
        queryset=StartupIndustry.objects.filter(is_active=True),
        source='industry',
        write_only=True
    )
    founders_data = serializers.ListField(
        child=serializers.JSONField(), 
        write_only=True, 
        required=False
    )

    class Meta:
        model = Startup
        fields = [
            'name', 'industry_id', 'logo', 'description', 'founding_year', 
            'stage', 'website', 'linkedin', 'twitter', 'email', 'phone', 
            'address', 'founders_data'
        ]

    def create(self, validated_data):
        founders_data = validated_data.pop('founders_data', [])
        request = self.context.get('request')
        if request and request.user:
            validated_data['submitted_by'] = request.user
        
        # default user submission is pending
        validated_data['status'] = 'pending'
        validated_data['is_verified'] = False
        validated_data['is_featured'] = False
        
        startup = Startup.objects.create(**validated_data)
        
        # Create founders if provided
        for founder_item in founders_data:
            Founder.objects.create(
                startup=startup,
                name=founder_item.get('name'),
                role=founder_item.get('role', ''),
                linkedin=founder_item.get('linkedin', ''),
                bio=founder_item.get('bio', ''),
                sort_order=founder_item.get('sort_order', 0)
            )
            
        return startup


class StartupAdminSerializer(serializers.ModelSerializer):
    industry_id = serializers.PrimaryKeyRelatedField(
        queryset=StartupIndustry.objects.all(),
        source='industry',
        write_only=True,
        required=False
    )
    industry = StartupIndustrySerializer(read_only=True)
    founders = FounderSerializer(many=True, read_only=True)

    class Meta:
        model = Startup
        fields = [
            'id', 'name', 'slug', 'industry', 'industry_id', 'submitted_by', 
            'logo', 'description', 'founding_year', 'stage', 'status', 
            'website', 'linkedin', 'twitter', 'email', 'phone', 'address', 
            'is_featured', 'is_verified', 'view_count', 'founders', 
            'meta_title', 'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'view_count', 'created_at', 'updated_at']
