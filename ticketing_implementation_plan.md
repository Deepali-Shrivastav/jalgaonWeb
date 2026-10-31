# Jalgaon.com Ticketing Ecosystem — Complete Implementation Plan

> **Status**: APPROVED — READY FOR CODING  
> **Base Project**: `d:\simplesphere\jalgaonWeb\`  
> **Stack**: Django 5.0 + DRF 3.15 + Next.js 16 + PostgreSQL + Razorpay  
> **Architecture Decision**: New `apps.ticketing` Django app (clean domain separation)  
> **Seat Hold Duration**: **6 minutes** (confirmed by user)  
> **Marketing Hold Feature**: ✅ Included (MARKETING_HOLD seat status, dedicated model, admin-only API)

---

## CONFIRMED FINDINGS FROM CODEBASE AUDIT

| Item | Finding |
|------|---------|
| Auth | `apps.accounts.User` with phone_number login, SimpleJWT, RBAC roles |
| Events | Basic `Event` model with flat `venue_name` string — needs `Venue` FK relation |
| Payments | `apps.payments` is an **empty shell** — safe to implement or use `apps.ticketing` |
| Existing deps | `pillow==10.4.0`, `PyJWT==2.8.0`, `requests==2.32.3` — already installed |
| Missing deps | `razorpay`, `qrcode[pil]` — need to add |
| Frontend | Next.js 16 App Router, Tailwind CSS v4, `react-hot-toast`, `lucide-react` |
| Missing FE deps | `html5-qrcode` for staff scanner |
| Admin Sidebar | Collapsible, RBAC-aware, expandable section groups — **must follow exact same pattern** |
| API prefix | All APIs under `/api/v1/` pattern |
| URL registration | `jalgaonApi/urls.py` — just add one line |

---

## PHASE 1 — BACKEND FOUNDATION
### Dependency & Setup

#### Step 1.1 — Install Python Dependencies

**File**: `jalgaonApi/requirements.txt`

Add these 2 lines:
```
razorpay==1.4.1
qrcode[pil]==7.4.2
```

Run:
```bash
pip install razorpay==1.4.1 "qrcode[pil]==7.4.2"
```

---

#### Step 1.2 — Add Environment Variables

**File**: `jalgaonApi/.env` (and `.env.example`)

Add:
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Ticketing
SEAT_HOLD_MINUTES=6
TICKET_QR_SECRET=your_qr_hmac_secret_key_here
```

---

#### Step 1.3 — Django Settings Update

**File**: `jalgaonApi/jalgaonApi/settings.py`

**Changes** (non-destructive, add only):
1. Add `'apps.ticketing'` to `INSTALLED_APPS` (after `apps.payments`)
2. Add ticketing config block:
```python
# ─────────────────────────────────────────────────────────────────────────────
# TICKETING CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')
RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', '')
SEAT_HOLD_MINUTES = int(os.getenv('SEAT_HOLD_MINUTES', 6))
TICKET_QR_SECRET = os.getenv('TICKET_QR_SECRET', 'change-this-in-production')
```

---

#### Step 1.4 — User Role Extension

**File**: `jalgaonApi/apps/accounts/models.py`

**Change**: Add 2 new roles to `ROLE_CHOICES` list (non-breaking):
```python
('gate_staff', 'Gate Staff'),
('event_manager', 'Event Manager'),
```

Also update `is_staff_role` property to include `'event_manager'`.

---

#### Step 1.5 — Register URL

**File**: `jalgaonApi/jalgaonApi/urls.py`

**Add one line** (after `apps.events.urls`):
```python
path('api/v1/tickets/', include('apps.ticketing.urls')),
```

---

## PHASE 2 — BACKEND MODELS (`apps/ticketing/`)

Create the full app directory: `jalgaonApi/apps/ticketing/`

### Files to Create

---

#### `apps/ticketing/__init__.py`
Empty file.

---

#### `apps/ticketing/apps.py`
```python
from django.apps import AppConfig

class TicketingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ticketing'
    verbose_name = 'Ticketing'
```

---

#### `apps/ticketing/models.py` — THE CORE FILE

Create the following model classes in order:

**Model 1: `Venue`**
```
Fields:
  id               BigAutoField (PK)
  name             CharField(200)
  slug             SlugField(250, unique=True)
  address          TextField()
  city             CharField(100, default='Jalgaon')
  pincode          CharField(10, blank=True)
  capacity         PositiveIntegerField(default=0)
  contact_phone    CharField(20, blank=True)
  featured_image   ImageField(upload_to='venues/', null=True, blank=True)
  is_active        BooleanField(default=True)
  created_at       DateTimeField(auto_now_add=True)
  updated_at       DateTimeField(auto_now=True)

Meta:
  db_table = 'ticketing_venue'
  indexes: slug, is_active
```

**Model 2: `VenueSection`** (Sections within a Venue)
```
Fields:
  id               BigAutoField (PK)
  venue            FK(Venue, related_name='sections', on_delete=PROTECT)
  name             CharField(100)          # e.g. "Balcony"
  code             CharField(20)           # e.g. "BALC"
  display_order    PositiveSmallIntegerField(default=0)
  color_code       CharField(7, default='#6366f1')  # Hex for UI display

Meta:
  db_table = 'ticketing_venuesection'
  unique_together: (venue, code)
  ordering: ['display_order']
```

**Model 3: `VenueRow`** (Rows inside a section)
```
Fields:
  id               BigAutoField (PK)
  section          FK(VenueSection, related_name='rows', on_delete=PROTECT)
  row_label        CharField(10)           # e.g. "A", "B", "AA"
  display_order    PositiveSmallIntegerField(default=0)

Meta:
  db_table = 'ticketing_venuerow'
  unique_together: (section, row_label)
  ordering: ['display_order']
```

**Model 4: `VenueSeat`** (Individual physical seats)
```
Fields:
  id               BigAutoField (PK)
  row              FK(VenueRow, related_name='seats', on_delete=PROTECT)
  seat_number      CharField(10)           # e.g. "1", "12", "12A"
  seat_type        CharField choices: standard / vip / accessible (default=standard)
  is_active        BooleanField(default=True)

Meta:
  db_table = 'ticketing_venueseat'
  unique_together: (row, seat_number)
```

**Model 5: `EventShow`** (Ticketed show schedules — extends existing Event)
```
Fields:
  id               BigAutoField (PK)
  event            FK(apps.events.Event, related_name='shows', on_delete=PROTECT)
  venue            FK(Venue, on_delete=PROTECT)
  show_datetime    DateTimeField()
  gate_open_at     DateTimeField(null=True, blank=True)
  status           CharField choices:
                     scheduled / booking_open / sold_out / completed / cancelled
                   default='scheduled'
  is_ticketed      BooleanField(default=True)
  created_by       FK(settings.AUTH_USER_MODEL, null=True, on_delete=SET_NULL)
  created_at       DateTimeField(auto_now_add=True)
  updated_at       DateTimeField(auto_now=True)

Meta:
  db_table = 'ticketing_eventshow'
  indexes: (event, status), show_datetime
```

**Model 6: `TicketCategory`** (Price tier per section per show)
```
Fields:
  id               BigAutoField (PK)
  show             FK(EventShow, related_name='categories', on_delete=CASCADE)
  section          FK(VenueSection, on_delete=PROTECT)
  name             CharField(100)          # e.g. "Gold Balcony"
  price            DecimalField(10, 2)     # INR
  booking_fee      DecimalField(8, 2, default=0.00)  # convenience fee
  max_per_booking  PositiveSmallIntegerField(default=8)

Meta:
  db_table = 'ticketing_ticketcategory'
  unique_together: (show, section)
```

**Model 7: `ShowSeat`** (Per-show seat inventory — the LOCKING model)
```
Fields:
  id               BigAutoField (PK)
  show             FK(EventShow, related_name='show_seats', on_delete=CASCADE)
  venue_seat       FK(VenueSeat, on_delete=PROTECT)
  category         FK(TicketCategory, on_delete=PROTECT)
  price            DecimalField(10, 2)     # Snapshot of price at time of inventory creation
  status           CharField choices:
                     AVAILABLE / HELD / BOOKED / BLOCKED / MARKETING_HOLD
                   default='AVAILABLE'
  held_by          FK(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=SET_NULL)
  held_at          DateTimeField(null=True, blank=True)
  hold_expires_at  DateTimeField(null=True, blank=True, db_index=True)
  booking_item     OneToOneField('BookingItem', null=True, blank=True, on_delete=SET_NULL)
  marketing_hold   OneToOneField('MarketingHold', null=True, blank=True, on_delete=SET_NULL)

Meta:
  db_table = 'ticketing_showseat'
  unique_together: (show, venue_seat)        ← THE KEY CONSTRAINT
  indexes: (show, status), (show, status, hold_expires_at), (held_by, status)

NOTE on status semantics:
  AVAILABLE       = Seat open for customer booking
  HELD            = Temporarily locked during a user's 6-min checkout window
  BOOKED          = Confirmed, paid, ticket generated
  BLOCKED         = Permanently admin-blocked (maintenance, damaged seat, etc.)
  MARKETING_HOLD  = Intentionally reserved by Admin/SuperAdmin for promotional
                    strategy. Counts as UNAVAILABLE to public but NOT as BOOKED
                    in revenue/occupancy statistics.
```

**Model 8: `Booking`**
```
Fields:
  id                   BigAutoField (PK)
  booking_reference    CharField(20, unique=True)  # e.g. JAL-8F3B14
  user                 FK(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=SET_NULL)
  show                 FK(EventShow, on_delete=PROTECT)
  customer_name        CharField(200)
  customer_email       EmailField()
  customer_phone       CharField(20)
  subtotal             DecimalField(10, 2)
  booking_fee          DecimalField(8, 2, default=0.00)
  discount_amount      DecimalField(8, 2, default=0.00)
  total_amount         DecimalField(10, 2)
  status               CharField choices:
                         PENDING / CONFIRMED / CANCELLED / EXPIRED / REFUNDED
                       default='PENDING'
  cancellation_reason  TextField(blank=True)
  created_at           DateTimeField(auto_now_add=True)
  updated_at           DateTimeField(auto_now=True)

Meta:
  db_table = 'ticketing_booking'
  indexes: booking_reference, (user, status), (show, status), created_at
```

**Model 9: `BookingItem`**
```
Fields:
  id               BigAutoField (PK)
  booking          FK(Booking, related_name='items', on_delete=CASCADE)
  show_seat        OneToOneField(ShowSeat, on_delete=PROTECT)
  price_at_booking DecimalField(10, 2)     # Snapshot of seat price

Meta:
  db_table = 'ticketing_bookingitem'
```

**Model 10: `Payment`**
```
Fields:
  id                      BigAutoField (PK)
  booking                 OneToOneField(Booking, related_name='payment', on_delete=CASCADE)
  razorpay_order_id       CharField(100, unique=True)
  razorpay_payment_id     CharField(100, blank=True, unique=True, null=True)
  razorpay_signature      CharField(500, blank=True)
  amount_paisa            PositiveIntegerField()      # Amount in paise (INR × 100)
  currency                CharField(5, default='INR')
  status                  CharField choices:
                            INITIATED / SUCCESS / FAILED / REFUNDED
                          default='INITIATED'
  error_code              CharField(100, blank=True)
  error_description       TextField(blank=True)
  webhook_event           CharField(100, blank=True)
  raw_razorpay_response   JSONField(null=True, blank=True)
  created_at              DateTimeField(auto_now_add=True)
  updated_at              DateTimeField(auto_now=True)

Meta:
  db_table = 'ticketing_payment'
  indexes: razorpay_order_id, razorpay_payment_id, (booking, status)
```

**Model 11: `Ticket`**
```
Fields:
  id               BigAutoField (PK)
  booking          OneToOneField(Booking, related_name='ticket', on_delete=CASCADE)
  ticket_code      UUIDField(default=uuid.uuid4, unique=True, editable=False)
  qr_payload       TextField()             # Signed HMAC payload stored for verification
  qr_code_image    ImageField(upload_to='tickets/qr/', null=True, blank=True)
  is_scanned       BooleanField(default=False, db_index=True)
  scanned_at       DateTimeField(null=True, blank=True)
  scanned_by       FK(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=SET_NULL)
  created_at       DateTimeField(auto_now_add=True)

Meta:
  db_table = 'ticketing_ticket'
  indexes: ticket_code, (ticket_code, is_scanned)
```

**Model 12: `TicketScanLog`**
```
Fields:
  id               BigAutoField (PK)
  ticket           FK(Ticket, related_name='scan_logs', on_delete=CASCADE)
  scanned_by       FK(settings.AUTH_USER_MODEL, on_delete=SET_NULL, null=True)
  scan_result      CharField choices:
                     SUCCESS / ALREADY_USED / INVALID / CANCELLED / WRONG_EVENT
  ip_address       GenericIPAddressField(null=True, blank=True)
  scanned_at       DateTimeField(auto_now_add=True)

Meta:
  db_table = 'ticketing_ticketscanlog'
  indexes: (ticket, scanned_at)
```

**Model 13: `MarketingHold`** (New — dedicated Marketing Hold record)
```
Purpose:
  Tracks every Marketing Hold applied by Admin/SuperAdmin.
  Provides audit trail, reason logging, optional expiry, and creator identity.
  Separate from ShowSeat to keep booking models clean and statistics accurate.

Fields:
  id               BigAutoField (PK)
  show             FK(EventShow, on_delete=CASCADE)    # Which show
  show_seats       ManyToManyField(ShowSeat, related_name='marketing_holds')
                                                       # Supports single/bulk/row/section
  created_by       FK(settings.AUTH_USER_MODEL, on_delete=SET_NULL, null=True,
                      related_name='marketing_holds_created')
  released_by      FK(settings.AUTH_USER_MODEL, on_delete=SET_NULL, null=True, blank=True,
                      related_name='marketing_holds_released')
  reason           CharField(500)                      # Internal admin reason/note
  hold_type        CharField choices:
                     PROMOTIONAL / SPONSOR / PRESS / VIP_RESERVATION / OPERATIONAL / OTHER
                   default='PROMOTIONAL'
  status           CharField choices:
                     ACTIVE / RELEASED / EXPIRED
                   default='ACTIVE'
  expires_at       DateTimeField(null=True, blank=True)  # Optional auto-expiry
  released_at      DateTimeField(null=True, blank=True)
  created_at       DateTimeField(auto_now_add=True)
  updated_at       DateTimeField(auto_now=True)

Meta:
  db_table = 'ticketing_marketinghold'
  indexes: (show, status), (created_by, status), expires_at
```

**Model 14: `MarketingHoldAuditLog`** (Immutable audit trail)
```
Purpose:
  Append-only log. One record per MarketingHold action (apply / modify / release / expire).
  Never updated or deleted. Provides complete admin accountability.

Fields:
  id               BigAutoField (PK)
  marketing_hold   FK(MarketingHold, related_name='audit_logs', on_delete=CASCADE)
  action           CharField choices:
                     APPLIED / REASON_UPDATED / EXPIRY_CHANGED / RELEASED / EXPIRED
  performed_by     FK(settings.AUTH_USER_MODEL, on_delete=SET_NULL, null=True)
  seat_count       PositiveIntegerField()             # How many seats were affected
  notes            TextField(blank=True)              # Optional extra note at time of action
  ip_address       GenericIPAddressField(null=True, blank=True)
  performed_at     DateTimeField(auto_now_add=True)

Meta:
  db_table = 'ticketing_marketingholdauditlog'
  indexes: (marketing_hold, performed_at), performed_by
  managed = True
  # No delete permission even for superadmin — append-only integrity
```

---

#### `apps/ticketing/migrations/` 
Run `python manage.py makemigrations ticketing` after models are complete.

---

## PHASE 3 — BACKEND SERVICES

#### `apps/ticketing/services/__init__.py`
Empty.

#### `apps/ticketing/services/seat_service.py`
Core seat logic. Functions:

```
generate_show_seats(show_id: int) -> int
    """
    Bulk-creates ShowSeat records from VenueSeat records of the show's venue.
    Called when an EventShow is created.
    Returns: count of seats created.
    """

hold_seats(show_id: int, seat_ids: list[int], user) -> Booking
    """
    Atomically holds seats using select_for_update(nowait=True).
    Creates Booking in PENDING status.
    Raises: SeatUnavailableError if any seat is taken.
    """

release_hold(booking_id: int) -> None
    """
    Releases all HELD ShowSeats back to AVAILABLE for a PENDING/EXPIRED booking.
    """

release_expired_holds() -> int
    """
    Batch-releases all holds where hold_expires_at < now().
    Returns: count of released seats.
    Called by management command every minute.
    """
```

#### `apps/ticketing/services/marketing_hold_service.py` (NEW)
```
apply_marketing_hold(
    show_id: int,
    seat_ids: list[int],
    admin_user,
    reason: str,
    hold_type: str,
    expires_at: datetime | None,
    ip: str
) -> MarketingHold
    """
    Validates seat_ids belong to show_id.
    Checks none are BOOKED or already HELD (active checkout hold).
    Atomically sets ShowSeat.status = MARKETING_HOLD for all seats.
    Creates MarketingHold record with M2M seat links.
    Creates MarketingHoldAuditLog(action=APPLIED).
    Raises: SeatUnavailableError if any seat is BOOKED or HELD.
    """

release_marketing_hold(
    marketing_hold_id: int,
    admin_user,
    notes: str,
    ip: str
) -> int
    """
    Sets all linked ShowSeat.status = AVAILABLE.
    Sets MarketingHold.status = RELEASED, released_by, released_at.
    Creates MarketingHoldAuditLog(action=RELEASED).
    Returns: count of seats released.
    """

release_expired_marketing_holds() -> int
    """
    Finds all MarketingHold where status=ACTIVE and expires_at < now().
    For each: sets linked ShowSeat.status = AVAILABLE.
    Sets MarketingHold.status = EXPIRED.
    Creates MarketingHoldAuditLog(action=EXPIRED).
    Returns: count of holds expired.
    Called by cleanup management command (runs every minute alongside seat hold cleanup).
    """

get_marketing_hold_summary(show_id: int) -> dict
    """
    Returns aggregated stats for admin dashboard:
    {
      total_marketing_hold_seats: int,
      active_holds: int,
      by_type: {PROMOTIONAL: N, SPONSOR: N, PRESS: N, ...}
    }
    """
```

#### `apps/ticketing/services/payment_service.py`
Razorpay integration. Functions:

```
create_razorpay_order(booking: Booking) -> Payment
    """
    Calls razorpay.orders.create(). Creates Payment record in INITIATED state.
    Returns Payment object with razorpay_order_id.
    """

verify_payment_signature(order_id, payment_id, signature) -> bool
    """
    Computes HMAC SHA256 of order_id + | + payment_id using RAZORPAY_KEY_SECRET.
    Uses hmac.compare_digest() for constant-time comparison.
    """

confirm_booking(booking: Booking, payment_id, signature) -> Ticket
    """
    Verifies signature, updates Payment to SUCCESS, Booking to CONFIRMED,
    ShowSeats to BOOKED, then triggers ticket generation.
    All inside a single atomic transaction.
    """

process_webhook(payload: dict, signature: str) -> None
    """
    Verifies webhook HMAC using RAZORPAY_WEBHOOK_SECRET.
    Handles: payment.captured, payment.failed, refund.processed events.
    Idempotent — safe to call multiple times for same payment.
    """
```

#### `apps/ticketing/services/ticket_service.py`
QR & Ticket generation. Functions:

```
generate_ticket(booking: Booking) -> Ticket
    """
    Creates Ticket record, signs QR payload with HMAC-SHA256,
    generates QR image using qrcode library, saves to media/tickets/qr/.
    """

build_qr_payload(ticket_code: str, booking_ref: str, show_id: int) -> str
    """
    Creates JSON string: {t_id, ref, sh_id, iat, sig}
    sig = HMAC-SHA256(TICKET_QR_SECRET, t_id + ref + str(show_id))
    """

verify_qr_payload(raw_payload: str) -> dict | None
    """
    Parses and validates HMAC signature. Returns payload dict or None on failure.
    """

scan_ticket(ticket_code: str, staff_user, show_id: int, ip: str) -> dict
    """
    Validates ticket and marks as scanned. Returns {status, message, booking_info}.
    Creates TicketScanLog entry for every attempt.
    """
```

---

## PHASE 4 — BACKEND SERIALIZERS

#### `apps/ticketing/serializers.py`

```
VenueSeatSerializer          (id, seat_number, seat_type, row label)
VenueRowSerializer           (id, row_label, seats: [VenueSeatSerializer])
VenueSectionSerializer       (id, name, code, color_code, rows: [VenueRowSerializer])
VenueSerializer              (id, name, slug, address, sections: [VenueSectionSerializer])
VenueListSerializer          (id, name, slug, city, capacity - lightweight for listing)

EventShowSerializer          (id, event_title, venue_name, show_datetime, status)
TicketCategorySerializer     (id, section_name, name, price, booking_fee)

ShowSeatSerializer           (id, venue_seat info, category, price, status)
  → status field is READ ONLY — never trust client status input

SeatHoldRequestSerializer    (seat_ids: list[int], customer_name, customer_email, customer_phone)
  → validates max 8 seats per request

BookingSerializer            (id, booking_reference, show, items, total_amount, status)
BookingItemSerializer        (id, show_seat, price_at_booking, seat label)

PaymentInitSerializer        (razorpay_order_id, amount_paisa, razorpay_key_id, booking_reference)
PaymentVerifySerializer      (razorpay_payment_id, razorpay_order_id, razorpay_signature)

TicketSerializer             (id, ticket_code, booking_reference, event_title, venue_name,
                               show_datetime, section_name, row_label, seat_number,
                               customer_name, qr_code_url, is_scanned)

StaffScanRequestSerializer   (qr_payload: str)
StaffScanResultSerializer    (scan_result, message, booking_info)

AdminVenueCreateSerializer   (name, address, city, pincode, capacity, contact_phone)
AdminSectionCreateSerializer (name, code, display_order, color_code)
AdminRowCreateSerializer     (row_label, display_order)
AdminSeatBulkCreateSerializer(seats: [{seat_number, seat_type}] — supports bulk)
AdminShowCreateSerializer    (event_id, venue_id, show_datetime, gate_open_at)
AdminTicketCategorySerializer(section_id, name, price, booking_fee, max_per_booking)

# Marketing Hold Serializers
MarketingHoldCreateSerializer(
  seat_ids: list[int],          # Direct seat selection
  row_ids: list[int],           # Select entire row(s)
  section_ids: list[int],       # Select entire section(s)
  reason: str,                  # Required, max 500 chars
  hold_type: str,               # PROMOTIONAL/SPONSOR/PRESS/VIP_RESERVATION/OPERATIONAL/OTHER
  expires_at: ISO8601 | null    # Optional auto-release datetime
)
  → validate: at least one of seat_ids/row_ids/section_ids must be non-empty
  → validate: reason is non-empty
  → expand row_ids and section_ids to full seat_ids before passing to service

MarketingHoldSerializer(
  id, show_id, seat_count, reason, hold_type, status,
  expires_at, created_by_name, created_at,
  released_by_name, released_at
)

MarketingHoldDetailSerializer(
  ...MarketingHoldSerializer fields...
  + affected_seats: [{id, section_name, row_label, seat_number}]
  + audit_logs: [MarketingHoldAuditLogSerializer]
)

MarketingHoldAuditLogSerializer(
  id, action, performed_by_name, seat_count, notes, ip_address, performed_at
)

MarketingHoldReleaseSerializer(
  notes: str (optional)
)
```

---

## PHASE 5 — BACKEND VIEWS

#### `apps/ticketing/views.py` (or split into `views/` package)

**View Classes:**

```python
# ── PUBLIC VIEWS ──────────────────────────────────────────────────────────────

class VenueListView(ListAPIView)
    permission_classes = [AllowAny]
    GET /api/v1/tickets/venues/

class EventShowListView(ListAPIView)
    permission_classes = [AllowAny]
    GET /api/v1/tickets/events/<event_slug>/shows/
    → returns list of EventShow for given event slug (status=booking_open only for users)

class ShowSeatMapView(RetrieveAPIView)
    permission_classes = [AllowAny]
    GET /api/v1/tickets/shows/<show_id>/seats/
    → returns grouped seat map: {sections: [{section, rows: [{row, seats: [{id, status, price}]}]}]}
    → IMPORTANT: expired HELD seats are auto-released before returning
    → MARKETING_HOLD seats appear as status='UNAVAILABLE' to public clients
      (the internal MARKETING_HOLD label is NEVER sent to public API responses)
    → Admin-authenticated requests receive the full status including MARKETING_HOLD

# ── AUTHENTICATED USER VIEWS ──────────────────────────────────────────────────

class HoldSeatsView(CreateAPIView)
    permission_classes = [IsAuthenticated]
    POST /api/v1/tickets/shows/<show_id>/hold/
    → Atomic seat lock → Creates Booking in PENDING
    → Returns booking_id, expires_at, total_amount

class InitiatePaymentView(CreateAPIView)
    permission_classes = [IsAuthenticated, IsBookingOwner]
    POST /api/v1/tickets/bookings/<booking_id>/initiate-payment/
    → Validates booking PENDING + seats still HELD
    → Creates Razorpay order → Returns Payment initiation data

class VerifyPaymentView(UpdateAPIView)
    permission_classes = [IsAuthenticated, IsBookingOwner]
    POST /api/v1/tickets/bookings/<booking_id>/verify-payment/
    → Verifies HMAC signature server-side
    → Confirms booking → Generates ticket

class MyBookingsView(ListAPIView)
    permission_classes = [IsAuthenticated]
    GET /api/v1/tickets/my-bookings/

class MyTicketsView(ListAPIView)
    permission_classes = [IsAuthenticated]
    GET /api/v1/tickets/my-tickets/

class TicketDownloadView(RetrieveAPIView)
    permission_classes = [IsAuthenticated, IsTicketOwner]
    GET /api/v1/tickets/<ticket_code>/

# ── WEBHOOK (NO AUTH — signature verified manually) ───────────────────────────

class RazorpayWebhookView(APIView)
    permission_classes = [AllowAny]
    POST /api/v1/tickets/webhooks/razorpay/
    → Verify X-Razorpay-Signature header → process_webhook()

# ── STAFF VIEWS ───────────────────────────────────────────────────────────────

class TicketScanView(CreateAPIView)
    permission_classes = [IsGateStaff]
    POST /api/v1/tickets/staff/scan/
    → Parses QR payload → calls scan_ticket() → returns result

class StaffShowInfoView(RetrieveAPIView)
    permission_classes = [IsGateStaff]
    GET /api/v1/tickets/staff/show/<show_id>/
    → Returns show details + scan count stats (no payment info)

# ── ADMIN VIEWS ───────────────────────────────────────────────────────────────

class AdminVenueViewSet(ModelViewSet)
    permission_classes = [IsAdminRole]
    /api/v1/tickets/admin/venues/ → CRUD

class AdminVenueSectionViewSet(ModelViewSet)
    permission_classes = [IsAdminRole]
    /api/v1/tickets/admin/venues/<venue_id>/sections/ → CRUD

class AdminVenueRowViewSet(ModelViewSet)
    permission_classes = [IsAdminRole]
    /api/v1/tickets/admin/sections/<section_id>/rows/ → CRUD

class AdminVenueSeatBulkCreateView(CreateAPIView)
    permission_classes = [IsAdminRole]
    POST /api/v1/tickets/admin/rows/<row_id>/seats/bulk/
    → Accepts list of seats → bulk_create()

class AdminEventShowViewSet(ModelViewSet)
    permission_classes = [IsAdminRole | IsEventManager]
    /api/v1/tickets/admin/shows/ → CRUD
    → On create: auto-calls generate_show_seats(show_id)

class AdminTicketCategoryViewSet(ModelViewSet)
    permission_classes = [IsAdminRole | IsEventManager]
    /api/v1/tickets/admin/shows/<show_id>/categories/ → CRUD

class AdminBlockSeatsView(UpdateAPIView)
    permission_classes = [IsAdminRole]
    POST /api/v1/tickets/admin/shows/<show_id>/block-seats/
    → Accepts list of show_seat_ids → sets status=BLOCKED

class AdminBookingListView(ListAPIView)
    permission_classes = [IsAdminRole]
    GET /api/v1/tickets/admin/bookings/

class AdminRevenueReportView(APIView)
    permission_classes = [IsSuperAdmin]
    GET /api/v1/tickets/admin/reports/revenue/

# ── MARKETING HOLD VIEWS (ADMIN/SUPERADMIN ONLY) ─────────────────────────────

class AdminMarketingHoldCreateView(CreateAPIView)
    permission_classes = [IsAdminRole]
    POST /api/v1/tickets/admin/shows/<show_id>/marketing-hold/
    Request body:
      seat_ids: list[int]         # individual seats
      row_ids: list[int]          # optional: hold entire rows
      section_ids: list[int]      # optional: hold entire sections
      reason: str (required)
      hold_type: str              # PROMOTIONAL / SPONSOR / PRESS / VIP_RESERVATION / OPERATIONAL / OTHER
      expires_at: ISO8601 | null  # optional auto-release datetime
    → Validates no BOOKED/HELD seats in selection
    → Calls apply_marketing_hold()
    → Returns MarketingHold record with seat count

class AdminMarketingHoldReleaseView(UpdateAPIView)
    permission_classes = [IsAdminRole]
    POST /api/v1/tickets/admin/marketing-holds/<hold_id>/release/
    Request body:
      notes: str (optional)
    → Calls release_marketing_hold()
    → Returns released seat count

class AdminMarketingHoldListView(ListAPIView)
    permission_classes = [IsAdminRole]
    GET /api/v1/tickets/admin/shows/<show_id>/marketing-holds/
    → Filters: status (ACTIVE/RELEASED/EXPIRED), hold_type, created_by
    → Returns list with seat_count, creator name, reason, expiry

class AdminMarketingHoldDetailView(RetrieveAPIView)
    permission_classes = [IsAdminRole]
    GET /api/v1/tickets/admin/marketing-holds/<hold_id>/
    → Full detail with audit log history

class AdminMarketingHoldAuditLogView(ListAPIView)
    permission_classes = [IsSuperAdmin]
    GET /api/v1/tickets/admin/marketing-holds/<hold_id>/audit/
    → Full immutable audit trail — SuperAdmin only
```

---

## PHASE 6 — CUSTOM PERMISSIONS

#### `apps/ticketing/permissions.py`

```python
class IsAdminRole(BasePermission)
    → user.role in ('super_admin', 'admin')

class IsSuperAdmin(BasePermission)
    → user.role == 'super_admin'

class IsEventManager(BasePermission)
    → user.role in ('super_admin', 'admin', 'event_manager')

class IsGateStaff(BasePermission)
    → user.role in ('super_admin', 'admin', 'gate_staff', 'event_manager')

class IsBookingOwner(BasePermission)
    → obj.user == request.user OR user.role in ('super_admin', 'admin')

class IsTicketOwner(BasePermission)
    → obj.booking.user == request.user OR user.role in ('super_admin', 'admin')

# Marketing Hold — admin-only; gate_staff and event_manager CANNOT modify
class CanManageMarketingHold(BasePermission)
    → user.role in ('super_admin', 'admin')
    # Explicitly excludes: gate_staff, event_manager, content_manager
    # SuperAdmin can also view full audit logs via IsSuperAdmin
```

---

## PHASE 7 — URL CONFIGURATION

#### `apps/ticketing/urls.py`

```python
urlpatterns = [
    # Public
    path('venues/', VenueListView.as_view()),
    path('events/<slug:event_slug>/shows/', EventShowListView.as_view()),
    path('shows/<int:show_id>/seats/', ShowSeatMapView.as_view()),

    # Authenticated User
    path('shows/<int:show_id>/hold/', HoldSeatsView.as_view()),
    path('bookings/<int:booking_id>/initiate-payment/', InitiatePaymentView.as_view()),
    path('bookings/<int:booking_id>/verify-payment/', VerifyPaymentView.as_view()),
    path('my-bookings/', MyBookingsView.as_view()),
    path('my-tickets/', MyTicketsView.as_view()),
    path('tickets/<uuid:ticket_code>/', TicketDownloadView.as_view()),

    # Webhook
    path('webhooks/razorpay/', RazorpayWebhookView.as_view()),

    # Staff
    path('staff/scan/', TicketScanView.as_view()),
    path('staff/show/<int:show_id>/', StaffShowInfoView.as_view()),

    # Admin
    path('admin/venues/', AdminVenueViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/venues/<int:pk>/', AdminVenueViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),
    path('admin/venues/<int:venue_id>/sections/', AdminVenueSectionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/sections/<int:section_id>/rows/', AdminVenueRowViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/rows/<int:row_id>/seats/bulk/', AdminVenueSeatBulkCreateView.as_view()),
    path('admin/shows/', AdminEventShowViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/shows/<int:pk>/', AdminEventShowViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'})),
    path('admin/shows/<int:show_id>/categories/', AdminTicketCategoryViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('admin/shows/<int:show_id>/block-seats/', AdminBlockSeatsView.as_view()),
    path('admin/bookings/', AdminBookingListView.as_view()),
    path('admin/reports/revenue/', AdminRevenueReportView.as_view()),

    # Marketing Hold
    path('admin/shows/<int:show_id>/marketing-hold/', AdminMarketingHoldCreateView.as_view()),
    path('admin/shows/<int:show_id>/marketing-holds/', AdminMarketingHoldListView.as_view()),
    path('admin/marketing-holds/<int:hold_id>/', AdminMarketingHoldDetailView.as_view()),
    path('admin/marketing-holds/<int:hold_id>/release/', AdminMarketingHoldReleaseView.as_view()),
    path('admin/marketing-holds/<int:hold_id>/audit/', AdminMarketingHoldAuditLogView.as_view()),
]
```

---

## PHASE 8 — MANAGEMENT COMMAND

#### `apps/ticketing/management/__init__.py`
#### `apps/ticketing/management/commands/__init__.py`
#### `apps/ticketing/management/commands/cleanup_expired_holds.py`

```python
"""
Run via: python manage.py cleanup_expired_holds
Schedule via systemd timer or cron: */1 * * * *
Handles TWO types of expiry:
  1. User checkout seat holds (HELD → AVAILABLE after 6 minutes)
  2. Admin marketing holds with optional expiry datetime (MARKETING_HOLD → AVAILABLE)
"""
class Command(BaseCommand):
    help = 'Release expired seat holds and marketing holds back to AVAILABLE'

    def handle(self, *args, **options):
        released = release_expired_holds()
        mkt_released = release_expired_marketing_holds()
        self.stdout.write(
            f"Released {released} checkout holds, {mkt_released} marketing holds."
        )
```

---

## PHASE 9 — DJANGO ADMIN REGISTRATION

#### `apps/ticketing/admin.py`

Register all models with the Django admin for superadmin visibility:
- `VenueAdmin` with inline `VenueSectionInline`
- `EventShowAdmin` with `TicketCategoryInline`
- `BookingAdmin` with `BookingItemInline` (read-only)
- `PaymentAdmin` (read-only except status)
- `TicketAdmin` (read-only)
- `TicketScanLogAdmin` (read-only)

---

## PHASE 10 — FRONTEND ROUTES

### New Files to Create (DO NOT MODIFY existing files unless specified)

```
New-JalgaonUI/src/
├── app/
│   ├── events/
│   │   └── [slug]/
│   │       └── ← MODIFY: add "Book Tickets" button & ShowPickerModal
│   │
│   ├── tickets/                              ← NEW DIRECTORY
│   │   ├── booking/
│   │   │   └── [showId]/
│   │   │       └── page.tsx                  ← Seat Selection Page
│   │   ├── checkout/
│   │   │   └── [bookingId]/
│   │   │       └── page.tsx                  ← Checkout & Payment Page
│   │   └── confirmation/
│   │       └── [bookingId]/
│   │           └── page.tsx                  ← Booking Confirmed Page
│   │
│   ├── account/
│   │   └── tickets/                          ← NEW ROUTE
│   │       └── page.tsx                      ← My Tickets Wallet
│   │
│   ├── admin/
│   │   └── ticketing/                        ← NEW DIRECTORY
│   │       ├── venues/
│   │       │   ├── page.tsx                  ← Venue List
│   │       │   └── [id]/
│   │       │       └── page.tsx              ← Venue Seating Layout Builder
│   │       ├── shows/
│   │       │   └── page.tsx                  ← Show Manager
│   │       └── bookings/
│   │           └── page.tsx                  ← Admin Bookings View
│   │
│   └── staff/                                ← NEW DIRECTORY
│       └── scan/
│           └── page.tsx                      ← Gate QR Scanner
│
├── components/
│   ├── ticketing/                            ← NEW DIRECTORY
│   │   ├── ShowPickerModal.tsx               ← Show date/time selection
│   │   ├── SeatMap/
│   │   │   ├── SeatMap.tsx                   ← Master seat grid wrapper
│   │   │   ├── SeatMapSection.tsx            ← Single section view
│   │   │   ├── SeatRow.tsx                   ← Row of seats
│   │   │   ├── Seat.tsx                      ← Individual seat button
│   │   │   └── SeatLegend.tsx                ← Color key (Available/Held/Booked)
│   │   ├── HoldCountdownTimer.tsx            ← 6-min countdown header bar
│   │   ├── CheckoutForm.tsx                  ← Customer details form
│   │   ├── RazorpayButton.tsx                ← Razorpay SDK integration
│   │   ├── TicketCard.tsx                    ← Visual ticket with QR display
│   │   └── QRScanner.tsx                     ← html5-qrcode camera scanner
│   │
│   └── admin/
│       ├── AdminSidebar.tsx                  ← MODIFY: add Ticketing section
│       └── ticketing/                        ← NEW DIRECTORY
│           ├── VenueLayoutBuilder.tsx         ← Drag-n-drop seat map editor
│           ├── ShowScheduleForm.tsx           ← Create show & pricing form
│           └── BookingDataTable.tsx           ← Bookings datatable
│
└── lib/
    └── ticketing/                            ← NEW DIRECTORY
        ├── api.ts                            ← All ticketing API calls
        ├── types.ts                          ← TypeScript interfaces
        └── razorpay.ts                       ← Razorpay SDK loader helper
```

---

## PHASE 11 — FRONTEND: KEY COMPONENT SPECS

### `src/lib/ticketing/types.ts`
```typescript
export interface Venue { id, name, slug, address, city }
export interface VenueSection { id, name, code, color_code, rows }
export interface VenueRow { id, row_label, seats: VenueSeat[] }
export interface VenueSeat { id, seat_number, seat_type }

export interface EventShow { id, event_title, venue_name, show_datetime, status }

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED' | 'SELECTED'

export interface ShowSeat {
  id: number
  venue_seat: VenueSeat
  section_id: number
  price: string
  status: SeatStatus
}

export interface SeatMapData {
  show: EventShow
  sections: {
    section: VenueSection
    categories: TicketCategory[]
    rows: {
      row: VenueRow
      seats: ShowSeat[]
    }[]
  }[]
}

export interface Booking {
  id: number
  booking_reference: string
  total_amount: string
  status: string
  items: BookingItem[]
  expires_at: string  // ISO8601 — for countdown timer
}

export interface Ticket {
  id: number
  ticket_code: string
  booking_reference: string
  event_title: string
  venue_name: string
  show_datetime: string
  section_name: string
  row_label: string
  seat_number: string
  customer_name: string
  qr_code_url: string
  is_scanned: boolean
}
```

### `src/lib/ticketing/api.ts`
```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1/tickets'

export const ticketingApi = {
  getShows: (eventSlug: string) =>
    authFetch(`${BASE}/events/${eventSlug}/shows/`),

  getSeatMap: (showId: number) =>
    authFetch(`${BASE}/shows/${showId}/seats/`),

  holdSeats: (showId: number, data: HoldRequest) =>
    authFetch(`${BASE}/shows/${showId}/hold/`, { method: 'POST', body: data }),

  initiatePayment: (bookingId: number) =>
    authFetch(`${BASE}/bookings/${bookingId}/initiate-payment/`, { method: 'POST' }),

  verifyPayment: (bookingId: number, data: PaymentVerifyData) =>
    authFetch(`${BASE}/bookings/${bookingId}/verify-payment/`, { method: 'POST', body: data }),

  getMyTickets: () =>
    authFetch(`${BASE}/my-tickets/`),

  getTicket: (ticketCode: string) =>
    authFetch(`${BASE}/tickets/${ticketCode}/`),

  // Staff
  scanTicket: (qrPayload: string) =>
    authFetch(`${BASE}/staff/scan/`, { method: 'POST', body: { qr_payload: qrPayload } }),
}
```

### `src/lib/ticketing/razorpay.ts`
```typescript
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const loaded = await loadRazorpay()
  if (!loaded) throw new Error('Razorpay SDK failed to load')
  const rzp = new window.Razorpay(options)
  rzp.open()
}
```

---

## PHASE 12 — ADMIN SIDEBAR MODIFICATION

**File**: `src/components/admin/AdminSidebar.tsx`

**Pattern to follow**: Exactly like `isBannersExpanded` pattern (lines 24, 173–182).

Add after line 25 (existing state declarations):
```typescript
const [isTicketingExpanded, setIsTicketingExpanded] = useState(pathname?.startsWith('/admin/ticketing') || false)
```

Add `canSeeTicketing` permission:
```typescript
const canSeeTicketing = isAdmin || userRole === 'event_manager'
```

Add sidebar section (after existing Events section):
```tsx
{canSeeTicketing && (
  <div>
    <button onClick={() => setIsTicketingExpanded(!isTicketingExpanded)} ...>
      <span className="material-symbols-outlined">confirmation_number</span>
      {!isCollapsed && <span>Ticketing</span>}
      {!isCollapsed && <span>{isTicketingExpanded ? 'expand_less' : 'expand_more'}</span>}
    </button>
    {isTicketingExpanded && !isCollapsed && (
      <div className="pl-11 space-y-1">
        <Link href="/admin/ticketing/venues">Venues</Link>
        <Link href="/admin/ticketing/shows">Shows</Link>
        <Link href="/admin/ticketing/bookings">Bookings</Link>
        <Link href="/admin/ticketing/marketing-holds">Marketing Holds</Link>
      </div>
    )}
  </div>
)}
```

---

## PHASE 13 — FRONTEND: SEAT SELECTION PAGE

**File**: `src/app/tickets/booking/[showId]/page.tsx`

**Page Flow**:
1. Fetch `GET /shows/{showId}/seats/` on mount
2. Poll every 30 seconds to refresh seat availability
3. Render `<SeatMap>` with sections grid
4. Seat click → toggle `SELECTED` status locally (max 8 seats)
5. "Confirm Selection" button → `POST /shows/{showId}/hold/`
6. On success → navigate to `/tickets/checkout/{bookingId}`
7. Auth guard: redirect to login if not authenticated

**Seat Color Coding** (Public seat map — `<Seat>` component):
```
AVAILABLE   → bg-green-100 border-green-300 cursor-pointer hover:bg-green-200
SELECTED    → bg-primary text-white cursor-pointer (user's local selection state)
HELD        → bg-yellow-100 border-yellow-300 cursor-not-allowed opacity-70 title="Being purchased"
BOOKED      → bg-slate-200 border-slate-300 cursor-not-allowed opacity-50 title="Sold"
BLOCKED     → bg-red-100 border-red-300 cursor-not-allowed opacity-50
UNAVAILABLE → bg-slate-100 border-slate-200 cursor-not-allowed opacity-40
              (MARKETING_HOLD seats served as this status to public — no label shown)
```

**Public scarcity messaging** is calculated ONLY from genuine AVAILABLE seats:
```typescript
const availableCount = seats.filter(s => s.status === 'AVAILABLE').length
// MARKETING_HOLD seats (served as UNAVAILABLE) are correctly excluded from
// available count, so "Only X seats left" messaging remains truthful.
```

**Admin seat map** (inside `/admin/ticketing/shows/[id]/`) additionally renders:
```
MARKETING_HOLD → bg-purple-100 border-purple-400 cursor-pointer opacity-80
                  Badge overlay: reason snippet + hold_type chip + expiry countdown
```

---

## PHASE 14 — FRONTEND: CHECKOUT & PAYMENT PAGE

**File**: `src/app/tickets/checkout/[bookingId]/page.tsx`

**Page Flow**:
1. Validate booking exists and belongs to current user
2. Show `<HoldCountdownTimer>` (calculates from `booking.expires_at`)
3. Show order summary (seats, categories, prices)
4. `<CheckoutForm>` with: customer_name, email, phone
5. "Pay Now" button → `POST /bookings/{bookingId}/initiate-payment/`
6. On success → call `openRazorpayCheckout()` with returned order data
7. Razorpay `handler` callback → `POST /bookings/{bookingId}/verify-payment/`
8. On verification success → navigate to `/tickets/confirmation/{bookingId}`

**Razorpay Options Object**:
```typescript
{
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  order_id: payment.razorpay_order_id,
  amount: payment.amount_paisa,
  currency: 'INR',
  name: 'Jalgaon.com',
  description: `Booking ${booking.booking_reference}`,
  handler: async (response) => {
    await verifyPayment(bookingId, response)
    router.push(`/tickets/confirmation/${bookingId}`)
  },
  modal: {
    ondismiss: () => {
      toast.error('Payment cancelled. Your seats are still held for 6 minutes.')
    }
  }
}
```

---

## PHASE 15 — FRONTEND: STAFF SCANNER PAGE

**File**: `src/app/staff/scan/page.tsx`

**Dependencies to install**:
```bash
npm install html5-qrcode
```

**Page Features**:
1. Auth guard: only `gate_staff`, `event_manager`, `admin`, `super_admin` roles
2. Camera preview using `Html5QrcodeScanner` component
3. On QR scan → `POST /staff/scan/` with `qr_payload`
4. Display result with full-screen color feedback:
   - **Green** + ✓ icon + chime sound → `SUCCESS`
   - **Red** + ✗ icon + buzz sound → `ALREADY_USED` / `INVALID` / `CANCELLED`
5. Show scan counter (today's total entry count)
6. Cooldown 2 seconds between scans to prevent accidental double-scans

---

## PHASE 16 — PRODUCTION ENVIRONMENT ADDITIONS

### Frontend `.env.local`
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```
> Note: Only the KEY_ID goes to frontend. SECRET stays strictly on backend.

### Backend `.env`
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
SEAT_HOLD_MINUTES=6
TICKET_QR_SECRET=long-random-secret-string-min-32-chars
```

### Systemd Timer for Seat Cleanup (`deploy/systemd/`)

**`jalgaon-seat-cleanup.service`**:
```ini
[Unit]
Description=Jalgaon Ticketing - Release Expired Seat Holds
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/home/ubuntu/jalgaonWeb/jalgaonApi
ExecStart=/home/ubuntu/jalgaonWeb/jalgaonApi/venv/bin/python manage.py cleanup_expired_holds
```

**`jalgaon-seat-cleanup.timer`**:
```ini
[Unit]
Description=Run seat hold cleanup every minute

[Timer]
OnBootSec=60
OnUnitActiveSec=60
Unit=jalgaon-seat-cleanup.service

[Install]
WantedBy=timers.target
```

---

## COMPLETE FILE CREATION SEQUENCE (Build Order)

```
Order  File                                                          Action
────────────────────────────────────────────────────────────────────────────
 1     jalgaonApi/requirements.txt                                   MODIFY
 2     jalgaonApi/.env                                               MODIFY
 3     jalgaonApi/jalgaonApi/settings.py                             MODIFY
 4     jalgaonApi/apps/accounts/models.py                            MODIFY (add 2 roles)
 5     jalgaonApi/apps/ticketing/__init__.py                         CREATE
 6     jalgaonApi/apps/ticketing/apps.py                             CREATE
 7     jalgaonApi/apps/ticketing/models.py                           CREATE
 8     jalgaonApi/apps/ticketing/permissions.py                      CREATE
 9     jalgaonApi/apps/ticketing/services/__init__.py                CREATE
10     jalgaonApi/apps/ticketing/services/seat_service.py            CREATE
11     jalgaonApi/apps/ticketing/services/payment_service.py         CREATE
12     jalgaonApi/apps/ticketing/services/ticket_service.py          CREATE
13     jalgaonApi/apps/ticketing/serializers.py                      CREATE
14     jalgaonApi/apps/ticketing/views.py                            CREATE
15     jalgaonApi/apps/ticketing/urls.py                             CREATE
16     jalgaonApi/apps/ticketing/admin.py                            CREATE
17     jalgaonApi/apps/ticketing/management/commands/cleanup_...py   CREATE
18     jalgaonApi/jalgaonApi/urls.py                                 MODIFY (1 line)
19     [ RUN: python manage.py makemigrations ticketing ]
20     [ RUN: python manage.py migrate ]

21     New-JalgaonUI/src/lib/ticketing/types.ts                      CREATE
22     New-JalgaonUI/src/lib/ticketing/api.ts                        CREATE
23     New-JalgaonUI/src/lib/ticketing/razorpay.ts                   CREATE
24     New-JalgaonUI/src/components/ticketing/SeatMap/Seat.tsx       CREATE
25     New-JalgaonUI/src/components/ticketing/SeatMap/SeatRow.tsx    CREATE
26     New-JalgaonUI/src/components/ticketing/SeatMap/SeatMapSection.tsx  CREATE
27     New-JalgaonUI/src/components/ticketing/SeatMap/SeatMap.tsx    CREATE
28     New-JalgaonUI/src/components/ticketing/SeatMap/SeatLegend.tsx CREATE
29     New-JalgaonUI/src/components/ticketing/HoldCountdownTimer.tsx  CREATE
30     New-JalgaonUI/src/components/ticketing/ShowPickerModal.tsx     CREATE
31     New-JalgaonUI/src/components/ticketing/CheckoutForm.tsx        CREATE
32     New-JalgaonUI/src/components/ticketing/RazorpayButton.tsx      CREATE
33     New-JalgaonUI/src/components/ticketing/TicketCard.tsx          CREATE
34     New-JalgaonUI/src/components/ticketing/QRScanner.tsx           CREATE
35     New-JalgaonUI/src/app/tickets/booking/[showId]/page.tsx        CREATE
36     New-JalgaonUI/src/app/tickets/checkout/[bookingId]/page.tsx    CREATE
37     New-JalgaonUI/src/app/tickets/confirmation/[bookingId]/page.tsx CREATE
38     New-JalgaonUI/src/app/account/tickets/page.tsx                 CREATE
39     New-JalgaonUI/src/app/staff/scan/page.tsx                      CREATE
40     New-JalgaonUI/src/components/admin/ticketing/ (admin UI)       CREATE
41     New-JalgaonUI/src/app/admin/ticketing/ (admin pages)           CREATE
42     New-JalgaonUI/src/app/events/[slug]/EventDetailClient.tsx      MODIFY (add Book Tickets button)
43     New-JalgaonUI/src/components/admin/AdminSidebar.tsx            MODIFY (add Ticketing section)
```

---

## DECISIONS STILL PENDING (Confirm before starting)

| # | Decision | Default Assumed |
|---|---------|----------------|
| 1 | **Seat Hold Duration** | ~~10 minutes~~ → **6 minutes** ✅ confirmed |
| 2 | **Max seats per booking** | 8 seats |
| 3 | **PDF tickets or Web-only tickets** | Web ticket + QR image (no PDF for MVP) |
| 4 | **SMS confirmation via Twilio** (already installed) | Yes — send booking SMS to customer_phone |
| 5 | **Staff scanner: show_id restriction** | Staff can scan any valid show (no show-locking) |
| 6 | **Razorpay test vs live keys** | Test mode first |
| 7 | **Event model backward compat** | Keep `venue_name` string field + add nullable `venue` FK |
