import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalgaonApi.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('accounts', '0001_initial', CURRENT_TIMESTAMP);")
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('directory', '0001_initial', CURRENT_TIMESTAMP);")
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('search', '0001_initial', CURRENT_TIMESTAMP);")
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('reviews', '0001_initial', CURRENT_TIMESTAMP);")
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('news', '0001_initial', CURRENT_TIMESTAMP);")
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('ads', '0001_initial', CURRENT_TIMESTAMP);")
    cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('finance', '0001_initial', CURRENT_TIMESTAMP);")
print("Inserted fake migrations successfully.")
