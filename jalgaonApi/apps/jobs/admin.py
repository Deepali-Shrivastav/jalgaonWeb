from django.contrib import admin
from .models import JobCategory, Job, JobApplication, SavedJob

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'sort_order')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'posted_by', 'status', 'job_type', 'deadline', 'created_at')
    list_filter = ('status', 'job_type', 'category', 'is_featured')
    search_fields = ('title', 'company', 'location')
    prepopulated_fields = {'slug': ('title', 'company')}
    raw_id_fields = ('posted_by', 'category')
    date_hierarchy = 'created_at'

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'job', 'status', 'applied_at')
    list_filter = ('status',)
    search_fields = ('applicant__email', 'job__title')
    raw_id_fields = ('applicant', 'job')
    date_hierarchy = 'applied_at'

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'saved_at')
    search_fields = ('user__email', 'job__title')
    raw_id_fields = ('user', 'job')
