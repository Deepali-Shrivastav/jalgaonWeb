"""
Jalgaon.com Ticketing Ecosystem — Core Models
=============================================
Model hierarchy:
  Physical Venue Structure:  Venue -> VenueSection -> VenueRow -> VenueSeat
  Event / Show:              Event(existing) -> EventShow -> TicketCategory
  Show Inventory:            ShowSeat  (one row per physical seat per show)
  Customer Flow:             Booking -> BookingItem -> Payment -> Ticket -> TicketScanLog
  Admin / Marketing:         MarketingHold (M2M to ShowSeat) -> MarketingHoldAuditLog

Concurrency safety:
  ShowSeat uses select_for_update(nowait=True) in seat_service.hold_seats()
  The (show, venue_seat) unique_together constraint prevents double-booking at DB level.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


# =============================================================================
# PHYSICAL VENUE STRUCTURE
# Configured once per venue. Reused across all events and shows.
# =============================================================================

class Venue(models.Model):
    """Physical venue master record. Admin creates once. Multiple events reference it."""
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100, default='Jalgaon')
    pincode = models.CharField(max_length=10, blank=True)
    capacity = models.PositiveIntegerField(default=0)
    contact_phone = models.CharField(max_length=20, blank=True)
    featured_image = models.ImageField(upload_to='venues/images/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticketing_venue'
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['city', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.city})"


class VenueSection(models.Model):
    """Logical section inside a venue (e.g. Balcony, Prime, Classic)."""
    venue = models.ForeignKey(Venue, on_delete=models.PROTECT, related_name='sections')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    display_order = models.PositiveSmallIntegerField(default=0)
    color_code = models.CharField(max_length=7, default='#6366f1')

    class Meta:
        db_table = 'ticketing_venuesection'
        unique_together = [('venue', 'code')]
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.venue.name} - {self.name}"


class VenueRow(models.Model):
    """Horizontal row inside a section (e.g. Row A, Row B)."""
    section = models.ForeignKey(VenueSection, on_delete=models.PROTECT, related_name='rows')
    row_label = models.CharField(max_length=10)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = 'ticketing_venuerow'
        unique_together = [('section', 'row_label')]
        ordering = ['display_order', 'row_label']

    def __str__(self):
        return f"{self.section} - Row {self.row_label}"


class VenueSeat(models.Model):
    """Individual physical seat. Master definition. NOT show-specific."""
    SEAT_TYPE_CHOICES = [
        ('standard', 'Standard'),
        ('vip', 'VIP'),
        ('accessible', 'Accessible'),
    ]
    row = models.ForeignKey(VenueRow, on_delete=models.PROTECT, related_name='seats')
    seat_number = models.CharField(max_length=10)
    seat_type = models.CharField(max_length=20, choices=SEAT_TYPE_CHOICES, default='standard')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ticketing_venueseat'
        unique_together = [('row', 'seat_number')]

    def __str__(self):
        s = self.row.section
        return f"{s.code}-{self.row.row_label}{self.seat_number}"

    @property
    def label(self):
        return str(self)

    @property
    def full_location(self):
        s = self.row.section
        return f"{s.name} / Row {self.row.row_label} / Seat {self.seat_number}"


# =============================================================================
# EVENT SHOW & PRICING
# =============================================================================

class EventShow(models.Model):
    """
    Specific date/time schedule for an event at a venue.
    On creation, ShowSeat inventory is auto-generated via seat_service.generate_show_seats().
    """
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('booking_open', 'Booking Open'),
        ('sold_out', 'Sold Out'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    event = models.ForeignKey('events.Event', on_delete=models.PROTECT, related_name='shows')
    venue = models.ForeignKey(Venue, on_delete=models.PROTECT, related_name='shows')
    show_datetime = models.DateTimeField()
    gate_open_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled', db_index=True)
    is_ticketed = models.BooleanField(default=True)
    inventory_generated = models.BooleanField(
        default=False,
        help_text="True after ShowSeat records have been bulk-created for this show."
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_shows'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticketing_eventshow'
        ordering = ['show_datetime']
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['show_datetime']),
            models.Index(fields=['venue', 'show_datetime']),
        ]

    def __str__(self):
        return f"{self.event.title} - {self.show_datetime:%d %b %Y %I:%M %p}"


class TicketCategory(models.Model):
    """Price tier per section per show. One TicketCategory per (show, section) pair."""
    show = models.ForeignKey(EventShow, on_delete=models.CASCADE, related_name='categories')
    section = models.ForeignKey(VenueSection, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    max_per_booking = models.PositiveSmallIntegerField(default=8)

    class Meta:
        db_table = 'ticketing_ticketcategory'
        unique_together = [('show', 'section')]

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"

    @property
    def total_price(self):
        return self.price + self.booking_fee


# =============================================================================
# SHOW SEAT INVENTORY — THE LOCKING LAYER
# =============================================================================

class ShowSeat(models.Model):
    """
    Per-show seat inventory. One record per (show, physical seat).
    Generated in bulk when EventShow is created.

    Status semantics:
      AVAILABLE       - Open for customer booking.
      HELD            - Temporarily locked during user's 6-minute checkout window.
                        Auto-released by cleanup_expired_holds management command.
      BOOKED          - Confirmed. Payment received. Ticket generated.
      BLOCKED         - Permanently admin-blocked (maintenance, damaged, press row).
      MARKETING_HOLD  - Reserved by Admin/SuperAdmin for promotional strategy.
                        NOT counted as BOOKED in revenue/occupancy stats.
                        Public API returns 'UNAVAILABLE' for this status.
    """
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        HELD = 'HELD', 'Held (Checkout)'
        BOOKED = 'BOOKED', 'Booked'
        BLOCKED = 'BLOCKED', 'Blocked'
        MARKETING_HOLD = 'MARKETING_HOLD', 'Marketing Hold / Reserved'

    STATUS_AVAILABLE = Status.AVAILABLE
    STATUS_HELD = Status.HELD
    STATUS_BOOKED = Status.BOOKED
    STATUS_BLOCKED = Status.BLOCKED
    STATUS_MARKETING_HOLD = Status.MARKETING_HOLD

    STATUS_CHOICES = Status.choices

    PUBLIC_UNAVAILABLE_STATUSES = frozenset([
        STATUS_HELD, STATUS_BOOKED, STATUS_BLOCKED, STATUS_MARKETING_HOLD
    ])
    REVENUE_STATUSES = frozenset([STATUS_BOOKED])

    show = models.ForeignKey(EventShow, on_delete=models.CASCADE, related_name='show_seats')
    venue_seat = models.ForeignKey(VenueSeat, on_delete=models.PROTECT)
    category = models.ForeignKey(TicketCategory, on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)

    # Checkout hold (user-driven, expires after SEAT_HOLD_MINUTES)
    held_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='held_seats'
    )
    held_at = models.DateTimeField(null=True, blank=True)
    hold_expires_at = models.DateTimeField(null=True, blank=True, db_index=True)

    # Set after payment confirmed (status -> BOOKED)
    booking_item = models.ForeignKey(
        'BookingItem', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='show_seat_ref'
    )

    # Set when status -> MARKETING_HOLD
    marketing_hold = models.ForeignKey(
        'MarketingHold', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='held_show_seats'
    )

    class Meta:
        db_table = 'ticketing_showseat'
        unique_together = [('show', 'venue_seat')]   # KEY CONCURRENCY CONSTRAINT
        indexes = [
            models.Index(fields=['show', 'status']),
            models.Index(fields=['show', 'status', 'hold_expires_at']),
            models.Index(fields=['held_by', 'status']),
            models.Index(fields=['marketing_hold']),
        ]

    def __str__(self):
        return f"{self.show} | {self.venue_seat.label} | {self.status}"

    @property
    def is_available(self):
        if self.status == self.STATUS_HELD:
            return self.hold_expires_at and self.hold_expires_at <= timezone.now()
        return self.status == self.STATUS_AVAILABLE

    @property
    def public_status(self):
        """Masks MARKETING_HOLD as UNAVAILABLE in public API responses."""
        if self.status == self.STATUS_MARKETING_HOLD:
            return 'UNAVAILABLE'
        return self.status


# =============================================================================
# BOOKING
# =============================================================================

class Booking(models.Model):
    """Customer order record. PENDING -> CONFIRMED (payment) or EXPIRED/CANCELLED."""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Payment'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired (Seat Hold Timeout)'),
        ('REFUNDED', 'Refunded'),
    ]
    booking_reference = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='bookings'
    )
    show = models.ForeignKey(EventShow, on_delete=models.PROTECT, related_name='bookings')
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    booking_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticketing_booking'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking_reference']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['show', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.booking_reference} ({self.status})"


class BookingItem(models.Model):
    """Individual seat line-item within a booking."""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    show_seat = models.OneToOneField(ShowSeat, on_delete=models.PROTECT, related_name='booking_item_record')
    price_at_booking = models.DecimalField(max_digits=10, decimal_places=2)
    booking_fee_at_booking = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)

    class Meta:
        db_table = 'ticketing_bookingitem'

    def __str__(self):
        return f"{self.booking.booking_reference} - {self.show_seat.venue_seat.label}"


# =============================================================================
# PAYMENT (Razorpay)
# =============================================================================

class Payment(models.Model):
    """
    Razorpay payment record. One per booking.
    Payment is ALWAYS verified server-side via HMAC SHA256 before confirming booking.
    """
    STATUS_CHOICES = [
        ('INITIATED', 'Initiated'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    razorpay_signature = models.CharField(max_length=500, blank=True)
    amount_paisa = models.PositiveIntegerField()
    currency = models.CharField(max_length=5, default='INR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INITIATED', db_index=True)
    error_code = models.CharField(max_length=100, blank=True)
    error_description = models.TextField(blank=True)
    webhook_event = models.CharField(max_length=100, blank=True)
    raw_razorpay_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticketing_payment'
        indexes = [
            models.Index(fields=['razorpay_order_id']),
            models.Index(fields=['razorpay_payment_id']),
            models.Index(fields=['booking', 'status']),
        ]

    def __str__(self):
        return f"{self.booking.booking_reference} | {self.razorpay_order_id} | {self.status}"


# =============================================================================
# TICKET & GATE VERIFICATION
# =============================================================================

class Ticket(models.Model):
    """Generated after booking confirmed. QR payload is HMAC-SHA256 signed."""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='ticket')
    ticket_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    qr_payload = models.TextField()
    qr_code_image = models.ImageField(upload_to='tickets/qr/', null=True, blank=True)
    is_scanned = models.BooleanField(default=False, db_index=True)
    scanned_at = models.DateTimeField(null=True, blank=True)
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='scanned_tickets'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticketing_ticket'
        indexes = [
            models.Index(fields=['ticket_code']),
            models.Index(fields=['ticket_code', 'is_scanned']),
        ]

    def __str__(self):
        return f"Ticket {self.ticket_code} | {self.booking.booking_reference}"


class TicketScanLog(models.Model):
    """Append-only audit log for every gate scan attempt."""
    SCAN_RESULT_CHOICES = [
        ('SUCCESS', 'Entry Granted'),
        ('ALREADY_USED', 'Already Scanned'),
        ('INVALID', 'Invalid QR / Signature Mismatch'),
        ('CANCELLED', 'Booking Cancelled'),
        ('WRONG_EVENT', 'Wrong Event / Show'),
    ]
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='scan_logs')
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='scan_log_entries'
    )
    scan_result = models.CharField(max_length=20, choices=SCAN_RESULT_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    scanned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticketing_ticketscanlog'
        indexes = [
            models.Index(fields=['ticket', 'scanned_at']),
            models.Index(fields=['scan_result']),
        ]

    def __str__(self):
        return f"{self.scan_result} | {self.ticket.ticket_code} | {self.scanned_at:%Y-%m-%d %H:%M}"


# =============================================================================
# MARKETING HOLD — ADMIN / SUPERADMIN ONLY
# =============================================================================

class MarketingHold(models.Model):
    """
    Seats reserved by Admin/SuperAdmin for legitimate marketing purposes.
    NOT a booking. NOT counted in revenue or occupancy statistics.
    Public API masks these as UNAVAILABLE. Internal details never exposed to customers.
    """
    HOLD_TYPE_CHOICES = [
        ('PROMOTIONAL', 'Promotional / Campaign'),
        ('SPONSOR', 'Sponsor Seats'),
        ('PRESS', 'Press / Media'),
        ('VIP_RESERVATION', 'VIP / Guest Reservation'),
        ('OPERATIONAL', 'Operational / Internal'),
        ('OTHER', 'Other'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RELEASED', 'Released'),
        ('EXPIRED', 'Expired'),
    ]
    show = models.ForeignKey(EventShow, on_delete=models.CASCADE, related_name='marketing_holds')
    show_seats = models.ManyToManyField(ShowSeat, related_name='marketing_holds', blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='marketing_holds_created'
    )
    released_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='marketing_holds_released'
    )
    reason = models.CharField(max_length=500)
    hold_type = models.CharField(max_length=30, choices=HOLD_TYPE_CHOICES, default='PROMOTIONAL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE', db_index=True)
    expires_at = models.DateTimeField(
        null=True, blank=True, db_index=True,
        help_text="If set, seats auto-release at this datetime via cleanup management command."
    )
    released_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticketing_marketinghold'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['show', 'status']),
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.hold_type} | {self.show} | {self.status}"


class MarketingHoldAuditLog(models.Model):
    """
    Immutable append-only audit trail for all MarketingHold actions.
    Never modified or deleted after insertion. Admin delete_permission = False.
    """
    ACTION_CHOICES = [
        ('APPLIED', 'Hold Applied'),
        ('REASON_UPDATED', 'Reason Updated'),
        ('EXPIRY_CHANGED', 'Expiry Changed'),
        ('RELEASED', 'Released (Manual)'),
        ('EXPIRED', 'Released (Auto-Expired)'),
    ]
    marketing_hold = models.ForeignKey(MarketingHold, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='marketing_hold_audit_entries'
    )
    seat_count = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    performed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticketing_marketingholdauditlog'
        ordering = ['-performed_at']
        indexes = [
            models.Index(fields=['marketing_hold', 'performed_at']),
            models.Index(fields=['performed_by']),
        ]

    def __str__(self):
        return f"{self.action} | hold#{self.marketing_hold_id} | {self.performed_at:%Y-%m-%d %H:%M}"
