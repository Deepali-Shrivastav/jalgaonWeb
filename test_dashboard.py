import os, sys, requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalgaonApi.settings')
sys.path.append('d:/Projects/jalgaonWeb/jalgaonApi')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
admin = User.objects.filter(role='super_admin').first()

from rest_framework_simplejwt.tokens import RefreshToken
token = str(RefreshToken.for_user(admin).access_token)

headers = {'Authorization': f'Bearer {token}'}

def test_endpoint(url):
    print(f"\n--- Testing {url} ---")
    r = requests.get(url, headers=headers)
    print("Status:", r.status_code)
    try:
        print("Response:", r.json())
    except:
        print("Response Text:", r.text[:200])

BASE = 'http://127.0.0.1:8000'
test_endpoint(f"{BASE}/api/v1/jobs/saved/")
test_endpoint(f"{BASE}/api/v1/jobs/my-jobs/")
test_endpoint(f"{BASE}/api/v1/jobs/my-applications/")
test_endpoint(f"{BASE}/api/v1/listings/user/my-listings/")
