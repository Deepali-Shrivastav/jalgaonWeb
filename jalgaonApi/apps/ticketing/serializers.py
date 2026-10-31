from rest_framework import serializers
from apps.ticketing.models import (
    Venue, VenueSection, VenueRow, VenueSeat,
    EventShow, TicketCategory, ShowSeat,
    Booking, BookingItem, Payment, Ticket, TicketScanLog,
    MarketingHold, MarketingHoldAuditLog
)


class VenueSeatSerializer(serializers.ModelSerializer):
    row_label = serializers.CharField(source='row.row_label', read_only=True)
    section_name = serializers.CharField(source='row.section.name', read_only=True)
    section_code = serializers.CharField(source='row.section.code', read_only=True)

    class Meta:
        model = VenueSeat
        fields = ['id', 'seat_number', 'seat_type', 'is_active', 'row_label', 'section_name', 'section_code']


class VenueRowSerializer(serializers.ModelSerializer):
    seats = VenueSeatSerializer(many=True, read_only=True)

    class Meta:
        model = VenueRow
        fields = ['id', 'row_label', 'display_order', 'seats']


class VenueSectionSerializer(serializers.ModelSerializer):
    rows = VenueRowSerializer(many=True, read_only=True)

    class Meta:
        model = VenueSection
        fields = ['id', 'name', 'code', 'display_order', 'color_code', 'entry_gate', 'rows']


class VenueSerializer(serializers.ModelSerializer):
    sections = VenueSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Venue
        fields = ['id', 'name', 'slug', 'address', 'city', 'pincode', 'capacity', 'contact_phone', 'featured_image', 'sections']


class TicketCategorySerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_code = serializers.CharField(source='section.code', read_only=True)

    class Meta:
        model = TicketCategory
        fields = ['id', 'name', 'price', 'booking_fee', 'max_per_booking', 'section_id', 'section_name', 'section_code']


class EventShowSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_slug = serializers.CharField(source='event.slug', read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    categories = TicketCategorySerializer(many=True, read_only=True)

    class Meta:
        model = EventShow
        fields = [
            'id', 'event_title', 'event_slug', 'venue_name', 'venue_id',
            'show_datetime', 'gate_open_at', 'status', 'is_ticketed', 'categories'
        ]


class ShowSeatSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='venue_seat.seat_number', read_only=True)
    row_label = serializers.CharField(source='venue_seat.row.row_label', read_only=True)
    section_name = serializers.CharField(source='venue_seat.row.section.name', read_only=True)
    section_id = serializers.IntegerField(source='venue_seat.row.section_id', read_only=True)

    class Meta:
        model = ShowSeat
        fields = [
            'id', 'venue_seat_id', 'seat_number', 'row_label', 'section_name', 'section_id',
            'category_id', 'price', 'status', 'hold_expires_at'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        # Mask MARKETING_HOLD from public API clients as UNAVAILABLE
        if ret['status'] == ShowSeat.Status.MARKETING_HOLD:
            if not request or not request.user or not request.user.is_staff:
                ret['status'] = 'UNAVAILABLE'
        return ret


class SeatHoldRequestSerializer(serializers.Serializer):
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=8,
        help_text="List of ShowSeat IDs to hold (max 8)."
    )
    customer_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    customer_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    send_whatsapp = serializers.BooleanField(default=True)


class BookingItemSerializer(serializers.ModelSerializer):
    seat_number = serializers.CharField(source='show_seat.venue_seat.seat_number', read_only=True)
    row_label = serializers.CharField(source='show_seat.venue_seat.row.row_label', read_only=True)
    section_name = serializers.CharField(source='show_seat.venue_seat.row.section.name', read_only=True)

    class Meta:
        model = BookingItem
        fields = ['id', 'price_at_booking', 'seat_number', 'row_label', 'section_name']


class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    event_title = serializers.CharField(source='show.event.title', read_only=True)
    venue_name = serializers.CharField(source='show.venue.name', read_only=True)
    show_datetime = serializers.DateTimeField(source='show.show_datetime', read_only=True)
    expires_at = serializers.SerializerMethodField()
    ticket_code = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'customer_name', 'customer_email', 'customer_phone',
            'subtotal', 'booking_fee', 'gst_amount', 'discount_amount', 'total_amount',
            'status', 'created_at', 'event_title', 'venue_name', 'show_datetime',
            'items', 'expires_at', 'ticket_code'
        ]

    def get_expires_at(self, obj):
        first_item = obj.items.select_related('show_seat').first()
        if first_item and first_item.show_seat and first_item.show_seat.hold_expires_at:
            return first_item.show_seat.hold_expires_at.isoformat()
        return None

    def get_ticket_code(self, obj):
        if hasattr(obj, 'ticket') and obj.ticket:
            return str(obj.ticket.ticket_code)
        return None


class PaymentVerifySerializer(serializers.Serializer):
    razorpay_payment_id = serializers.CharField(max_length=100)
    razorpay_order_id = serializers.CharField(max_length=100)
    razorpay_signature = serializers.CharField(max_length=500)


class TicketSerializer(serializers.ModelSerializer):
    booking_reference = serializers.CharField(source='booking.booking_reference', read_only=True)
    customer_name = serializers.CharField(source='booking.customer_name', read_only=True)
    event_title = serializers.CharField(source='booking.show.event.title', read_only=True)
    venue_name = serializers.CharField(source='booking.show.venue.name', read_only=True)
    show_datetime = serializers.DateTimeField(source='booking.show.show_datetime', read_only=True)
    doors_open_at = serializers.DateTimeField(source='booking.show.gate_open_at', read_only=True)
    total_amount = serializers.DecimalField(source='booking.total_amount', max_digits=10, decimal_places=2, read_only=True)
    seats = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_code', 'booking_reference', 'customer_name', 'event_title',
            'venue_name', 'show_datetime', 'doors_open_at', 'total_amount', 'qr_payload',
            'qr_code_image', 'is_scanned', 'scanned_at', 'seats', 'created_at'
        ]

    def get_seats(self, obj):
        items = obj.booking.items.select_related('show_seat__venue_seat__row__section').all()
        return [
            {
                'seat_number': item.show_seat.venue_seat.seat_number,
                'row_label': item.show_seat.venue_seat.row.row_label,
                'section_name': item.show_seat.venue_seat.row.section.name,
                'entry_gate': item.show_seat.venue_seat.row.section.entry_gate
            }
            for item in items if item.show_seat
        ]


class StaffScanRequestSerializer(serializers.Serializer):
    ticket_code = serializers.CharField(max_length=100)
    show_id = serializers.IntegerField(required=False, allow_null=True)


class MarketingHoldCreateSerializer(serializers.Serializer):
    seat_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    row_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    section_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
    reason = serializers.CharField(max_length=500, min_length=3)
    hold_type = serializers.ChoiceField(
        choices=MarketingHold.HOLD_TYPE_CHOICES,
        default='PROMOTIONAL'
    )
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, data):
        if not data.get('seat_ids') and not data.get('row_ids') and not data.get('section_ids'):
            raise serializers.ValidationError("At least one of seat_ids, row_ids, or section_ids must be provided.")
        return data


class MarketingHoldSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    released_by_name = serializers.CharField(source='released_by.get_full_name', read_only=True)
    seat_count = serializers.IntegerField(source='show_seats.count', read_only=True)

    class Meta:
        model = MarketingHold
        fields = [
            'id', 'show_id', 'reason', 'hold_type', 'status', 'expires_at',
            'created_by_name', 'released_by_name', 'seat_count', 'released_at', 'created_at'
        ]


class MarketingHoldAuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = MarketingHoldAuditLog
        fields = ['id', 'action', 'performed_by_name', 'seat_count', 'notes', 'ip_address', 'performed_at']


class CouponValidateSerializer(serializers.Serializer):
    coupon_code = serializers.CharField(max_length=50)
    booking_reference = serializers.CharField(max_length=50)
