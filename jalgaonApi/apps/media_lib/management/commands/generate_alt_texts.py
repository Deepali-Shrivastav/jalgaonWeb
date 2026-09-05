from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import models
from apps.media_lib.models import SEOImageAlt
from apps.media_lib.utils import generate_seo_alt_text
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Automatically generates and backfills SEO alt texts for all image and file fields across the project'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting generation of SEO Alt Texts...")
        
        skip_apps = ['admin', 'contenttypes', 'sessions', 'auth', 'media_lib', 'migrations']
        
        total_created = 0
        total_skipped = 0

        # Loop through all installed models
        for model in apps.get_models():
            if model._meta.app_label in skip_apps:
                continue
            
            # Find all image/file fields
            image_fields = [f.name for f in model._meta.get_fields() if isinstance(f, (models.ImageField, models.FileField))]
            if not image_fields:
                continue
                
            self.stdout.write(f"Processing model {model.__name__}...")
            
            # Retrieve all instances
            try:
                instances = model.objects.all()
                for instance in instances:
                    for field_name in image_fields:
                        image_file = getattr(instance, field_name, None)
                        
                        if image_file and getattr(image_file, 'name', None):
                            # Check if it already exists
                            if not SEOImageAlt.objects.filter(image_path=image_file.name).exists():
                                alt_text = generate_seo_alt_text(instance, field_name)
                                SEOImageAlt.objects.create(
                                    image_path=image_file.name,
                                    alt_text=alt_text
                                )
                                total_created += 1
                            else:
                                total_skipped += 1
            except Exception as e:
                self.stderr.write(f"Error processing {model.__name__}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Finished! Created {total_created} new ALT texts, skipped {total_skipped} existing ones."))
