from django.db import models
from django.conf import settings
from django.utils.text import slugify

class NGOCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class NGO(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(NGOCategory, on_delete=models.SET_NULL, null=True, related_name='ngos')
    managed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='managed_ngos')
    
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    established_date = models.DateField(blank=True, null=True)
    
    description = models.TextField()
    mission_statement = models.TextField(blank=True, null=True)
    
    address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    
    logo = models.ImageField(upload_to='ngo_logos/', blank=True, null=True)
    
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
