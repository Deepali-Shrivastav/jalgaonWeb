from django.db import models
from django.conf import settings

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

class AdsListing(models.Model):
    BANNER_AD = 'BA'
    CAROUSEL_AD = 'CA'
    
    AD_TYPE_CHOICES = [
        (BANNER_AD, 'Banner Ads'),
        (CAROUSEL_AD, 'Carousel Ads'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    contact_email = models.CharField(max_length=255)
    ad_type = models.CharField(
        max_length=2,
        choices=AD_TYPE_CHOICES,
        default=BANNER_AD,
    )
    ad_image = models.ImageField(upload_to='static/assets/ads_images')

    class Meta:
        db_table = 'app_adslisting'

    def __str__(self):
        return self.name
