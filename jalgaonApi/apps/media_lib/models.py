from django.db import models

class SEOImageAlt(models.Model):
    image_path = models.CharField(max_length=500, unique=True, db_index=True)
    alt_text = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_seoimagealt'
        verbose_name = 'SEO Image Alt Text'
        verbose_name_plural = 'SEO Image Alt Texts'

    def __str__(self):
        return f"{self.image_path} - {self.alt_text}"
