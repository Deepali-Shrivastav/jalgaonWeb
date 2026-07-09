from rest_framework import serializers
from .models import ClubCategory, Club, ClubActivity, ClubMember, ClubPhoto

class ClubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubCategory
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'sort_order']
        read_only_fields = ['slug']


class ClubActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubActivity
        fields = ['id', 'club', 'title', 'description', 'activity_date', 'activity_type', 'photo', 'is_featured', 'created_at']
        read_only_fields = ['club']


class ClubPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubPhoto
        fields = ['id', 'club', 'image', 'caption', 'sort_order', 'uploaded_at']
        read_only_fields = ['club']


class ClubMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubMember
        fields = ['id', 'club', 'name', 'role', 'photo', 'sort_order']
        read_only_fields = ['club']


class ClubListSerializer(serializers.ModelSerializer):
    category = ClubCategorySerializer(read_only=True)
    activity_count = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'slug', 'category', 'logo', 'short_description', 
            'address', 'founded_year', 'is_featured', 'is_verified', 'status', 
            'view_count', 'activity_count', 'member_count', 'created_at'
        ]

    def get_activity_count(self, obj):
        return obj.activities.count()

    def get_member_count(self, obj):
        return obj.members.count()


class ClubDetailSerializer(serializers.ModelSerializer):
    category = ClubCategorySerializer(read_only=True)
    activities = ClubActivitySerializer(many=True, read_only=True)
    members = ClubMemberSerializer(many=True, read_only=True)
    photos = ClubPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'slug', 'category', 'logo', 'banner_image', 
            'description', 'short_description', 'address', 'contact_phone', 
            'contact_email', 'website', 'facebook', 'instagram', 'founded_year', 
            'is_featured', 'is_verified', 'status', 'view_count', 'rejection_reason',
            'activities', 'members', 'photos', 'meta_title', 'meta_description', 
            'created_at', 'updated_at'
        ]


class ClubSubmitSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ClubCategory.objects.filter(is_active=True),
        source='category',
        write_only=True
    )
    # Optional nested data on initial submission
    activities_data = serializers.ListField(child=serializers.JSONField(), write_only=True, required=False)
    members_data = serializers.ListField(child=serializers.JSONField(), write_only=True, required=False)

    class Meta:
        model = Club
        fields = [
            'name', 'category_id', 'logo', 'banner_image', 'description', 
            'short_description', 'address', 'contact_phone', 'contact_email', 
            'website', 'facebook', 'instagram', 'founded_year', 'activities_data', 
            'members_data'
        ]

    def to_internal_value(self, data):
        import json
        # Make a mutable copy of data if it's a QueryDict
        if hasattr(data, 'copy'):
            data = data.copy()
        
        if 'activities_data' in data:
            val = data['activities_data']
            if isinstance(val, str):
                try:
                    data['activities_data'] = json.loads(val)
                except Exception:
                    pass
                    
        if 'members_data' in data:
            val = data['members_data']
            if isinstance(val, str):
                try:
                    data['members_data'] = json.loads(val)
                except Exception:
                    pass
                    
        return super().to_internal_value(data)


    def create(self, validated_data):
        activities_data = validated_data.pop('activities_data', [])
        members_data = validated_data.pop('members_data', [])
        
        request = self.context.get('request')
        if request and request.user:
            validated_data['submitted_by'] = request.user
            
        validated_data['status'] = 'pending'
        validated_data['is_verified'] = False
        validated_data['is_featured'] = False
        
        club = Club.objects.create(**validated_data)
        
        # Create activities if provided
        for activity_item in activities_data:
            ClubActivity.objects.create(
                club=club,
                title=activity_item.get('title'),
                description=activity_item.get('description'),
                activity_date=activity_item.get('activity_date'),
                activity_type=activity_item.get('activity_type', 'other'),
                is_featured=activity_item.get('is_featured', False)
            )
            
        # Create members if provided
        for member_item in members_data:
            ClubMember.objects.create(
                club=club,
                name=member_item.get('name'),
                role=member_item.get('role'),
                sort_order=member_item.get('sort_order', 0)
            )
            
        return club


class ClubAdminSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ClubCategory.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    category = ClubCategorySerializer(read_only=True)
    activities = ClubActivitySerializer(many=True, read_only=True)
    members = ClubMemberSerializer(many=True, read_only=True)
    photos = ClubPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'slug', 'category', 'category_id', 'submitted_by', 
            'logo', 'banner_image', 'description', 'short_description', 'address', 
            'contact_phone', 'contact_email', 'website', 'facebook', 'instagram', 
            'founded_year', 'is_featured', 'is_verified', 'status', 'rejection_reason', 
            'view_count', 'activities', 'members', 'photos', 'meta_title', 
            'meta_description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'view_count', 'created_at', 'updated_at']
