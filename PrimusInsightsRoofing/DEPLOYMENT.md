# PRIMUS HOME PRO - Deployment & Marketing Checklist

Complete guide to deploying your AI-first CRM and acquiring your first 10 customers.

---

## 🚀 Phase 1: Stripe Configuration (30 minutes)

### Step 1: Create Stripe Products

1. **Go to:** https://dashboard.stripe.com/products
2. **Create Product #1: Pro Plan**
   - Name: `Primus Home Pro - Pro`
   - Price: `$49/month` (recurring)
   - Copy the **Price ID** (starts with `price_...`)
3. **Create Product #2: Agency Plan**
   - Name: `Primus Home Pro - Agency`
   - Price: `$149/month` (recurring)
   - Copy the **Price ID** (starts with `price_...`)

### Step 2: Get Stripe Keys

1. **Get API Keys:** https://dashboard.stripe.com/apikeys
   - Copy **Publishable key** (`pk_test_...` or `pk_live_...`)
   - Copy **Secret key** (`sk_test_...` or `sk_live_...`)

### Step 3: Configure Webhook

1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Add endpoint:** `https://yourdomain.com/api/webhooks/stripe`
3. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Copy Webhook Secret** (`whsec_...`)

---

## 🌐 Phase 2: Vercel Deployment (15 minutes)

### Step 1: Connect Repository

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`

### Step 2: Environment Variables

Add these to Vercel → Settings → Environment Variables:

```env
# Database (Vercel Postgres)
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PRICE_AGENCY="price_..."

# App URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Twilio (Optional - for SMS)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Resend (Optional - for email)
RESEND_API_KEY="re_..."

# Cron Security
CRON_SECRET="your-random-secret-here"
```

### Step 3: Deploy

1. Click **Deploy**
2. Wait for build to complete (~3-5 minutes)
3. Visit your production URL

---

## 🗄️ Phase 3: Database Setup (10 minutes)

### Option A: Vercel Postgres (Recommended)

1. Go to Vercel dashboard → Storage → Create Database
2. Select **Postgres**
3. Copy connection string
4. Update `DATABASE_URL` in environment variables
5. Run migrations:
   ```bash
   cd frontend
   npx prisma migrate deploy
   ```

### Option B: Neon, Supabase, or Railway

1. Create database on your preferred platform
2. Copy connection string
3. Update `DATABASE_URL` in environment variables
4. Run migrations as above

### Seed Default Automations

```bash
npx ts-node prisma/seed-automations.ts
```

---

## 🔐 Phase 4: Clerk Authentication (10 minutes)

1. **Go to:** https://dashboard.clerk.com
2. **Create Application:**
   - Name: `Primus Home Pro`
   - Sign-in options: Email + Google (recommended)
3. **Configure Redirect URLs:**
   - Sign-in: `https://yourdomain.com/dashboard`
   - Sign-up: `https://yourdomain.com/dashboard`
   - After sign-out: `https://yourdomain.com`
4. **Set up Webhook:**
   - Endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`
5. **Copy Keys:**
   - Publishable Key
   - Secret Key
   - Webhook Secret

---

## 🎨 Phase 5: Domain & Branding (30 minutes)

### Custom Domain

1. **Vercel Dashboard** → Settings → Domains
2. Add your domain (e.g., `primushomepro.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (~5-10 minutes)

### Update Environment

```env
NEXT_PUBLIC_APP_URL="https://primushomepro.com"
```

### Branding Customization

**Files to update:**
- `app/layout.tsx` - Update metadata (title, description)
- `components/marketing/*` - Update hero copy
- `public/` - Add your logo (replace placeholders)

---

## 🧪 Phase 6: Testing Checklist

Before launching, test these critical paths:

### ✅ Authentication Flow
- [ ] Sign up with email
- [ ] Sign in with Google
- [ ] User record created in database
- [ ] Redirect to dashboard works

### ✅ Lead Capture
- [ ] Submit form at `/templates/simple`
- [ ] Lead appears in `/dashboard/leads`
- [ ] AI analysis scores lead
- [ ] Automation triggers (check console logs)

### ✅ Automation Engine
- [ ] Visit `/dashboard/automations`
- [ ] Default automations are listed
- [ ] Toggle automation on/off
- [ ] Edit automation settings
- [ ] Test trigger: Create lead → Check for email/SMS

### ✅ Billing Flow
- [ ] Visit `/dashboard/billing`
- [ ] Click "Upgrade" on Pro plan
- [ ] Complete Stripe checkout (use test card: `4242 4242 4242 4242`)
- [ ] Redirect back to dashboard
- [ ] User plan updated to "pro"
- [ ] Webhook received (check Stripe dashboard)

### ✅ Cron Jobs
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/process
```
- [ ] Returns `{ success: true, processed: X }`

---

## 📈 Phase 7: First 10 Customers (2 weeks)

### Week 1: Launch to Warm Audience

**Day 1-2: Beta Launch**
1. Email your network (friends, family, past clients)
2. Offer: "Free Pro plan for 3 months" in exchange for feedback
3. LinkedIn post: "Just launched Primus Home Pro..."
4. Twitter/X thread: Product journey + demo video

**Day 3-4: Content Marketing**
1. Write blog post: "How I Built an AI-First CRM in [X] Days"
2. Share on:
   - Hacker News (Show HN)
   - Reddit (r/SaaS, r/entrepreneur)
   - IndieHackers
3. Create demo video (Loom or similar)

**Day 5-7: Direct Outreach**
1. Identify 50 home service businesses (roofing, HVAC, solar)
2. Send personalized emails:
   ```
   Subject: Automate your lead follow-up (built for roofers)

   Hey [Name],

   I built Primus Home Pro specifically for home service pros who lose leads
   to slow follow-up.

   It uses AI to:
   - Score every lead instantly
   - Auto-reply within seconds
   - Never miss a hot prospect

   Would you like a free demo?

   [Your Name]
   ```

### Week 2: Paid Acquisition Test

**Google Ads ($200 budget)**
- Keywords: "roofing CRM", "lead management software", "contractor CRM"
- Landing page: `/templates/simple` (your own lead capture!)
- Track conversions in Google Analytics

**Facebook Ads ($200 budget)**
- Audience: Home service business owners, 35-55, USA
- Ad creative: Before/After (manual follow-up vs. automated)
- Lead form: Direct to sign-up

### Pricing Strategy for First 10

**Offer #1: Early Adopter**
- 50% off for life ($24.50/mo instead of $49)
- Limited to first 10 customers
- Creates urgency

**Offer #2: Annual Prepay**
- $490/year (2 months free)
- Locks in revenue
- Reduces churn

---

## 📊 Phase 8: Monitoring & Iteration

### Analytics Setup

**Vercel Analytics** (Built-in)
- Enable in Vercel dashboard
- Track: Page views, conversions, Core Web Vitals

**Stripe Dashboard**
- Monitor: MRR, churn rate, failed payments

**Database Metrics**
Query your database weekly:
```sql
-- Total users
SELECT COUNT(*) FROM "User";

-- Active subscriptions
SELECT "subscriptionPlan", COUNT(*)
FROM "User"
WHERE "subscriptionStatus" = 'active'
GROUP BY "subscriptionPlan";

-- Leads created this week
SELECT COUNT(*) FROM "Lead"
WHERE "createdAt" > NOW() - INTERVAL '7 days';
```

### Key Metrics to Track

**Week 1-2:**
- Sign-ups: Goal 20+
- Activated users (created ≥1 lead): Goal 10+
- Paid conversions: Goal 3+

**Month 1:**
- MRR: Goal $500+
- Churn: Goal <10%
- NPS: Goal 40+

---

## 🆘 Troubleshooting

### Build Fails on Vercel

**Error:** "Module not found"
```bash
# Fix: Check package.json dependencies
npm install
```

**Error:** "Prisma Client not generated"
```bash
# Add to package.json scripts:
"postinstall": "prisma generate"
```

### Webhooks Not Working

**Stripe webhook fails:**
1. Check webhook secret matches
2. Verify endpoint is public (not `/api/webhooks/[id]`)
3. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

**Clerk webhook fails:**
1. Check `CLERK_WEBHOOK_SECRET` is set
2. Verify endpoint is `POST /api/webhooks/clerk`

### Database Connection Issues

**Error:** "Can't reach database server"
1. Check `DATABASE_URL` format
2. Verify database is public (or whitelist Vercel IPs)
3. Test connection:
   ```bash
   npx prisma db pull
   ```

---

## ✅ Pre-Launch Final Checklist

Before announcing to the world:

### Code
- [ ] All environment variables set in Vercel
- [ ] Database migrations deployed
- [ ] Seed data loaded (default automations)
- [ ] Stripe test mode → Live mode
- [ ] Remove console.log statements
- [ ] Error tracking enabled (Sentry recommended)

### Legal
- [ ] Privacy policy added (`/privacy`)
- [ ] Terms of service added (`/terms`)
- [ ] Cookie consent (if EU customers)

### Marketing
- [ ] Landing page copy reviewed
- [ ] Demo video recorded
- [ ] Social media accounts created
- [ ] Email for support@ set up

### Business
- [ ] Stripe account fully verified
- [ ] Business bank account linked
- [ ] Refund policy defined
- [ ] Support process documented

---

## 🎯 Success Criteria

**Week 1:**
- ✅ 5+ sign-ups
- ✅ 1+ paid customer
- ✅ 0 critical bugs

**Month 1:**
- ✅ $500+ MRR
- ✅ 10+ active users
- ✅ 3+ paid customers

**Month 3:**
- ✅ $2,000+ MRR
- ✅ 50+ active users
- ✅ <5% churn rate

---

## 🚀 You're Ready to Launch!

**Next Steps:**
1. Complete Stripe setup (30 min)
2. Deploy to Vercel (15 min)
3. Run tests (30 min)
4. Launch to 10 friends (Day 1)
5. Post on social media (Day 1)
6. Start customer conversations (Week 1)

**Remember:** Your first customers are buying YOU, not your product.
Focus on solving their specific problems, not feature parity with competitors.

**Good luck! 🎉**
