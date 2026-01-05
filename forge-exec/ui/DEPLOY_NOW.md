# 🚀 Deploy ForgeExec UI to Vercel - Quick Guide

## ⚠️ Git Author Issue Detected

The CLI deployment is blocked due to Git author permissions. Use the **Web Dashboard** method instead (easiest).

---

## ✅ Method 1: Vercel Web Dashboard (RECOMMENDED)

### Step 1: Prepare the Repository
The code is already built and ready (`dist/` folder exists).

### Step 2: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**

### Step 3: Import Repository
Choose one of these options:

#### Option A: Import from GitHub (if you have the repo there)
1. Click **"Import Git Repository"**
2. Select your repository
3. Configure:
   - **Root Directory**: `ui`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Deploy from Local (if no Git repo)
1. Use Vercel CLI with fixed Git config:
```bash
cd ui
git config user.email "your-email@example.com"
vercel
```

### Step 4: Set Environment Variables
In Vercel project settings, add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_FORGEEXEC_API` | `http://localhost:3000` (or your API URL) | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | `your-gemini-key` | Production, Preview, Development |

### Step 5: Deploy
Click **"Deploy"** and wait ~2 minutes.

### Step 6: Your Live URL
You'll get: `https://forgeexec-ui-xxx.vercel.app`

---

## 🔧 Method 2: Fix Git Author & Use CLI

If you want to use the CLI, fix the Git author first:

```bash
cd "/c/Users/Donte/.claude-worktrees/Next Level Electric/wizardly-vaughan/forge-exec"

# Set your actual email
git config user.email "your-actual-email@example.com"
git config user.name "Your Name"

# Verify
git config user.email

# Now deploy
cd ui
vercel --yes
```

---

## 📦 What's Already Done

✅ Production build tested (`npm run build` successful)  
✅ `vercel.json` configured  
✅ `.gitignore` updated  
✅ Environment variables structure ready  
✅ All 4 tabs working (QUEUE, ATLAS, CAPTURE, ORDERS)

---

## 🌐 After Deployment

1. **Test the live site:**
   - Open the Vercel URL
   - Check all 4 navigation tabs
   - Verify job cards display
   - Test filters and interactions

2. **Update API URL:**
   - If you deploy the API backend, update `VITE_FORGEEXEC_API`
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Update the value
   - Redeploy (Vercel will auto-redeploy on save)

3. **Custom Domain (Optional):**
   - Project Settings → Domains
   - Add your domain
   - Configure DNS as shown

---

## 🐛 Troubleshooting

### "Git author must have access"
→ Use Web Dashboard method or fix Git config (see Method 2)

### "Build failed"
→ Check Vercel build logs for errors  
→ Test locally: `npm run build`

### "Environment variables not working"
→ Ensure they start with `VITE_` prefix  
→ Redeploy after adding variables

### "API connection failed"
→ Check `VITE_FORGEEXEC_API` is correct  
→ API must be publicly accessible or deployed

---

## 🎯 Quick Summary

**The fastest way right now:**

1. Go to https://vercel.com/new
2. Import from Git OR drag & drop the `ui` folder
3. Set framework: Vite
4. Add the 2 environment variables
5. Click Deploy
6. Done! 🎉

Your ForgeExec UI will be live in ~2 minutes.

---

**Current Status:** ✅ Build successful, ready to deploy via web dashboard
