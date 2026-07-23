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

    def __str__(self):
        return self.phone_number


class CategoryImg(models.Model):
    category_img = models.ImageField(upload_to='static/assets/category_img')
    img_name = models.CharField(max_length=50, blank=True, null=True)


    def __str__(self):
        return self.img_name
    

class MainCategory(models.Model):
    category_img = models.ForeignKey(CategoryImg, on_delete=models.CASCADE)
    main_category = models.CharField(max_length=50)

    def __str__(self):
        return self.main_category
    
class SubCategory(models.Model):
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    sub_category = models.CharField(max_length=50)
    sub_category_img = models.ImageField(upload_to='static/assets/category_img')

    def __str__(self):
        return self.sub_category
    


class ShopListing(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    sub_category = models.ForeignKey(SubCategory, on_delete=models.CASCADE)

    business_name = models.CharField(max_length=50)
    business_rating = models.IntegerField(default=0)
    business_address = models.CharField(max_length=100)
    business_banner = models.ImageField(upload_to='static/assets/listedShops')

    sub_domain_one = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_two = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_three = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_four = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_five = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_six = models.CharField(max_length=50, null=True, blank=True)
    sub_domain_seven = models.CharField(max_length=50, null=True, blank=True)

    business_origin = models.CharField(max_length=50, default="India")
    business_dob = models.CharField(max_length=50, default="N/A")
    business_gst = models.CharField(max_length=50, default="N/A")

    business_description = models.CharField(max_length=1000)


    business_img_one = models.ImageField(upload_to='static/assets/listedShops')
    business_img_two = models.ImageField(upload_to='static/assets/listedShops')
    business_img_three = models.ImageField(upload_to='static/assets/listedShops')


    business_no = models.CharField(max_length=15)
    business_email = models.CharField(max_length=50)
     
    insta_link = models.CharField(max_length=1000, blank=True, null=True)
    facebook_link = models.CharField(max_length=1000, blank=True, null=True)
    website_link = models.CharField(max_length=1000, blank=True, null=True)
    gmap_link = models.CharField(max_length=1000, blank=True, null=True)
    is_valid = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.user}->{self.business_name}"






class HomeCrouselAds(models.Model):
    crousel_add_img = models.ImageField(upload_to='static/assets/AdsImages')

class BannerAds(models.Model):
    # home page ads banner
    banner_add_home_one = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_home_two = models.ImageField(upload_to='static/assets/AdsImages')

    # category page ads banner
    banner_add_category_one = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_category_two = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_category_three = models.ImageField(upload_to='static/assets/AdsImages')
    banner_add_category_four = models.ImageField(upload_to='static/assets/AdsImages')
    def __str__(self):
        return f"BannerAds {self.id}"

class FinanceData(models.Model):
    stock_title = models.CharField(max_length=50)
    stock_price = models.CharField(max_length=50)
    isUp = models.BooleanField()
    stock_change = models.CharField(max_length=50)
    stock_price_percentage = models.CharField(max_length=50)

    def __str__(self):
        return self.stock_title
    



class AdsListing(models.Model):
    BANNER_AD = 'BA'
    CAROUSEL_AD = 'CA'
    
    AD_TYPE_CHOICES = [
        (BANNER_AD, 'Banner Ads'),
        (CAROUSEL_AD, 'Carousel Ads'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    contact_email = models.CharField(max_length=255)
    ad_type = models.CharField(
        max_length=2,
        choices=AD_TYPE_CHOICES,
        default=BANNER_AD,
    )
    ad_image = models.ImageField(upload_to='static/assets/ads_images')

    def __str__(self):
        return self.name



class ArticleModel(models.Model):
    title = models.CharField(max_length=50) 
    short_desc = models.CharField(max_length=100)
    blog_img = models.ImageField(upload_to='static/assets/article_imgs')
    para_one = models.CharField(max_length=1000) 
    para_two = models.CharField(max_length=1000) 
    para_trhee = models.CharField(max_length=1000) 
    para_four = models.CharField(max_length=1000) 
    para_five = models.CharField(max_length=1000)

    def __str__(self):
        return self.title
     

class ActiveArticle(models.Model):
    article = models.ForeignKey(ArticleModel, on_delete=models.CASCADE)


class LikedShops(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user}->{self.shop_listing}"
    
class ShopReview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey('ShopListing', on_delete=models.CASCADE)
    rating_star = models.CharField(max_length=5)
    user_review = models.CharField(max_length=2000)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}->{self.shop_listing}"
    