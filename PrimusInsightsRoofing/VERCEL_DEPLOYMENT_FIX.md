# ✅ VERCEL DEPLOYMENT QUICK FIX

## The Problem
Vercel doesn't see your Next.js app because it's in a subdirectory (`frontend/`).

## The Solution - 3 Steps

### Step 1: Configure Root Directory in Vercel
1. Go to: https://vercel.com/dashboard
2. Click on your **primus-home-pro-frontend** project
3. Go to **Settings** → **General**
4. Find **Root Directory**
5. Change it to: **`frontend`** (this is where the Next.js app is)
6. **Save**

### Step 2: Add Environment Variables
Go to **Settings** → **Environment Variables** and add these:

**Critical (build will fail without these):**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_YOUR_KEY
CLERK_SECRET_KEY = sk_live_YOUR_KEY
DATABASE_URL = postgresql://...your connection string...
```

**Optional (features won't work but build succeeds):**
```
ANTHROPIC_API_KEY = sk-ant-YOUR_KEY
STRIPE_SECRET_KEY = sk_test_YOUR_KEY (or sk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET = whsec_YOUR_SECRET
```

### Step 3: Trigger Deployment
1. Go to **Deployments** tab
2. Click **Redeploy** button on the latest commit
3. Wait 2-5 minutes

---

## If Still Not Working

### Option A: Use Netlify Instead
Netlify might be simpler for this monorepo structure:
1. Connect your GitHub repo to Netlify
2. Set Build Command: `cd frontend/PrimusInsightsRoofing/frontend && npm install && npm run build`
3. Set Publish Directory: `frontend/PrimusInsightsRoofing/frontend/.next`

### Option B: Deploy Frontend Only
Create a new GitHub repository with JUST the frontend files at root level:
```bash
# Create new repo on GitHub: primus-frontend-only
# Then locally:
git clone https://github.com/YourUsername/primus-frontend-only
cp -r PrimusInsightsRoofing/frontend/* primus-frontend-only/
cd primus-frontend-only
git add .
git commit -m "Initial frontend deployment"
git push
# Connect this repo to Vercel
```

---

## Debug: Check if Vercel is Seeing Your Code

1. Go to Vercel Project → **Settings** → **Git**
2. Verify the repo is connected: `NowItsMonopoly1/primus-home-pro-frontend`
3. Verify branch is: `main`
4. Go to **Deployments** tab
5. If no deployments: the git connection might be broken

**If no deployments appear:**
- Disconnect and reconnect the GitHub repo in Vercel
- Go to https://github.com/settings/apps and check Vercel permissions

---

## Check Build Logs
Even if deployment fails, you'll see WHY in the build logs:
1. Go to **Deployments**
2. Click the latest deployment
3. Click **View Build Logs**
4. Look for errors (usually environment variable related)

---

**Still stuck?** Share the exact error from the build logs and I can help fix it.
