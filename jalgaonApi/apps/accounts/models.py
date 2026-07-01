from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.conf import settings
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("Phone number is required")

        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)  # Fixed typo here
        user.save(using=self._db)

        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'super_admin')

        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('content_manager', 'Content Manager'),
        ('news_editor', 'News Editor'),
        ('seo_manager', 'SEO Manager'),
        ('moderator', 'Moderator'),
        ('support', 'Support Executive'),
        ('advertiser', 'Advertiser'),
        ('business_owner', 'Business Owner'),
        ('registered_user', 'Registered User'),
        ('guest', 'Guest'),
    ]

    username = None
    phone_number = models.CharField(max_length=13, unique=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pic', null=True, blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='registered_user')
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []  # Add additional required fields for createsuperuser

    objects = UserManager()

    class Meta:
        db_table = 'app_user'

    def __str__(self):
        return self.phone_number

    @property
    def is_admin_role(self):
        """Check if user has any admin-level role."""
        return self.role in ('super_admin', 'admin')

    @property
    def is_staff_role(self):
        """Check if user has any staff-level role (admin or content/moderation)."""
        return self.role in (
            'super_admin', 'admin', 'content_manager',
            'news_editor', 'seo_manager', 'moderator', 'support'
        )
