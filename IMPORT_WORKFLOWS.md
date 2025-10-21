# Trekka Import Workflows

## 1. Google Calendar Import

### User Flow:
```
1. User clicks "Import from Google Calendar" button
2. OAuth popup → Grant calendar read access
3. Trekka fetches calendar events (next 12 months)
4. AI/Filter detects travel-related events:
   - Keywords: flight, hotel, airbnb, trip, vacation, travel
   - Multi-day events
   - Events with locations outside home city
5. Shows review screen: "We found 8 potential trips"
6. User checks boxes for trips to import
7. Click "Import Selected" → Creates trips
8. Option: "Keep checking for new trips monthly"
```

### Technical Implementation:
- **OAuth:** Google Calendar API with read-only scope
- **Detection Logic:**
  - Parse event titles for airlines, hotels, booking sites
  - Check event duration (multi-day = potential trip)
  - Extract location from event.location field
  - Use keywords: "flight to", "staying in", "trip to"
- **One-time import** (simpler) vs continuous sync
- Store Google refresh token for ongoing sync (optional)

### Pros:
✅ Users already have trips in calendar
✅ One-click bulk import
✅ Works with flight/hotel calendar invites
✅ Can enable ongoing sync

### Cons:
⚠️ Requires OAuth (some users hesitant)
⚠️ Calendar data might be messy
⚠️ May detect non-travel events

---

## 2. Email Parsing (Trip Forwarding)

### Recommended Workflow:

```
1. User receives flight/hotel confirmation email
2. User forwards email to: trips@trekka.com
3. Subject line auto-includes: user identifier
   - Forward to: {user_id}@trips.trekka.com
   - OR: trips+{user_id}@trekka.com (gmail-style)
4. Backend receives email
5. Parse email for:
   - Destination city/country
   - Start date (departure/check-in)
   - End date (return/check-out)
   - Confirmation number
   - Type (flight/hotel/rental)
6. Create "pending trip" in database
7. Send notification: "✈️ We detected a trip to Tokyo, Mar 15-20. Confirm?"
8. User clicks notification → Review screen
9. Can edit details if parsing missed something
10. Click "Confirm" → Trip created and shared
```

### Example Email Sources:
- **Airlines:** American, Delta, United, Southwest, JetBlue
- **Hotels:** Booking.com, Airbnb, Hotels.com, Expedia
- **Car Rentals:** Hertz, Enterprise, Avis
- **Trains:** Amtrak, Eurostar

### Technical Implementation:

#### Option A: Simple Email Forwarding (Recommended)
**Setup:**
- Use **SendGrid Inbound Parse** or **AWS SES**
- Configure subdomain: `trips.trekka.com`
- User-specific addresses: `{user_id}@trips.trekka.com`
- OR: Single address with + notation: `trips+{username}@trekka.com`

**Parsing Strategy:**
1. **Use AI (Google Gemini 1.5 Flash)** - Most reliable & FREE
   ```javascript
   const prompt = `
   Extract travel details from this email:

   ${emailBody}

   Return JSON:
   {
     "destination": "city, country",
     "start_date": "YYYY-MM-DD",
     "end_date": "YYYY-MM-DD",
     "type": "flight|hotel|rental",
     "confirmation": "ABC123"
   }
   `;
   ```

2. **Fallback: Regex patterns** for common formats
   - Flight: "Departing: March 15, 2025"
   - Hotel: "Check-in: 03/15/2025"
   - Destination: "to Paris" or "staying in Tokyo"

**Flow:**
```
Email received
  → Parse with Gemini
  → Extract: destination, dates, type
  → Create pending_trip record
  → Send notification to user
  → User reviews in app
  → Confirm → Creates actual trip
```

#### Option B: Gmail Integration (More Complex)
- OAuth to Gmail
- Scan inbox for travel confirmations
- Auto-import detected trips
- **Cons:** Requires inbox access (privacy concerns)

---

## Comparison

| Feature | Google Calendar | Email Forwarding |
|---------|----------------|------------------|
| **Setup Time** | 1 click OAuth | Set up forwarding once |
| **Ongoing Effort** | Auto-sync (optional) | Forward each email |
| **Accuracy** | 70% (messy calendar data) | 95% (structured emails + AI) |
| **Privacy** | Needs calendar access | Just forwarded emails |
| **Bulk Import** | Yes (import all at once) | No (one at a time) |
| **User Control** | Less (auto-import) | More (explicit forward) |
| **Cost** | Free | FREE (Gemini tier) |

---

## Recommended Approach

### Phase 1: Email Forwarding (Week 1)
**Why first:**
- ✅ More accurate parsing (structured emails)
- ✅ Less privacy concerns (user forwards explicitly)
- ✅ Works for ALL travel providers
- ✅ User feels in control

**Implementation:**
1. Set up `{user_id}@trips.trekka.com` addresses
2. Use Google Gemini to parse emails (FREE tier!)
3. Create pending trips
4. Notification system for confirmation
5. Review UI to edit before confirming

### Phase 2: Google Calendar Import (Week 2)
**Why second:**
- ✅ Good for bulk import of existing trips
- ✅ One-time use to populate historical data
- ✅ Optional ongoing sync

**Implementation:**
1. OAuth with Google Calendar API
2. Fetch events from past 6 months + next 12 months
3. AI detection of travel events
4. Bulk review and import UI

---

## User Experience Examples

### Email Forwarding UX:

**In Settings:**
```
┌─────────────────────────────────────┐
│ 📧 Email Forwarding                 │
│                                     │
│ Forward trip confirmations to:      │
│ ┌─────────────────────────────────┐ │
│ │ owen_abc123@trips.trekka.com   │ │
│ └─────────────────────────────────┘ │
│ [Copy Email]                        │
│                                     │
│ How it works:                       │
│ 1. Get flight/hotel email           │
│ 2. Forward to address above         │
│ 3. We'll detect and suggest trip    │
│ 4. Confirm with 1 click             │
└─────────────────────────────────────┘
```

**After forwarding:**
```
🔔 Notification:
"✈️ Trip detected: Tokyo, Mar 15-20
[Review & Confirm]"

→ Taps notification →

┌─────────────────────────────────────┐
│ Confirm Trip                        │
│                                     │
│ Destination: Tokyo, Japan   [Edit]  │
│ Dates: Mar 15-20, 2025     [Edit]  │
│ Type: ✈️ Flight                     │
│                                     │
│ From: ANA Confirmation Email        │
│ Conf #: ABC123XYZ                   │
│                                     │
│ [✓ Confirm & Create Trip]           │
│ [✗ Discard]                         │
└─────────────────────────────────────┘
```

### Google Calendar Import UX:

```
┌─────────────────────────────────────┐
│ Import from Google Calendar         │
│                                     │
│ We found 8 potential trips:         │
│                                     │
│ ☑ Tokyo - Mar 15-20, 2025           │
│   "ANA Flight Confirmation"         │
│                                     │
│ ☑ Paris - Apr 5-12, 2025            │
│   "Paris Hotel - Airbnb"            │
│                                     │
│ ☐ Team Offsite - May 1-3            │
│   "Work Event in Austin"            │
│                                     │
│ ☑ Bali - Jun 10-25, 2025            │
│   "Summer Vacation"                 │
│                                     │
│ [Import Selected (3 trips)]         │
│                                     │
│ ☐ Keep checking monthly for new     │
│   trips in my calendar              │
└─────────────────────────────────────┘
```

---

## Technical Requirements

### Email Forwarding:
- **Email Service:** SendGrid Inbound Parse ($0) or AWS SES (~$0.10/1000)
- **AI Parsing:** Google Gemini API (FREE up to 1,500/day, then ~$0.001 per email)
- **Database:** Add `pending_trips` table
- **Notifications:** Already built ✅

### Google Calendar:
- **Google Cloud Project:** Free
- **OAuth Setup:** Google Calendar API (free)
- **Rate Limits:** 1M requests/day (more than enough)

---

## My Recommendation

**Start with Email Forwarding** because:
1. Higher accuracy (95% vs 70%)
2. Less privacy friction (no inbox access)
3. Users feel more in control
4. Works better for ongoing use
5. Simpler infrastructure
6. FREE with Gemini API (1,500/day free tier)

**Add Calendar Import later** for:
- Bulk import of historical trips
- Optional convenience feature
- One-time use case

Want me to start building the email forwarding system first?
