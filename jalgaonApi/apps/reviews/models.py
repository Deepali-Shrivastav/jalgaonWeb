from django.db import models
from django.conf import settings
from apps.directory.models import ShopListing
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

class ShopReview(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop_listing = models.ForeignKey(ShopListing, on_delete=models.CASCADE, related_name='reviews')
    rating_star = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    user_review = models.CharField(max_length=2000)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_helpful_count = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_shopreview'

    def __str__(self):
        return f"{self.user}->{self.shop_listing}"

@receiver(post_save, sender=ShopReview)
@receiver(post_delete, sender=ShopReview)
def update_shop_rating(sender, instance, **kwargs):
    shop = instance.shop_listing
    approved_reviews = shop.reviews.filter(status='approved')
    review_count = approved_reviews.count()
    if review_count > 0:
        avg_rating = sum(r.rating_star for r in approved_reviews) / review_count
        shop.avg_rating = round(avg_rating, 2)
    else:
        shop.avg_rating = 0.00
    shop.review_count = review_count
    shop.save(update_fields=['avg_rating', 'review_count'])
