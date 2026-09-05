import os
import django
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalgaonApi.settings')
django.setup()

client = Client()

spam_urls = [
    '/virtuals/test',
    '/jackpots/test',
    '/betplays/test',
    '/casinoet/test',
    '/slotwins/test',
    '/onlinets/test'
]

print("--- Testing Spam URLs ---")
for url in spam_urls:
    response = client.get(url)
    print(f"URL: {url} -> Status: {response.status_code}")
    assert response.status_code == 410, f"Expected 410, got {response.status_code} for {url}"

print("\n--- Testing Legitimate URLs ---")
legit_url = '/api/v1/' # Just an arbitrary route that might exist, or a 404
response = client.get(legit_url)
print(f"URL: {legit_url} -> Status: {response.status_code}")
assert response.status_code != 410, f"Expected non-410, got {response.status_code} for {legit_url}"

missing_url = '/completely-missing-page-404'
response = client.get(missing_url)
print(f"URL: {missing_url} -> Status: {response.status_code}")
assert response.status_code == 404, f"Expected 404, got {response.status_code} for {missing_url}"

print("\nAll tests passed successfully!")
