# Primus Insights Roofing - Landing Page

![Primus OS](https://img.shields.io/badge/Powered%20by-Primus%20OS-34d399)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

A dark mode, high-tech landing page for Primus Insights Roofing's AI-powered lead automation system.

## Design Philosophy

**Primus OS Aesthetic**: Command center vibes with dark mode, emerald accents, and terminal-inspired UI elements. No stock photos—pure software interface design.

### Color Palette
- Background: `slate-950` (Deep dark blue/grey)
- Surface/Cards: `slate-900/70` (Structured with borders)
- Primary Accent: `emerald-400` / `emerald-500` (System active glow)
- Text: `slate-100` / `slate-400` (Primary/secondary)
- Borders: `slate-800` (Structural definition)

## Features

### Lead Form Component
- **State Management**: Idle → Submitting → Success/Error states
- **API Integration**: Direct POST to Render backend
- **Success UI**: "System Log" style confirmation with Lead ID
- **Loading States**: Spinner and disabled inputs during submission

### Mock Chat UI
- Live conversation example showing AI interaction
- Real-time appearance with subtle animations
- Demonstrates the booking flow visually

### Responsive Design
- Mobile-first approach
- Desktop: Split screen (value prop + sticky form)
- Tablet: Stacked layout with optimized spacing

## Tech Stack

- **Framework**: Next.js 15.1 (App Router)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Install Dependencies

```bash
cd primus-landing
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
primus-landing/
├── app/
│   ├── components/
│   │   ├── Header.tsx       # Top navigation with logo
│   │   ├── LeadForm.tsx     # Interactive lead capture form
│   │   └── MockChat.tsx     # Demo conversation UI
│   ├── globals.css          # Global styles + Tailwind
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main landing page
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind + Primus OS theme
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Component API

### `<LeadForm />`
Client-side component with state machine logic.

**States:**
- `idle`: Ready for input
- `submitting`: API request in progress
- `success`: Lead captured, shows system log
- `error`: Error message displayed

**API Endpoint:**
```
POST https://primus-insights-roofing.onrender.com/lead
Body: { "name": string, "phone": string, "message": string }
Response: { "status": "ok", "leadId": number }
```

### `<MockChat />`
Pure presentational component showing example AI conversation.

**Features:**
- User/AI message bubbles
- Timestamp labels (font-mono)
- Booking confirmation highlight
- Conversation metadata footer

### `<Header />`
Sticky navigation header.

**Elements:**
- PI logo (emerald circle badge)
- Product name + version
- "Powered by Primus OS" status

## Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow prompts to link your GitHub repo. Vercel will auto-deploy on every push to `main`.

**Environment Variables**: None required (API endpoint is hardcoded for MVP)

### Custom Domain Setup

1. In Vercel dashboard: Settings → Domains
2. Add custom domain: `primusinsights.com`
3. Configure DNS records as instructed

## Customization

### Change API Endpoint

Edit `app/components/LeadForm.tsx`:

```typescript
const response = await fetch(
  "https://YOUR-CUSTOM-BACKEND.com/lead",
  // ...
);
```

### Update Color Theme

Edit `tailwind.config.ts`:

```typescript
'primus': {
  'accent': '#YOUR_COLOR', // Change emerald accent
  // ...
}
```

### Modify Copy/Text

All text is in `app/page.tsx` and component files. Search and replace as needed.

## Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <2.5s

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Proprietary - © 2025 Primus Insights Roofing

## Support

For technical questions or deployment help, contact the development team.

---

**Built with Primus OS** • v1.0
