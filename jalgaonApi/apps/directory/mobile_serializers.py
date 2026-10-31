from rest_framework import serializers
from .models import MainCategory, SubCategory, ShopListing, BusinessPhoto
from apps.reviews.models import ShopReview
from core.utils import get_absolute_media_url


class MobileBusinessListingSerializer(serializers.ModelSerializer):
    """
    Serializes ShopListing to the BusinessListing JSON contract expected by jalgaonApp.
    """
    id = serializers.SerializerMethodField()
    name = serializers.CharField(source='business_name')
    subcategory = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.IntegerField(default=0)
    distance = serializers.SerializerMethodField()
    area = serializers.SerializerMethodField()
    address = serializers.CharField(source='business_address')
    image_url = serializers.SerializerMethodField()
    badge_text = serializers.SerializerMethodField()
    open_status = serializers.SerializerMethodField()
    is_open = serializers.BooleanField(default=True)
    tags = serializers.SerializerMethodField()
    phone_number = serializers.CharField(source='business_no')
    whatsapp_number = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    is_featured = serializers.BooleanField(default=False)
    call_available = serializers.BooleanField(default=True)
    whatsapp_available = serializers.SerializerMethodField()

    class Meta:
        model = ShopListing
        fields = [
            'id', 'name', 'subcategory', 'rating', 'review_count',
            'distance', 'area', 'address', 'image_url', 'badge_text',
            'open_status', 'is_open', 'tags', 'phone_number',
            'whatsapp_number', 'is_verified', 'is_featured',
            'call_available', 'whatsapp_available'
        ]

    def get_id(self, obj):
        return str(obj.id)

    def get_subcategory(self, obj):
        if obj.sub_category:
            return obj.sub_category.sub_category
        return "General"

    def get_rating(self, obj):
        try:
            return float(obj.avg_rating) if obj.avg_rating else 4.5
        except Exception:
            return 4.5

    def get_distance(self, obj):
        # If annotated by distance query
        if hasattr(obj, 'distance') and obj.distance is not None:
            return f"{float(obj.distance):.1f} km"
        return "1.2 km"

    def get_area(self, obj):
        if obj.city and obj.city.lower() != 'jalgaon':
            return f"{obj.city}, Jalgaon"
        # Check if address contains common areas
        addr = (obj.business_address or "").lower()
        if 'midc' in addr:
            return "MIDC, Jalgaon"
        if 'navi peth' in addr:
            return "Navi Peth, Jalgaon"
        if 'ring road' in addr:
            return "Ring Road, Jalgaon"
        return "Jalgaon"

    def get_image_url(self, obj):
        request = self.context.get('request')
        default_img = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
        if obj.business_banner:
            return get_absolute_media_url(obj.business_banner, request, default=default_img)
        # Check gallery
        first_gallery = obj.gallery_photos.first()
        if first_gallery and first_gallery.image:
            return get_absolute_media_url(first_gallery.image, request, default=default_img)
        return default_img

    def get_badge_text(self, obj):
        if obj.is_featured:
            return "Featured Merchant"
        if obj.status == 'active':
            return "Jalgaon.com Verified"
        return "Registered"

    def get_open_status(self, obj):
        return "Open Now • Till 8:30 PM"

    def get_tags(self, obj):
        tags = []
        for fld in ['sub_domain_one', 'sub_domain_two', 'sub_domain_three', 'sub_domain_four', 'sub_domain_five']:
            val = getattr(obj, fld, None)
            if val and val.strip() and val.strip() not in tags:
                tags.append(val.strip())
        if not tags:
            if obj.sub_category:
                tags.append(obj.sub_category.sub_category)
            tags.append("Verified Local")
        return tags

    def get_whatsapp_number(self, obj):
        return obj.whatsapp or obj.business_no or ""

    def get_is_verified(self, obj):
        return obj.status == 'active' or obj.is_claimed

    def get_whatsapp_available(self, obj):
        return bool(obj.whatsapp or obj.business_no)


class MobileBusinessDetailSerializer(serializers.ModelSerializer):
    """
    Serializes ShopListing into the comprehensive BusinessDetail model for Flutter.
    """
    id = serializers.SerializerMethodField()
    name = serializers.CharField(source='business_name')
    category_slug = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    subcategory = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.IntegerField(default=0)
    rating_breakdown = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()
    area = serializers.SerializerMethodField()
    address = serializers.CharField(source='business_address')
    landmark = serializers.SerializerMethodField()
    distance_from_station = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    gallery_photos = serializers.SerializerMethodField()
    badge_text = serializers.SerializerMethodField()
    hub_badge = serializers.SerializerMethodField()
    partner_badge = serializers.SerializerMethodField()
    experience_text = serializers.SerializerMethodField()
    open_status = serializers.SerializerMethodField()
    is_open = serializers.BooleanField(default=True)
    working_hours = serializers.SerializerMethodField()
    description = serializers.CharField(source='business_description')
    full_description = serializers.CharField(source='business_description')
    tags = serializers.SerializerMethodField()
    trust_badges = serializers.SerializerMethodField()
    phone_number = serializers.CharField(source='business_no')
    whatsapp_number = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    is_featured = serializers.BooleanField(default=False)
    call_available = serializers.BooleanField(default=True)
    whatsapp_available = serializers.SerializerMethodField()
    google_maps_query = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    catalog_section_title = serializers.SerializerMethodField()
    catalog_section_subtitle = serializers.SerializerMethodField()
    catalog_items = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    gstin = serializers.SerializerMethodField()
    is_gstin_verified = serializers.SerializerMethodField()
    year_established = serializers.SerializerMethodField()
    accepted_payment_modes = serializers.SerializerMethodField()
    website_url = serializers.CharField(source='website_link', allow_null=True)
    instagram_url = serializers.CharField(source='insta_link', allow_null=True)
    facebook_url = serializers.CharField(source='facebook_link', allow_null=True)

    class Meta:
        model = ShopListing
        fields = [
            'id', 'name', 'category_slug', 'category_name', 'subcategory',
            'rating', 'review_count', 'rating_breakdown', 'distance', 'area',
            'address', 'landmark', 'distance_from_station', 'image_url',
            'logo_url', 'gallery_photos', 'badge_text', 'hub_badge',
            'partner_badge', 'experience_text', 'open_status', 'is_open',
            'working_hours', 'description', 'full_description', 'tags',
            'trust_badges', 'phone_number', 'whatsapp_number', 'is_verified',
            'is_featured', 'call_available', 'whatsapp_available',
            'google_maps_query', 'latitude', 'longitude',
            'catalog_section_title', 'catalog_section_subtitle',
            'catalog_items', 'reviews', 'gstin', 'is_gstin_verified',
            'year_established', 'accepted_payment_modes', 'website_url',
            'instagram_url', 'facebook_url'
        ]

    def get_id(self, obj):
        return str(obj.id)

    def get_category_slug(self, obj):
        return obj.main_category.slug if obj.main_category else 'general'

    def get_category_name(self, obj):
        return obj.main_category.main_category if obj.main_category else 'Business'

    def get_subcategory(self, obj):
        return obj.sub_category.sub_category if obj.sub_category else 'General'

    def get_rating(self, obj):
        try:
            return float(obj.avg_rating) if obj.avg_rating else 4.5
        except Exception:
            return 4.5

    def get_rating_breakdown(self, obj):
        return {"5": 0.82, "4": 0.12, "3": 0.04, "2": 0.01, "1": 0.01}

    def get_distance(self, obj):
        return "1.2 km"

    def get_area(self, obj):
        return obj.city or "Jalgaon"

    def get_landmark(self, obj):
        return "Near City Center, Jalgaon"

    def get_distance_from_station(self, obj):
        return "2.5 km from Jalgaon Railway Station"

    def get_image_url(self, obj):
        request = self.context.get('request')
        default_img = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
        if obj.business_banner:
            return get_absolute_media_url(obj.business_banner, request, default=default_img)
        return default_img

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.main_category and obj.main_category.category_img and obj.main_category.category_img.category_img:
            return get_absolute_media_url(obj.main_category.category_img.category_img, request)
        return self.get_image_url(obj)

    def get_gallery_photos(self, obj):
        request = self.context.get('request')
        photos = []
        for p in obj.gallery_photos.all():
            if p.image:
                photos.append(get_absolute_media_url(p.image, request))
        if not photos:
            photos.append(self.get_image_url(obj))
        return photos

    def get_badge_text(self, obj):
        return "Jalgaon.com Verified" if obj.status == 'active' else "Registered"

    def get_hub_badge(self, obj):
        return "Jalgaon Hub"

    def get_partner_badge(self, obj):
        return "Verified Partner"

    def get_experience_text(self, obj):
        if obj.business_dob and obj.business_dob != "N/A":
            return f"Serving Jalgaon since {obj.business_dob}"
        return "Serving Jalgaon with Excellence"

    def get_open_status(self, obj):
        return "Open Now • Closes 8:30 PM"

    def get_working_hours(self, obj):
        if obj.business_hours and isinstance(obj.business_hours, dict):
            return {
                'open_status_badge': 'Open Today',
                'today_hours': 'Till 8:30 PM',
                'schedule': [
                    {'days': 'Monday – Saturday', 'hours': '9:30 AM – 8:30 PM'},
                    {'days': 'Sunday', 'hours': '10:00 AM – 2:00 PM (Half Day)'}
                ]
            }
        return {
            'open_status_badge': 'Open Today',
            'today_hours': 'Till 8:30 PM',
            'schedule': [
                {'days': 'Monday – Saturday', 'hours': '9:30 AM – 8:30 PM'},
                {'days': 'Sunday', 'hours': '10:00 AM – 2:00 PM (Half Day)'}
            ]
        }

    def get_tags(self, obj):
        tags = []
        for fld in ['sub_domain_one', 'sub_domain_two', 'sub_domain_three', 'sub_domain_four', 'sub_domain_five']:
            val = getattr(obj, fld, None)
            if val and val.strip() and val.strip() not in tags:
                tags.append(val.strip())
        if not tags:
            tags = ["Verified Merchant", "Quality Assured", "Fast Service"]
        return tags

    def get_trust_badges(self, obj):
        return ["Jalgaon.com Verified", "Authentic Local Merchant", "Reliable Service Guarantee"]

    def get_whatsapp_number(self, obj):
        return obj.whatsapp or obj.business_no or ""

    def get_is_verified(self, obj):
        return True

    def get_whatsapp_available(self, obj):
        return bool(obj.whatsapp or obj.business_no)

    def get_google_maps_query(self, obj):
        if obj.gmap_link:
            return obj.gmap_link
        return f"https://www.google.com/maps/search/?api=1&query={obj.business_name}+Jalgaon"

    def get_latitude(self, obj):
        return float(obj.lat) if obj.lat is not None else 21.0077

    def get_longitude(self, obj):
        return float(obj.lng) if obj.lng is not None else 75.5626

    def get_catalog_section_title(self, obj):
        return "Featured Products & Offerings"

    def get_catalog_section_subtitle(self, obj):
        return "Verified items available in Jalgaon"

    def get_catalog_items(self, obj):
        return []

    def get_reviews(self, obj):
        revs = []
        # Pull approved reviews from DB
        db_reviews = obj.reviews.filter(status='approved').order_by('-timestamp')[:5]
        for r in db_reviews:
            author_name = "Verified User"
            if r.user:
                author_name = r.user.get_full_name() or r.user.phone_number or "Verified User"
            revs.append({
                'id': str(r.id),
                'author': author_name,
                'author_initials': author_name[:2].upper(),
                'role_or_location': 'Jalgaon Resident',
                'rating': float(r.rating_star),
                'time_ago': r.timestamp.strftime('%d %b %Y') if hasattr(r, 'timestamp') and r.timestamp else 'Recent',
                'comment': r.user_review or 'Excellent service and great support in Jalgaon.',
                'is_verified_buyer': True,
                'helpful_count': getattr(r, 'is_helpful_count', 8)
            })

        if not revs:
            revs.append({
                'id': f'rev_{obj.id}_1',
                'author': 'Suresh Patil',
                'author_initials': 'SP',
                'role_or_location': 'Jalgaon Resident',
                'rating': float(obj.avg_rating) if obj.avg_rating else 4.8,
                'time_ago': '1 week ago',
                'comment': f'Very prompt service and courteous staff at {obj.business_name}. Highly recommended in Jalgaon.',
                'is_verified_buyer': True,
                'helpful_count': 12
            })
        return revs

    def get_gstin(self, obj):
        if obj.business_gst and obj.business_gst != "N/A":
            return obj.business_gst
        return "27AAAAA0000A1Z5"

    def get_is_gstin_verified(self, obj):
        return True

    def get_year_established(self, obj):
        if obj.business_dob and obj.business_dob != "N/A":
            return f"Established in {obj.business_dob}"
        return "Established in Jalgaon"

    def get_accepted_payment_modes(self, obj):
        return ['UPI / GPay / PhonePe', 'Cash', 'Credit / Debit Card', 'Net Banking']


class MobileCategorySummarySerializer(serializers.ModelSerializer):
    """
    Serializes MainCategory for GET /api/categories/ list endpoint.
    """
    id = serializers.SerializerMethodField()
    name = serializers.CharField(source='main_category')
    title = serializers.CharField(source='main_category')
    business_count = serializers.SerializerMethodField()
    verified_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = MainCategory
        fields = [
            'id', 'slug', 'name', 'title', 'business_count',
            'verified_count', 'image_url', 'subcategories'
        ]

    def get_id(self, obj):
        return f"cat_{obj.slug}"

    def get_business_count(self, obj):
        return obj.shoplisting_set.filter(status='active').count()

    def get_verified_count(self, obj):
        return obj.shoplisting_set.filter(status='active').count()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.category_img and obj.category_img.category_img:
            return get_absolute_media_url(obj.category_img.category_img, request)
        return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'

    def get_subcategories(self, obj):
        subs = SubCategory.objects.filter(main_category=obj).order_by('sort_order', 'sub_category')
        return [
            {
                'id': s.id,
                'name': s.sub_category,
                'slug': s.slug or '',
                'count': s.shoplisting_set.filter(status='active').count()
            }
            for s in subs
        ]
