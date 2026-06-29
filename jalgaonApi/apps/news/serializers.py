from rest_framework import serializers
from .models import ArticleModel, ActiveArticle

class ArticleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleModel
        fields = '__all__'

class ActiveArticleSerializer(serializers.ModelSerializer):
    article = ArticleModelSerializer(read_only=True)

    class Meta:
        model = ActiveArticle
        fields = ['article']
