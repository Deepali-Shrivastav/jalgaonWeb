from django.core.management.base import BaseCommand
from apps.search.models import SearchQuery

SEEDS = [
    "restaurant", "hotel", "hospital", "doctor", "school",
    "grocery", "pharmacy", "gym", "salon", "lawyer",
    "ca firm", "wedding hall", "catering", "electronics", "jewellery",
]

class Command(BaseCommand):
    help = "Seed popular searches if table is empty"

    def handle(self, *args, **options):
        if SearchQuery.objects.exists():
            self.stdout.write("Search queries already exist. Skipping seed.")
            return
        
        for i, term in enumerate(SEEDS):
            SearchQuery.objects.create(query=term, count=100 - i)
            
        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {len(SEEDS)} popular search queries."))
