from django.db import models

class ArticleModel(models.Model):
    title = models.CharField(max_length=50) 
    short_desc = models.CharField(max_length=100)
    blog_img = models.ImageField(upload_to='static/assets/article_imgs')
    para_one = models.CharField(max_length=1000) 
    para_two = models.CharField(max_length=1000) 
    para_trhee = models.CharField(max_length=1000) 
    para_four = models.CharField(max_length=1000) 
    para_five = models.CharField(max_length=1000)

    class Meta:
        db_table = 'app_articlemodel'

    def __str__(self):
        return self.title
     

class ActiveArticle(models.Model):
    article = models.ForeignKey(ArticleModel, on_delete=models.CASCADE)

    class Meta:
        db_table = 'app_activearticle'
