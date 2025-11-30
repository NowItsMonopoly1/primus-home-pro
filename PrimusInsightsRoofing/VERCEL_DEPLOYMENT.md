# VERCEL DEPLOYMENT GUIDE - Production Ready

Complete step-by-step guide to deploy Primus Home Pro to production.

**Prerequisites:** Local tests passed OR you're confident to deploy directly.

---

## 🎯 Deployment Strategy

**Approach:** Deploy with Stripe test mode first → Validate → Switch to live mode → Launch

**Timeline:**
- Database setup: 10 minutes
- Vercel configuration: 15 minutes
- First deployment: 5 minutes
- Testing: 15 minutes
- Switch to live mode: 5 minutes

**Total:** ~50 minutes to production

---

## ✅ Phase 1: Database Setup (10 minutes)

### Option A: Vercel Postgres (Recommended)

1. **Go to:** https://vercel.com/dashboard
2. **Navigate to:** Storage → Create Database
3. **Select:** Postgres
4. **Name:** `primus-home-pro-db`
5. **Region:** Choose closest to your target users (e.g., `us-east-1`)
6. **Click:** Create

**Copy these values:**
- `POSTGRES_URL` → Use as `DATABASE_URL`
- Save other connection strings for reference

### Option B: Neon (Free Tier Available)

1. **Go to:** https://neon.tech
2. **Create:** New Project → `primus-home-pro`
3. **Region:** Choose closest region
4. **Copy:** Connection string
5. **Format:** `postgresql://user:password@host/database?sslmode=require`

### Option C: Supabase

1. **Go to:** https://supabase.com/dashboard
2. **Create:** New Project → `primus-home-pro`
3. **Settings → Database:** Copy connection string
4. **Format:** Direct connection (not pooler for migrations)

---

## ✅ Phase 2: Vercel Project Setup (15 minutes)

### Step 1: Connect GitHub Repository

1. **Go to:** https://vercel.com/new
2. **Import Git Repository:**
   - Select your GitHub account
   - Find: `PrimusInsightsRoofing` repository
   - Click **Import**

### Step 2: Configure Build Settings

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `frontend`

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

**Node Version:** 18.x or 20.x

### Step 3: Add Environment Variables

**CRITICAL:** Add ALL of these before first deployment.

Click **Environment Variables** and add:

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# ============================================================================
# CLERK AUTHENTICATION
# ============================================================================
# Get from: https://dashboard.clerk.com
# IMPORTANT: Use PRODUCTION keys, not test keys!
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# ============================================================================
# ANTHROPIC AI
# ============================================================================
ANTHROPIC_API_KEY=sk-ant-...

# ============================================================================
# STRIPE - Start with TEST mode
# ============================================================================
# Use sk_test_ for first deployment, switch to sk_live_ after testing
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (same for test and live)
STRIPE_PRICE_PRO=price_1SZ1ii05lmCbSdUDS1cX1OW8
STRIPE_PRICE_AGENCY=price_1SZ1l005lmCbSdUDzc20PR2E

# ============================================================================
# APPLICATION
# ============================================================================
# Will be your Vercel domain initially, then custom domain
NEXT_PUBLIC_APP_URL=https://primus-home-pro.vercel.app

# ============================================================================
# CRON SECURITY
# ============================================================================
# Generate a random secret: openssl rand -base64 32
CRON_SECRET=your-production-secret-here

# ============================================================================
# OPTIONAL: Email & SMS
# ============================================================================
# TWILIO_ACCOUNT_SID=AC...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=+1...
# RESEND_API_KEY=re_...
```

**Environment:** Select "Production" for all variables

### Step 4: Deploy

Click **Deploy**

**Expected:**
- Build starts (~2-3 minutes)
- May fail on first deploy (database not migrated yet) - this is OK
- Note your deployment URL: `https://primus-home-pro-xyz.vercel.app`

---

## ✅ Phase 3: Run Database Migration (5 minutes)

### Method A: Using Vercel CLI (Recommended)

Install Vercel CLI if you haven't:

```powershell
npm install -g vercel
```

Login and link project:

```powershell
cd "c:\Users\Donte\Downloads\Primus insights roofing\PrimusInsightsRoofing\frontend"
vercel login
vercel link
```

Pull environment variables:

```powershell
vercel env pull .env.production
```

Run migration:

```powershell
npx prisma migrate deploy
```

### Method B: Add to package.json

Add to `package.json` scripts:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma migrate deploy && next build"
  }
}
```

**Commit and push** - Vercel will auto-deploy and run migrations.

### Verify Migration

Check Prisma Studio with production database:

```powershell
# Update .env to use production DATABASE_URL
npx prisma studio
```

Or use your database provider's UI (Vercel Dashboard, Neon Console, etc.)

**Verify tables exist:**
- User
- Lead
- LeadEvent
- Automation

---

## ✅ Phase 4: Configure Stripe Webhook (10 minutes)

### Step 1: Get Production URL

Your webhook URL will be:
```
https://primus-home-pro-xyz.vercel.app/api/webhooks/stripe
```

Or with custom domain:
```
https://primushomepro.com/api/webhooks/stripe
```

### Step 2: Create Webhook in Stripe Dashboard

1. **Go to:** https://dashboard.stripe.com/test/webhooks (test mode first)
2. **Click:** Add endpoint
3. **Endpoint URL:** `https://your-domain.vercel.app/api/webhooks/stripe`
4. **Events to send:** Select these:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. **Click:** Add endpoint

### Step 3: Get Webhook Secret

After creating webhook:
1. Click on the webhook
2. **Reveal** the signing secret (starts with `whsec_...`)
3. **Copy** it

### Step 4: Update Environment Variable

1. **Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Find:** `STRIPE_WEBHOOK_SECRET`
3. **Edit** and paste the new secret
4. **Redeploy:** Vercel will auto-redeploy

---

## ✅ Phase 5: Configure Clerk Production (10 minutes)

### Step 1: Set Up Production Instance

1. **Go to:** https://dashboard.clerk.com
2. **Switch to:** Production environment (top right)
3. **Configure:**
   - Sign-in options: Email + Google (recommended)
   - Appearance: Match your brand
   - Paths:
     - Sign-in URL: `/sign-in`
     - Sign-up URL: `/sign-up`
     - After sign-in: `/dashboard`
     - After sign-up: `/dashboard`

### Step 2: Update Allowed Domains

**Go to:** Domains
**Add:**
- `primus-home-pro-xyz.vercel.app`
- `primushomepro.com` (your custom domain)

### Step 3: Configure Webhook

**Go to:** Webhooks → Add Endpoint

**Endpoint URL:**
```
https://your-domain.vercel.app/api/webhooks/clerk
```

**Events:**
- `user.created`
- `user.updated`
- `user.deleted`

**Copy:** Webhook signing secret

**Update Vercel:** Add/update `CLERK_WEBHOOK_SECRET` environment variable

---

## ✅ Phase 6: Seed Default Automations (5 minutes)

### Option A: Via Vercel CLI

```powershell
# From your local machine
vercel env pull .env.production
npx ts-node prisma/seed-automations.ts
```

### Option B: Manual in Prisma Studio

Connect to production database and manually create 3 automations (copy from seed file).

### Verify

Visit: `https://your-domain.vercel.app/dashboard/automations`

Should see:
- Welcome New Leads
- Follow-up Stale Leads
- High Intent - Send Calendar

---

## ✅ Phase 7: Custom Domain Setup (Optional - 15 minutes)

### Step 1: Add Domain in Vercel

1. **Go to:** Project → Settings → Domains
2. **Add:** `primushomepro.com`
3. **Add:** `www.primushomepro.com` (recommended)

Vercel will show DNS records to configure.

### Step 2: Update DNS Records

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)

**Add these records:**

For apex domain (`primushomepro.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

For www subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for DNS Propagation

- Usually takes 5-30 minutes
- Vercel will auto-provision SSL certificate
- Check status in Vercel Dashboard

### Step 4: Update Environment Variables

Update `NEXT_PUBLIC_APP_URL`:
```
NEXT_PUBLIC_APP_URL=https://primushomepro.com
```

Also update in Clerk and Stripe redirect URLs.

---

## ✅ Phase 8: Production Testing (15 minutes)

### Test Checklist

**Visit your production URL** and test:

#### Test 1: Homepage
- [ ] Loads correctly
- [ ] No console errors
- [ ] Links work

#### Test 2: Authentication
- [ ] Sign up with real email
- [ ] Receive verification email
- [ ] Redirected to dashboard
- [ ] User created in database

#### Test 3: Lead Capture
- [ ] Visit `/templates/simple`
- [ ] Submit test lead
- [ ] See in dashboard
- [ ] AI analysis works
- [ ] Events logged

#### Test 4: Billing (Test Mode)
- [ ] Visit `/dashboard/billing`
- [ ] Click Upgrade to Pro
- [ ] Stripe checkout opens
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Redirected back
- [ ] Check webhook received in Stripe Dashboard
- [ ] User plan updated to "pro"

#### Test 5: Webhook Verification
**Go to:** Stripe Dashboard → Webhooks → Your endpoint

Check recent events:
- [ ] `checkout.session.completed` - Status: Succeeded
- [ ] Response: 200 OK

#### Test 6: Automation
- [ ] Create another lead
- [ ] Check terminal logs (Vercel logs)
- [ ] Verify automation triggered

---

## ✅ Phase 9: Switch to Live Mode (5 minutes)

**ONLY after all tests pass!**

### Step 1: Update Stripe Keys

1. **Go to:** Vercel → Settings → Environment Variables
2. **Update these variables:**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

### Step 2: Create Live Webhook

1. **Go to:** Stripe Dashboard (switch to Live mode)
2. **Webhooks → Add endpoint**
3. **URL:** `https://primushomepro.com/api/webhooks/stripe`
4. **Events:** Same as test mode
5. **Copy webhook secret**
6. **Update:** `STRIPE_WEBHOOK_SECRET` in Vercel

### Step 3: Redeploy

Vercel will auto-redeploy when you update environment variables.

### Step 4: Verify Live Mode

1. Visit `/dashboard/billing`
2. Prices should match ($48, $148)
3. Click upgrade
4. **Use real card** (will charge!)
5. Verify subscription works

---

## ✅ Phase 10: Enable Cron Jobs (Optional)

### Configure vercel.json

Create `vercel.json` in frontend folder:

```json
{
  "crons": [
    {
      "path": "/api/cron/process",
      "schedule": "0 * * * *"
    }
  ]
}
```

**Schedule:** Every hour (0 * * * *)

**Commit and push** - Vercel will enable cron automatically.

### Verify Cron

Check Vercel Dashboard → Cron Jobs → Should see your job listed

---

## ✅ Post-Deployment Checklist

### Required

- [ ] All tests passed
- [ ] Stripe in live mode
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Webhooks working (check Stripe Dashboard)
- [ ] User can sign up
- [ ] User can upgrade
- [ ] Subscription updates correctly

### Recommended

- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking (Sentry)
- [ ] Add privacy policy page
- [ ] Add terms of service page
- [ ] Set up email notifications
- [ ] Create admin user
- [ ] Test on mobile devices

### Nice to Have

- [ ] Configure Twilio for SMS
- [ ] Configure Resend for email
- [ ] Set up Vercel Edge Config
- [ ] Enable Vercel Preview Deployments
- [ ] Add Google Analytics

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`

**Fix:**
```powershell
# Verify all dependencies in package.json
cd frontend
npm install
```

**Error:** `Prisma Client not found`

**Fix:** Add to `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Webhook Fails

**Error:** `Webhook signature verification failed`

**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Check endpoint URL is exact match
3. Ensure no trailing slash in URL

### Database Connection Failed

**Error:** `Can't reach database server`

**Fix:**
1. Check `DATABASE_URL` format
2. Ensure database allows connections from Vercel IPs
3. Verify SSL mode: `?sslmode=require`

### Clerk Auth Issues

**Error:** `Missing publishableKey`

**Fix:**
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
2. Must start with `pk_live_` for production
3. Redeploy after adding

---

## 📊 Monitoring Production

### Vercel Dashboard

**Go to:** Project → Analytics

Monitor:
- Requests per day
- Error rate
- Response time
- Top pages

### Stripe Dashboard

Monitor:
- Daily MRR
- New subscriptions
- Churn rate
- Failed payments

### Database Metrics

Check your database provider:
- Connection count
- Query performance
- Storage usage

---

## 🎯 Success Metrics (First Week)

### Day 1
- [ ] 1+ sign-up
- [ ] 0 critical errors
- [ ] All webhooks working

### Week 1
- [ ] 5+ sign-ups
- [ ] 1+ paid subscription
- [ ] <5% error rate

### Week 2
- [ ] 10+ active users
- [ ] 2+ paid subscriptions ($96+ MRR)
- [ ] 0 unresolved bugs

---

## 🚀 You're Live!

**Congratulations!** Primus Home Pro is now in production.

**Next steps:**
1. Monitor errors closely (first 48 hours)
2. Invite beta users
3. Collect feedback
4. Iterate quickly

**Marketing:**
1. Post on LinkedIn
2. Submit to Product Hunt
3. Share on Twitter/X
4. Email your network

**Remember:** Your first customers are buying YOU, not your product. Focus on solving their problems.

---

## 📞 Support Resources

**Vercel:** https://vercel.com/docs
**Stripe:** https://stripe.com/docs
**Clerk:** https://clerk.com/docs
**Prisma:** https://www.prisma.io/docs

**Community:**
- Vercel Discord
- Stripe Community
- Next.js Discord

---

**Ready to deploy? Follow the steps above sequentially. Report any errors immediately!** 🎉
