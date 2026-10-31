from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("Phone number is required")

        if extra_fields.get('email'):
            extra_fields['email'] = self.normalize_email(extra_fields['email'])

        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'super_admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractUser):
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
        ('event_manager', 'Event Manager'),
        ('gate_staff', 'Gate Staff'),
        ('venue_staff', 'Venue Staff'),
        ('registered_user', 'Registered User'),
        ('guest', 'Guest'),
    ]

    username = None  # type: ignore
    phone_number = models.CharField(max_length=13, unique=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pic', null=True, blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='registered_user')
    email = models.EmailField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Optional email address for account recovery and notifications."
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="True after phone number is confirmed via OTP."
    )
    bio = models.TextField(
        max_length=500,
        null=True,
        blank=True,
        help_text="Short user bio shown on their public profile."
    )
    date_of_birth = models.DateField(
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []

    objects = UserManager()  # type: ignore

    class Meta:
        db_table = 'app_user'

    def __str__(self):
        return self.phone_number

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        If both are empty, return phone_number.
        """
        first = self.first_name or ''
        last = self.last_name or ''
        full_name = f"{first} {last}".strip()
        return full_name if full_name else str(self.phone_number)

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name or str(self.phone_number)

    @property
    def is_admin_role(self):
        """Check if user has any admin-level role."""
        return self.role in ('super_admin', 'admin')

    @property
    def is_staff_role(self):
        """Check if user has any staff-level role (admin or content/moderation)."""
        return self.role in (
            'super_admin', 'admin', 'content_manager',
            'news_editor', 'seo_manager', 'moderator', 'support',
            'event_manager'
        )

    @property
    def is_gate_staff_role(self):
        """Check if user has gate staff or venue staff scanner role."""
        return self.role in ('gate_staff', 'venue_staff')

    def save(self, *args, **kwargs):
        """
        Synchronize is_staff and is_superuser based on role:
        - super_admin: is_staff=True, is_superuser=True
        - staff roles (admin, content_manager, etc.): is_staff=True, is_superuser=False
        - non-staff roles: is_staff=False, is_superuser=False
        Also ensures update_fields includes is_staff and is_superuser whenever role is being updated.
        """
        if self.role == 'super_admin':
            self.is_staff = True
            self.is_superuser = True
        elif self.role in (
            'admin', 'content_manager', 'news_editor',
            'seo_manager', 'moderator', 'support', 'event_manager'
        ):
            self.is_staff = True
            self.is_superuser = False
        else:
            self.is_staff = False
            self.is_superuser = False

        update_fields = kwargs.get('update_fields')
        if update_fields is not None:
            update_fields_set = set(update_fields)
            if 'role' in update_fields_set:
                update_fields_set.add('is_staff')
                update_fields_set.add('is_superuser')
            kwargs['update_fields'] = list(update_fields_set)

        super().save(*args, **kwargs)


class LoginAttempt(models.Model):
    """
    Tracks failed login attempts per phone number.
    Used to implement account lockout after N consecutive failures.
    """
    phone_number = models.CharField(max_length=13, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    was_successful = models.BooleanField(default=False)
    user_agent = models.CharField(max_length=512, blank=True)

    objects = models.Manager()

    class Meta:
        db_table = 'auth_login_attempt'
        indexes = [
            models.Index(fields=['phone_number', 'attempted_at']),
            models.Index(fields=['ip_address', 'attempted_at']),
        ]

    def __str__(self):
        status = "✓" if self.was_successful else "✗"
        return f"{status} {self.phone_number} @ {self.attempted_at:%Y-%m-%d %H:%M}"

    @classmethod
    def get_failed_count(cls, phone_number, window_minutes=15):
        """Count failed attempts for a phone number within the last N minutes."""
        since = timezone.now() - timedelta(minutes=window_minutes)
        return cls.objects.filter(
            phone_number=phone_number,
            was_successful=False,
            attempted_at__gte=since
        ).count()

    @classmethod
    def is_locked(cls, phone_number, max_attempts=5, window_minutes=15):
        """Returns True if the account is temporarily locked."""
        return cls.get_failed_count(phone_number, window_minutes) >= max_attempts
