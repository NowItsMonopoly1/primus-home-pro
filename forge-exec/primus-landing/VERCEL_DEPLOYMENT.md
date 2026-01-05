# Vercel Deployment Guide - Primus Insights Landing Page

## Quick Deploy (5 Minutes)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your `primus-insights-roofing` repo
   - Set root directory: `primus-landing`

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site is live at: `https://your-project.vercel.app`

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd "c:\Users\Donte\Downloads\Primus insights roofing\primus-landing"

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: primus-insights-landing
# - Directory: ./
# - Build settings: (leave default)

# Production deployment
vercel --prod
```

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project in Vercel dashboard
2. Settings → Domains
3. Click "Add"
4. Enter: `primusinsights.com`

### Step 2: Configure DNS

Vercel will show you DNS records to add. Example:

**For apex domain (primusinsights.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Verify

- DNS propagation takes 5-60 minutes
- Vercel will auto-detect and enable SSL (Let's Encrypt)
- Your site will be live at `https://primusinsights.com`

---

## Environment Variables (If Needed)

Currently none required, but if you add backend auth:

1. Vercel Dashboard → Settings → Environment Variables
2. Add key-value pairs:
   ```
   API_KEY=your_secret_key
   BACKEND_URL=https://primus-insights-roofing.onrender.com
   ```
3. Redeploy for changes to take effect

---

## Auto-Deploy Setup

### Enable Automatic Deployments

Vercel automatically deploys on every push to `main` branch.

**How it works:**
```
git add .
git commit -m "Update landing page"
git push origin main
```
→ Vercel detects push → Builds → Deploys (2-3 min)

### Branch Previews

Every pull request gets a preview URL:
- Push to `feature-branch`
- Create PR to `main`
- Vercel comments with preview link: `https://primus-insights-landing-git-feature-branch.vercel.app`

---

## Performance Optimization

### Already Included
- ✅ Next.js automatic code splitting
- ✅ Image optimization (via Next.js)
- ✅ Vercel Edge Network (CDN)
- ✅ Gzip/Brotli compression
- ✅ HTTP/2 server push

### Recommended Tweaks

**1. Add Analytics (Optional)**

In Vercel Dashboard:
- Analytics → Enable Web Analytics
- Free tier: 100k requests/month

**2. Enable Speed Insights**

```bash
npm install @vercel/speed-insights
```

In `app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

// Add inside <body>:
<SpeedInsights />
```

---

## Monitoring Your Deployment

### Check Build Status

**Vercel Dashboard:**
- Deployments tab shows all builds
- Click any deployment to see logs

**CLI:**
```bash
vercel ls  # List deployments
vercel inspect <URL>  # Get deployment details
```

### View Live Logs

```bash
vercel logs <deployment-url>
```

---

## Troubleshooting

### Build Fails: "Module not found"

**Cause**: Missing dependency

**Fix**:
```bash
npm install
git add package-lock.json
git commit -m "Fix dependencies"
git push
```

### Build Fails: TypeScript errors

**Cause**: Type mismatch

**Fix**:
```bash
npm run build  # Test locally first
# Fix errors in code
git add .
git commit -m "Fix type errors"
git push
```

### 404 on Custom Domain

**Cause**: DNS not propagated

**Fix**:
- Wait 10-60 minutes
- Check DNS: `nslookup primusinsights.com`
- Verify DNS records in domain registrar

### Site is Slow

**Check**:
1. Vercel Analytics → Performance tab
2. Run Lighthouse in Chrome DevTools
3. Verify CDN is active (check response headers)

---

## Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Form submits successfully to Render backend
- [ ] Mobile responsive (test on phone)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (green lock icon)
- [ ] Analytics enabled (optional)
- [ ] Auto-deploy working (push to test)

---

## Updating the Live Site

```bash
# Make changes locally
# Test with: npm run dev

# When ready:
git add .
git commit -m "Update landing page copy"
git push origin main

# Vercel auto-deploys in 2-3 minutes
```

---

## Rollback to Previous Version

If a deployment breaks something:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Previous version is now live again

---

## Cost

**Vercel Hobby Plan (FREE):**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ SSL included
- ✅ Custom domains
- ✅ Automatic HTTPS

**When to Upgrade:**
- \>100GB bandwidth/month
- Need team collaboration
- Want advanced analytics

---

## Next Steps After Deployment

1. **Test the Full Flow**
   - Submit test lead via form
   - Verify SMS arrives from Render backend
   - Confirm success state displays correctly

2. **Share the URL**
   - Demo to potential roofing clients
   - Use in cold outreach emails
   - Add to social media bios

3. **Track Conversions**
   - Monitor Vercel Analytics
   - Check Render backend logs for `/lead` requests
   - Calculate form submission rate

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Your Landing Page is Ready to Deploy!**

Run `npm install` then `vercel` to get started.
