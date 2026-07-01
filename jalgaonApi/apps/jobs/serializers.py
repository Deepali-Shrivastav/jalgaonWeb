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

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'slug', 'company', 'company_logo', 'location', 
            'job_type', 'category', 'salary_min', 'salary_max', 
            'status', 'is_featured', 'deadline', 'posted_by_name', 'created_at'
        ]

class JobDetailSerializer(JobListSerializer):
    class Meta(JobListSerializer.Meta):
        fields = JobListSerializer.Meta.fields + [
            'description', 'requirements', 'apply_url', 'meta_title', 'meta_description', 'view_count'
        ]

class JobAdminSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=JobCategory.objects.all(), required=False, allow_null=True)
    posted_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = '__all__'

class JobApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['resume', 'cover_letter']

class JobApplicationListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    applicant_email = serializers.EmailField(source='applicant.email', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'job_title', 'applicant', 'applicant_name', 'applicant_email', 'resume', 'cover_letter', 'status', 'applied_at']

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'saved_at']
