from django.db import models
from django.conf import settings
from django.utils.text import slugify

class StartupIndustry(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Startup Industries"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Startup(models.Model):
    STAGE_CHOICES = [
        ('idea', 'Idea'),
        ('mvp', 'MVP'),
        ('early_stage', 'Early Stage'),
        ('growth', 'Growth'),
        ('established', 'Established'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    industry = models.ForeignKey(
        StartupIndustry, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='startups'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='submitted_startups'
    )
    logo = models.ImageField(upload_to='startups/logos/', blank=True, null=True)
    description = models.TextField()
    founding_year = models.PositiveIntegerField(blank=True, null=True)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='idea')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    
    meta_title = models.CharField(max_length=150, blank=True, null=True)
    meta_description = models.CharField(max_length=250, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Startup.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Founder(models.Model):
    startup = models.ForeignKey(
        Startup, 
        on_delete=models.CASCADE, 
        related_name='founders'
    )
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='startups/founders/', blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.name} - {self.startup.name}"
