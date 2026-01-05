# ForgeExec + UI Quickstart Guide

Get the complete ForgeExec system running in 5 minutes.

## What You'll Get

✅ **ForgeExec Backend** - Deterministic execution engine with adapters  
✅ **REST API Server** - HTTP interface for UI  
✅ **Professional UI** - React + Vite technician app & office dashboard  
✅ **Real-time Validation** - Kernel-validated state transitions  
✅ **AI Features** - Gemini-powered NEC code search & supply finder  

---

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** (optional, for cloning)
- **Gemini API Key** (optional, for AI features): [Get Key](https://ai.google.dev/)

---

## Step 1: Install Backend Dependencies

```bash
cd forge-exec/
npm install
```

This installs:
- TypeScript compiler
- Vitest (testing)
- Express + CORS (API server)
- All ForgeExec dependencies

---

## Step 2: Start ForgeExec API Server

```bash
npm run api:start
```

You should see:

```
ForgeExec API Server running on http://localhost:3000
Jobs loaded: 3
Health check: http://localhost:3000/health
```

**Test it:**

```bash
curl http://localhost:3000/health
```

**Expected response:**

```json
{
  "status": "healthy",
  "service": "ForgeExec API",
  "version": "1.0.0",
  "timestamp": "2026-01-04T..."
}
```

**Leave this terminal running.**

---

## Step 3: Install UI Dependencies

Open a **new terminal**:

```bash
cd forge-exec/ui/
npm install
```

This installs:
- React 19
- Vite 6
- Lucide icons
- Recharts
- Google GenAI SDK

---

## Step 4: Configure UI Environment

Create `ui/.env.local`:

```bash
# ForgeExec Backend API
VITE_FORGEEXEC_API=http://localhost:3000

# Gemini API Key (optional, for AI features)
VITE_GEMINI_API_KEY=your_api_key_here
```

**Note:** If you skip the Gemini API key, core features will work but AI features (NEC search, supply finder) will be disabled.

---

## Step 5: Start UI Development Server

```bash
npm run dev
```

You should see:

```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Open:** http://localhost:5173

---

## Step 6: Explore the UI

### Technician View (Default)

1. See 3 mock jobs (JOB-001, JOB-002, JOB-003)
2. Click on **JOB-002** (currently ON_SITE)
3. Click **"Complete Work"** button
4. Watch the state machine validate the transition
5. See success message: "STATE_TRANSITION_ACCEPTED"

### Office Dashboard View

1. Click **"Office"** in top navigation
2. View all active jobs in grid
3. Jobs are color-coded by state:
   - Blue: SCHEDULED
   - Purple: DISPATCHED
   - Orange: ON_SITE
   - Green: WORK_COMPLETED

### AI Features (Technician View)

1. Select any job
2. Click **"NEC_REF"** button
3. Gemini searches National Electrical Code requirements
4. Click **"SUPPLY"** button
5. Gemini finds nearby electrical supply stores

---

## Understanding the System

### Event Flow Example

**User Action:** Technician clicks "Complete Work"

1. **UI emits event:**
   ```json
   {
     "type": "WORK_COMPLETED",
     "payload": { "jobId": "JOB-002", "technicianId": "TECH-001" },
     "timestamp": "2026-01-04T10:00:00Z",
     "sourceId": "technician-app"
   }
   ```

2. **API Server receives event** → `POST /api/events`

3. **ForgeExec Executor validates:**
   - Current state: ON_SITE
   - Event type: WORK_COMPLETED
   - Transition rule: ON_SITE → WORK_COMPLETED ✅ (valid)

4. **Kernel approves transition:**
   - Updates job state to WORK_COMPLETED
   - Triggers adapters (QuickBooks, Twilio)

5. **API returns response:**
   ```json
   {
     "accepted": true,
     "newState": "WORK_COMPLETED",
     "message": "State transition: ON_SITE → WORK_COMPLETED"
   }
   ```

6. **UI updates:**
   - Job card changes from orange to green
   - Shows success notification
   - Disables "Complete Work" button

### State Machine Rules

```
SCHEDULED → DISPATCHED → ON_SITE → WORK_COMPLETED → 
INSPECTION_PASSED → INVOICED → CLOSED
```

**Invalid Examples:**

❌ SCHEDULED → ON_SITE (must dispatch first)  
❌ WORK_COMPLETED → ON_SITE (cannot go backwards)  
❌ SCHEDULED → CLOSED (cannot skip states)  

---

## Testing the Integration

### Test Event Submission

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "TECHNICIAN_ARRIVED",
    "payload": {
      "jobId": "JOB-003",
      "technicianId": "TECH-002",
      "gpsLocation": { "latitude": 37.7749, "longitude": -122.4194 }
    },
    "timestamp": "2026-01-04T10:00:00Z",
    "sourceId": "technician-app"
  }'
```

**Expected:** Job JOB-003 transitions from DISPATCHED → ON_SITE

### Test Invalid Transition

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "type": "WORK_COMPLETED",
    "payload": { "jobId": "JOB-001" },
    "timestamp": "2026-01-04T10:00:00Z",
    "sourceId": "technician-app"
  }'
```

**Expected:** Rejection (cannot complete work from SCHEDULED state)

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│   React UI (localhost:5173)             │
│   - Technician App                       │
│   - Office Dashboard                     │
└───────────┬─────────────────────────────┘
            │ HTTP POST/GET
┌───────────▼─────────────────────────────┐
│   Express API (localhost:3000)          │
│   - /api/events (submit events)         │
│   - /api/jobs/:id (get job details)     │
└───────────┬─────────────────────────────┘
            │ Direct invocation
┌───────────▼─────────────────────────────┐
│   ForgeExec Executor                    │
│   - Deterministic state machine         │
│   - Event validation                    │
│   - Adapter orchestration               │
└───────────┬─────────────────────────────┘
            │ Query/command
┌───────────▼─────────────────────────────┐
│   Primus Kernel + Adapters              │
│   - Mock Kernel (validation logic)      │
│   - Jobber, Samsara, QuickBooks, Twilio │
└─────────────────────────────────────────┘
```

---

## Development Workflow

### 1. Backend Development

**Edit executor logic:**

```bash
# Edit files in executor/, adapters/, verticals/
nano executor/executor.ts

# Run tests
npm test

# Restart API server
npm run api:start
```

### 2. Frontend Development

**Edit UI components:**

```bash
cd ui/
# Edit files in components/, services/
nano components/Technician/TechnicianApp.tsx

# Vite auto-reloads, no restart needed
```

### 3. Full Stack Testing

**Terminal 1:** Backend
```bash
npm run api:start
```

**Terminal 2:** UI
```bash
cd ui/ && npm run dev
```

**Terminal 3:** Tests
```bash
npm test -- --watch
```

---

## Deployment

### Build UI for Production

```bash
cd ui/
npm run build
```

Output: `ui/dist/` (static files)

### Deploy to Vercel

```bash
cd ui/
vercel
```

### Deploy to Netlify

```bash
cd ui/
netlify deploy --prod --dir=dist
```

### Environment Variables (Production)

```bash
VITE_FORGEEXEC_API=https://api.yourdomain.com
VITE_GEMINI_API_KEY=your_production_key
```

---

## Troubleshooting

### Backend Won't Start

**Error:** `Cannot find module 'express'`

**Fix:**

```bash
npm install express cors
```

### UI Shows "Connection Failed"

**Cause:** Backend not running

**Fix:**

1. Open new terminal
2. Run: `npm run api:start`
3. Check: `curl http://localhost:3000/health`

### CORS Errors in Browser

**Cause:** API server and UI on different ports

**Fix:** Already configured! CORS is enabled in `api-server.js`

### TypeScript Errors

**Fix:**

```bash
npm run type-check
```

If errors persist, see `tsconfig.json`

### Tests Failing

**Fix:**

```bash
npm test
```

All 85 tests should pass. If not, check recent code changes.

---

## Project Structure

```
forge-exec/
├── executor/              # Core execution engine
├── adapters/              # External system integrations
├── verticals/             # NLE vertical configuration
│   └── next-level-electric/
│       ├── events.ts      # Event definitions
│       ├── config.ts      # Vertical config
│       └── interfaces/    # UI contracts
├── kernel-client/         # Kernel interface + mock
├── api-server.js          # ✅ NEW - Express API server
├── ui/                    # ✅ NEW - React UI
│   ├── components/
│   ├── services/
│   └── INTEGRATION_GUIDE.md
├── package.json
└── QUICKSTART.md          # ← You are here
```

---

## Next Steps

### Option A: Customize UI

1. Edit colors: `ui/constants.tsx`
2. Modify layouts: `ui/components/Layout.tsx`
3. Add screens: Create new components in `ui/components/`

### Option B: Add Real Adapters

1. Configure Jobber API keys
2. Configure Samsara GPS credentials
3. Configure QuickBooks OAuth
4. Configure Twilio API keys

See: `adapters/` for implementation details

### Option C: Deploy to Production

1. Set up production database (replace in-memory job store)
2. Add authentication (JWT, OAuth)
3. Deploy backend to Railway/Render
4. Deploy UI to Vercel/Netlify
5. Configure production environment variables

### Option D: Field Test

1. Load real technician data
2. Load real job data from Jobber
3. Give technicians mobile access
4. Monitor in office dashboard
5. Collect feedback

---

## Documentation

- **Integration Guide:** [ui/INTEGRATION_GUIDE.md](ui/INTEGRATION_GUIDE.md)
- **Architecture Handoff:** [ARCHITECTURE_HANDOFF.md](ARCHITECTURE_HANDOFF.md)
- **UI Contracts:** [verticals/next-level-electric/interfaces/ui-contracts.ts](verticals/next-level-electric/interfaces/ui-contracts.ts)
- **Event Definitions:** [verticals/next-level-electric/events.ts](verticals/next-level-electric/events.ts)

---

## Support

- **Backend Issues:** Check `executor/`, `adapters/`, `verticals/`
- **UI Issues:** Check `ui/components/`, `ui/services/`
- **API Issues:** Check `api-server.js`
- **Test Failures:** Run `npm test` for details

---

**Status:** ✅ System Fully Operational - Backend + UI Integrated

**Test Coverage:** 85/85 tests passing  
**Architecture Validation:** Zero violations  
**TypeScript:** Zero compile errors  

Enjoy building with ForgeExec! 🚀⚡
