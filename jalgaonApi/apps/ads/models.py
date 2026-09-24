from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import io
from PIL import Image, ImageOps
from django.core.files.base import ContentFile

def validate_banner_image_size(image):
    max_size_mb = 1.0
    if image and hasattr(image, 'size') and image.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Banner image file size cannot exceed 1 MB (current size: {round(image.size / (1024 * 1024), 2)} MB).")

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
    ad_image = models.ImageField(upload_to='static/assets/ads_images', validators=[validate_banner_image_size])
    
    title = models.CharField(max_length=255, null=True, blank=True)
    subtitle = models.TextField(null=True, blank=True)
    cta_text = models.CharField(max_length=50, default='Explore Now', null=True, blank=True)
    cta_url = models.CharField(max_length=500, null=True, blank=True)
    badge_text = models.CharField(max_length=50, null=True, blank=True)
    banner_type = models.CharField(max_length=30, default='promotional', null=True, blank=True)
    category_slug = models.CharField(max_length=100, null=True, blank=True)

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


class Banner(models.Model):
    client_name = models.CharField(max_length=255, help_text="Client or business name providing the banner")
    website_url = models.URLField(max_length=500, null=True, blank=True, help_text="Destination URL when banner is clicked")
    banner_image = models.ImageField(upload_to='banners/', validators=[validate_banner_image_size], help_text="Banner graphic asset (max 1 MB)")
    
    title = models.CharField(max_length=255, null=True, blank=True)
    subtitle = models.TextField(null=True, blank=True)
    badge_text = models.CharField(max_length=50, null=True, blank=True)
    cta_text = models.CharField(max_length=50, default='Explore Now', null=True, blank=True)
    
    start_date = models.DateField(db_index=True)
    expiry_date = models.DateField(db_index=True)
    is_enabled = models.BooleanField(default=True, db_index=True)
    
    clicks = models.PositiveIntegerField(default=0)
    impressions = models.PositiveIntegerField(default=0)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_banners')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_banner'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_enabled', 'start_date', 'expiry_date']),
        ]

    def __str__(self):
        return f"{self.client_name} - {self.title or 'Banner'}"

    @property
    def status(self):
        """
        Calculates banner status dynamically based on current date and is_enabled status:
        - INACTIVE: Admin manually disabled the banner
        - SCHEDULED: Start date has not arrived yet
        - EXPIRED: Expiry date has passed
        - ACTIVE: Current date is between start_date and expiry_date (inclusive) and banner is enabled
        """
        if not self.is_enabled:
            return 'INACTIVE'
        today = timezone.now().date()
        if self.start_date and self.start_date > today:
            return 'SCHEDULED'
        elif self.expiry_date and self.expiry_date < today:
            return 'EXPIRED'
        else:
            return 'ACTIVE'

    def save(self, *args, **kwargs):
        """
        Universal Zero-Crop Banner Processing:
        Preserves 100% of ANY uploaded banner image (square, portrait, 4:3, 16:9, panoramic)
        without cropping or cutting off ANY text, logos, headers, or phone numbers.
        Pads unfilled background space with a soft blurred version of the original artwork.
        """
        if self.banner_image and hasattr(self.banner_image, 'file'):
            try:
                img = Image.open(self.banner_image)
                fmt = img.format if img.format in ['JPEG', 'PNG', 'WEBP'] else 'JPEG'
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                target_w, target_h = 1600, 685
                w, h = img.size
                current_ratio = w / h if h > 0 else 1.0
                target_ratio = target_w / target_h
                
                if abs(current_ratio - target_ratio) < 0.05:
                    # Perfect 21:9 widescreen ratio: direct resize
                    final_img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
                else:
                    # Universal zero-crop fit for ANY aspect ratio
                    try:
                        contained_img = ImageOps.contain(img, (target_w, target_h), Image.Resampling.LANCZOS)
                    except AttributeError:
                        img_copy = img.copy()
                        img_copy.thumbnail((target_w, target_h), Image.Resampling.LANCZOS)
                        contained_img = img_copy

                    c_w, c_h = contained_img.size
                    
                    # Create matching blurred background canvas (1600x685)
                    bg_img = ImageOps.fit(img, (target_w, target_h), Image.Resampling.LANCZOS)
                    from PIL import ImageFilter
                    bg_img = bg_img.filter(ImageFilter.GaussianBlur(radius=25))
                    
                    # Paste original intact image centered vertically & horizontally
                    paste_x = (target_w - c_w) // 2
                    paste_y = (target_h - c_h) // 2
                    bg_img.paste(contained_img, (paste_x, paste_y))
                    final_img = bg_img
                
                buffer = io.BytesIO()
                final_img.save(buffer, format=fmt, quality=92)
                file_name = self.banner_image.name.split('/')[-1]
                self.banner_image.save(file_name, ContentFile(buffer.getvalue()), save=False)
            except Exception as err:
                print(f"Banner adaptive processing warning: {err}")
                
        super().save(*args, **kwargs)


