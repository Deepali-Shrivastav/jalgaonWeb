import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from django.contrib.auth import get_user_model
from apps.clubs.models import ClubCategory, Club, ClubActivity, ClubMember, ClubPhoto

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds categories and sample clubs for testing the Club Activities module.'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing club data...')
        ClubPhoto.objects.all().delete()
        ClubMember.objects.all().delete()
        ClubActivity.objects.all().delete()
        Club.objects.all().delete()
        ClubCategory.objects.all().delete()

        self.stdout.write('Seeding club categories...')
        categories_data = [
            {'name': 'Sports', 'description': 'Cricket, football, kabaddi, badminton, and other athletic clubs in Jalgaon.'},
            {'name': 'Cultural & Drama', 'description': 'Theatres, dance academies, music circles, and artistic groups.'},
            {'name': 'Education & Science', 'description': 'Toastmasters, debate clubs, coding clubs, and science societies.'},
            {'name': 'Social Welfare', 'description': 'Rotary clubs, Lions club, and volunteer community service groups.'},
            {'name': 'Environmental & Nature', 'description': 'Tree plantation, trekking, wildlife conservation, and eco-clubs.'},
            {'name': 'Hobby & Recreation', 'description': 'Photography circles, chess clubs, board game meets, and reading clubs.'},
        ]

        categories = {}
        for idx, cat_data in enumerate(categories_data):
            category = ClubCategory.objects.create(
                name=cat_data['name'],
                description=cat_data['description'],
                is_active=True,
                sort_order=idx * 10
            )
            categories[cat_data['name']] = category

        # Find or create a user to submit these clubs
        user = User.objects.filter(phone_number='9021338128').first()
        if not user:
            user = User.objects.first()
        if not user:
            # Fallback if no user exists at all
            user = User.objects.create_superuser(
                phone_number='9021338128',
                first_name='Admin',
                last_name='User',
                is_active=True
            )
            user.set_password('admin123')
            user.save()

        clubs_data = [
            {
                'name': 'Jalgaon Cricket Warriors',
                'category': categories['Sports'],
                'description': 'A premier cricket club based in Jalgaon, training local talent and organizing district-level tournaments. We have state-of-the-art practice nets and professional coaches.',
                'short_description': 'Professional cricket club promoting district-level sports in Jalgaon.',
                'address': 'Chhatrapati Shivaji Maharaj Stadium, Near Collector Office, Jalgaon - 425001',
                'contact_phone': '9876543210',
                'contact_email': 'cricket@jalgaonwarriors.org',
                'website': 'https://warriorscricket.in',
                'facebook': 'https://facebook.com/jalgaoncricketwarriors',
                'instagram': 'https://instagram.com/jalgaoncricketwarriors',
                'founded_year': 2015,
                'is_featured': True,
                'is_verified': True,
                'status': 'approved'
            },
            {
                'name': 'Jalgaon Toastmasters Club',
                'category': categories['Education & Science'],
                'description': 'A community club helping members improve their public speaking, communication, and leadership skills. We meet every alternate Sunday morning to learn and grow together.',
                'short_description': 'Community club dedicated to public speaking and leadership development.',
                'address': 'KCE Society College Campus, Ring Road, Jalgaon - 425001',
                'contact_phone': '9876543211',
                'contact_email': 'toastmasters.jalgaon@gmail.com',
                'website': 'https://toastmasters.org',
                'founded_year': 2019,
                'is_featured': True,
                'is_verified': True,
                'status': 'approved'
            },
            {
                'name': 'Kala Vithika Theatre Group',
                'category': categories['Cultural & Drama'],
                'description': 'An independent theatre group in Jalgaon dedicated to staging Marathi dramas, street plays, and cultural festivals. We conduct regular acting workshops for youngsters.',
                'short_description': 'Independent street plays and classical Marathi theatre group.',
                'address': 'Mahabal Road, Opp. Nutan Maratha College, Jalgaon - 425002',
                'contact_phone': '9876543212',
                'contact_email': 'contact@kalavithika.org',
                'founded_year': 2010,
                'is_featured': False,
                'is_verified': True,
                'status': 'approved'
            },
            {
                'name': 'Rotary Club of Jalgaon Gold',
                'category': categories['Social Welfare'],
                'description': 'A leading service organization in Jalgaon carrying out social welfare projects including blood donation camps, school adoptions, and tree plantation drives.',
                'short_description': 'Service organization conducting local community welfare projects.',
                'address': 'Rotary Bhavan, Jilha Peth, Jalgaon - 425001',
                'contact_phone': '9876543213',
                'contact_email': 'rotaryjalgaongold@gmail.com',
                'founded_year': 1998,
                'is_featured': False,
                'is_verified': True,
                'status': 'approved'
            },
            {
                'name': 'Jalgaon Trekking & Nature Club',
                'category': categories['Environmental & Nature'],
                'description': 'A club for adventure lovers and nature enthusiasts. We organize weekend treks to Sahyadri ranges, local fort cleanups, and bird watching sessions around Jalgaon district.',
                'short_description': 'Local trekking club promoting eco-tourism and nature conservation.',
                'address': 'Shahu Nagar, Near G.S. Ground, Jalgaon - 425001',
                'contact_phone': '9876543214',
                'contact_email': 'trek@jalgaontrekkers.com',
                'website': 'https://jalgaontrekkers.com',
                'founded_year': 2018,
                'is_featured': False,
                'is_verified': False,
                'status': 'pending'
            }
        ]

        self.stdout.write('Seeding sample clubs...')
        seeded_clubs = []
        for c_data in clubs_data:
            club = Club.objects.create(
                name=c_data['name'],
                category=c_data['category'],
                description=c_data['description'],
                short_description=c_data['short_description'],
                address=c_data['address'],
                contact_phone=c_data['contact_phone'],
                contact_email=c_data['contact_email'],
                website=c_data.get('website', ''),
                facebook=c_data.get('facebook', ''),
                instagram=c_data.get('instagram', ''),
                founded_year=c_data['founded_year'],
                is_featured=c_data['is_featured'],
                is_verified=c_data['is_verified'],
                status=c_data['status'],
                submitted_by=user
            )
            seeded_clubs.append(club)

        self.stdout.write('Seeding club members...')
        roles = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Youth Coordinator']
        for club in seeded_clubs:
            # Seed 3-4 members per club
            names = ['Amit Patil', 'Rahul Shinde', 'Sneha Chaudhari', 'Deepak Mahajan', 'Pragati Joshi']
            random.shuffle(names)
            for i in range(random.randint(3, 4)):
                ClubMember.objects.create(
                    club=club,
                    name=names[i],
                    role=roles[i],
                    sort_order=i
                )

        self.stdout.write('Seeding club activities...')
        activities_pool = [
            {
                'title': 'Annual General Meet',
                'description': 'Our yearly meeting to discuss progress, plan budget, and welcome new members.',
                'type': 'meeting'
            },
            {
                'title': 'Weekend Skill Training Session',
                'description': 'A specialized coaching and mentoring session led by guest experts from Mumbai.',
                'type': 'workshop'
            },
            {
                'title': 'District Invitational Championship',
                'description': 'A competitive tournament open to all teams in the district. Registration required.',
                'type': 'competition'
            },
            {
                'title': 'Mega Blood Donation Drive',
                'description': 'Organized in association with the Civil Hospital. Over 150 donors expected.',
                'type': 'social_drive'
            },
            {
                'title': 'Eco-Cleanup and Trek',
                'description': 'Trek to Laling fort combined with garbage cleanup initiative. Let\'s preserve our heritage.',
                'type': 'camp'
            }
        ]

        for club in seeded_clubs:
            # Seed 3 activities per club
            random.shuffle(activities_pool)
            for i in range(3):
                act_data = activities_pool[i]
                # Random date within last 3 months or next 1 month
                random_days = random.randint(-90, 30)
                activity_date = date.today() + timedelta(days=random_days)
                
                ClubActivity.objects.create(
                    club=club,
                    title=f"{club.name} - {act_data['title']}",
                    description=act_data['description'],
                    activity_date=activity_date,
                    activity_type=act_data['type'],
                    is_featured=(i == 0)
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all Club Activities data!'))
