from django.db import models
from django.conf import settings


class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'events_eventcategory'
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Event Categories'

    def __str__(self):
        return self.name


class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    # Core details
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True)
    description = models.TextField()
    short_description = models.TextField()

    # Organizer details
    organizer_name = models.CharField(max_length=200)
    organizer_contact = models.CharField(max_length=100, blank=True)

    # Venue & Geolocation
    venue_name = models.CharField(max_length=200)
    venue_address = models.TextField()
    venue_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    venue_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    maps_url = models.URLField(max_length=500, blank=True, null=True)

    # Schedule & Links
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    registration_link = models.URLField(max_length=500, blank=True, null=True)
    price = models.CharField(max_length=50, default='Free', blank=True, help_text="e.g. 'Free' or '₹199'")

    # Media & Category
    featured_image = models.ImageField(upload_to='events/featured/', null=True, blank=True)
    category = models.ForeignKey(EventCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')

    # Moderation & Workflow
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='submitted_events'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_featured = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, null=True)

    # Analytics & SEO
    view_count = models.PositiveIntegerField(default=0)
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events_event'
        ordering = ['start_datetime']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['start_datetime']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['submitted_by']),
        ]

    def __str__(self):
        return self.title


class EventBooking(models.Model):
    booking_reference = models.CharField(max_length=50, unique=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='mobile_bookings')
    pass_category = models.CharField(max_length=100, default='General')
    quantity = models.PositiveIntegerField(default=1)
    customer_name = models.CharField(max_length=200, blank=True, default='Mobile App Guest')
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    customer_email = models.EmailField(blank=True, default='')
    total_price = models.CharField(max_length=50, blank=True, default='Free')
    status = models.CharField(max_length=20, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'events_booking'
        ordering = ['-created_at']
        verbose_name = 'Mobile Event Booking'
        verbose_name_plural = 'Mobile Event Bookings'

    def __str__(self):
        return f"{self.booking_reference} - {self.event.title} ({self.quantity} tickets)"
