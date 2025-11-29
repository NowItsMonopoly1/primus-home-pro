# PrimusInsights Roofing MVP

AI-powered lead follow-up and booking engine for roofing companies.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

**Required:**
- `TWILIO_SID` - Twilio Account SID
- `TWILIO_TOKEN` - Twilio Auth Token
- `TWILIO_FROM` - Your Twilio phone number
- `OPENAI_KEY` - OpenAI API key
- `GOOGLE_CREDS` - Path to Google service account JSON file
- `CALENDAR_ID` - Google Calendar ID (use "primary" for main calendar)
- `OWNER_PHONE` - Phone number to notify on bookings

### 3. Google Calendar Setup
- Create a service account in Google Cloud Console
- Enable Google Calendar API
- Download service account JSON and save as `service-account.json`
- Share your calendar with the service account email

### 4. Twilio Setup
- Configure webhook URL: `https://your-domain.com/sms` (use ngrok for local testing)

### 5. Run the Server
```bash
npm start
```

## API Endpoints

### POST /lead
Create a new lead and send initial AI response.

**Example:**
```bash
curl -X POST http://localhost:3000/lead \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+15551234567",
    "name": "John Doe",
    "message": "I need my roof inspected"
  }'
```

### POST /sms
Twilio webhook for incoming SMS responses (configured in Twilio dashboard).

## Testing with ngrok

```bash
ngrok http 3000
# Copy the HTTPS URL and add it to Twilio webhook settings
```

## Test Flow

1. Send initial lead via cURL
2. Customer receives SMS acknowledgment
3. Customer responds with answers
4. If availability mentioned, AI attempts booking
5. Owner receives notification on successful booking

## AI Logic

- **Step 1:** Acknowledge lead warmly
- **Step 2:** Ask ONE qualifying question (address, roof type, or availability)
- **Step 3:** If availability given → attempt booking
- **Step 4:** If booking succeeds → send confirmation
- **Step 5:** If unsure → escalate with `needs_human: true`

## Production Deployment

For production, use:
- PM2 for process management
- Redis for lead storage
- PostgreSQL for permanent database
- Rate limiting middleware
- Proper error handling and logging
