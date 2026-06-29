from django.contrib import admin
from .models import ArticleModel, ActiveArticle

admin.site.register(ArticleModel)
admin.site.register(ActiveArticle)
