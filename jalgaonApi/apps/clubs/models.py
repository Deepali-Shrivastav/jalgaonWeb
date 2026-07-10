from django.db import models
from django.conf import settings
from django.utils.text import slugify

class ClubCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "Club Categories"
        ordering = ['sort_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Club(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    category = models.ForeignKey(
        ClubCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='clubs'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='submitted_clubs'
    )
    logo = models.ImageField(upload_to='clubs/logos/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='clubs/banners/', blank=True, null=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300)
    address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    founded_year = models.PositiveIntegerField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    view_count = models.PositiveIntegerField(default=0)
    
    meta_title = models.CharField(max_length=150, blank=True, null=True)
    meta_description = models.CharField(max_length=250, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Club.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ClubActivity(models.Model):
    TYPE_CHOICES = [
        ('event', 'Event'),
        ('workshop', 'Workshop'),
        ('camp', 'Camp'),
        ('meeting', 'Meeting'),
        ('competition', 'Competition'),
        ('social_drive', 'Social Drive'),
        ('other', 'Other'),
    ]

    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    activity_date = models.DateField()
    activity_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='other')
    photo = models.ImageField(upload_to='clubs/activities/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-activity_date', '-created_at']
        verbose_name_plural = "Club Activities"

    def __str__(self):
        return f"{self.title} - {self.club.name}"


class ClubMember(models.Model):
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='members'
    )
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='clubs/members/', blank=True, null=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.club.name}"


class ClubPhoto(models.Model):
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='clubs/photos/')
    caption = models.CharField(max_length=200, blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"Photo {self.id} for {self.club.name}"
