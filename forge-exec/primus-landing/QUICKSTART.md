# Quick Start - Primus Insights Landing Page

## 30-Second Setup

```bash
cd "c:\Users\Donte\Downloads\Primus insights roofing\primus-landing"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## What You'll See

### Desktop View
- **Left Column**: Value proposition, workflow, mock chat demo
- **Right Column**: Sticky lead form + system stats

### Mobile View
- Stacked layout
- Form appears after scrolling past value prop

---

## Test the Form

1. Fill in:
   - Name: "John Demo"
   - Phone: "+1 555 123 4567"
   - Message: "I need a roof inspection"

2. Click "Request roof inspection"

3. Form submits to: `https://primus-insights-roofing.onrender.com/lead`

4. Success state shows:
   ```
   ✓ Lead Captured
   LEAD_ID: #0000
   STATUS: SMS_DISPATCHING
   PHONE: +1 555 123 4567
   ```

---

## Deploy to Vercel (5 Minutes)

### Method 1: CLI
```bash
npm install -g vercel
vercel
```

### Method 2: GitHub + Vercel Dashboard
1. Push to GitHub
2. Import repo in Vercel
3. Set root directory: `primus-landing`
4. Deploy

**Result**: Live site at `https://your-project.vercel.app`

---

## File Structure

```
primus-landing/
├── app/
│   ├── components/
│   │   ├── Header.tsx        ← Logo + status
│   │   ├── LeadForm.tsx      ← Interactive form
│   │   └── MockChat.tsx      ← Demo conversation
│   ├── globals.css           ← Tailwind + custom styles
│   ├── layout.tsx            ← Root layout
│   └── page.tsx              ← Main landing page
├── package.json              ← Dependencies
├── tailwind.config.ts        ← Primus OS theme
└── README.md                 ← Full documentation
```

---

## Common Commands

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Build for production
npm start       # Run production build locally
npm run lint    # Check for code issues
```

---

## Customization Guide

### Change Backend URL

Edit `app/components/LeadForm.tsx` line 31:
```typescript
"https://YOUR-NEW-BACKEND.com/lead"
```

### Update Color Accent

Edit `tailwind.config.ts`:
```typescript
'accent': '#YOUR_COLOR',  // Default: #34d399 (emerald)
```

### Modify Copy

All text is in:
- `app/page.tsx` (main content)
- `app/components/*.tsx` (component-specific)

---

## Troubleshooting

### "Module not found" Error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use
```bash
# Kill the process or use different port
npm run dev -- -p 3001
```

### TypeScript Errors
```bash
npm run build  # Check for errors
```

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run dev server: `npm run dev`
3. ✅ Test form submission
4. ✅ Deploy to Vercel
5. ✅ Configure custom domain (optional)

---

**Need Help?**

- Full docs: [README.md](README.md)
- Deployment guide: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

---

**Ready to launch in under 5 minutes!**
