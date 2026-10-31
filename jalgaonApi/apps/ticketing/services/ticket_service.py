import io
import json
import hmac
import hashlib
import uuid
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from apps.ticketing.models import Booking, Ticket, TicketScanLog


def build_qr_payload(ticket_code: str, booking_ref: str, show_id: int) -> str:
    """Generates an HMAC-SHA256 signed JSON payload string for ticket QR code."""
    secret = getattr(settings, 'TICKET_QR_SECRET', 'fallback-qr-secret-key-jalgaon')
    iat = int(timezone.now().timestamp())
    msg_raw = f"{ticket_code}|{booking_ref}|{show_id}|{iat}"
    signature = hmac.new(
        secret.encode('utf-8'),
        msg_raw.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    payload_dict = {
        "t_id": str(ticket_code),
        "ref": booking_ref,
        "sh_id": show_id,
        "iat": iat,
        "sig": signature[:32]
    }
    return json.dumps(payload_dict, separators=(',', ':'))


def verify_qr_payload(raw_payload: str) -> dict | None:
    """Parses and validates HMAC-SHA256 signature of a scanned QR payload."""
    try:
        data = json.loads(raw_payload)
        ticket_code = data.get("t_id")
        booking_ref = data.get("ref")
        show_id = data.get("sh_id")
        iat = data.get("iat")
        sig = data.get("sig")

        if not all([ticket_code, booking_ref, show_id, iat, sig]):
            return None

        secret = getattr(settings, 'TICKET_QR_SECRET', 'fallback-qr-secret-key-jalgaon')
        msg_raw = f"{ticket_code}|{booking_ref}|{show_id}|{iat}"
        expected_sig = hmac.new(
            secret.encode('utf-8'),
            msg_raw.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()[:32]

        if hmac.compare_digest(expected_sig, sig):
            return data
    except Exception:
        pass
    return None


@transaction.atomic
def generate_ticket(booking: Booking) -> Ticket:
    """
    Creates a digital Ticket record with a cryptographically signed QR code image.
    """
    ticket, created = Ticket.objects.get_or_create(
        booking=booking,
        defaults={
            'ticket_code': uuid.uuid4(),
            'is_scanned': False
        }
    )

    qr_payload = build_qr_payload(
        ticket_code=str(ticket.ticket_code),
        booking_ref=booking.booking_reference,
        show_id=booking.show_id
    )

    ticket.qr_payload = qr_payload

    # Generate QR Code image using qrcode library
    import qrcode
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    file_name = f"ticket_qr_{ticket.ticket_code}.png"
    ticket.qr_code_image.save(file_name, ContentFile(buffer.getvalue()), save=False)
    ticket.save(update_fields=['qr_payload', 'qr_code_image'])

    return ticket


@transaction.atomic
def scan_ticket(
    ticket_code: str,
    staff_user=None,
    show_id: int = None,
    ip_address: str = ""
) -> dict:
    """
    Validates a scanned ticket code at venue turnstiles/gates.
    Logs every scan attempt to TicketScanLog.
    """
    staff_obj = staff_user if (staff_user and staff_user.is_authenticated) else None

    try:
        ticket = Ticket.objects.select_for_update().select_related(
            'booking__show__event', 'booking__show__venue'
        ).get(ticket_code=ticket_code)
    except (Ticket.DoesNotExist, ValueError):
        return {
            "result": TicketScanLog.ScanResult.INVALID,
            "message": "Invalid or non-existent ticket code."
        }

    # Verify event show matching
    if show_id and ticket.booking.show_id != show_id:
        TicketScanLog.objects.create(
            ticket=ticket,
            scanned_by=staff_obj,
            scan_result=TicketScanLog.ScanResult.WRONG_EVENT,
            ip_address=ip_address or None
        )
        return {
            "result": TicketScanLog.ScanResult.WRONG_EVENT,
            "message": f"Ticket is for show ID {ticket.booking.show_id}, not show ID {show_id}."
        }

    # Verify booking status
    if ticket.booking.status == Booking.Status.CANCELLED:
        TicketScanLog.objects.create(
            ticket=ticket,
            scanned_by=staff_obj,
            scan_result=TicketScanLog.ScanResult.CANCELLED,
            ip_address=ip_address or None
        )
        return {
            "result": TicketScanLog.ScanResult.CANCELLED,
            "message": "Ticket has been cancelled."
        }

    # Check already scanned
    if ticket.is_scanned:
        TicketScanLog.objects.create(
            ticket=ticket,
            scanned_by=staff_obj,
            scan_result=TicketScanLog.ScanResult.ALREADY_USED,
            ip_address=ip_address or None
        )
        return {
            "result": TicketScanLog.ScanResult.ALREADY_USED,
            "message": f"Ticket was ALREADY scanned on {ticket.scanned_at.strftime('%d %b %Y %H:%M')}.",
            "scanned_at": ticket.scanned_at.isoformat() if ticket.scanned_at else None
        }

    # Successful Scan
    now = timezone.now()
    ticket.is_scanned = True
    ticket.scanned_at = now
    ticket.scanned_by = staff_obj
    ticket.save(update_fields=['is_scanned', 'scanned_at', 'scanned_by'])

    TicketScanLog.objects.create(
        ticket=ticket,
        scanned_by=staff_obj,
        scan_result=TicketScanLog.ScanResult.SUCCESS,
        ip_address=ip_address or None
    )

    items = ticket.booking.items.select_related('show_seat__venue_seat__row__section').all()
    seat_labels = [
        f"{item.show_seat.venue_seat.row.section.name} - Row {item.show_seat.venue_seat.row.row_label}: Seat {item.show_seat.venue_seat.seat_number}"
        for item in items if item.show_seat
    ]

    return {
        "result": TicketScanLog.ScanResult.SUCCESS,
        "message": "Entry Authorized. Ticket Validated.",
        "customer_name": ticket.booking.customer_name,
        "booking_reference": ticket.booking.booking_reference,
        "event_title": ticket.booking.show.event.title,
        "venue_name": ticket.booking.show.venue.name,
        "seats": seat_labels
    }
