import os
import django
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalgaonApi.settings')
django.setup()

from apps.jobs.models import JobCategory

categories = ['IT & Software', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education']
for i, name in enumerate(categories):
    slug = slugify(name)
    JobCategory.objects.get_or_create(name=name, defaults={'slug': slug, 'is_active': True, 'sort_order': i})
print("Categories seeded successfully.")
