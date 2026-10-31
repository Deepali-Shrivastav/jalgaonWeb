from rest_framework import serializers
from django.utils import timezone
from .models import EventCategory, Event, EventBooking
from core.utils import get_absolute_media_url


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'slug', 'description', 'sort_order']
        read_only_fields = ['slug']


class EventListSerializer(serializers.ModelSerializer):
    category = EventCategorySerializer(read_only=True)
    submitted_by_name = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'slug', 'short_description', 'featured_image',
            'image_url', 'category', 'organizer_name', 'venue_name', 'venue_address',
            'start_datetime', 'end_datetime', 'registration_link',
            'price', 'is_featured', 'status', 'view_count', 'created_at',
            'submitted_by_name'
        ]

    def get_submitted_by_name(self, obj):
        if obj.submitted_by:
            full_name = obj.submitted_by.get_full_name().strip()
            return full_name if full_name else obj.submitted_by.phone_number
        return "Anonymous"

    def get_featured_image(self, obj):
        request = self.context.get('request')
        default_img = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'
        if obj.featured_image:
            return get_absolute_media_url(obj.featured_image, request, default=default_img)
        return default_img

    def get_image_url(self, obj):
        return self.get_featured_image(obj)


class EventDetailSerializer(EventListSerializer):
    schema_json_ld = serializers.SerializerMethodField()

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + [
            'description', 'venue_lat', 'venue_lng', 'maps_url',
            'organizer_contact', 'meta_title', 'meta_description',
            'schema_json_ld'
        ]

    def get_schema_json_ld(self, obj):
        request = self.context.get('request')
        image_url = None
        if obj.featured_image:
            image_url = get_absolute_media_url(obj.featured_image, request)

        data = {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": obj.title,
            "startDate": obj.start_datetime.isoformat() if obj.start_datetime else None,
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
                "@type": "Place",
                "name": obj.venue_name,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": obj.venue_address,
                    "addressLocality": "Jalgaon",
                    "addressRegion": "MH",
                    "postalCode": "425001",
                    "addressCountry": "IN"
                }
            },
            "organizer": {
                "@type": "Organization",
                "name": obj.organizer_name
            },
            "description": obj.short_description,
            "url": f"https://www.jalgaon.com/events/{obj.slug}"
        }

        if obj.end_datetime:
            data["endDate"] = obj.end_datetime.isoformat()

        if image_url:
            data["image"] = image_url

        if obj.venue_lat is not None and obj.venue_lng is not None:
            data["location"]["geo"] = {
                "@type": "GeoCoordinates",
                "latitude": float(obj.venue_lat),
                "longitude": float(obj.venue_lng)
            }

        return data


class EventCreateSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=EventCategory.objects.filter(is_active=True),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Event
        fields = [
            'title', 'description', 'short_description',
            'organizer_name', 'organizer_contact',
            'venue_name', 'venue_address', 'venue_lat', 'venue_lng', 'maps_url',
            'start_datetime', 'end_datetime', 'registration_link', 'price',
            'featured_image', 'category'
        ]

    def validate_featured_image(self, value):
        if value:
            max_size = 5 * 1024 * 1024  # 5MB per PRD constraint
            if value.size > max_size:
                raise serializers.ValidationError("Featured image size must not exceed 5MB.")
        return value

    def validate(self, data):
        start_datetime = data.get('start_datetime')
        end_datetime = data.get('end_datetime')

        if start_datetime and start_datetime < timezone.now():
            raise serializers.ValidationError({"start_datetime": "Event start time cannot be in the past."})

        if start_datetime and end_datetime and end_datetime < start_datetime:
            raise serializers.ValidationError({"end_datetime": "End time must be after start time."})

        return data


class EventAdminSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, read_only=True)
    submitted_by = serializers.PrimaryKeyRelatedField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=EventCategory.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Event
        fields = '__all__'


# ─────────────────────────────────────────────────────────────────────────────
# MOBILE APP DEDICATED SERIALIZERS (Strict JSON Contract for Flutter jalgaonApp)
# ─────────────────────────────────────────────────────────────────────────────

class MobileEventSerializer(serializers.ModelSerializer):
    """
    Serializes Event objects into the exact JSON shape required by Flutter CityEvent:
    - id: string/int
    - title: string
    - category: string
    - date: string (e.g. '2026-11-15')
    - time: string (e.g. '6:00 PM')
    - location: string
    - price: string (e.g. 'Free' or '₹199')
    - image_url: full absolute URL string
    - organizer: string
    - description: string
    - is_featured: boolean
    """
    category = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    organizer = serializers.CharField(source='organizer_name', default='Jalgaon Organizers')
    description = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'category',
            'date',
            'time',
            'location',
            'price',
            'image_url',
            'organizer',
            'description',
            'is_featured',
        ]

    def get_category(self, obj):
        return obj.category.name if obj.category else "Entertainment"

    def get_date(self, obj):
        if obj.start_datetime:
            return obj.start_datetime.strftime('%Y-%m-%d')
        return ""

    def get_time(self, obj):
        if obj.start_datetime:
            formatted = obj.start_datetime.strftime('%I:%M %p')
            return formatted.lstrip('0')
        return "6:00 PM"

    def get_location(self, obj):
        if obj.venue_address:
            return f"{obj.venue_name}, {obj.venue_address}".strip(', ')
        return obj.venue_name or "Jalgaon"

    def get_price(self, obj):
        if hasattr(obj, 'price') and obj.price:
            return str(obj.price)
        return "Free"

    def get_image_url(self, obj):
        request = self.context.get('request')
        default_img = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745'
        if obj.featured_image:
            return get_absolute_media_url(obj.featured_image, request, default=default_img)
        return default_img

    def get_description(self, obj):
        return obj.description or obj.short_description or ""


class TicketBookingCreateSerializer(serializers.Serializer):
    """
    Accepts booking payload from mobile app:
    - event_id: string/int
    - pass_category: string
    - quantity: integer
    """
    event_id = serializers.CharField(required=True)
    pass_category = serializers.CharField(required=False, default='General')
    quantity = serializers.IntegerField(required=False, default=1, min_value=1)
    customer_name = serializers.CharField(required=False, default='Mobile App Guest')
    customer_phone = serializers.CharField(required=False, default='')
    customer_email = serializers.EmailField(required=False, default='')
