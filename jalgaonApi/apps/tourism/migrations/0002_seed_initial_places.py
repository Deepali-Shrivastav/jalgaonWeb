from django.db import migrations


def seed_places(apps, schema_editor):
    TouristPlace = apps.get_model('tourism', 'TouristPlace')

    places_data = [
        {
            'name': 'Ajanta Caves',
            'slug': 'ajanta-caves',
            'category': 'Heritage',
            'rating': 4.9,
            'reviews_count': 1420,
            'distance': 'Approx. 55 km from Jalgaon',
            'image_url': 'https://images.unsplash.com/photo-1600100397608-f010f4439c23',
            'timings': '9:00 AM - 5:30 PM (Closed Mondays)',
            'description': 'UNESCO World Heritage rock-cut cave monuments dating from the 2nd century BCE, featuring exquisite Buddhist paintings and sculptures.',
            'highlights': ['UNESCO Heritage', 'Ancient Rock Caves', 'Buddhist Art', 'Guided Tours'],
            'sort_order': 1,
            'is_active': True,
        },
        {
            'name': 'Mehrun Lake',
            'slug': 'mehrun-lake',
            'category': 'Nature & Scenic',
            'rating': 4.6,
            'reviews_count': 680,
            'distance': '4 km from City Center',
            'image_url': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
            'timings': 'Open 24 Hours (Best 5:30 AM - 8:00 PM)',
            'description': 'A serene natural lake located within Jalgaon city, renowned for morning joggers, picturesque sunsets, and bird watching.',
            'highlights': ['Sunset Views', 'Jogging Track', 'Boating', 'Photography'],
            'sort_order': 2,
            'is_active': True,
        },
        {
            'name': 'Patnadevi Temple & Gautala Sanctuary',
            'slug': 'patnadevi-temple-gautala-sanctuary',
            'category': 'Pilgrimage & Nature',
            'rating': 4.8,
            'reviews_count': 530,
            'distance': 'Approx. 70 km from Jalgaon',
            'image_url': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
            'timings': '6:00 AM - 7:30 PM Daily',
            'description': 'Historic Hemadpanthi temple of Goddess Chandi Mata surrounded by the verdant forests and waterfalls of Gautala Autramghat Wildlife Sanctuary.',
            'highlights': ['Historic Temple', 'Wildlife Sanctuary', 'Waterfalls', 'Scenic Valley'],
            'sort_order': 3,
            'is_active': True,
        },
        {
            'name': 'Padalsare Dam',
            'slug': 'padalsare-dam',
            'category': 'Scenic Getaway',
            'rating': 4.5,
            'reviews_count': 310,
            'distance': 'Approx. 50 km from Jalgaon',
            'image_url': 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5',
            'timings': '8:00 AM - 6:30 PM',
            'description': 'Expansive dam built across the Tapi river, offering spectacular water views, fresh monsoon greenery, and picnic spots.',
            'highlights': ['Panoramic Water View', 'Monsoon Picnic Spot', 'Photography', 'River Basin'],
            'sort_order': 4,
            'is_active': True,
        },
        {
            'name': 'Sunset Point Jalgaon',
            'slug': 'sunset-point-jalgaon',
            'category': 'Scenic Viewpoint',
            'rating': 4.7,
            'reviews_count': 420,
            'distance': '6 km from City Center',
            'image_url': 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869',
            'timings': '5:00 AM - 8:30 PM',
            'description': 'Popular elevated viewpoint near Maruti Mandir offering breathtaking panoramic golden hour views of Jalgaon city.',
            'highlights': ['Golden Hour Views', 'Evening Stroll', 'Cool Breeze', 'Youth Hangout'],
            'sort_order': 5,
            'is_active': True,
        },
        {
            'name': 'Icchapurti Ganesh Temple',
            'slug': 'icchapurti-ganesh-temple',
            'category': 'Religious',
            'rating': 4.8,
            'reviews_count': 940,
            'distance': '3 km from City Center',
            'image_url': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66',
            'timings': '6:00 AM - 9:00 PM',
            'description': 'Vibrant and spiritually revered Lord Ganesha temple celebrated for granting the wishes of devotees, featuring marble courtyard and peaceful ambiance.',
            'highlights': ['Divine Aura', 'Marble Architecture', 'Spiritual Harmony', 'Aarti Ceremonies'],
            'sort_order': 6,
            'is_active': True,
        },
        {
            'name': 'Swinging Towers (Jhulta Minar Farkande)',
            'slug': 'swinging-towers-jhulta-minar-farkande',
            'category': 'Heritage',
            'rating': 4.4,
            'reviews_count': 260,
            'distance': 'Approx. 35 km from Jalgaon',
            'image_url': 'https://images.unsplash.com/photo-1564507592333-c60657eea523',
            'timings': '9:00 AM - 6:00 PM',
            'description': 'An ancient architectural wonder where swinging one tower causes the other connected tower to vibrate in harmony.',
            'highlights': ['Acoustic Wonder', 'Mughal Architecture', 'Historic Mystery', 'Heritage Site'],
            'sort_order': 7,
            'is_active': True,
        },
        {
            'name': 'Mahatma Gandhi Udyan',
            'slug': 'mahatma-gandhi-udyan',
            'category': 'Garden & Recreation',
            'rating': 4.3,
            'reviews_count': 390,
            'distance': '2 km from City Center',
            'image_url': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae',
            'timings': '6:00 AM - 8:00 PM',
            'description': 'Central public municipal botanical garden with lush greenery, play area for children, musical fountain, and walking tracks.',
            'highlights': ['Family Friendly', 'Walking Tracks', 'Botanical Variety', 'Children Play Area'],
            'sort_order': 8,
            'is_active': True,
        }
    ]

    for item in places_data:
        TouristPlace.objects.update_or_create(
            slug=item['slug'],
            defaults=item
        )


def unseed_places(apps, schema_editor):
    TouristPlace = apps.get_model('tourism', 'TouristPlace')
    slugs = [
        'ajanta-caves',
        'mehrun-lake',
        'patnadevi-temple-gautala-sanctuary',
        'padalsare-dam',
        'sunset-point-jalgaon',
        'icchapurti-ganesh-temple',
        'swinging-towers-jhulta-minar-farkande',
        'mahatma-gandhi-udyan',
    ]
    TouristPlace.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tourism', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_places, reverse_code=unseed_places),
    ]
