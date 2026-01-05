# ForgeExec: PR Review Checklist

**Use this checklist to review all ForgeExec pull requests.**

This checklist mirrors the constraints in the Claude Bootstrap Message v1.2.1. A PR must pass **ALL** checks to be merged.

---

## Review Protocol

1. **Clone the PR branch locally**
2. **Work through each section below sequentially**
3. **Mark each item as PASS or FAIL**
4. **If ANY item fails, reject the PR immediately with the failure reason**
5. **Do not request changes - reject and require resubmission**

---

## Section 1: Zone Compliance

**Check that the PR does not violate file zone boundaries.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No modifications to `/kernel-client/interface.ts` | ☐ | |
| No new files in `/utils/**/*` | ☐ | |
| No new files in `/helpers/**/*` | ☐ | |
| No new files in `/shared/**/*` | ☐ | |
| No new files in `/common/**/*` | ☐ | |
| No new files in `/lib/**/*` | ☐ | |
| All new files are in `/executor/`, `/adapters/`, or `/verticals/` only | ☐ | |

**If any item fails:** REJECT - "Zone boundary violation"

---

## Section 2: State Immutability

**Check that state is never mutated.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| All state parameters are typed as `Readonly<State>` | ☐ | |
| No direct property assignments to state objects (e.g., `state.field = value`) | ☐ | |
| All state transitions return new state objects | ☐ | |
| No use of mutating array methods on state arrays (`.push()`, `.splice()`, etc.) | ☐ | |
| No use of mutating object methods (e.g., `Object.assign(state, ...)`) | ☐ | |

**If any item fails:** REJECT - "State mutation detected"

---

## Section 3: Event & Output Immutability

**Check that events and outputs are never mutated.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No property assignments to event objects | ☐ | |
| No property assignments to output payloads | ☐ | |
| No enrichment, annotation, or metadata addition to events | ☐ | |
| Events and outputs are passed through unchanged | ☐ | |

**If any item fails:** REJECT - "Event/output mutation detected"

---

## Section 4: No Derived State

**Check that execution logic does not compute or cache derived values.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No computed fields (e.g., `isComplete = a && b`) in execution logic | ☐ | |
| No cached values or memoization in executor | ☐ | |
| No derived flags or inferred state | ☐ | |
| All state values are explicitly provided, not calculated | ☐ | |

**If any item fails:** REJECT - "Derived state in execution logic"

---

## Section 5: Adapter Purity

**Check that adapters are pure side-effect sinks with no logic.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No conditional statements (`if`, `switch`, `?:`) in adapters | ☐ | |
| No loops (`for`, `while`, `.map()`, `.filter()`) in adapters | ☐ | |
| No transformations or data manipulation in adapters | ☐ | |
| Adapters only call external services with provided payloads | ☐ | |

**If any item fails:** REJECT - "Logic detected in adapter"

---

## Section 6: No Abstractions

**Check that no new abstractions are introduced.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No new base classes | ☐ | |
| No new utility functions | ☐ | |
| No new helper functions | ☐ | |
| No new shared libraries or modules | ☐ | |
| No new frameworks or patterns | ☐ | |

**If any item fails:** REJECT - "Abstraction introduced"

---

## Section 7: Import Boundaries

**Check that imports do not cross zone boundaries.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Executor files only import from `/executor/` or `/kernel-client/interface.ts` | ☐ | |
| Adapter files only import from `/adapters/` (same directory) or external packages | ☐ | |
| No imports from forbidden zones (`/utils/`, `/helpers/`, etc.) | ☐ | |
| No imports from Primus Kernel beyond `/kernel-client/interface.ts` | ☐ | |
| Verticals only import from `/verticals/` (same vertical), `/executor/` (types), `/adapters/` (registry), `/kernel-client/` | ☐ | |

**If any item fails:** REJECT - "Import boundary violation"

---

## Section 8: Determinism

**Check that execution logic is deterministic.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No use of `Date.now()` in executor or state logic | ☐ | |
| No use of `new Date()` in executor or state logic | ☐ | |
| No use of `Math.random()` in executor or state logic | ☐ | |
| No use of `crypto.randomUUID()` or similar in executor or state logic | ☐ | |
| Timestamps/UUIDs only generated in adapters if required by external systems | ☐ | |

**If any item fails:** REJECT - "Nondeterminism in execution logic"

---

## Section 9: IO Isolation

**Check that IO and network calls only occur in adapters.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No filesystem operations in executor or state logic | ☐ | |
| No network calls in executor or state logic | ☐ | |
| No database calls in executor or state logic | ☐ | |
| No external service calls in executor or state logic | ☐ | |
| All IO confined to `/adapters/` only | ☐ | |

**If any item fails:** REJECT - "IO in execution logic"

---

## Section 10: Error Handling

**Check that errors are explicit and never swallowed.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No empty `catch` blocks | ☐ | |
| No `catch` blocks that return partial success | ☐ | |
| All errors are thrown or returned explicitly | ☐ | |
| No silent failures or ignored errors | ☐ | |

**If any item fails:** REJECT - "Error swallowing detected"

---

## Section 11: Business Logic Placement

**Check that business logic only exists in state tables, not code paths.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No business rules in executor functions | ☐ | |
| No policy decisions in adapters | ☐ | |
| All business logic is table-driven (state machine tables) | ☐ | |
| No "smart" behavior in execution code | ☐ | |

**If any item fails:** REJECT - "Business logic outside state tables"

---

## Section 12: Documentation & Comments

**Check that documentation follows constraints.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No "why" comments explaining architecture rationale | ☐ | |
| Comments only mark forbidden zones or interface contracts | ☐ | |
| No new README files unless explicitly requested | ☐ | |
| No architecture documentation files | ☐ | |

**If any item fails:** REJECT - "Inappropriate documentation"

---

## Section 13: Naming & Stability

**Check that concepts, files, and types are not renamed without authorization.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| No renamed files from existing codebase | ☐ | |
| No renamed types from existing interfaces | ☐ | |
| No "clarified" or "improved" naming | ☐ | |
| All names match existing conventions | ☐ | |

**If any item fails:** REJECT - "Unauthorized renaming"

---

## Section 14: Type Compliance

**Check that all types satisfy existing interfaces.**

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| All new types implement existing interface signatures | ☐ | |
| No weakened types (e.g., changing `string` to `any`) | ☐ | |
| No invented types outside interface requirements | ☐ | |
| TypeScript compilation passes with no errors | ☐ | |
| `npm run validate` passes (type check + architecture validation) | ☐ | |

**If any item fails:** REJECT - "Type compliance violation"

---

## Final Approval Gate

**ALL sections above must PASS.**

| Final Check | Pass/Fail |
|-------------|-----------|
| All 14 sections passed | ☐ |
| No architectural violations detected | ☐ |
| Code compiles and executes | ☐ |
| `npm run validate` passes | ☐ |
| PR author has acknowledged constraints | ☐ |

---

## Rejection Protocol

**If ANY check fails:**

1. **Reject the PR immediately**
2. **Provide the section name and specific failure reason**
3. **Do NOT request changes - require full resubmission**
4. **Reference the Master Claude Prompt v1.2.1**

**Example rejection message:**
```
REJECTED - State mutation detected (Section 2)

Violation: Direct property assignment to state object in executor.ts:45
`state.status = 'completed'`

This violates the immutability constraint. State transitions must return new state objects.

Please review the Master Claude Prompt v1.2.1 and resubmit.
```

---

## Approval Protocol

**If ALL checks pass:**

1. **Mark PR as APPROVED**
2. **Add comment: "ForgeExec constraints verified - approved for merge"**
3. **Merge to main**

---

**Version:** v1.2.1 (mirrors Bootstrap v1.2.1)
**Status:** LOCKED

---

**This checklist is:**
- Mechanical (no interpretation required)
- Binary (pass/fail only, no gray areas)
- Complete (covers all v1.2.1 constraints)
- Scalable (works for humans, LLMs, or CI automation)
