from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid

class JobCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'jobs_jobcategory'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

class Job(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('rejected', 'Rejected'),
    ]

    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ]

    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    company = models.CharField(max_length=255)
    company_logo = models.ImageField(upload_to='jobs/logos/', null=True, blank=True)
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, related_name='jobs')
    
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    
    description = models.TextField()
    requirements = models.TextField()
    
    apply_url = models.URLField(max_length=500, null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_featured = models.BooleanField(default=False)
    
    view_count = models.PositiveIntegerField(default=0)
    
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jobs_job'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'deadline']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return f"{self.title} at {self.company}"

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    resume = models.FileField(upload_to='jobs/resumes/')
    cover_letter = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'jobs_jobapplication'
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.applicant} -> {self.job.title}"

class SavedJob(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by_users')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'jobs_savedjob'
        unique_together = ('user', 'job')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user} saved {self.job.title}"
