# Week 1 Execution Plan
## ForgeExec × Next Level Electric

**Status:** AUTHORITATIVE
**Scope:** Week 1 only
**Audience:** Execution team
**Interpretation allowed:** None

---

## 1. Objective (Week 1)

By the end of Week 1, the system must satisfy **one binary condition**:

> A real Next Level Electric job event can be executed end-to-end through ForgeExec using the real Primus Kernel, producing real external side effects, for at least one technician, without modifying ForgeExec architecture.

**Anything not directly serving this objective is out of scope.**

---

## 2. Day-by-Day Execution Order

### Day 1 — Core Engine Confidence

**Goal:** Prove ForgeExec executor correctness in isolation.

**Tasks (in order):**

1. Write unit tests for `executor.ts`
   - Valid state transition → PASS
   - Invalid state transition → EXPLICIT FAILURE
   - Kernel rejection → EXPLICIT FAILURE
   - State immutability enforced
   - Event immutability enforced

2. Run all tests using MockKernel

**Deliverables:**
- `executor/executor.spec.ts`
- Green test suite

**Exit Condition (binary):**
- ❌ Any failing test → STOP
- ✅ All tests green → proceed

---

### Day 2 — Adapter Contract Integrity

**Goal:** Prove adapters are dumb, isolated, and swappable.

**Tasks:**

1. Write tests for each adapter:
   - Jobber
   - Samsara
   - QuickBooks
   - Twilio

2. Mock external APIs

3. Verify:
   - Exact payload pass-through
   - No conditionals
   - No transformations
   - Errors propagate

**Deliverables:**
- Adapter test files
- Zero adapter logic violations

**Exit Condition:**
- ❌ Any adapter contains logic → REJECT and FIX
- ✅ All adapters pass purity tests → proceed

---

### Day 3 — Real Kernel Integration

**Goal:** Replace the mock kernel without touching ForgeExec internals.

**Tasks:**

1. Wire real Primus Kernel behind `KernelInterface`
2. Run executor tests against real kernel
3. Validate:
   - Kernel decisions drive state transitions
   - No kernel logic leaks into ForgeExec

**Deliverables:**
- Real kernel integration commit
- Executor works unchanged

**Exit Condition:**
- ❌ Any ForgeExec code change required → STOP
- ✅ Kernel swaps cleanly → proceed

---

### Day 4 — Thin Reality Interfaces

**Goal:** Introduce real-world inputs with zero intelligence.

**Tasks:**

1. Implement minimal technician input source
   - Could be CLI, script, or simple UI
2. Implement minimal office trigger (if required)
3. Feed events into executor exactly as spec'd

**Deliverables:**
- One real event source
- One real execution run

**Exit Condition:**
- ❌ Logic appears in UI/input → STOP
- ✅ Events flow cleanly → proceed

---

### Day 5 — Field Test Dry Run

**Goal:** Execute a real job flow without human correction.

**Tasks:**

1. Run a real NLE job end-to-end:
   - Job created
   - Dispatched
   - Completed
   - Invoiced

2. Observe outputs only (no hotfixing)
3. Log failures

**Deliverables:**
- Execution log
- Failure list (if any)

**Exit Condition:**
- ❌ Manual intervention required → FAIL WEEK
- ✅ Full flow executes → PASS WEEK

---

## 3. False Start Kill List (DO NOT DO)

If any of the following appear, **kill the work immediately**:

- ❌ Improving architecture "slightly"
- ❌ Adding helper utilities
- ❌ Making adapters "smarter"
- ❌ Adding conditionals "just for now"
- ❌ Building full UI
- ❌ Refactoring for cleanliness
- ❌ Supporting multiple job types
- ❌ Supporting multiple technicians
- ❌ Making it configurable
- ❌ Performance optimization
- ❌ Error recovery polish
- ❌ Logging frameworks
- ❌ Metrics dashboards

**Week 1 is proof of correctness, not polish.**

---

## 4. Blocker & Dependency Map

### Hard Dependencies
- ✅ Real Primus Kernel availability
- ✅ Credentials for:
  - Jobber
  - Samsara
  - QuickBooks
  - Twilio
- ✅ One cooperative NLE technician

### Soft Dependencies
- UI framework (optional)
- Deployment target (local acceptable)

### Non-Dependencies (ignore)
- Scaling
- Security hardening
- Multi-tenant support
- Billing
- Observability

---

## 5. Minimal Viable Field Test (MVFT)

A Week 1 field test is valid **if and only if**:

1. ✅ One real job is created
2. ✅ One real technician receives dispatch
3. ✅ One real job completion event is submitted
4. ✅ One real invoice is generated
5. ✅ No ForgeExec code is modified during execution
6. ✅ No manual correction occurs mid-flow

**Anything less is not a field test.**

---

## 6. Week 1 Exit Gate (Binary)

### ✅ PASS if ALL are true:
- ✅ Executor tests pass
- ✅ Adapter tests pass
- ✅ Real kernel integrated without ForgeExec changes
- ✅ One real job executes end-to-end
- ✅ No architectural violations
- ✅ No hotfixes during run

### ❌ FAIL if ANY are true:
- ❌ Manual intervention required
- ❌ Logic added outside kernel
- ❌ Adapter behavior modified
- ❌ State/event mutation detected
- ❌ Architecture rules bypassed

**No partial credit.**

---

## 7. If Week 1 Fails

**Do not:**
- Patch forward
- Add exceptions
- "Stabilize" with logic
- Reinterpret architecture

**Instead:**
1. Log the exact failure
2. Identify which boundary was violated
3. Fix only the violating component
4. Re-run Week 1 from Day 1

---

## 8. Test File Structure (Reference)

```
forge-exec/
├── executor/
│   ├── executor.ts
│   ├── executor.spec.ts         # Day 1
│   ├── state.ts
│   └── state.spec.ts            # Day 1
│
├── adapters/
│   ├── crm/
│   │   ├── jobber-adapter.ts
│   │   └── jobber-adapter.spec.ts    # Day 2
│   ├── dispatch/
│   │   ├── samsara-adapter.ts
│   │   └── samsara-adapter.spec.ts   # Day 2
│   ├── invoicing/
│   │   ├── quickbooks-adapter.ts
│   │   └── quickbooks-adapter.spec.ts # Day 2
│   └── notifications/
│       ├── twilio-adapter.ts
│       └── twilio-adapter.spec.ts     # Day 2
│
├── kernel-client/
│   ├── mock-kernel.ts           # Day 1 (use this)
│   ├── real-kernel.ts           # Day 3 (build this)
│   └── interface.ts             # Read-only
│
└── examples/
    └── nle-field-test.ts        # Day 5
```

---

## 9. Day 1 Quick Start

**Immediate next action:**

```bash
# 1. Install test framework
npm install --save-dev vitest @vitest/ui

# 2. Add test script to package.json
# "test": "vitest"

# 3. Create first test file
touch forge-exec/executor/executor.spec.ts

# 4. Run tests
npm test
```

**First test to write:**

```typescript
// executor/executor.spec.ts
import { describe, it, expect } from 'vitest'
import { executeEvent } from './executor'
import { createInitialState } from './state'
import { createMockKernel } from '../kernel-client/mock-kernel'

describe('ForgeExec Executor', () => {
  it('accepts valid state transition from kernel', async () => {
    const kernel = createMockKernel()
    const state = createInitialState('job-001', 'LEAD_RECEIVED')

    const event = {
      type: 'JOB_SCHEDULED',
      payload: { scheduledTime: '2026-01-10T09:00:00Z' },
      timestamp: new Date().toISOString(),
      sourceId: 'test'
    }

    const context = {
      jobId: 'job-001',
      customerId: 'customer-001',
      vertical: 'electrician',
      jobType: 'PANEL_UPGRADE',
      metadata: {}
    }

    const result = await executeEvent({ kernel }, state, event, context)

    expect(result.success).toBe(true)
    expect(result.state.currentState).toBe('SCHEDULED')
  })
})
```

---

## 10. Status

| Component | Status |
|-----------|--------|
| Architecture | FROZEN |
| Scope | LOCKED |
| Interpretation | DISALLOWED |
| Execution | ACTIVE |

---

**Week 1 is now mechanically defined.**

**Version:** 1.0
**Last Updated:** 2026-01-04
**Authority:** This document supersedes all verbal discussions.

If execution conflicts with this plan, **the plan wins**.
