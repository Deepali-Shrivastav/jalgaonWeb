from django.apps import AppConfig


class MediaLibConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.media_lib'

    def ready(self):
        import apps.media_lib.signals  # Connect signals

        # Monkey-patch DRF ModelSerializer to automatically inject _alt fields
        from rest_framework.serializers import ModelSerializer
        from rest_framework.fields import FileField, ImageField
        from apps.media_lib.models import SEOImageAlt
        
        original_to_representation = ModelSerializer.to_representation

        def new_to_representation(self, instance):
            ret = original_to_representation(self, instance)
            
            # Automatically inject alt texts for any image fields
            alt_texts = {}
            for field_name, field in self.fields.items():
                if isinstance(field, (ImageField, FileField)):
                    try:
                        # Extract the actual file field object from the instance
                        source = field.source or field_name
                        # Handle nested sources (e.g. 'main_category.category_img')
                        val = instance
                        for part in source.split('.'):
                            val = getattr(val, part, None)
                            if val is None:
                                break
                                
                        if val and hasattr(val, 'name') and val.name:
                            seo = SEOImageAlt.objects.filter(image_path=val.name).first()
                            alt_texts[f"{field_name}_alt"] = seo.alt_text if seo else "Image"
                        else:
                            # Also check if 'ret' already has the url but no file (happens in some representations)
                            # But val.name is the most reliable path
                            pass
                    except Exception:
                        pass
            
            if alt_texts:
                ret.update(alt_texts)
            return ret

        ModelSerializer.to_representation = new_to_representation
