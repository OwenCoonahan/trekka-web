# Email Forwarding Setup Guide

## Overview

The email forwarding feature allows users to automatically create trips by forwarding flight and hotel confirmation emails. The system uses OpenAI to parse the emails and extract trip details.

## 🗄️ Database Setup (REQUIRED)

**Run this SQL in Supabase:**

```bash
# In your Supabase SQL Editor, run:
add-email-forwarding.sql
```

This creates:
- `pending_trips` table for storing parsed trip data
- `email_import_id` column on profiles for unique email addresses
- Notification trigger for new pending trips
- RLS policies

## 🔧 Environment Variables (REQUIRED)

Add to your `.env.local`:

```env
# OpenAI API Key for email parsing
OPENAI_API_KEY=sk-...your-key-here

# Optional: Webhook secret for SendGrid verification
EMAIL_WEBHOOK_SECRET=your-random-secret-here
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and add to `.env.local`

**Cost:** ~$0.01 per email (using GPT-4o-mini)

## 📧 Email Service Setup

You need to configure an inbound email service to receive forwarded emails and send them to your API.

### Option A: SendGrid Inbound Parse (Recommended - Free)

**1. Create SendGrid Account**
- Go to https://sendgrid.com
- Sign up (free tier includes inbound parse)

**2. Set up Inbound Parse**
1. Go to Settings → Inbound Parse
2. Click "Add Host & URL"
3. Configure:
   - **Subdomain:** `trips`
   - **Domain:** Your domain (e.g., `trekka.com`)
   - **Destination URL:** `https://your-app.vercel.app/api/parse-email`
   - **Check spam:** No
   - **POST raw, full MIME message:** No

**3. Configure DNS**

Add these DNS records to your domain:

```
Type: MX
Host: trips (or trips.yourdomain.com)
Value: mx.sendgrid.net
Priority: 10
```

**4. Test**

Send a test email to `anything@trips.yourdomain.com` and check your API logs.

---

### Option B: AWS SES (Alternative)

**1. Set up SES**
1. Go to AWS SES console
2. Verify domain: `trips.yourdomain.com`
3. Set up receipt rule set

**2. Create Lambda Function**
```javascript
exports.handler = async (event) => {
  const email = event.Records[0].ses;

  // Forward to your Next.js API
  await fetch('https://your-app.vercel.app/api/parse-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email.mail.destination[0],
      from: email.mail.source,
      subject: email.mail.commonHeaders.subject,
      text: email.content,
    }),
  });
};
```

**3. Configure DNS (Route 53)**
- Add MX record pointing to SES inbound endpoint
- Verify domain ownership

---

## 🧪 Testing

### 1. Get Your Email Address

1. Log into your Trekka account
2. Go to Settings
3. Find the "📧 Email Import" section
4. Copy your unique email address (e.g., `abc123@trips.trekka.com`)

### 2. Send Test Email

Forward a flight or hotel confirmation to your email address.

**Supported Providers:**
- ✈️ Airlines: American, Delta, United, Southwest, JetBlue, etc.
- 🏨 Hotels: Booking.com, Airbnb, Hotels.com, Expedia
- 🚗 Car Rentals: Hertz, Enterprise, Avis
- 🚂 Trains: Amtrak, Eurostar

### 3. Review Pending Trip

1. You'll get a notification: "✈️ Trip detected from email"
2. Go to `/trips/pending` or click "View Pending" in settings
3. Review the parsed trip details
4. Edit if needed
5. Click "Confirm Trip" to create it

---

## 📊 How It Works

### User Flow

```
User receives booking email
  ↓
Forwards to abc123@trips.trekka.com
  ↓
SendGrid/SES receives email
  ↓
Sends POST to /api/parse-email
  ↓
OpenAI extracts trip details
  ↓
Creates pending_trip record
  ↓
Notification sent to user
  ↓
User reviews in /trips/pending
  ↓
User confirms → Trip created
```

### API Flow (`/api/parse-email`)

1. Receive email from SendGrid/SES
2. Extract `email_import_id` from recipient address
3. Look up user by `email_import_id`
4. Parse email with OpenAI GPT-4o-mini
5. Extract: destination, dates, type, confirmation #
6. Create `pending_trip` record
7. Database trigger creates notification
8. Return success

### Parsing with AI

The system sends the email to OpenAI with this prompt:

```
Extract travel details from this email:
[email content]

Return JSON:
{
  "destination": "city, country",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "type": "flight|hotel|rental|train",
  "confirmation": "ABC123"
}
```

OpenAI returns structured data with ~90% accuracy.

---

## 🔐 Security

### Email Address Generation
- Each user gets unique 8-character ID
- Generated with MD5 hash + timestamp
- Checked for uniqueness
- Auto-generated on profile creation

### API Protection
1. **Email verification:** Only accepts emails to valid `email_import_id`
2. **User lookup:** Must have matching profile
3. **RLS policies:** Users can only see their own pending trips
4. **Optional webhook secret:** Verify requests from SendGrid

### Recommended: Add Webhook Auth

In `/api/parse-email/route.ts`:

```typescript
// Uncomment these lines:
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.EMAIL_WEBHOOK_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

Then configure SendGrid to send this header.

---

## 🐛 Troubleshooting

### Emails not being received

1. Check DNS records are configured correctly
2. Verify SendGrid inbound parse is active
3. Check SendGrid logs for delivery issues
4. Test with `curl` to your API endpoint

### Parsing failures

1. Check OpenAI API key is valid
2. Check API logs for OpenAI errors
3. Email might be in unsupported format
4. Check confidence_score in database (< 0.7 = low confidence)

### User not found error

1. User hasn't been assigned `email_import_id`
2. Run SQL migration to generate IDs for existing users
3. Check database for profile with that ID

---

## 📈 Future Enhancements

**Possible improvements:**
1. **Attachment parsing:** Extract PDFs with more details
2. **Calendar integration:** Sync with Google Calendar
3. **Bulk import:** Upload .ics files
4. **Smart suggestions:** "You're in Paris Mar 15-20, Alice is there Mar 18-22"
5. **Email threading:** Detect updates to existing trips
6. **Multi-city trips:** Parse complex itineraries
7. **Participant detection:** Extract "Traveling with John Smith"

---

## 💰 Cost Estimate

**Per email:**
- OpenAI API: $0.01 (GPT-4o-mini)
- SendGrid: Free (up to reasonable volume)
- Supabase: Negligible

**For 100 emails/month:** ~$1.00

**For 1000 emails/month:** ~$10.00

Very affordable for the value it provides!

---

## ✅ Post-Setup Checklist

- [ ] Database migration run (`add-email-forwarding.sql`)
- [ ] `OPENAI_API_KEY` added to environment variables
- [ ] SendGrid account created
- [ ] Inbound Parse configured
- [ ] DNS records added and verified
- [ ] Test email sent and successfully parsed
- [ ] Pending trip appears in app
- [ ] Confirmed pending trip creates actual trip
- [ ] Notifications working

---

## 🚀 Launch!

Once all checks pass, your email forwarding is live! Users can now forward any travel confirmation and have it automatically imported into Trekka.

**Marketing copy:**
> "Never manually enter a trip again. Just forward your confirmation email and we'll do the rest. ✈️"
