from rest_framework import generics, viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied

from .models import JobCategory, Job, JobApplication, SavedJob
from .serializers import (
    JobCategorySerializer, JobListSerializer, JobDetailSerializer, 
    JobAdminSerializer, JobApplicationCreateSerializer, JobApplicationListSerializer, 
    SavedJobSerializer
)
from .permissions import CanSubmitJob, CanManageJobs

# --- Public Views ---

class JobCategoryListView(generics.ListAPIView):
    queryset = JobCategory.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = JobCategorySerializer
    permission_classes = [AllowAny]

class PublicJobListView(generics.ListAPIView):
    serializer_class = JobListSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location', 'description', 'requirements']
    ordering_fields = ['created_at', 'salary_max', 'view_count']

    def get_queryset(self):
        queryset = Job.objects.filter(status='active')
        
        # Filter out expired jobs
        today = timezone.now().date()
        queryset = queryset.filter(deadline__gte=today) | queryset.filter(deadline__isnull=True)

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        job_type = self.request.query_params.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type)
            
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        salary_min = self.request.query_params.get('salary_min')
        if salary_min:
            queryset = queryset.filter(salary_min__gte=salary_min)
            
        return queryset.order_by('-created_at')

class FeaturedJobsView(generics.ListAPIView):
    serializer_class = JobListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        today = timezone.now().date()
        queryset = Job.objects.filter(status='active', is_featured=True)
        queryset = queryset.filter(deadline__gte=today) | queryset.filter(deadline__isnull=True)
        return queryset.order_by('-created_at')[:5]

class PublicJobDetailView(generics.RetrieveAPIView):
    serializer_class = JobDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        today = timezone.now().date()
        queryset = Job.objects.filter(status='active')
        queryset = queryset.filter(deadline__gte=today) | queryset.filter(deadline__isnull=True)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Job.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

# --- Authenticated Views ---

class SubmitJobView(generics.CreateAPIView):
    serializer_class = JobAdminSerializer
    permission_classes = [CanSubmitJob]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        import uuid
        
        title = serializer.validated_data.get('title', 'job')
        company = serializer.validated_data.get('company', 'company')
        base_slug = slugify(f"{title}-{company}")
        slug = base_slug
        
        if Job.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
            
        serializer.save(posted_by=self.request.user, slug=slug, status='active')

class ApplyToJobView(generics.CreateAPIView):
    serializer_class = JobApplicationCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        job_slug = self.kwargs.get('slug')
        job = get_object_or_404(Job, slug=job_slug, status='active')
        
        # Check if already applied
        if JobApplication.objects.filter(job=job, applicant=self.request.user).exists():
            raise PermissionDenied("You have already applied for this job.")
            
        serializer.save(applicant=self.request.user, job=job)
        
        # TODO: Trigger notification to job.posted_by

class SavedJobView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        job = get_object_or_404(Job, slug=slug)
        saved_job, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        
        if not created:
            saved_job.delete()
            return Response({'status': 'unsaved'}, status=status.HTTP_200_OK)
            
        return Response({'status': 'saved'}, status=status.HTTP_201_CREATED)

class MySavedJobsView(generics.ListAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).order_by('-saved_at')

class MyJobsView(generics.ListAPIView):
    serializer_class = JobListSerializer
    permission_classes = [CanSubmitJob]

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user).order_by('-created_at')

class MyApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user).order_by('-applied_at')

class EmployerJobApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [CanSubmitJob]

    def get_queryset(self):
        job_id = self.kwargs.get('pk')
        job = get_object_or_404(Job, pk=job_id, posted_by=self.request.user)
        return JobApplication.objects.filter(job=job).order_by('-applied_at')

class EmployerUpdateApplicationStatusView(generics.GenericAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [CanSubmitJob]

    def patch(self, request, pk=None, app_id=None):
        job = get_object_or_404(Job, pk=pk, posted_by=self.request.user)
        application = get_object_or_404(JobApplication, pk=app_id, job=job)
        
        new_status = request.data.get('status')
        if new_status not in dict(JobApplication.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        application.status = new_status
        application.save()
        return Response({'status': application.status})

# --- Admin Views ---

class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = JobAdminSerializer
    permission_classes = [CanManageJobs]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        import uuid
        
        title = serializer.validated_data.get('title', 'job')
        company = serializer.validated_data.get('company', 'company')
        base_slug = slugify(f"{title}-{company}")
        slug = base_slug
        
        if Job.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
            
        serializer.save(posted_by=self.request.user, slug=slug)

    @action(detail=True, methods=['patch'], permission_classes=[CanManageJobs])
    def status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Job.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        job.status = new_status
        job.save()
        return Response({'status': job.status})

class AdminJobCategoryViewSet(viewsets.ModelViewSet):
    queryset = JobCategory.objects.all().order_by('sort_order', 'name')
    serializer_class = JobCategorySerializer
    permission_classes = [CanManageJobs]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        import uuid
        name = serializer.validated_data.get('name', '')
        base_slug = slugify(name)
        slug = base_slug
        if JobCategory.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
        serializer.save(slug=slug)

class AdminJobApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobApplication.objects.all().order_by('-applied_at')
    serializer_class = JobApplicationListSerializer
    permission_classes = [CanManageJobs]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        job_id = self.request.query_params.get('job')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        return queryset
