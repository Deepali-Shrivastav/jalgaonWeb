from rest_framework import serializers
from .models import JobCategory, Job, JobApplication, SavedJob

class JobCategorySerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(read_only=True)
    
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'slug', 'is_active', 'sort_order']

class JobListSerializer(serializers.ModelSerializer):
    category = JobCategorySerializer(read_only=True)
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True, default='Admin')
    posted_by_phone = serializers.SerializerMethodField()
    posted_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'slug', 'company', 'company_logo', 'location', 
            'job_type', 'category', 'salary_min', 'salary_max', 
            'status', 'is_featured', 'deadline', 'posted_by_name', 'posted_by_phone', 'posted_by_email', 'created_at'
        ]

    def get_posted_by_phone(self, obj):
        if getattr(obj, 'contact_number', None):
            return obj.contact_number
        return obj.posted_by.phone_number if obj.posted_by else ''

    def get_posted_by_email(self, obj):
        if getattr(obj, 'contact_email', None):
            return obj.contact_email
        return obj.posted_by.email if obj.posted_by else ''

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Dynamically set status to expired if deadline has passed
        if ret.get('status') == 'active' and instance.deadline:
            from django.utils import timezone
            if instance.deadline < timezone.now().date():
                ret['status'] = 'expired'
        return ret

class JobDetailSerializer(JobListSerializer):
    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + [
            'description', 'requirements', 'apply_url', 'meta_title', 'meta_description', 'view_count'
        ]

class JobAdminSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=JobCategory.objects.all(), required=False, allow_null=True)
    posted_by = serializers.PrimaryKeyRelatedField(read_only=True)
    shop_listing = serializers.PrimaryKeyRelatedField(queryset=Job.objects.none(), required=False, allow_null=True) # Will override in init

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from apps.directory.models import ShopListing
        self.fields['shop_listing'].queryset = ShopListing.objects.all()

    class Meta:
        model = Job
        fields = '__all__'

class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['resume', 'cover_letter', 'applicant_name', 'applicant_email', 'applicant_phone']

    def validate_resume(self, value):
        if value and value.size > 500 * 1024:
            raise serializers.ValidationError("Resume file size must be less than 500 KB.")
        return value

class JobApplicationListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    applicant_phone = serializers.SerializerMethodField()
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'job_title', 'applicant', 'applicant_name', 'applicant_email', 'applicant_phone', 'resume', 'cover_letter', 'status', 'applied_at']

    def get_applicant_name(self, obj):
        return obj.applicant_name or obj.applicant.get_full_name()

    def get_applicant_email(self, obj):
        return obj.applicant_email or obj.applicant.email

    def get_applicant_phone(self, obj):
        if getattr(obj, 'applicant_phone', None):
            return obj.applicant_phone
        if hasattr(obj.applicant, 'phone_number'):
            return obj.applicant.phone_number
        return ''

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'saved_at']
