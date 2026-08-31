import os
import sys
import django
import pandas as pd
from django.utils.text import slugify

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jalgaonApi.settings')
django.setup()

from apps.clubs.models import Club, ClubCategory

# Read the excel file
file_path = r'd:\simplesphere\jalgaonWeb\club_data.xlsx'
df = pd.read_excel(file_path)

for index, row in df.iterrows():
    club_name = row.get('Club Name')
    if pd.isna(club_name):
        continue

    club_type = row.get('Club Type')
    if not pd.isna(club_type):
        category, _ = ClubCategory.objects.get_or_create(
            name=str(club_type).strip(),
            defaults={'is_active': True}
        )
    else:
        category = None

    address = row.get('Address')
    address = str(address).strip() if not pd.isna(address) else ""
    if address == 'nan': address = ""

    phone = row.get('Phone Number')
    phone = str(phone).strip() if not pd.isna(phone) else ""
    if phone == 'nan': phone = ""
    if len(phone) > 20:
        phone = phone[:20]

    website = row.get('Website')
    website = str(website).strip() if not pd.isna(website) else ""
    if website == 'nan': website = ""

    bio = row.get('bio')
    bio = str(bio).strip() if not pd.isna(bio) else ""
    if bio == 'nan': bio = ""
    
    desc = bio if bio else "No description available"
    short_desc = (desc[:297] + '...') if len(desc) > 300 else desc

    # Generate a dummy email since it's required
    email = f"info@{slugify(str(club_name))[:30] or 'club'}.com"

    try:
        club, created = Club.objects.update_or_create(
            name=str(club_name).strip(),
            defaults={
                'category': category,
                'description': desc,
                'short_description': short_desc,
                'address': address,
                'contact_phone': phone,
                'contact_email': email,
                'website': website,
                'status': 'approved',
                'is_verified': True
            }
        )
        if created:
            print(f"Created club: {club.name}")
        else:
            print(f"Updated club: {club.name}")
    except Exception as e:
        print(f"Failed to update/create club {club_name}: {e}")

print("Import completed.")
