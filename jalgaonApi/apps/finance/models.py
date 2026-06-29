from django.db import models

class FinanceData(models.Model):
    stock_title = models.CharField(max_length=50)
    stock_price = models.CharField(max_length=50)
    isUp = models.BooleanField()
    stock_change = models.CharField(max_length=50)
    stock_price_percentage = models.CharField(max_length=50)

    class Meta:
        db_table = 'app_financedata'

    def __str__(self):
        return self.stock_title
