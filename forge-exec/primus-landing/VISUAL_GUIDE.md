# Visual Design Guide - Primus Insights Landing Page

## Color Reference

### Primus OS Color Palette

```
┌─────────────────────────────────────────────┐
│ Background (slate-950)                      │
│ #020617                                     │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Surface (slate-900/70)                      │
│ #0f172a @ 70% opacity                       │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Accent (emerald-400)                        │
│ #34d399                                     │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Accent Bright (emerald-500)                 │
│ #10b981                                     │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Text Primary (slate-100)                    │
│ #f1f5f9                                     │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Text Muted (slate-400)                      │
│ #94a3b8                                     │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Borders (slate-800)                         │
│ #1e293b                                     │
│ ███████████████████████████████████████     │
└─────────────────────────────────────────────┘
```

---

## Component Previews (ASCII Mockup)

### Header Component
```
┌──────────────────────────────────────────────────────────────┐
│  ╭───╮  Primus Insights Roofing        ⚡ Powered by Primus │
│  │PI │  v1.0                                         OS      │
│  ╰───╯                                                       │
└──────────────────────────────────────────────────────────────┘
```

**Colors**:
- Background: `slate-950/50` with backdrop-blur
- Logo circle: `emerald-500/20` background, `emerald-500/30` border
- Text "PI": `emerald-400`
- Product name: `slate-100`
- Version: `slate-500` font-mono
- Status: `emerald-400` with pulse animation

---

### Lead Form (Idle State)
```
┌─────────────────────────────────────────────────┐
│  Request Roof Inspection                        │
│  AUTOMATED LEAD CAPTURE                         │
│                                                 │
│  Name                                           │
│  ┌─────────────────────────────────────────┐   │
│  │ John Smith                              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Phone Number                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ +1 (555) 123-4567                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Roofing Issue                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ I need a roof inspection after storm... │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │     Request roof inspection             │   │ ← Emerald bg
│  └─────────────────────────────────────────┘   │
│  ───────────────────────────────────────────   │
│  SYSTEM STATUS: OPERATIONAL                     │ ← Emerald text
└─────────────────────────────────────────────────┘
```

**Colors**:
- Container: `slate-900/70` background, `slate-800` border
- Labels: `slate-300`
- Inputs: `slate-950` background, `slate-800` border
- Focus: `emerald-500/50` ring
- Button: `emerald-500` background, `slate-950` text
- Status: `emerald-400`

---

### Lead Form (Success State)
```
┌─────────────────────────────────────────────────┐
│  ✓  Lead Captured                               │ ← Emerald
│                                                 │
│     LEAD_ID: #0000                              │ ← Mono
│     STATUS: SMS_DISPATCHING                     │
│     PHONE: +1 555 123 4567                      │
│                                                 │
│     ┌───────────────────────────────────────┐  │
│     │ ⌘ AI agent assigned. Homeowner will  │  │ ← Terminal
│     │   receive SMS within 10 seconds.     │  │
│     └───────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │     Submit another request              │   │ ← Slate bg
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Colors**:
- Container: `emerald-500/40` border, `slate-900/60` background
- Check icon: `emerald-400`
- Title: `emerald-400`
- Labels: `slate-500` mono
- Values: `slate-300` mono
- Terminal box: `slate-950/50` background, `slate-800` border

---

### Mock Chat Component
```
┌─────────────────────────────────────────────────┐
│  ╭──╮  Primus AI Agent                          │
│  │🤖│  ACTIVE                                    │ ← Emerald
│  ╰──╯                                            │
│  ────────────────────────────────────────────   │
│                                                 │
│  💬  I need a roof inspection. We had           │ ← User
│      storm damage last night.                   │
│      HOMEOWNER • 2:34 PM                        │
│                                                 │
│  🤖  Thanks for reaching out. I understand      │ ← AI
│      you need an inspection for storm damage.   │
│      To help you quickly, what's your           │
│      property address?                          │
│      PRIMUS AI • 2:34 PM                        │
│                                                 │
│  💬  123 Oak Street, Los Angeles                │
│      HOMEOWNER • 2:35 PM                        │
│                                                 │
│  🤖  Perfect. What's your availability for an   │
│      inspection? We can typically schedule      │
│      within 24-48 hours.                        │
│      PRIMUS AI • 2:35 PM                        │
│                                                 │
│  💬  Tomorrow afternoon works, around 2pm       │
│      HOMEOWNER • 2:36 PM                        │
│                                                 │
│  🤖  ✓ Appointment Confirmed                    │ ← Highlight
│      Inspection scheduled for tomorrow at       │
│      2:00 PM. You'll receive a confirmation...  │
│      PRIMUS AI • 2:36 PM • BOOKING_ID: #0247    │
│                                                 │
│  ────────────────────────────────────────────   │
│  CONVERSATION STATUS        BOOKED • 142s       │
└─────────────────────────────────────────────────┘
```

**Colors**:
- Container: `emerald-500/30` border, `slate-900/60` background
- Header: `slate-200` name, `emerald-400` status
- User messages: `slate-800` background
- AI messages: `emerald-500/10` gradient background, `emerald-500/30` border
- Booking confirmation: `emerald-500/20` background, `emerald-500/50` border
- Timestamps: `slate-500` (user), `emerald-400` (AI), font-mono

---

### Feature Pills (4-column grid)
```
┌──────────────────┬──────────────────┐
│ ⚡ Instant AI    │ ⏰ 24/7          │
│    responses     │    availability  │
└──────────────────┴──────────────────┘
┌──────────────────┬──────────────────┐
│ 👥 Human handoff │ ✓ Auto-booking   │
│    ready         │    flow          │
└──────────────────┴──────────────────┘
```

**Each pill**:
- Background: `slate-900/50`
- Border: `slate-800`
- Icon: `emerald-400`
- Text: `slate-300`
- Padding: `px-4 py-3`

---

### System Stats (3-column grid)
```
┌──────────┬──────────┬──────────┐
│  ~10s    │   24/7   │   95%    │
│ Response │  Avail-  │ Qualifi- │
│   Time   │  ability │  cation  │
└──────────┴──────────┴──────────┘
```

**Each stat**:
- Background: `slate-900/50`
- Border: `slate-800`
- Number: `emerald-400` font-mono text-2xl
- Label: `slate-500` uppercase text-xs

---

## Typography Hierarchy

```
H1 (Main Headline)
  Size: text-4xl sm:text-5xl lg:text-6xl
  Weight: font-bold
  Color: slate-100
  Accent: emerald-400 for key phrases

H2 (Section Titles)
  Size: text-2xl
  Weight: font-semibold
  Color: slate-100

H3 (Component Headers)
  Size: text-xl
  Weight: font-semibold
  Color: slate-100

Labels (Form/UI)
  Size: text-sm
  Weight: font-medium
  Color: slate-300

Body Text
  Size: text-base
  Color: slate-400

Small Text (Meta)
  Size: text-xs
  Weight: uppercase tracking-wide
  Color: slate-500
  Font: font-mono (for technical elements)
```

---

## Spacing System

```
Container Max Width: max-w-7xl (1280px)
Section Vertical: py-12 lg:py-20
Component Gap: gap-8 lg:gap-12
Card Padding: p-4 to p-6
Grid Gaps: gap-3 to gap-6
```

---

## Interactive States

### Button States
```
Default:    bg-emerald-500
Hover:      bg-emerald-600
Disabled:   bg-slate-700 cursor-not-allowed
Active:     (slight scale transform)
```

### Input States
```
Default:    bg-slate-950 border-slate-800
Focus:      ring-2 ring-emerald-500/50 border-emerald-500
Error:      border-red-500
Disabled:   opacity-50 cursor-not-allowed
```

---

## Animations

### Header Status Dot
```css
animate-pulse (emerald-400)
```

### Success Check Icon
```css
CheckCircle2 (emerald-400)
```

### Loading Spinner
```css
Loader2 with animate-spin
```

### AI Booking Bubble
```css
Pulsing emerald glow on confirmation
```

---

## Responsive Breakpoints

```
Mobile:     Default (< 640px)
Tablet:     sm: (640px)
Desktop:    lg: (1024px)
Wide:       xl: (1280px)
```

### Layout Changes
- **Mobile**: Single column, stacked
- **Tablet**: 2-column grids for features
- **Desktop**: Split screen (value prop | form)
- **Wide**: Increased padding, centered content

---

## Icon Usage

All icons from **Lucide React**:

- `Activity`: Header status indicator
- `Bot`: AI agent avatar
- `CheckCircle2`: Success states
- `Clock`: 24/7 availability
- `Loader2`: Loading spinner
- `MessageSquare`: User messages
- `Terminal`: System log indicator
- `Users`: Human handoff feature
- `Zap`: Instant response feature

**Style**: w-5 h-5 or w-6 h-6, color varies by context

---

## Browser Rendering

### Font Stack
```css
Sans-serif: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'...
Monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas
```

### Anti-aliasing
```css
-webkit-font-smoothing: antialiased
-moz-osx-font-smoothing: grayscale
```

---

## Dark Mode Only

This design is **dark mode exclusive**. No light mode toggle.

**Reasoning**:
- Matches "Primus OS" technical aesthetic
- Better for command center/dashboard feel
- Reduces eye strain for demo viewing
- Emerald accents pop more on dark background

---

## Accessibility

- All interactive elements have focus states
- Color contrast ratios meet WCAG AA
- Semantic HTML (header, main, footer)
- ARIA labels on icons (via Lucide)
- Keyboard navigation supported

---

**Preview URL** (after deployment): `https://your-project.vercel.app`

**Design Status**: ✅ Production Ready
