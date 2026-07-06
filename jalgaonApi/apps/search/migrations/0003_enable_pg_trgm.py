from django.db import migrations
from django.contrib.postgres.operations import TrigramExtension

class Migration(migrations.Migration):
    dependencies = [
        ('search', '0002_searchsynonym'),
    ]

    operations = [
        TrigramExtension(),
    ]
