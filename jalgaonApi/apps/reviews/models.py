from django.db import models
from django.conf import settings
from apps.directory.models import ShopListing

class ShopReview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE)
    rating_star = models.CharField(max_length=5)
    user_review = models.CharField(max_length=2000)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_shopreview'

    def __str__(self):
        return f"{self.user}->{self.shop_listing}"
