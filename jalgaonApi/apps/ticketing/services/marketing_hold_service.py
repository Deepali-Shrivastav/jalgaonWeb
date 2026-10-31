from django.db import transaction
from django.utils import timezone
from apps.ticketing.models import (
    EventShow, VenueSeat, ShowSeat, MarketingHold, MarketingHoldAuditLog
)
from apps.ticketing.services.seat_service import SeatUnavailableError


@transaction.atomic
def apply_marketing_hold(
    show_id: int,
    seat_ids: list[int] = None,
    row_ids: list[int] = None,
    section_ids: list[int] = None,
    admin_user=None,
    reason: str = "",
    hold_type: str = "PROMOTIONAL",
    expires_at=None,
    ip_address: str = ""
) -> MarketingHold:
    """
    Applies a Marketing Hold on selected individual seats, entire rows, or entire sections for a show.
    Prevents public users from booking these seats until released or expired.
    Maintains an immutable audit log.
    """
    if not reason or not reason.strip():
        raise ValueError("An internal reason/note is required when applying a Marketing Hold.")

    seat_ids = list(seat_ids or [])
    row_ids = list(row_ids or [])
    section_ids = list(section_ids or [])

    # Expand row_ids to seat_ids
    if row_ids:
        row_seat_ids = list(
            ShowSeat.objects.filter(
                show_id=show_id,
                venue_seat__row_id__in=row_ids
            ).values_list('id', flat=True)
        )
        seat_ids.extend(row_seat_ids)

    # Expand section_ids to seat_ids
    if section_ids:
        sec_seat_ids = list(
            ShowSeat.objects.filter(
                show_id=show_id,
                venue_seat__row__section_id__in=section_ids
            ).values_list('id', flat=True)
        )
        seat_ids.extend(sec_seat_ids)

    # Deduplicate seat IDs
    target_seat_ids = list(set(seat_ids))
    if not target_seat_ids:
        raise ValueError("No valid seats identified to apply Marketing Hold.")

    # Select for update
    locked_seats = list(
        ShowSeat.objects.select_for_update(nowait=False)
        .filter(show_id=show_id, id__in=target_seat_ids)
        .select_related('venue_seat__row__section')
    )

    if len(locked_seats) != len(target_seat_ids):
        raise SeatUnavailableError("One or more specified seats were not found for this show.")

    # Check that no seat is BOOKED or actively HELD
    for seat in locked_seats:
        if seat.status in [ShowSeat.Status.BOOKED, ShowSeat.Status.HELD]:
            raise SeatUnavailableError(
                f"Cannot place Marketing Hold: Seat {seat.venue_seat.seat_number} "
                f"in Row {seat.venue_seat.row.row_label} is currently {seat.status}."
            )

    # Create MarketingHold record
    m_hold = MarketingHold.objects.create(
        show_id=show_id,
        created_by=admin_user if (admin_user and admin_user.is_authenticated) else None,
        reason=reason.strip(),
        hold_type=hold_type,
        status='ACTIVE',
        expires_at=expires_at
    )
    m_hold.show_seats.set(locked_seats)

    # Update ShowSeat status
    for seat in locked_seats:
        seat.status = ShowSeat.Status.MARKETING_HOLD
        seat.marketing_hold = m_hold
        seat.save(update_fields=['status', 'marketing_hold'])

    # Create Audit Log
    MarketingHoldAuditLog.objects.create(
        marketing_hold=m_hold,
        action='APPLIED',
        performed_by=admin_user if (admin_user and admin_user.is_authenticated) else None,
        seat_count=len(locked_seats),
        notes=f"Marketing hold applied on {len(locked_seats)} seats. Reason: {reason.strip()}",
        ip_address=ip_address or None
    )

    return m_hold


@transaction.atomic
def release_marketing_hold(
    marketing_hold_id: int,
    admin_user=None,
    notes: str = "",
    ip_address: str = ""
) -> int:
    """Releases an active Marketing Hold and sets all linked seats back to AVAILABLE."""
    try:
        m_hold = MarketingHold.objects.select_for_update().get(id=marketing_hold_id)
    except MarketingHold.DoesNotExist:
        raise ValueError("Marketing Hold record not found.")

    if m_hold.status != 'ACTIVE':
        return 0

    seats = list(m_hold.show_seats.select_for_update().all())
    count = len(seats)

    for seat in seats:
        if seat.status == ShowSeat.Status.MARKETING_HOLD:
            seat.status = ShowSeat.Status.AVAILABLE
            seat.marketing_hold = None
            seat.save(update_fields=['status', 'marketing_hold'])

    now = timezone.now()
    admin_obj = admin_user if (admin_user and admin_user.is_authenticated) else None
    
    m_hold.status = 'RELEASED'
    m_hold.released_by = admin_obj
    m_hold.released_at = now
    m_hold.save(update_fields=['status', 'released_by', 'released_at'])

    # Audit Log
    MarketingHoldAuditLog.objects.create(
        marketing_hold=m_hold,
        action='RELEASED',
        performed_by=admin_obj,
        seat_count=count,
        notes=notes.strip() or f"Released {count} marketing hold seats back to AVAILABLE.",
        ip_address=ip_address or None
    )

    return count


@transaction.atomic
def release_expired_marketing_holds() -> int:
    """Releases any Marketing Holds where expires_at < now()."""
    now = timezone.now()
    expired_holds = list(
        MarketingHold.objects.select_for_update()
        .filter(status='ACTIVE', expires_at__lt=now)
    )

    total_released_seats = 0
    for m_hold in expired_holds:
        seats = list(m_hold.show_seats.select_for_update().all())
        seat_count = len(seats)

        for seat in seats:
            if seat.status == ShowSeat.Status.MARKETING_HOLD:
                seat.status = ShowSeat.Status.AVAILABLE
                seat.marketing_hold = None
                seat.save(update_fields=['status', 'marketing_hold'])

        m_hold.status = 'EXPIRED'
        m_hold.save(update_fields=['status'])

        MarketingHoldAuditLog.objects.create(
            marketing_hold=m_hold,
            action='EXPIRED',
            performed_by=None,
            seat_count=seat_count,
            notes=f"Auto-released {seat_count} seats due to expiration.",
            ip_address=None
        )

        total_released_seats += seat_count

    return total_released_seats
