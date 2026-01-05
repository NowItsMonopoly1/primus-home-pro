# NLE UI Contract Specification v1.0.0 (FROZEN)

**Status:** FROZEN - Changes require architecture review
**Last Updated:** 2026-01-04
**Scope:** Next Level Electric Technician App + Office Dashboard

---

## 1. Contract Principles

### 1.1 UI Role Definition

UIs are **dumb terminals** with exactly two responsibilities:

1. **Display state** exactly as received from ForgeExec
2. **Emit events** exactly as user actions occur

UIs are **prohibited** from:

- Computing derived state
- Making business decisions
- Transforming data
- Caching state locally
- Optimistically updating
- Encoding business rules

### 1.2 Event Flow

```
User Action → UI Emits Event → ForgeExec Executes → Kernel Decides → State Updates → UI Renders
```

**Critical:** UI NEVER assumes the outcome of an event emission.

---

## 2. Event Catalog

### 2.1 Technician App Events

| Event Type | Trigger | Payload | Screen |
|------------|---------|---------|--------|
| `TECHNICIAN_CLOCKED_IN` | Clock In button | technicianId, GPS, timestamp | Clock In |
| `TECHNICIAN_CLOCKED_OUT` | Clock Out button | technicianId, GPS, timestamp | Clock In |
| `TECHNICIAN_ARRIVED` | Arrive button | jobId, technicianId, GPS, timestamp | Job Detail |
| `WORK_STARTED` | Start Work button | jobId, technicianId, timestamp | Job Detail |
| `WORK_COMPLETED` | Complete Work button | jobId, laborHours, requiresInspection, notes | Work Capture |
| `MATERIALS_LOGGED` | Log Materials button | jobId, materials[] | Materials Log |
| `CHANGE_ORDER_REQUESTED` | Submit Request button | jobId, description, cost, time, reason, photos[] | Change Order |
| `PHOTO_CAPTURED` | Capture Photo button | jobId, photoUrl, caption | Work Capture |
| `VOICE_NOTE_RECORDED` | Record Note button | jobId, audioUrl, duration | Work Capture |

### 2.2 Office Dashboard Events

| Event Type | Trigger | Payload | Screen |
|------------|---------|---------|--------|
| `JOB_CREATED` | Create Job button | jobId, customerId, address, jobType, scheduledTime, priority | Job Board |
| `JOB_SCHEDULED` | Schedule Job button | jobId, technicianId, scheduledTime | Job Board |
| `TECHNICIAN_DISPATCHED` | Dispatch button | jobId, technicianId | Job Board |
| `JOB_CANCELLED` | Cancel Job button | jobId, reason | Job Detail |
| `JOB_RESCHEDULED` | Reschedule button | jobId, newScheduledTime, reason | Job Detail |
| `CHANGE_ORDER_APPROVED` | Approve button | jobId, changeOrderId, approvalNotes | Change Orders |
| `CHANGE_ORDER_REJECTED` | Reject button | jobId, changeOrderId, rejectionReason | Change Orders |
| `INVOICE_GENERATED` | Generate Invoice button | jobId | Invoicing |

---

## 3. State Contracts

### 3.1 Technician App State

**Received From:** ForgeExec state push
**Update Frequency:** Real-time on state change
**Format:** JSON

```typescript
{
  session: {
    technicianId: string
    technicianName: string
    clockInTime: string | null
    currentJobId: string | null
  },
  assignedJobs: [
    {
      jobId: string
      customerName: string
      address: string
      jobType: string
      scheduledTime: string
      currentState: JobState  // LEAD_RECEIVED | SCHEDULED | DISPATCHED | ON_SITE | WORK_COMPLETED | ...
    }
  ],
  currentJob: {
    jobId: string
    customerName: string
    customerPhone: string
    address: string
    jobType: string
    jobNotes: string
    currentState: JobState
    workStartTime: string | null
    photosUploaded: string[]
    voiceNotesUploaded: string[]
  } | null,
  vanInventory: [
    {
      itemId: string
      description: string
      quantityAvailable: number
      unitCost: number
    }
  ]
}
```

**UI Rendering Rules:**

- Display `currentState` as-is (e.g., "DISPATCHED", not "En Route")
- Show `scheduledTime` in local timezone for display ONLY
- NO computation of "time remaining", "is late", etc.
- NO status badges derived from state (use state value directly)

### 3.2 Office Dashboard State

**Received From:** ForgeExec state push
**Update Frequency:** Real-time on state change
**Format:** JSON

```typescript
{
  jobs: [
    {
      jobId: string
      customerId: string
      customerName: string
      address: string
      jobType: string
      currentState: JobState
      assignedTechnicianId: string | null
      scheduledTime: string | null
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
    }
  ],
  technicians: [
    {
      technicianId: string
      name: string
      clockedIn: boolean
      currentJobId: string | null
      lastGPSLatitude: number | null
      lastGPSLongitude: number | null
      lastGPSTimestamp: string | null
    }
  ],
  changeOrders: [
    {
      changeOrderId: string
      jobId: string
      technicianId: string
      description: string
      estimatedCost: number
      estimatedTime: number
      reason: string
      photos: string[]
      requestedAt: string
      status: 'PENDING' | 'APPROVED' | 'REJECTED'
      reviewedBy: string | null
      reviewedAt: string | null
      reviewNotes: string | null
    }
  ],
  invoiceReadyJobs: [
    {
      jobId: string
      customerId: string
      customerName: string
      customerEmail: string
      completedAt: string
      laborHours: number
      materialsUsed: [
        {
          itemId: string
          description: string
          quantity: number
          cost: number
        }
      ],
      changeOrderCosts: number
    }
  ],
  selectedJob: {
    jobId: string
    customerId: string
    customerName: string
    customerPhone: string
    customerEmail: string
    address: string
    jobType: string
    currentState: JobState
    assignedTechnicianId: string | null
    scheduledTime: string | null
    jobNotes: string
    photos: [
      {
        photoId: string
        url: string
        caption: string | null
        timestamp: string
        uploadedBy: string
      }
    ],
    voiceNotes: [
      {
        noteId: string
        url: string
        duration: number
        timestamp: string
        uploadedBy: string
      }
    ],
    workHistory: [
      {
        timestamp: string
        technicianId: string
        action: string
        notes: string | null
      }
    ]
  } | null
}
```

**UI Rendering Rules:**

- Filter jobs by `currentState` for board columns (e.g., filter where `currentState === 'SCHEDULED'`)
- Display GPS coordinates on map without interpretation
- NO derivation of "jobs completed today" (wait for kernel to provide)
- NO computation of invoice totals (use exact values from `invoiceReadyJobs`)

---

## 4. Screen Specifications

### 4.1 Technician App Screens

#### Clock In Screen

**Purpose:** Clock in/out with GPS verification

**Data Displayed:**
- Technician name (from `session.technicianName`)
- Current GPS location (live from device)
- Clock status (from `session.clockInTime`)

**Events Emitted:**
- `TECHNICIAN_CLOCKED_IN` (on "Clock In" button)
- `TECHNICIAN_CLOCKED_OUT` (on "Clock Out" button)

**UI Logic Constraints:**
- ❌ NO auto-clock-out after X hours
- ❌ NO "forgot to clock in" warnings
- ✅ Display exact clock-in time if available

---

#### Job List Screen

**Purpose:** View assigned jobs

**Data Displayed:**
- List of jobs (from `assignedJobs[]`)
- For each job: customer name, address, job type, scheduled time, current state

**Events Emitted:**
- None (navigation only)

**UI Logic Constraints:**
- ❌ NO sorting by "urgency" or "proximity"
- ❌ NO filtering by "late" jobs
- ✅ Display jobs in order received from ForgeExec

---

#### Job Detail Screen

**Purpose:** View job details and take action

**Data Displayed:**
- Full job details (from `currentJob`)
- Customer phone, address, job notes
- Current state

**Events Emitted:**
- `TECHNICIAN_ARRIVED` (on "Arrive" button)
- `WORK_STARTED` (on "Start Work" button)

**UI Logic Constraints:**
- ❌ NO conditional button visibility based on state inference
- ❌ NO "Get Directions" button (separate concern)
- ✅ Show all buttons; ForgeExec/Kernel will reject invalid transitions

---

#### Work Capture Screen

**Purpose:** Document work progress

**Data Displayed:**
- Job ID, start time (from `currentJob.workStartTime`)
- Photos uploaded (from `currentJob.photosUploaded`)
- Voice notes uploaded (from `currentJob.voiceNotesUploaded`)

**Events Emitted:**
- `PHOTO_CAPTURED` (on "Capture Photo" button)
- `VOICE_NOTE_RECORDED` (on "Record Note" button)
- `WORK_COMPLETED` (on "Complete Work" button)

**UI Logic Constraints:**
- ❌ NO "elapsed time" calculation
- ❌ NO "minimum photos required" validation
- ✅ Display work start time as-is

---

#### Materials Log Screen

**Purpose:** Log materials used on job

**Data Displayed:**
- Van inventory (from `vanInventory[]`)
- Materials already logged (from state)

**Events Emitted:**
- `MATERIALS_LOGGED` (on "Log Materials" button)

**UI Logic Constraints:**
- ❌ NO inventory deduction logic
- ❌ NO cost calculations
- ✅ Submit materials exactly as entered

---

#### Change Order Screen

**Purpose:** Request approval for scope changes

**Data Displayed:**
- Job ID, original scope (from `currentJob.jobNotes`)

**Events Emitted:**
- `CHANGE_ORDER_REQUESTED` (on "Submit Request" button)

**UI Logic Constraints:**
- ❌ NO auto-approval logic
- ❌ NO cost validation rules
- ✅ Submit change order exactly as entered

---

### 4.2 Office Dashboard Screens

#### Overview Screen

**Purpose:** At-a-glance status

**Data Displayed:**
- Active jobs count (filter `jobs[]` where state ∈ {SCHEDULED, DISPATCHED, ON_SITE})
- Clocked-in technicians count (filter `technicians[]` where `clockedIn === true`)
- Pending change orders count (filter `changeOrders[]` where `status === 'PENDING'`)
- Invoice-ready jobs count (`invoiceReadyJobs.length`)

**Events Emitted:**
- None (navigation only)

**UI Logic Constraints:**
- ❌ NO "today's revenue" calculation
- ❌ NO "jobs behind schedule" alerts
- ✅ Simple counts only

---

#### Job Board Screen

**Purpose:** Kanban view of jobs by state

**Data Displayed:**
- Three columns: Scheduled, In Progress, Completed
- Jobs filtered by `currentState`

**Events Emitted:**
- `JOB_CREATED` (on "Create Job" button)
- `JOB_SCHEDULED` (on "Schedule" button)
- `TECHNICIAN_DISPATCHED` (on "Dispatch" button)

**UI Logic Constraints:**
- ❌ NO drag-and-drop state transitions
- ❌ NO auto-assignment of technicians
- ✅ Emit event on explicit user action only

---

#### Technician Tracking Screen

**Purpose:** Real-time technician locations

**Data Displayed:**
- Map with technician pins (from `technicians[].lastGPS*`)
- List view with technician status

**Events Emitted:**
- None (read-only)

**UI Logic Constraints:**
- ❌ NO "estimated arrival time" calculation
- ❌ NO geofence alerts
- ✅ Display GPS coordinates as-is

---

#### Change Orders Screen

**Purpose:** Approve/reject change order requests

**Data Displayed:**
- Pending, approved, rejected change orders (from `changeOrders[]`)
- For each: description, cost, time, photos

**Events Emitted:**
- `CHANGE_ORDER_APPROVED` (on "Approve" button)
- `CHANGE_ORDER_REJECTED` (on "Reject" button)

**UI Logic Constraints:**
- ❌ NO auto-approval rules
- ❌ NO budget checks
- ✅ Explicit approval/rejection only

---

#### Invoicing Screen

**Purpose:** Generate invoices for completed jobs

**Data Displayed:**
- Invoice-ready jobs (from `invoiceReadyJobs[]`)
- For each: customer, labor hours, materials, change order costs

**Events Emitted:**
- `INVOICE_GENERATED` (on "Generate Invoice" button)

**UI Logic Constraints:**
- ❌ NO invoice total calculation (use exact values from state)
- ❌ NO tax computation
- ✅ Display invoice data as-is from ForgeExec

---

## 5. Implementation Examples

### 5.1 ✅ CORRECT: Event Emission

```typescript
async function handleCompleteWork() {
  setLoading(true)

  const event: WorkCompletedEvent = {
    type: 'WORK_COMPLETED',
    payload: {
      jobId: currentJob.jobId,
      technicianId: session.technicianId,
      laborHours: parseFloat(laborHoursInput),
      requiresInspection: requiresInspectionCheckbox,
      notes: notesTextarea || undefined,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    sourceId: 'technician-app'
  }

  try {
    await forgeExecClient.emitEvent(event)
    // Wait for state update notification
    // UI will re-render when state arrives
  } catch (error) {
    setError('Failed to submit work completion')
  } finally {
    setLoading(false)
  }
}
```

### 5.2 ❌ WRONG: Optimistic Update

```typescript
// ❌ DO NOT DO THIS
async function handleCompleteWork() {
  // WRONG: Assume success
  setJobStatus('WORK_COMPLETED')
  navigate('/jobs')

  await api.completeWork(jobId)
}
```

### 5.3 ✅ CORRECT: State Rendering

```typescript
function JobCard({ job }: { job: Job }) {
  return (
    <Card>
      <h3>{job.customerName}</h3>
      <Badge>{job.currentState}</Badge>
      <p>{job.address}</p>
      <p>Scheduled: {formatTimestamp(job.scheduledTime)}</p>
    </Card>
  )
}

function formatTimestamp(iso: string): string {
  // ✅ OK: Display formatting only
  return new Date(iso).toLocaleString()
}
```

### 5.4 ❌ WRONG: Derived State

```typescript
// ❌ DO NOT DO THIS
function JobCard({ job }: { job: Job }) {
  const isLate = new Date(job.scheduledTime) < new Date()
  const status = deriveStatus(job.currentState)
  const priority = calculatePriority(job)

  return (
    <Card className={isLate ? 'late' : ''}>
      <Badge color={priority}>{status}</Badge>
    </Card>
  )
}
```

---

## 6. Validation Checklist

Before merging any UI code, verify:

- [ ] NO `if/else` logic based on job state
- [ ] NO calculations (totals, durations, rates)
- [ ] NO optimistic state updates
- [ ] NO state caching or local storage
- [ ] NO "smart" button visibility logic
- [ ] Event payloads match frozen event catalog exactly
- [ ] State rendering uses exact field names from contract
- [ ] All timestamps displayed in local timezone (display only)
- [ ] NO business rules encoded in UI (e.g., "late", "overdue", "requires approval")

---

## 7. Change Control

**Status:** FROZEN v1.0.0

Changes to this contract require:

1. Architecture review
2. Kernel contract update (if event types change)
3. ForgeExec executor update (if state schema changes)
4. Version bump in this document
5. Regression testing of all UIs

**Last Frozen:** 2026-01-04
**Next Review:** After Week 1 execution complete
