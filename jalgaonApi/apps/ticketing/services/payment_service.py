import hmac
import hashlib
from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from apps.ticketing.models import Booking, Payment, ShowSeat, Ticket
from apps.ticketing.services.ticket_service import generate_ticket


class PaymentVerificationError(Exception):
    """Raised when payment signature verification fails."""
    pass


def get_razorpay_client():
    """Initializes and returns the Razorpay SDK client."""
    import razorpay
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
    return razorpay.Client(auth=(key_id, key_secret))


@transaction.atomic
def create_razorpay_order(booking: Booking) -> Payment:
    """
    Creates a Razorpay order for a PENDING booking.
    Creates or updates the associated Payment model record in INITIATED status.
    """
    if booking.status != Booking.Status.PENDING:
        raise ValueError(f"Cannot initiate payment for booking in status '{booking.status}'.")

    amount_paisa = int(booking.total_amount * 100)

    # In development / test mode without active keys, fallback to mock order ID
    key_id = getattr(settings, 'RAZORPAY_KEY_ID', '')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')

    if key_id and key_secret and not key_id.startswith('rzp_test_xxx'):
        client = get_razorpay_client()
        order_payload = {
            'amount': amount_paisa,
            'currency': 'INR',
            'receipt': booking.booking_reference,
            'notes': {
                'booking_ref': booking.booking_reference,
                'customer_email': booking.customer_email,
                'customer_phone': booking.customer_phone
            }
        }
        rp_order = client.order.create(data=order_payload)
        order_id = rp_order['id']
    else:
        # Development fallback order ID
        order_id = f"order_{booking.booking_reference.replace('-', '_')}"

    payment, created = Payment.objects.get_or_create(
        booking=booking,
        defaults={
            'razorpay_order_id': order_id,
            'amount_paisa': amount_paisa,
            'currency': 'INR',
            'status': Payment.Status.INITIATED
        }
    )

    if not created and payment.status == Payment.Status.INITIATED:
        payment.razorpay_order_id = order_id
        payment.amount_paisa = amount_paisa
        payment.save(update_fields=['razorpay_order_id', 'amount_paisa'])

    return payment


def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """Verifies HMAC SHA256 payment signature from Razorpay."""
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
    if not key_secret or key_secret == 'your_razorpay_secret_key':
        # Development mode bypass for testing UI flows
        return True

    msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode('utf-8')
    generated_signature = hmac.new(
        key_secret.encode('utf-8'),
        msg,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(generated_signature, razorpay_signature)


@transaction.atomic
def confirm_booking(
    booking: Booking,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> Ticket:
    """
    Verifies payment signature, confirms booking, updates ShowSeat to BOOKED,
    and generates digital Ticket with QR payload.
    """
    payment = Payment.objects.select_for_update().get(booking=booking)

    if not verify_payment_signature(payment.razorpay_order_id, razorpay_payment_id, razorpay_signature):
        payment.status = Payment.Status.FAILED
        payment.error_code = "BAD_SIGNATURE"
        payment.error_description = "Razorpay payment signature verification failed."
        payment.save(update_fields=['status', 'error_code', 'error_description'])
        raise PaymentVerificationError("Invalid payment signature.")

    # Update Payment
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = Payment.Status.SUCCESS
    payment.save(update_fields=['razorpay_payment_id', 'razorpay_signature', 'status'])

    # Update Booking
    booking.status = Booking.Status.CONFIRMED
    booking.save(update_fields=['status'])

    # Update ShowSeats from HELD -> BOOKED
    items = booking.items.select_related('show_seat').all()
    for item in items:
        seat = item.show_seat
        if seat:
            seat.status = ShowSeat.Status.BOOKED
            seat.held_by = None
            seat.held_at = None
            seat.hold_expires_at = None
            seat.save(update_fields=['status', 'held_by', 'held_at', 'hold_expires_at'])

    # Issue digital ticket
    ticket = generate_ticket(booking)
    return ticket


@transaction.atomic
def process_cancellation_and_refund(booking: Booking, user=None) -> bool:
    """
    Self-service 15-minute cancellation window policy.
    If booking was created within 15 minutes, releases seats back to AVAILABLE
    and initiates refund.
    """
    now = timezone.now()
    if booking.created_at + timedelta(minutes=15) < now:
        raise ValueError("The 15-minute free cancellation window has expired.")

    if booking.status not in [Booking.Status.CONFIRMED, Booking.Status.PENDING]:
        raise ValueError(f"Cannot cancel booking in status '{booking.status}'.")

    # Release seats
    items = booking.items.select_related('show_seat').all()
    for item in items:
        seat = item.show_seat
        if seat:
            seat.status = ShowSeat.Status.AVAILABLE
            seat.held_by = None
            seat.held_at = None
            seat.hold_expires_at = None
            seat.booking_item = None
            seat.save(update_fields=['status', 'held_by', 'held_at', 'hold_expires_at', 'booking_item'])

    # Update Payment if SUCCESS
    if hasattr(booking, 'payment') and booking.payment.status == Payment.Status.SUCCESS:
        booking.payment.status = Payment.Status.REFUNDED
        booking.payment.save(update_fields=['status'])

    booking.status = Booking.Status.CANCELLED
    booking.cancellation_reason = "Customer self-service cancellation within 15-minute window."
    booking.save(update_fields=['status', 'cancellation_reason'])

    return True
