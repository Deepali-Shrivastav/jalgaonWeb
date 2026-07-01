from celery import shared_task
from django.utils import timezone
from .models import NewsArticle

@shared_task
def publish_scheduled_articles():
    """
    Run every minute via Celery Beat.
    Publishes articles whose publish_date has passed and status is 'review'.
    """
    now = timezone.now()
    articles = NewsArticle.objects.filter(
        status='review', 
        publish_date__lte=now, 
        publish_date__isnull=False
    )
    
    count = articles.update(status='published', published_at=now)
    
    return f"Published {count} scheduled articles"
