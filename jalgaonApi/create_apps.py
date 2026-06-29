import os
import subprocess

apps = [
    'accounts', 'directory', 'search', 'reviews', 'news', 'blog', 'jobs',
    'events', 'ads', 'payments', 'notifications', 'dashboard', 'admin_panel',
    'cms', 'media_lib', 'audit', 'analytics', 'startups', 'clubs', 'tourism',
    'ngo', 'finance'
]

os.makedirs('apps', exist_ok=True)
with open('apps/__init__.py', 'w') as f:
    pass

for app in apps:
    print(f"Creating app {app}")
    os.makedirs(f'apps/{app}', exist_ok=True)
    subprocess.run(['python', 'manage.py', 'startapp', app, f'apps/{app}'])
    
    # Update apps.py to include the apps. prefix
    apps_py_path = f'apps/{app}/apps.py'
    if os.path.exists(apps_py_path):
        with open(apps_py_path, 'r') as f:
            content = f.read()
        content = content.replace(f"name = '{app}'", f"name = 'apps.{app}'")
        with open(apps_py_path, 'w') as f:
            f.write(content)

print("Creating core app")
os.makedirs('core', exist_ok=True)
subprocess.run(['python', 'manage.py', 'startapp', 'core', 'core'])
