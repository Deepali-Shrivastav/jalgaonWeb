import os
import django
from django.test import Client

if __name__ == '__main__':
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

    print("\n--- Testing Legitimate URLs ---")
    legit_url = '/api/v1/'
    response = client.get(legit_url)
    print(f"URL: {legit_url} -> Status: {response.status_code}")

    missing_url = '/completely-missing-page-404'
    response = client.get(missing_url)
    print(f"URL: {missing_url} -> Status: {response.status_code}")

    print("\nScript completed.")
