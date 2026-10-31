import uuid
from django.db import models
from django.utils.text import slugify


class TouristPlace(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    category = models.CharField(max_length=100, default='Tourist attraction')
    rating = models.FloatField(default=4.5)
    reviews_count = models.IntegerField(default=100)
    distance = models.CharField(max_length=150, default='Jalgaon')
    image = models.ImageField(upload_to='tourism/places/', null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Direct image URL fallback or external link")
    timings = models.CharField(max_length=150, default='9:00 AM - 6:00 PM')
    description = models.TextField(blank=True)
    highlights = models.JSONField(default=list, blank=True, help_text="List of highlights e.g. ['Scenic View', 'Historic']")
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tourism_touristplace'
        ordering = ['sort_order', 'name']
        verbose_name = 'Tourist Place'
        verbose_name_plural = 'Tourist Places'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            base_slug = slugify(self.name)
            candidate = base_slug
            counter = 1
            while TouristPlace.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{counter}"
                counter += 1
            self.slug = candidate
        super().save(*args, **kwargs)
