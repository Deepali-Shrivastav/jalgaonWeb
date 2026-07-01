from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    JobCategoryListView, PublicJobListView, FeaturedJobsView, PublicJobDetailView,
    SubmitJobView, ApplyToJobView, SavedJobView, MySavedJobsView, MyJobsView,
    MyApplicationsView, EmployerJobApplicationsView, EmployerUpdateApplicationStatusView, 
    AdminJobViewSet, AdminJobCategoryViewSet, AdminJobApplicationViewSet
)

router = SimpleRouter()
router.register(r'admin/jobs', AdminJobViewSet, basename='admin-jobs')
router.register(r'admin/categories', AdminJobCategoryViewSet, basename='admin-categories')
router.register(r'admin/applications', AdminJobApplicationViewSet, basename='admin-applications')

urlpatterns = [
    # Public endpoints
    path('categories/', JobCategoryListView.as_view(), name='job-categories'),
    path('featured/', FeaturedJobsView.as_view(), name='featured-jobs'),
    
    # Authenticated user endpoints (employers)
    path('my-jobs/', MyJobsView.as_view(), name='my-jobs'),
    path('my-jobs/<int:pk>/applications/', EmployerJobApplicationsView.as_view(), name='my-job-applications'),
    path('my-jobs/<int:pk>/applications/<int:app_id>/status/', EmployerUpdateApplicationStatusView.as_view(), name='update-application-status'),
    
    # Authenticated user endpoints (job seekers)
    path('saved/', MySavedJobsView.as_view(), name='my-saved-jobs'),
    path('my-applications/', MyApplicationsView.as_view(), name='my-applications'),
    
    # Job submission
    path('submit/', SubmitJobView.as_view(), name='submit-job'),
    
    # Admin endpoints
    path('', include(router.urls)),
    
    # Detail endpoints (need to be lower so they don't capture above routes)
    path('<slug:slug>/', PublicJobDetailView.as_view(), name='job-detail'),
    path('<slug:slug>/apply/', ApplyToJobView.as_view(), name='apply-job'),
    path('<slug:slug>/save/', SavedJobView.as_view(), name='save-job'),
    
    # List endpoint (lowest priority)
    path('', PublicJobListView.as_view(), name='job-list'),
]
