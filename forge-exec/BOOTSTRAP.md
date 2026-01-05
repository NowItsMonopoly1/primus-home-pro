# ForgeExec Bootstrap Instructions

**Use this file to start any ForgeExec development session.**

---

## Step 1: Paste the Master Claude Prompt

Before making ANY code changes, paste the **Master Claude Prompt v1.2.1** at the start of your session.

**Location:** `docs/master-claude-prompt.md`

**Required response from Claude:**
```
Constraints acknowledged. Ready to implement.
```

If Claude does not acknowledge, **STOP** and repaste the prompt.

---

## Step 2: Verify Your Zone

Check which file you're modifying and confirm it's in an allowed zone:

### ✅ Allowed Zones

**Readonly (READ ONLY):**
```
/kernel-client/interface.ts
```
You may read this file, but NEVER modify it.

**Implementation (FILL THESE):**
```
/executor/executor.ts
/executor/state.ts
/adapters/**/*.ts
/verticals/**/*.ts
```

### ❌ Forbidden Zones

**DO NOT CREATE FILES HERE:**
```
/utils/**/*
/helpers/**/*
/shared/**/*
/common/**/*
/lib/**/*
```

If you need to create a helper function, **STOP** and ask the user.

---

## Step 3: Check Import Boundaries

Before adding an import, verify it doesn't cross zone boundaries:

### ✅ Allowed Imports

**Executor files may import from:**
- `/executor/` (same directory)
- `/kernel-client/interface.ts`

**Adapter files may import from:**
- `/adapters/` (same directory or subdirectories)
- `/kernel-client/interface.ts`
- External packages (npm)

**Vertical files may import from:**
- `/verticals/` (same vertical only)
- `/kernel-client/interface.ts`
- `/executor/` (for types only)

### ❌ Forbidden Imports

- Adapters importing from executor (except types)
- Executor importing from adapters
- Any file importing from forbidden zones
- Any file importing from Primus Kernel beyond `/kernel-client/interface.ts`

---

## Step 4: State Pattern Enforcement

All state transitions MUST follow this pattern:

### ✅ Correct Pattern

```typescript
function transition(
  current: Readonly<State>,
  proposed: State
): State {
  return { ...proposed }
}
```

### ❌ Incorrect Patterns

```typescript
// MUTATION - FORBIDDEN
function transition(state: State): void {
  state.status = 'new_status'
}

// DERIVED STATE - FORBIDDEN
function transition(current: Readonly<State>): State {
  return {
    ...current,
    isComplete: current.progress === 100 // COMPUTED FIELD
  }
}
```

---

## Step 5: Adapter Pattern Enforcement

All adapters MUST be pure side-effect sinks:

### ✅ Correct Pattern

```typescript
async function sendEmail(payload: EmailPayload): Promise<void> {
  await emailService.send(payload)
}
```

### ❌ Incorrect Patterns

```typescript
// CONDITIONAL LOGIC - FORBIDDEN
async function sendEmail(payload: EmailPayload): Promise<void> {
  if (payload.priority === 'high') {
    await emailService.sendUrgent(payload)
  } else {
    await emailService.send(payload)
  }
}

// TRANSFORMATION - FORBIDDEN
async function sendEmail(payload: EmailPayload): Promise<void> {
  const enriched = { ...payload, timestamp: Date.now() }
  await emailService.send(enriched)
}
```

---

## Step 6: Stop Conditions

**STOP and ASK the user if:**

1. The interface you need doesn't exist
2. You need to add a state that doesn't fit the existing enum
3. You need to import from outside your zone
4. You need to modify kernel behavior
5. An adapter needs conditional logic
6. You're tempted to create a helper function
7. You need to compute a derived value in execution logic
8. You're unsure which zone owns the work

**Do NOT work around constraints. Ask.**

---

## Step 7: Pre-PR Self-Review

Before submitting a PR, review against the **PR Review Checklist**:

**Location:** `docs/pr-review-checklist.md`

**All 14 sections must PASS:**

1. Zone Compliance
2. State Immutability
3. Event & Output Immutability
4. No Derived State
5. Adapter Purity
6. No Abstractions
7. Import Boundaries
8. Determinism
9. IO Isolation
10. Error Handling
11. Business Logic Placement
12. Documentation & Comments
13. Naming & Stability
14. Type Compliance

**If ANY section fails, fix before submitting.**

---

## Step 8: Validate Architecture

**CRITICAL:** Run architecture validation before committing:

```bash
npm run validate
```

This runs:
1. **TypeScript type checks** - all type errors must be resolved
2. **Architecture validation** - all zone boundaries must be respected

**If this fails, STOP and fix the violations immediately.**

Common failures:
- `no-executor-to-verticals` - Executor imported from verticals (FORBIDDEN)
- `no-adapters-to-executor` - Adapter imported from executor (FORBIDDEN)
- `no-vertical-cross-imports` - One vertical imported from another (FORBIDDEN)
- `no-forbidden-zones` - Files exist in utils/helpers/shared (FORBIDDEN)

---

## Step 9: Commit Message Format

Use this format for all commits:

```
<type>: <description>

- Detail 1
- Detail 2

Vertical: <vertical-name>
Zone: <zone-name>
```

**Example:**
```
feat: Add Jobber CRM adapter for NLE

- Implement syncJobToJobber function
- Implement updateJobStatus function
- No logic - pure side-effect execution

Vertical: next-level-electric
Zone: adapters/crm
```

---

## Step 10: PR Submission

**PR Title Format:**
```
[<vertical>] <type>: <description>
```

**Example:**
```
[NLE] feat: Add Jobber CRM adapter
```

**PR Description Must Include:**

1. **What changed:**
   - Files added/modified
   - Functions implemented

2. **Zone verification:**
   - Confirm all changes are in allowed zones

3. **Checklist confirmation:**
   - "All 14 PR checklist sections verified: PASS"

4. **Test status:**
   - Type check: PASS
   - Tests: PASS (or N/A if no tests yet)

**If PR description is incomplete, it will be rejected.**

---

## Common Mistakes to Avoid

### ❌ Mistake 1: "Just a little logic"

```typescript
// FORBIDDEN
async function sendInvoice(payload: InvoicePayload): Promise<void> {
  if (payload.amount > 1000) { // LOGIC IN ADAPTER
    await invoiceService.sendWithApproval(payload)
  }
}
```

**Why:** Adapters are side-effect sinks. All logic belongs in the kernel.

---

### ❌ Mistake 2: "Helpful" state enrichment

```typescript
// FORBIDDEN
function transitionState(current: Readonly<State>): State {
  return {
    ...current,
    completedAt: Date.now() // NONDETERMINISM
  }
}
```

**Why:** Execution logic must be deterministic. Timestamps belong in adapters or kernel.

---

### ❌ Mistake 3: "Quick" utility function

```typescript
// FORBIDDEN
// /utils/format-phone.ts
export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
```

**Why:** Utilities create abstraction debt. If you need a helper, ask the user.

---

### ❌ Mistake 4: "Temporary" kernel modification

```typescript
// FORBIDDEN
// /kernel-client/interface.ts
export interface KernelDecision {
  accepted: boolean
  reason?: string
  // Added for NLE - WRONG
  technicianId?: string
}
```

**Why:** Kernel interface is read-only. Request kernel changes through proper channels.

---

## Quick Reference Card

| Task | Allowed? | Location |
|------|----------|----------|
| Add executor logic | ✅ | `/executor/` |
| Add adapter | ✅ | `/adapters/` |
| Add vertical config | ✅ | `/verticals/` |
| Modify kernel | ❌ | Never |
| Create utility | ❌ | Never |
| Add helper | ❌ | Never |
| Mutate state | ❌ | Never |
| Add logic to adapter | ❌ | Never |
| Compute derived state | ❌ | Never |
| Use Date.now() in executor | ❌ | Never |

---

## Emergency Contacts

**If you're blocked:**
1. Check the Master Claude Prompt
2. Check the PR Review Checklist
3. Check the System Diagram
4. Ask the user

**Do NOT work around constraints.**

---

**Version:** 1.0.0
**Last Updated:** 2026-01-04
**Status:** Production bootstrap protocol
