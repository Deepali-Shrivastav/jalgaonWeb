from django.db import migrations

def enable_trgm_extension(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")

def disable_trgm_extension(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute("DROP EXTENSION IF EXISTS pg_trgm;")

def create_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoplisting_name_trgm ON app_shoplisting USING gin (business_name gin_trgm_ops);")
        schema_editor.execute("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shoplisting_desc_trgm ON app_shoplisting USING gin (business_description gin_trgm_ops);")

def drop_trgm_indexes(apps, schema_editor):
    if schema_editor.connection.vendor == 'postgresql':
        schema_editor.execute("DROP INDEX IF EXISTS idx_shoplisting_name_trgm;")
        schema_editor.execute("DROP INDEX IF EXISTS idx_shoplisting_desc_trgm;")

class Migration(migrations.Migration):
    """
    Enables pg_trgm extension and creates trigram GIN indexes on PostgreSQL.
    Bypasses execution on SQLite (local development env) to ensure local tests
    and dev servers run without database errors.
    """
    atomic = False

    dependencies = [
        ('directory', '0007_shoplisting_meta_description_and_more'),
    ]

    operations = [
        migrations.RunPython(enable_trgm_extension, disable_trgm_extension),
        migrations.RunPython(create_trgm_indexes, drop_trgm_indexes),
    ]
