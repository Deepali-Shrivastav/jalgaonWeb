import secrets
import string
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from apps.ticketing.models import (
    EventShow, VenueSeat, TicketCategory, ShowSeat, Booking, BookingItem
)


class SeatUnavailableError(Exception):
    """Raised when one or more requested seats are not available for hold."""
    pass


class HoldExpiredError(Exception):
    """Raised when attempting an operation on an expired hold."""
    pass


def generate_booking_reference() -> str:
    """Generates a unique 8-character uppercase booking reference ID (e.g. JLG-8F42K9)."""
    chars = string.ascii_uppercase + string.digits
    rand_str = ''.join(secrets.choice(chars) for _ in range(6))
    return f"JLG-{rand_str}"


def generate_show_seats(show_id: int) -> int:
    """
    Bulk-creates ShowSeat inventory records for an EventShow based on physical VenueSeats.
    Called when an EventShow is created or published.
    """
    show = EventShow.objects.select_related('venue').get(id=show_id)
    venue = show.venue

    # Fetch existing show seats to prevent duplicates
    existing_seat_ids = set(
        ShowSeat.objects.filter(show=show).values_list('venue_seat_id', flat=True)
    )

    categories = {cat.section_id: cat for cat in show.categories.all()}
    
    venue_seats = VenueSeat.objects.filter(
        row__section__venue=venue,
        is_active=True
    ).select_related('row__section')

    show_seats_to_create = []
    for vs in venue_seats:
        if vs.id in existing_seat_ids:
            continue
        
        section_id = vs.row.section_id
        category = categories.get(section_id)
        if not category:
            continue

        show_seats_to_create.append(
            ShowSeat(
                show=show,
                venue_seat=vs,
                category=category,
                price=category.price,
                status=ShowSeat.Status.AVAILABLE
            )
        )

    if show_seats_to_create:
        ShowSeat.objects.bulk_create(show_seats_to_create)

    return len(show_seats_to_create)


@transaction.atomic
def hold_seats(
    show_id: int,
    seat_ids: list[int],
    user=None,
    customer_name: str = "",
    customer_email: str = "",
    customer_phone: str = "",
    send_whatsapp: bool = True
) -> Booking:
    """
    Atomically holds up to 8 seats for 6 minutes (SEAT_HOLD_MINUTES).
    Raises SeatUnavailableError if any seat is already HELD, BOOKED, BLOCKED, or MARKETING_HOLD.
    Creates a Booking in PENDING status.
    """
    if not seat_ids:
        raise ValueError("At least one seat must be selected.")
    if len(seat_ids) > 8:
        raise ValueError("Maximum 8 seats allowed per booking.")

    # 1. First cleanup any stale holds for this show
    release_expired_holds()

    # 2. Select seats for update to lock rows at DB level
    locked_seats = list(
        ShowSeat.objects.select_for_update(nowait=False)
        .filter(show_id=show_id, id__in=seat_ids)
        .select_related('category', 'venue_seat__row__section')
    )

    if len(locked_seats) != len(seat_ids):
        raise SeatUnavailableError("One or more selected seats were not found.")

    # 3. Check availability
    for s in locked_seats:
        if s.status != ShowSeat.Status.AVAILABLE:
            raise SeatUnavailableError(
                f"Seat {s.venue_seat.seat_number} in Row {s.venue_seat.row.row_label} "
                f"is no longer available (Status: {s.status})."
            )

    # 4. Calculate 6-minute expiration (SEAT_HOLD_MINUTES = 6)
    hold_minutes = getattr(settings, 'SEAT_HOLD_MINUTES', 6)
    now = timezone.now()
    expires_at = now + timedelta(minutes=hold_minutes)

    # 5. Calculate pricing
    subtotal = sum(s.price for s in locked_seats)
    total_booking_fee = sum(s.category.booking_fee for s in locked_seats)
    # GST calculation: 18% on convenience fee
    gst_amount = (total_booking_fee * Decimal('0.18')).quantize(Decimal('0.01')) if hasattr(Decimal, 'quantize') else round(float(total_booking_fee) * 0.18, 2)
    
    from decimal import Decimal
    subtotal_dec = Decimal(str(subtotal))
    fee_dec = Decimal(str(total_booking_fee))
    gst_dec = (fee_dec * Decimal('0.18')).quantize(Decimal('0.01'))
    total_amount_dec = subtotal_dec + fee_dec + gst_dec

    # 6. Generate reference & create Booking
    booking_ref = generate_booking_reference()
    while Booking.objects.filter(booking_reference=booking_ref).exists():
        booking_ref = generate_booking_reference()

    user_obj = user if (user and user.is_authenticated) else None

    booking = Booking.objects.create(
        booking_reference=booking_ref,
        user=user_obj,
        show_id=show_id,
        customer_name=customer_name or (user.get_full_name() if user_obj else "Guest"),
        customer_email=customer_email or (user.email if user_obj else ""),
        customer_phone=customer_phone or (getattr(user, 'phone_number', '') if user_obj else ""),
        subtotal=subtotal_dec,
        booking_fee=fee_dec,
        gst_amount=gst_dec,
        discount_amount=Decimal('0.00'),
        total_amount=total_amount_dec,
        status=Booking.Status.PENDING,
        created_at=now
    )

    # 7. Create items & update seats to HELD
    for s in locked_seats:
        b_item = BookingItem.objects.create(
            booking=booking,
            show_seat=s,
            price_at_booking=s.price
        )
        s.status = ShowSeat.Status.HELD
        s.held_by = user_obj
        s.held_at = now
        s.hold_expires_at = expires_at
        s.booking_item = b_item
        s.save(update_fields=['status', 'held_by', 'held_at', 'hold_expires_at', 'booking_item'])

    return booking


@transaction.atomic
def release_hold(booking_id: int) -> int:
    """Releases all HELD seats for a booking back to AVAILABLE."""
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return 0

    items = booking.items.select_related('show_seat').all()
    count = 0
    for item in items:
        seat = item.show_seat
        if seat and seat.status == ShowSeat.Status.HELD:
            seat.status = ShowSeat.Status.AVAILABLE
            seat.held_by = None
            seat.held_at = None
            seat.hold_expires_at = None
            seat.booking_item = None
            seat.save(update_fields=['status', 'held_by', 'held_at', 'hold_expires_at', 'booking_item'])
            count += 1

    if booking.status == Booking.Status.PENDING:
        booking.status = Booking.Status.EXPIRED
        booking.save(update_fields=['status'])

    return count


@transaction.atomic
def release_expired_holds() -> int:
    """
    Batch releases all expired seat holds where hold_expires_at < now().
    Invoked periodically by cron/management command or dynamically on API calls.
    """
    now = timezone.now()
    expired_seats = list(
        ShowSeat.objects.select_for_update(nowait=False)
        .filter(status=ShowSeat.Status.HELD, hold_expires_at__lt=now)
        .select_related('booking_item__booking')
    )

    if not expired_seats:
        return 0

    affected_booking_ids = set()
    for seat in expired_seats:
        if seat.booking_item and seat.booking_item.booking_id:
            affected_booking_ids.add(seat.booking_item.booking_id)

        seat.status = ShowSeat.Status.AVAILABLE
        seat.held_by = None
        seat.held_at = None
        seat.hold_expires_at = None
        seat.booking_item = None
        seat.save(update_fields=['status', 'held_by', 'held_at', 'hold_expires_at', 'booking_item'])

    if affected_booking_ids:
        Booking.objects.filter(
            id__in=affected_booking_ids,
            status=Booking.Status.PENDING
        ).update(status=Booking.Status.EXPIRED)

    return len(expired_seats)
