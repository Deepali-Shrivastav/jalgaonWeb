from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from .models import SEOImageAlt
from .utils import generate_seo_alt_text
import logging

logger = logging.getLogger(__name__)

@receiver(post_save)
def generate_alt_text_for_images(sender, instance, created, **kwargs):
    # Skip system/administrative apps to prevent errors and overhead
    skip_apps = ['admin', 'contenttypes', 'sessions', 'auth', 'media_lib']
    if getattr(sender._meta, 'app_label', '') in skip_apps:
        return
        
    try:
        # Find all ImageField or FileField on this model
        image_fields = [f.name for f in sender._meta.get_fields() if isinstance(f, (models.ImageField, models.FileField))]
        if not image_fields:
            return
            
        for field_name in image_fields:
            image_file = getattr(instance, field_name, None)
            
            # Check if there's actually a file uploaded
            if image_file and getattr(image_file, 'name', None):
                # Ensure the alt text doesn't already exist for this image path
                if not SEOImageAlt.objects.filter(image_path=image_file.name).exists():
                    alt_text = generate_seo_alt_text(instance, field_name)
                    SEOImageAlt.objects.create(
                        image_path=image_file.name,
                        alt_text=alt_text
                    )
    except Exception as e:
        logger.error(f"Error generating SEO alt text for {sender.__name__}: {e}")
