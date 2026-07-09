from django.db import models
from django.conf import settings
from django.utils.text import slugify

class CategoryImg(models.Model):
    category_img = models.ImageField(upload_to='static/assets/category_img')
    img_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'app_categoryimg'

    def __str__(self):
        return self.img_name
    

class MainCategory(models.Model):
    category_img = models.ForeignKey(CategoryImg, on_delete=models.SET_NULL, null=True, blank=True)
    main_category = models.CharField(max_length=50)
    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'app_maincategory'

    def __str__(self):
        return self.main_category
    
    def save(self, *args, **kwargs):
        if not self.slug and self.main_category:
            self.slug = slugify(self.main_category)
        super().save(*args, **kwargs)

class SubCategory(models.Model):
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    sub_category = models.CharField(max_length=50)
    sub_category_img = models.ImageField(upload_to='static/assets/category_img')
    slug = models.SlugField(max_length=120, unique=True, null=True, blank=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'app_subcategory'

    def __str__(self):
        return self.sub_category
    
    def save(self, *args, **kwargs):
        if not self.slug and self.sub_category:
            self.slug = slugify(self.sub_category)
        super().save(*args, **kwargs)
    

class ShopListing(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    sub_category = models.ForeignKey(SubCategory, on_delete=models.CASCADE)

    business_name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=300, unique=True, null=True, blank=True)
    business_rating = models.IntegerField(default=0)
    business_address = models.CharField(max_length=100)
    city = models.CharField(max_length=50, default="Jalgaon")
    business_banner = models.ImageField(upload_to='static/assets/listedShops')

    sub_domain_one = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_two = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_three = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_four = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_five = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_six = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_seven = models.CharField(max_length=50, null=True, blank=True)

    business_dob = models.CharField(max_length=50, default="N/A")
    business_gst = models.CharField(max_length=50, default="N/A")

    business_description = models.CharField(max_length=1000)

    # Legacy image fields (to be migrated/deprecated in future)
    business_img_one = models.ImageField(upload_to='static/assets/listedShops', null=True, blank=True)
    business_img_two = models.ImageField(upload_to='static/assets/listedShops', null=True, blank=True)
    business_img_three = models.ImageField(upload_to='static/assets/listedShops', null=True, blank=True)

    business_no = models.CharField(max_length=15)
    whatsapp = models.CharField(max_length=20, null=True, blank=True)
    business_email = models.CharField(max_length=50)
    
    # Legacy social fields (for backward compatibility during migration)
    insta_link = models.CharField(max_length=1000, blank=True, null=True)
    facebook_link = models.CharField(max_length=1000, blank=True, null=True)
    website_link = models.CharField(max_length=1000, blank=True, null=True)
    
    social_links = models.JSONField(null=True, blank=True)
    business_hours = models.JSONField(null=True, blank=True)
    
    gmap_link = models.CharField(max_length=1000, blank=True, null=True)
    lat = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    lng = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)

    # Moderation & Workflow
    is_valid = models.BooleanField(default=False) # Legacy, use status instead
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_claimed = models.BooleanField(default=False)
    
    # Monetization & Featured
    is_trending = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    trending_until = models.DateTimeField(null=True, blank=True)
    trending_priority = models.IntegerField(default=0)
    
    # Analytics / Denormalized stats
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    review_count = models.IntegerField(default=0)
    views = models.IntegerField(default=0)

    # SEO Metadata
    meta_title = models.CharField(max_length=150, blank=True, null=True)
    meta_description = models.CharField(max_length=300, blank=True, null=True)
    meta_keywords = models.CharField(max_length=300, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        db_table = 'app_shoplisting'

    def __str__(self):
        return f"{self.user}->{self.business_name}"

    def save(self, *args, **kwargs):
        if not self.slug and self.business_name:
            import uuid
            self.slug = slugify(self.business_name) + "-" + str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)

class BusinessPhoto(models.Model):
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE, related_name='gallery_photos')
    image = models.ImageField(upload_to='static/assets/listedShops/gallery')
    caption = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_businessphoto'

    def __str__(self):
        return f"Photo for {self.shop_listing.business_name}"

class LikedShops(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_likedshops'

    def __str__(self):
        return f"{self.user}->{self.shop_listing}"

class BusinessClaim(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE, related_name='claims')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='business_claims')
    message = models.TextField()
    contact_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_businessclaim'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} claiming {self.shop_listing}"

class BusinessReport(models.Model):
    REASON_CHOICES = (
        ('fake', 'Fake/Spam Business'),
        ('inappropriate', 'Inappropriate Content'),
        ('closed', 'Business Permanently Closed'),
        ('wrong_info', 'Incorrect Information'),
        ('other', 'Other'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='business_reports')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_businessreport'
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for {self.shop_listing.business_name} - {self.get_reason_display()}"
