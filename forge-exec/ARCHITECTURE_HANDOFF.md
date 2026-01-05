# ForgeExec Architecture Handoff for UI/UX Development

**Date:** January 4, 2026  
**Version:** 1.0  
**Status:** Production Ready - Ready for UI Implementation  
**Target:** Google AI Studio UI/UX Development

---

## Executive Summary

ForgeExec is a **deterministic vertical execution engine** for trade-specific workflows, currently deployed for Next Level Electric (electrician vertical). The system is built on strict architectural principles that enforce immutability, determinism, and clear separation of concerns.

**Current Status:**
- ✅ 85 tests passing
- ✅ Zero architecture violations
- ✅ Zero TypeScript errors
- ✅ Backend fully implemented
- ⏭️ Needs: Professional UI/UX for Technician App & Office Dashboard

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────┐
│           Primus Kernel (AI)                │
│   (Business rules, policies, intelligence)   │
└───────────────▲─────────────────────────────┘
                │ readonly contract
┌───────────────┴─────────────────────────────┐
│              ForgeExec                       │
│   (Execution-only, deterministic engine)    │
│   - State machine executor                   │
│   - Event processing                         │
│   - Adapter orchestration                    │
└───────────────▲─────────────────────────────┘
                │
┌───────────────┴─────────────────────────────┐
│       Next Level Electric Vertical          │
│   - Job types (Panel Upgrade, EV Charger)   │
│   - State flow configuration                 │
│   - Adapter wiring (Jobber, Samsara, QB)    │
└───────────────▲─────────────────────────────┘
                │
┌───────────────┴─────────────────────────────┐
│              UI Layer (TO BUILD)             │
│   - Technician Mobile App                    │
│   - Office Dashboard                         │
└─────────────────────────────────────────────┘
```

### Core Principles (MUST FOLLOW)

1. **UI is a Dumb Terminal**
   - NO business logic in UI
   - NO state management in UI
   - NO computed/derived values
   - UI only: displays data + emits events

2. **Event-Driven Architecture**
   - All user actions → ExecutionEvents
   - Events are immutable once created
   - Events flow: UI → ForgeExec → Kernel → Adapters

3. **State Authority**
   - Kernel is sole authority on state transitions
   - UI reflects current state (read-only)
   - UI does NOT decide what happens next

---

## UI Requirements

### Technician Mobile App

**Purpose:** Field technicians use this to report job progress

**Core Screens:**

1. **Clock In/Out Screen**
   - GPS location capture (required)
   - One-tap clock in/out
   - Display: technician name, current location, clock status

2. **Job List Screen**
   - Show assigned jobs for today
   - Display: customer name, address, job type, scheduled time
   - Sort by scheduled time
   - Visual indicators: distance to job, priority level

3. **Job Detail Screen**
   - Customer info (name, phone, address)
   - Job requirements and notes
   - Safety notes (if any)
   - Required materials list

4. **Job Actions Screen**
   - Big action buttons:
     - "Arrived at Job"
     - "Start Work"
     - "Complete Work"
   - Each button emits appropriate event
   - Disabled buttons if action not available

5. **Work Capture Screen**
   - Photo capture (multiple)
   - Voice note recording
   - Materials logging
   - Labor hours tracking

6. **Change Order Request Screen**
   - Description input
   - Cost estimate input
   - Photo attachments
   - Priority selection (LOW/MEDIUM/HIGH)

**Design Requirements:**
- Large touch targets (minimum 48px)
- High contrast for outdoor visibility
- Offline-first capability
- Simple, task-focused flows
- Minimal text input (use buttons/selections)

**Color Coding:**
- Green: Available actions
- Yellow: In progress
- Blue: Informational
- Red: Alerts/Warnings
- Gray: Disabled/Unavailable

### Office Dashboard

**Purpose:** Office staff monitors all jobs, approves changes, generates invoices

**Core Sections:**

1. **Active Jobs Overview**
   - Grid/List view of all jobs
   - Columns: Job ID, Customer, Technician, State, Priority
   - Color-coded by state
   - Filter by: state, technician, date, priority
   - Search by: customer name, address, job ID

2. **Real-Time Technician Tracking**
   - Map view with technician locations
   - List view: technician name, status, current job
   - Filter: clocked in, on job, available

3. **Change Order Management**
   - Pending approvals list
   - Change order details: description, cost, photos
   - Actions: Approve, Reject (with reason)
   - Approval history

4. **Invoice Management**
   - Jobs ready for invoicing
   - One-click invoice generation
   - View invoice details: labor, materials, total
   - Payment status tracking

5. **Daily Reporting Dashboard**
   - Jobs completed today
   - Total revenue
   - Technician productivity
   - Average job time
   - Materials used

**Design Requirements:**
- Desktop-first (1920x1080 minimum)
- Data-dense but readable
- Quick-action buttons always visible
- Real-time updates (WebSocket/polling)
- Export capabilities (CSV, PDF)
- Responsive tables with sorting/filtering

**Color Coding:**
- Job States:
  - Blue: SCHEDULED
  - Purple: DISPATCHED
  - Orange: ON_SITE
  - Green: WORK_COMPLETED
  - Cyan: INVOICED
  - Gray: CLOSED

---

## Technical Specifications

### Job States (Finite State Machine)

```
LEAD_RECEIVED
    ↓
SCHEDULED
    ↓
DISPATCHED
    ↓
ON_SITE
    ↓
WORK_COMPLETED
    ↓
INSPECTION_PASSED
    ↓
INVOICED
    ↓
CLOSED
```

**Rules:**
- Jobs CANNOT skip states
- Jobs CANNOT go backwards
- Kernel validates all transitions
- Invalid transitions are rejected with reason

### Event Types

**Technician Events:**
- `TECHNICIAN_CLOCKED_IN`
- `TECHNICIAN_CLOCKED_OUT`
- `TECHNICIAN_DISPATCHED`
- `TECHNICIAN_ARRIVED`
- `WORK_STARTED`
- `WORK_COMPLETED`
- `MATERIALS_LOGGED`
- `PHOTO_CAPTURED`
- `VOICE_NOTE_RECORDED`

**Office Events:**
- `JOB_SCHEDULED`
- `CHANGE_ORDER_APPROVED`
- `CHANGE_ORDER_REJECTED`
- `INSPECTION_PASSED`
- `INVOICE_GENERATED`
- `PAYMENT_RECEIVED`
- `JOB_CLOSED`

### Data Structures

**ExecutionEvent:**
```typescript
{
  type: string                    // Event type (see above)
  payload: Record<string, unknown> // Event-specific data
  timestamp: string               // ISO 8601 timestamp
  source: string                  // 'technician-app' | 'office-dashboard'
}
```

**JobState:**
```typescript
{
  jobId: string
  currentState: 'SCHEDULED' | 'DISPATCHED' | 'ON_SITE' | ...
  history: Array<StateTransition>
  pendingOutputs: Array<PendingOutput>
}
```

**JobDetails:**
```typescript
{
  jobId: string
  customerName: string
  customerPhone: string
  address: string
  jobType: 'SERVICE_CALL' | 'PANEL_UPGRADE' | 'EV_CHARGER_INSTALL' | ...
  currentState: JobState
  assignedTechnician?: string
  scheduledTime: string
  estimatedDuration: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  notes: string
  photos: Array<string>
  voiceNotes: Array<string>
  materialsUsed: Array<MaterialLog>
  changeOrders: Array<ChangeOrder>
  totalLaborHours: number
  totalMaterialCost: number
}
```

### API Contracts

**Submit Event:**
```typescript
POST /api/events
Body: ExecutionEvent
Response: {
  accepted: boolean
  newState?: string
  message?: string
  error?: string
}
```

**Get Job Details:**
```typescript
GET /api/jobs/:jobId
Response: JobDetails
```

**Get Active Jobs:**
```typescript
GET /api/jobs?state=ACTIVE
Response: Array<JobSummary>
```

**Get Technician Status:**
```typescript
GET /api/technicians/:technicianId
Response: TechnicianStatus
```

---

## UI/UX Design Guidelines

### Design System Requirements

**Typography:**
- Headings: Bold, 1.5-2rem
- Body: Regular, 0.95-1rem
- Captions: 0.85rem
- Monospace: Event logs, IDs

**Spacing:**
- Base unit: 8px
- Padding: 16px, 24px
- Margins: 12px, 20px, 32px

**Borders:**
- Radius: 8px (cards), 12px (panels)
- Width: 1-2px
- Color: Low contrast for structure

**Shadows:**
- Card: 0 2px 8px rgba(0,0,0,0.1)
- Modal: 0 4px 16px rgba(0,0,0,0.2)
- Hover: 0 4px 12px rgba(0,0,0,0.15)

### Mobile App Design Patterns

**Navigation:**
- Bottom tab bar (4-5 items max)
- Stack navigation for details
- Swipe gestures for common actions

**Forms:**
- Large input fields (48px height)
- Voice input where possible
- Camera integration for photos
- Autocomplete for materials

**Feedback:**
- Loading spinners for async operations
- Success animations (checkmarks)
- Error messages (toast notifications)
- Haptic feedback on actions

### Dashboard Design Patterns

**Layout:**
- Sidebar navigation (collapsible)
- Top bar: search, filters, user menu
- Main content: cards/tables
- Right panel: details/actions

**Tables:**
- Sticky headers
- Row hover effects
- Inline actions
- Sortable columns
- Pagination or infinite scroll

**Real-Time Updates:**
- Subtle animations for new data
- Color flash for state changes
- Badge counts for pending actions
- Sound notifications (optional)

---

## User Flows

### Technician Flow: Complete a Job

1. Technician opens app → sees assigned jobs
2. Selects job → views details
3. Taps "Arrived" → GPS captured, event sent
4. Kernel validates → state → ON_SITE
5. Taps "Start Work" → timer starts
6. Works on job, captures photos/notes
7. Logs materials used
8. Taps "Complete Work" → submits completion data
9. Kernel validates → state → WORK_COMPLETED
10. Invoice automatically generated (office notified)

### Office Flow: Approve Change Order

1. Office staff sees notification badge
2. Opens "Pending Approvals" section
3. Clicks on change order
4. Reviews: description, photos, cost estimate
5. Clicks "Approve" button
6. Confirmation modal → confirms
7. Event sent to ForgeExec
8. Kernel validates → updates job
9. Technician receives approval notification
10. Job can proceed with additional work

---

## Integration Points

### Existing Backend Endpoints (Reference)

**Location:** `verticals/next-level-electric/interfaces/`

- `technician-app.ts` - Mobile app interface spec
- `office-dashboard.ts` - Dashboard interface spec
- `ui-contracts.ts` - UI implementation patterns

### Adapter Integrations (Already Implemented)

1. **Jobber CRM** - Job sync, customer data
2. **Samsara GPS** - Technician tracking
3. **QuickBooks** - Invoice generation
4. **Twilio** - SMS/Email notifications

---

## Constraints and Rules

### What UI CAN Do:
✅ Display current state
✅ Emit events on user actions
✅ Show validation errors
✅ Capture photos/GPS/voice
✅ Render lists and details
✅ Navigate between screens

### What UI CANNOT Do:
❌ Decide if action is allowed (Kernel decides)
❌ Calculate derived values (totals, durations)
❌ Store job state locally
❌ Retry failed events automatically
❌ Modify event payloads
❌ Skip state validations

### Critical Rules:
1. Every button click → event submission
2. Every event gets validated by Kernel
3. Rejected events show error message
4. UI never assumes state changes
5. All state comes from backend

---

## Development Handoff Checklist

### For Google AI Studio:

- [ ] Review this document completely
- [ ] Understand event-driven architecture
- [ ] Review TypeScript interfaces in `/verticals/next-level-electric/interfaces/`
- [ ] Design mobile app screens (Figma/mockups)
- [ ] Design dashboard layouts
- [ ] Create component library
- [ ] Define color palette and typography
- [ ] Plan responsive breakpoints
- [ ] Specify animations and transitions
- [ ] Create interaction prototypes

### Deliverables Needed:

1. **Design System**
   - Component library (buttons, forms, cards, modals)
   - Color palette with hex codes
   - Typography specifications
   - Icon set

2. **Mobile App Screens** (High-fidelity mockups)
   - Clock In/Out
   - Job List
   - Job Detail
   - Job Actions
   - Work Capture
   - Change Order Request

3. **Dashboard Screens** (High-fidelity mockups)
   - Jobs Overview
   - Technician Tracking
   - Change Order Management
   - Invoice Management
   - Reports

4. **Interaction Specifications**
   - Button states (default, hover, active, disabled)
   - Form validation patterns
   - Loading states
   - Error states
   - Success feedback

5. **Responsive Design**
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1280px, 1920px

---

## Technical Context

**Backend Stack:**
- TypeScript 5.3+
- Node.js 18+
- Vitest (testing)
- Strict architecture validation

**Suggested Frontend Stack:**
- React/React Native or Vue/Nuxt
- TypeScript (required)
- TailwindCSS or similar
- React Query or SWR (data fetching)
- Socket.io (real-time)

**Target Browsers:**
- Mobile: iOS Safari 15+, Chrome Android 100+
- Desktop: Chrome 100+, Firefox 100+, Safari 15+

---

## Next Steps

1. Google AI Studio reviews this document
2. Creates design system and mockups
3. Shares designs for feedback
4. Implements frontend using existing backend interfaces
5. Integration testing with ForgeExec backend
6. Field testing with real technicians

---

## Contact Points

**Architecture Questions:**
- See: `/docs/master-claude-prompt.md`
- See: `/docs/pr-review-checklist.md`

**API Specifications:**
- See: `/verticals/next-level-electric/interfaces/`
- See: `/kernel-client/interface.ts`

**Test Coverage:**
- 85 tests in `/adapters/`, `/executor/`, `/verticals/`
- Run: `npm test`

---

**End of Handoff Document**

This document provides everything needed to create professional, production-ready UI/UX for ForgeExec. The backend is solid, tested, and ready for integration.
