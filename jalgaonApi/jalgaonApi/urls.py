"""
URL configuration for jalgaonApi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from apps.directory.views import LegacyDirectoryRedirectView, ProductViewLegacyRedirectView

urlpatterns = [
    path('directory/<str:business_slug>/', LegacyDirectoryRedirectView.as_view(), name='legacy-directory-redirect'),
    path('directory/<str:business_slug>', LegacyDirectoryRedirectView.as_view(), name='legacy-directory-redirect-noslash'),
    path('productView/<int:id>/', ProductViewLegacyRedirectView.as_view(), name='legacy-productview-redirect'),
    path('productView/<int:id>', ProductViewLegacyRedirectView.as_view(), name='legacy-productview-redirect-noslash'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/listings/', include('apps.directory.urls')),
    path('api/v1/search/', include('apps.search.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
    path('api/v1/news/', include('apps.news.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/ads/', include('apps.ads.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),
    path('api/v1/jobs/', include('apps.jobs.urls')),
    path('api/v1/admin-panel/', include('apps.admin_panel.urls')),
    path('api/v1/ngo/', include('apps.ngo.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/blog/', include('apps.blog.urls')),
    path('api/v1/startups/', include('apps.startups.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/clubs/', include('apps.clubs.urls')),
    path('api/v1/jalgaon-glimpse/', include(('apps.jalgaon_glimpse.urls', 'jalgaon_glimpse'), namespace='jalgaon_glimpse')),
    path('api/v1/youtube/', include(('apps.jalgaon_glimpse.urls', 'jalgaon_glimpse'), namespace='youtube')),

    # Swagger / OpenAPI Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)