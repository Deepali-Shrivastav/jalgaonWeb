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

        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractUser, PermissionsMixin):
    username = None
    phone_number = models.CharField(max_length=13, unique=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pic', null=True, blank=True)
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []  # Add additional required fields for createsuperuser

    objects = UserManager()

    class Meta:
        db_table = 'app_user'

    def __str__(self):
        return self.phone_number
