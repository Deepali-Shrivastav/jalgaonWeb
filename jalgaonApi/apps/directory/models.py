from django.db import models
from django.conf import settings

class CategoryImg(models.Model):
    category_img = models.ImageField(upload_to='static/assets/category_img')
    img_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'app_categoryimg'

    def __str__(self):
        return self.img_name
    

class MainCategory(models.Model):
    category_img = models.ForeignKey(CategoryImg, on_delete=models.CASCADE)
    main_category = models.CharField(max_length=50)

    class Meta:
        db_table = 'app_maincategory'

    def __str__(self):
        return self.main_category
    
class SubCategory(models.Model):
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    sub_category = models.CharField(max_length=50)
    sub_category_img = models.ImageField(upload_to='static/assets/category_img')

    class Meta:
        db_table = 'app_subcategory'

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


    class Meta:
        db_table = 'app_shoplisting'

    def __str__(self):
        return f"{self.user}->{self.business_name}"


class LikedShops(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_likedshops'

    def __str__(self):
        return f"{self.user}->{self.shop_listing}"
