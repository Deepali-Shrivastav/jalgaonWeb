from django.db import models
from django.conf import settings
from django.utils import timezone

class HomeCrouselAds(models.Model):
    crousel_add_img = models.ImageField(upload_to='static/assets/AdsImages')

    class Meta:
        db_table = 'app_homecrouselads'

class BannerAds(models.Model):
    banner_add_home_one = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_home_two = models.ImageField(upload_to='static/assets/AdsImages')

    banner_add_category_one = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_category_two = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_category_three = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_category_four = models.ImageField(upload_to='static/assets/AdsImages')

    class Meta:
        db_table = 'app_bannerads'

    def __str__(self):
        return f"BannerAds {self.id}"

class AdSlot(models.Model):
    SLOT_CHOICES = [
        ('hero_banner', 'Homepage Hero Banner'),
        ('category_banner', 'Category Page Banner'),
        ('sidebar', 'Sidebar'),
        ('listing_interstitial', 'Between Listings'),
    ]
    slot_name = models.CharField(max_length=30, choices=SLOT_CHOICES, unique=True)
    is_enabled = models.BooleanField(default=True)
    max_ads = models.PositiveIntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_adslot'

    def __str__(self):
        return f"{self.get_slot_name_display()} ({'Enabled' if self.is_enabled else 'Disabled'})"

class AdsListing(models.Model):
    BANNER_AD = 'BA'
    CAROUSEL_AD = 'CA'
    
    AD_TYPE_CHOICES = [
        (BANNER_AD, 'Banner Ads'),
        (CAROUSEL_AD, 'Carousel Ads'),
    ]

    TARGET_PAGE_CHOICES = [
        ('hero_banner', 'Homepage Hero Banner'),
        ('category_banner', 'Category Page Banner'),
        ('sidebar', 'Sidebar'),
        ('listing_interstitial', 'Between Listings'),
    ]

    PACKAGE_CHOICES = [
        ('basic', 'Basic (3 Days)'),
        ('standard', 'Standard (7 Days)'),
        ('premium', 'Premium (30 Days)'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey('directory.ShopListing', on_delete=models.CASCADE, null=True, blank=True, related_name='advertisements')
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    contact_email = models.CharField(max_length=255)
    ad_type = models.CharField(
        max_length=2,
        choices=AD_TYPE_CHOICES,
        default=BANNER_AD,
    )
    target_page = models.CharField(
        max_length=30,
        choices=TARGET_PAGE_CHOICES,
        default='hero_banner'
    )
    package = models.CharField(
        max_length=20,
        choices=PACKAGE_CHOICES,
        default='basic'
    )
    ad_image = models.ImageField(upload_to='static/assets/ads_images')
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    impressions = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)

    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('active', 'Active'), ('rejected', 'Rejected'), ('revision_requested', 'Revision Requested')],
        default='pending'
    )
    rejection_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_adslisting'

    def __str__(self):
        return self.name


class FloatingVideoAdvertisement(models.Model):
    PLATFORM_CHOICES = [
        ('youtube', 'YouTube'),
        ('instagram', 'Instagram'),
    ]

    title = models.CharField(max_length=255, default='Feature of the day')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='youtube')
    video_url = models.URLField(max_length=500)
    start_date = models.DateField()
    end_date = models.DateField()
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_floatingvideoadvertisement'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.platform})"

    @property
    def status(self):
        """
        Calculates status dynamically based on current timezone-aware date and is_enabled status:
        - DISABLED: Admin manually disabled the advertisement
        - SCHEDULED: Start date has not arrived yet
        - EXPIRED: End date has passed
        - ACTIVE: Current date is between Start Date and End Date and ad is enabled
        """
        if not self.is_enabled:
            return 'DISABLED'
        today = timezone.now().date()
        if self.start_date and self.start_date > today:
            return 'SCHEDULED'
        elif self.end_date and self.end_date < today:
            return 'EXPIRED'
        else:
            return 'ACTIVE'

