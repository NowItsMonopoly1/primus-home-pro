# PRIMUS HOME PRO - Setup Instructions

## Quick Start Guide

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

✅ Already complete

---

### Step 2: Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual values:

#### 🗄️ **Database Setup** (Choose ONE)

**Option A: Local Postgres (Development)**
```bash
# Run Prisma's local Postgres server
npx prisma dev
```
This will automatically populate your `DATABASE_URL`.

**Option B: Vercel Postgres (Production-Ready)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create a new Postgres database
3. Copy the `DATABASE_URL` connection string
4. Add to `.env.local`

**Option C: Existing Postgres Database**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/primus_home_pro"
```

---

#### 🔐 **Clerk Authentication**

1. Visit [clerk.com](https://clerk.com) and create an account
2. Create a new application named "Primus Home Pro"
3. Get your keys from the dashboard:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

4. **Configure Webhook** (Required for user sync):
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks/clerk` (dev) or `https://yourdomain.com/api/webhooks/clerk` (prod)
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret:
     ```env
     CLERK_WEBHOOK_SECRET=whsec_xxxxx
     ```

---

#### 🤖 **Anthropic Claude API**

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account and get your API key
3. Add to `.env.local`:
   ```env
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

---

#### 💳 **Stripe (Optional - for billing)**

1. Visit [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your test keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```
3. For webhooks (later):
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

---

#### 📱 **Twilio SMS**

1. Visit [twilio.com/console](https://twilio.com/console)
2. Get credentials:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
   ```

---

#### 📧 **Resend Email**

1. Visit [resend.com/api-keys](https://resend.com/api-keys)
2. Create API key:
   ```env
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=hello@primushomepro.com
   ```

---

### Step 3: Initialize Database

```bash
cd frontend

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view database
npx prisma studio
```

---

### Step 4: Start Development Server

```bash
cd frontend
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Verification Checklist

Before proceeding to build features, verify:

- [ ] `npm run dev` starts without errors
- [ ] Prisma client generated successfully
- [ ] Database connection working (check console logs)
- [ ] Clerk auth routes accessible (`/sign-in`, `/sign-up`)
- [ ] No TypeScript errors in IDE
- [ ] Environment variables loaded (check Network tab for API calls)

---

## Common Issues

### "PrismaClient is not defined"
```bash
npx prisma generate
```

### "DATABASE_URL is not set"
Ensure `.env.local` exists and contains `DATABASE_URL`

### Clerk middleware errors
Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set

### Tailwind not working
```bash
npm install -D tailwindcss postcss autoprefixer
```

---

## Next Phase: Building Features

Once setup is complete, you're ready to build:

1. **Module A**: Landing pages + lead capture forms
2. **Module B**: CRM dashboard
3. **Module C**: AI orchestrator
4. **Module D**: Automation engine

Refer to `PHASE_1_COMPLETE.md` for full architecture details.

---

**Need Help?**
- Check `.env.local.example` for environment variable template
- Review `frontend/lib/db/prisma.ts` for database connection
- Check `frontend/middleware.ts` for auth configuration
