# ForgeExec UI - Next Level Electric

Professional UI/UX for the ForgeExec deterministic execution engine, designed by Google AI Studio.

## Features

### Technician Mobile App
- ✅ Clock In/Out with GPS tracking
- ✅ Job list with real-time updates
- ✅ Job details and site logistics
- ✅ Work capture (photos, voice notes, materials)
- ✅ Change order requests
- ✅ NEC code lookup (Gemini-powered)
- ✅ Nearby supply store finder (Gemini-powered)

### Office Dashboard
- ✅ Active jobs overview
- ✅ Real-time technician tracking
- ✅ Change order management
- ✅ Invoice generation
- ✅ Daily reporting dashboard

## Architecture

```
UI (React + Vite)
    ↓
ForgeExec API (Express)
    ↓
ForgeExec Executor (TypeScript)
    ↓
Primus Kernel + Adapters
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
# ForgeExec Backend API
VITE_FORGEEXEC_API=http://localhost:3000

# Gemini API Key (for AI features)
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key: https://ai.google.dev/

### 3. Start ForgeExec Backend

In the root directory:

```bash
npm install express cors
npm run api:start
```

Backend will run on: `http://localhost:3000`

### 4. Start UI Development Server

```bash
npm run dev
```

UI will open at: `http://localhost:5173`

## Usage

### Technician View

1. Click "Technician" in the top navigation
2. View assigned jobs for today
3. Click on a job to see details
4. Use action buttons:
   - **Arrived** - Mark arrival at job site (GPS captured)
   - **Start Work** - Begin work on job
   - **Complete** - Mark work as completed
5. Use auxiliary features:
   - **NEC_REF** - Search electrical code requirements
   - **SUPPLY** - Find nearby electrical supply stores

### Office Dashboard View

1. Click "Office" in the top navigation
2. View all active jobs in grid/list format
3. Monitor technician locations
4. Approve/reject change orders
5. Generate invoices for completed jobs

## Event-Driven Architecture

All user actions emit `ExecutionEvent` objects:

```typescript
{
  type: 'TECHNICIAN_ARRIVED',
  payload: {
    jobId: 'JOB-001',
    technicianId: 'TECH-001',
    gpsLocation: { latitude: 37.7749, longitude: -122.4194 }
  },
  timestamp: '2026-01-04T10:00:00Z',
  sourceId: 'technician-app'
}
```

ForgeExec validates events and returns:

```typescript
{
  accepted: true,
  newState: 'ON_SITE',
  message: 'State transition accepted: DISPATCHED → ON_SITE'
}
```

## State Machine

Jobs follow this deterministic flow:

```
LEAD_RECEIVED → SCHEDULED → DISPATCHED → ON_SITE → 
WORK_COMPLETED → INSPECTION_PASSED → INVOICED → CLOSED
```

**Rules:**
- ❌ Cannot skip states
- ❌ Cannot go backwards
- ✅ All transitions validated by Primus Kernel

## Project Structure

```
ui/
├── components/           # React components
│   ├── Technician/      # Mobile app screens
│   ├── Dashboard/       # Office dashboard screens
│   └── Layout.tsx       # App layout and navigation
├── services/            # API integrations
│   ├── forgeexecService.ts   # ForgeExec backend API
│   ├── geminiService.ts      # Gemini AI features
│   └── eventTypes.ts         # Event type definitions
├── types.ts             # TypeScript type definitions
├── constants.tsx        # UI constants (colors, mock data)
├── App.tsx              # Main application component
└── INTEGRATION_GUIDE.md # Full integration documentation
```

## API Endpoints

The UI expects these endpoints from ForgeExec backend:

- `POST /api/events` - Submit execution event
- `GET /api/jobs/:jobId` - Get job details
- `GET /api/jobs?state=ACTIVE` - Get active jobs
- `GET /api/technicians/:id` - Get technician status

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for full API specifications.

## UI Constraints

✅ **UI DOES:**
- Display current state
- Emit events on user actions
- Show validation errors
- Capture photos/GPS/voice notes

❌ **UI DOES NOT:**
- Decide if actions are allowed
- Calculate derived values
- Store authoritative state
- Modify event payloads

## Build for Production

```bash
npm run build
```

Output: `dist/` folder with static files

## Deploy

### Vercel

```bash
vercel
```

### Netlify

```bash
netlify deploy --prod --dir=dist
```

### Environment Variables (Production)

```bash
VITE_FORGEEXEC_API=https://api.yourdomain.com
VITE_GEMINI_API_KEY=your_production_key
```

## Troubleshooting

### "Unable to connect to ForgeExec backend"

**Solution:** Ensure backend is running on port 3000:

```bash
cd ..
npm run api:start
```

### Gemini AI features not working

**Solution:** Check your API key in `.env.local`:

```bash
VITE_GEMINI_API_KEY=your_key_here
```

Restart dev server after changes:

```bash
npm run dev
```

## Documentation

- **Full Integration Guide:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Architecture Handoff:** [../ARCHITECTURE_HANDOFF.md](../ARCHITECTURE_HANDOFF.md)
- **Backend Interfaces:** [../verticals/next-level-electric/interfaces/](../verticals/next-level-electric/interfaces/)

## Tech Stack

- **React 19** - UI framework
- **Vite 6** - Build tool
- **TypeScript 5.8** - Type safety
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **Google GenAI** - AI features (NEC search, supply finder)

## Credits

UI/UX designed by **Google AI Studio** based on ForgeExec architecture specifications.

---

**Status:** ✅ Production Ready - Integrated with ForgeExec backend
