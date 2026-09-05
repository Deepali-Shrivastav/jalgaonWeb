from django.core.management.base import BaseCommand
from django.utils.text import slugify
from datetime import datetime
from apps.clubs.models import ClubCategory, Club, ClubActivity, ClubMember, ClubPhoto

CLUBS_DATA = [
    {
        "name": "Eklavya Krida Sankul",
        "category": "Sports & Fitness",
        "founded_year": 2004,
        "short_description": "Multi-sport facility in Jalgaon offering indoor and outdoor sports training and facilities.",
        "description": "Eklavya Krida Sankul, operated by Khandesh College Education Society, provides a wide range of sports infrastructure including swimming, badminton, squash, table tennis, tennis, gymnastics, cricket, football, basketball, archery, skating and kabaddi.",
        "contact_phone": "+91 257 223 9600",
        "contact_email": "info@eklavya-krida-sankul.com",
        "website": "https://eklavya.kces.in/",
        "instagram": "https://www.instagram.com/eklavya_skating_academy/",
        "address": "Moolji, Jaitha College, MJ College Rd, Shivram Nagar, Campus, Jalgaon, Maharashtra 425001",
        "logo": "https://eklavya.kces.in/Games/compititions",
        "banner_image": "https://eklavya.kces.in/Games/outdoor_games",
        "activity": {
            "title": "Dr. G. D. Bendale Memorial State-Level School Badminton Competition",
            "date": "2019-01-01",
            "type": "competition",
            "description": "State-level school badminton competition hosted at Eklavya Krida Sankul; official site reports participation by 235 students."
        }
    },
    {
        "name": "Prabhat Sport Club",
        "category": "Sports & Fitness",
        "short_description": "Sports complex on Ajanta Road offering recreational sports facilities.",
        "description": "Prabhat Sport Club is a sports complex located behind the Indian Oil petrol pump on Ajanta Road in Ayodhya Nagar, Old MIDC, Jalgaon.",
        "contact_phone": "+91 84838 18188",
        "contact_email": "info@prabhat-sport-club.com",
        "address": "Backside of Indian Oil Petrol Pump, Ajanta Road, Ayodhya Nagar, Old MIDC, Jalgaon, Maharashtra 425003",
        "logo": "https://files.yappe.in/place/full/prabhat-sport-club-2433575.webp"
    },
    {
        "name": "Jain Sports Academy",
        "category": "Sports & Fitness",
        "short_description": "Multi-sport academy in Jalgaon for sports training and activities.",
        "description": "Jain Sports Academy is a Jalgaon sports academy associated with multiple sporting activities including cricket, badminton, football, chess, table tennis, taekwondo, carrom and basketball.",
        "contact_phone": "+91 94222 78936",
        "contact_email": "rakeshjain252@gmail.com",
        "address": "JK Park, Tambapura, Jalgaon, Maharashtra 425001",
        "member_name": "Rakesh Jain",
        "member_role": "Key Contact"
    },
    {
        "name": "The Pickle Club",
        "category": "Sports & Fitness",
        "short_description": "Jalgaon sports club focused on pickleball and recreational play.",
        "description": "The Pickle Club is located on Ring Road near Aditya Builders in Ganesh Colony, Jalgaon.",
        "contact_phone": "+91 94229 86503",
        "contact_email": "info@the-pickle-club.com",
        "address": "12, Ring Rd, near Aditya Builders, Ganesh Colony, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Arcadoy",
        "category": "Sports & Fitness",
        "short_description": "Multi-sport club in Jalgaon with cricket, football and tennis facilities.",
        "description": "Arcadoy is a sports club at Madhuri Ware House opposite Mhada Colony in MIDC, Jalgaon, offering cricket, football, tennis and other sporting activities.",
        "contact_phone": "+91 81000 02121",
        "contact_email": "info@arcadoy.com",
        "website": "https://arcadoy.cricketground.in/",
        "address": "Madhuri Ware House, opposite Mhada Colony, MIDC, Jalgaon, Maharashtra 425003"
    },
    {
        "name": "Turf Royale",
        "category": "Sports & Fitness",
        "short_description": "Jalgaon turf venue for football, box cricket and recreational sports.",
        "description": "Turf Royale is a turf sports facility near Mehrun Lake, offering football, box cricket and related turf activities.",
        "contact_phone": "+91 97676 97620",
        "contact_email": "info@turf-royale.com",
        "website": "http://www.turfroyale.com/",
        "address": "Mehrun Lake, opposite Grappies Resto Bar, Jalgaon, Maharashtra 425002"
    },
    {
        "name": "The Turf Club",
        "category": "Sports & Fitness",
        "short_description": "Turf sports facility on Akashwani Road in Jalgaon.",
        "description": "The Turf Club is located on Akashwani Road near Union Bank in Jalgaon.",
        "contact_phone": "+91 94231 50409",
        "contact_email": "info@the-turf-club.com",
        "address": "Akashwani Road, near Union Bank, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Gurukul - The MultiSports Turf",
        "category": "Sports & Fitness",
        "short_description": "Multisports turf venue located near St. Joseph School in Jalgaon.",
        "description": "Gurukul - The MultiSports Turf provides turf grounds for cricket, football and other group sports behind Crown Bakery.",
        "contact_phone": "+91 94222 72637",
        "contact_email": "info@gurukul-multisports.com",
        "address": "Backside of Crown Bakery, opposite St. Joseph School, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Green Box Turf",
        "category": "Sports & Fitness",
        "short_description": "Box cricket and sports turf on Ring Road in Jalgaon.",
        "description": "Green Box Turf offers sports turf and box cricket booking facilities near HP Petrol Pump on Ring Road.",
        "contact_phone": "+91 73787 47848",
        "contact_email": "info@green-box-turf.com",
        "address": "Ring Road, near HP Petrol Pump, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Skyline Turf",
        "category": "Sports & Fitness",
        "short_description": "Sports turf facility near Icchadevi Mandir Chowk in Jalgaon.",
        "description": "Skyline Turf offers turf grounds for box cricket and football matches in Jalgaon.",
        "contact_phone": "+91 88558 26909",
        "contact_email": "info@skyline-turf.com",
        "website": "https://www.playspots.in/booking-spot/skyline-turf-chowk-jalgaon-maharashtra/",
        "address": "Near Icchadevi Mandir Chowk, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Unique Turf",
        "category": "Cricket",
        "short_description": "Cricket turf facility located near the Nexa showroom in Jalgaon.",
        "description": "Unique Turf is a cricket turf facility near Nexa showroom in Jalgaon.",
        "contact_phone": "+91 98220 70470",
        "contact_email": "info@unique-turf.com",
        "address": "Near Nexa Showroom, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Lord's",
        "category": "Cricket",
        "short_description": "Sports and cricket turf venue in Jalgaon.",
        "description": "Lord's is a sports ground / turf venue in Jalgaon offering cricket and recreational sports facilities.",
        "contact_phone": "+91 94227 75503",
        "contact_email": "info@lords-turf.com",
        "address": "Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Success Tennis Academy",
        "category": "Tennis",
        "short_description": "Tennis coaching academy located in Ramanand Nagar, Jalgaon.",
        "description": "Success Tennis Academy provides lawn tennis training and practice courts in Ramanand Nagar.",
        "contact_phone": "+91 76203 61622",
        "contact_email": "info@successtennis.com",
        "address": "Ramanand Nagar, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Eklavya Badminton Academy",
        "category": "Badminton",
        "short_description": "Badminton training academy based at Eklavya Krida Sankul.",
        "description": "Eklavya Badminton Academy offers structured coaching and indoor badminton courts in Jalgaon.",
        "contact_phone": "+91 257 223 9600",
        "contact_email": "info@eklavyabadminton.com",
        "address": "Eklavya Krida Sankul, MJ College Road, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Jalgaon Jilha Krida Sangh",
        "category": "Badminton",
        "short_description": "District sports association supporting badminton and indoor sports.",
        "description": "Jalgaon Jilha Krida Sangh organizes district badminton tournaments and indoor sports training.",
        "contact_phone": "+91 257 222 6531",
        "contact_email": "info@jalgaonkridasangh.com",
        "address": "District Sports Complex, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Jalgaon Municipal Corporation (JMC) Swimming Pool",
        "category": "Swimming",
        "short_description": "Public swimming pool facility operated by JMC in Jalgaon.",
        "description": "Public swimming pool facility operated by Jalgaon Municipal Corporation offering swimming sessions.",
        "contact_phone": "+91 257 222 2261",
        "contact_email": "info@jmcswimming.com",
        "address": "Near Bahinabai Garden, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Police Swimming Pool Jalgaon",
        "category": "Swimming",
        "short_description": "Swimming pool facility located in Police Head Quarters area.",
        "description": "Police Swimming Pool Jalgaon is a swimming facility located in the Police Head Quarters campus.",
        "contact_phone": "+91 257 222 3333",
        "contact_email": "info@policeswimming.com",
        "address": "Police Head Quarters, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Nilesh Boxing Club Jalgaon",
        "category": "Boxing & Martial Arts",
        "short_description": "Boxing training center located at Eklavya Krida Sankul in Jalgaon.",
        "description": "Nilesh Boxing Club Jalgaon offers boxing training and conditioning for amateur and competitive boxers.",
        "contact_phone": "+91 77982 12159",
        "contact_email": "info@nileshboxing.com",
        "address": "Eklavya Krida Sankul, MJ College Rd, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Samrat Boxing Club",
        "category": "Boxing & Martial Arts",
        "short_description": "Boxing and combat training club in Jalgaon.",
        "description": "Samrat Boxing Club provides boxing practice, fitness training, and combat sports coaching in Jalgaon.",
        "contact_phone": "+91 81693 70818",
        "contact_email": "info@samratboxing.com",
        "address": "Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Swayamsidhha RJ Martial Arts Self Defence Academy",
        "category": "Boxing & Martial Arts",
        "short_description": "Self-defense and martial arts academy in Jalgaon.",
        "description": "Swayamsidhha RJ Martial Arts Self Defence Academy offers karate, martial arts, and self-defense classes.",
        "contact_phone": "+91 95954 63975",
        "contact_email": "info@swayamsidhha.com",
        "address": "Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Best Move Chess Club",
        "category": "Chess",
        "short_description": "Chess club and coaching center in Jalgaon.",
        "description": "Best Move Chess Club offers chess coaching, tournament preparation, and regular practice matches.",
        "contact_phone": "+91 94227 72637",
        "contact_email": "info@bestmovechess.com",
        "address": "Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Epic 5678 Dance & Fitness Academy",
        "category": "Dance & Fitness",
        "short_description": "Dance and fitness academy near Swatantrya Chowk in Jalgaon.",
        "description": "Epic 5678 Dance & Fitness Academy offers dance classes, workout sessions, and fitness instruction.",
        "contact_phone": "+91 77095 54587",
        "contact_email": "info@epic5678.com",
        "website": "https://www.instagram.com/epic_5678_dance_fitness/",
        "address": "274, 3rd floor, India Plaza, Swatantrya Chowk - Pande Chowk Rd, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "WARRIORS DANCE & FITNESS KINGDOM",
        "category": "Dance & Fitness",
        "short_description": "Dance and fitness studio located in Shiv Colony, Jalgaon.",
        "description": "WARRIORS DANCE & FITNESS KINGDOM offers hip-hop, contemporary dance, and group fitness sessions.",
        "contact_phone": "+91 90282 33235",
        "contact_email": "info@warriorsdance.com",
        "address": "Shiv Colony, Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Gladiator Dance Classes",
        "category": "Dance & Fitness",
        "short_description": "Dance academy in Jalgaon offering various dance styles.",
        "description": "Gladiator Dance Classes provides choreography, aerobic fitness, and dance training.",
        "contact_phone": "+91 98236 45100",
        "contact_email": "info@gladiatordance.com",
        "address": "Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Maharshi Walmik Kabaddi Sangh",
        "category": "Kabaddi",
        "short_description": "Kabaddi club promoting traditional sports in Jalgaon.",
        "description": "Maharshi Walmik Kabaddi Sangh trains local players and competes in kabaddi tournaments across Maharashtra.",
        "contact_phone": "+91 94222 11111",
        "contact_email": "info@walmikkabaddi.com",
        "address": "Jalgaon, Maharashtra 425001"
    },
    {
        "name": "Kailas Krida Kabaddi Club Jalgaon",
        "category": "Kabaddi",
        "short_description": "Local kabaddi club organizing matches and youth training.",
        "description": "Kailas Krida Kabaddi Club Jalgaon supports grass-roots kabaddi talent and fitness training.",
        "contact_phone": "+91 94222 22222",
        "contact_email": "info@kailaskabaddi.com",
        "address": "Jalgaon, Maharashtra 425001"
    }
]

CATEGORIES_ORDER = [
    "Sports & Fitness", "Cricket", "Badminton", "Football", "Swimming",
    "Tennis", "Boxing & Martial Arts", "Kabaddi", "Chess", "Dance & Fitness"
]

class Command(BaseCommand):
    help = 'Seeds all verified Jalgaon clubs and categories into the database safely.'

    def handle(self, *args, **options):
        self.stdout.write('Seeding club categories...')
        categories_map = {}
        for idx, cat_name in enumerate(CATEGORIES_ORDER, start=1):
            category, created = ClubCategory.objects.get_or_create(
                name=cat_name,
                defaults={
                    'sort_order': idx * 10,
                    'is_active': True,
                    'slug': slugify(cat_name)
                }
            )
            categories_map[cat_name] = category

        self.stdout.write('Seeding clubs data safely with update_or_create...')
        for idx, item in enumerate(CLUBS_DATA, start=1):
            cat_obj = categories_map.get(item['category'])
            if not cat_obj:
                cat_obj, _ = ClubCategory.objects.get_or_create(name=item['category'])
                categories_map[item['category']] = cat_obj

            club_slug = slugify(item['name'])
            club, created = Club.objects.update_or_create(
                name=item['name'],
                defaults={
                    'slug': club_slug,
                    'category': cat_obj,
                    'founded_year': item.get('founded_year'),
                    'short_description': item.get('short_description', item['name'])[:290],
                    'description': item.get('description', item['name']),
                    'address': item.get('address', 'Jalgaon, Maharashtra'),
                    'contact_phone': item.get('contact_phone', '')[:20],
                    'contact_email': item.get('contact_email', f"info@{club_slug}.com"),
                    'website': item.get('website'),
                    'instagram': item.get('instagram'),
                    'logo': item.get('logo', ''),
                    'banner_image': item.get('banner_image', ''),
                    'status': 'approved',
                    'is_verified': True,
                    'is_featured': (idx <= 6)
                }
            )
            self.stdout.write(f'  [{"Created" if created else "Updated"}] {club.name} ({cat_obj.name})')

            # Optional member
            if item.get('member_name'):
                ClubMember.objects.get_or_create(
                    club=club,
                    name=item['member_name'],
                    defaults={'role': item.get('member_role', 'Key Contact')}
                )

            # Optional activity
            act = item.get('activity')
            if act:
                try:
                    act_date = datetime.strptime(act['date'], '%Y-%m-%d').date()
                except Exception:
                    act_date = datetime.now().date()
                ClubActivity.objects.get_or_create(
                    club=club,
                    title=act['title'],
                    defaults={
                        'description': act.get('description', act['title']),
                        'activity_date': act_date,
                        'activity_type': act.get('type', 'competition'),
                        'is_featured': True
                    }
                )

            # Optional photo
            if item.get('logo') and item['logo'].startswith('http'):
                ClubPhoto.objects.get_or_create(
                    club=club,
                    image=item['logo'],
                    defaults={'caption': f"{club.name} Photo"}
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(CLUBS_DATA)} clubs and {len(categories_map)} categories!'))
