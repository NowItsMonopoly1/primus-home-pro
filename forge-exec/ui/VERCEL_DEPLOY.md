# Vercel Deployment Guide

## Quick Deploy

### Option 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy from ui directory:**
```bash
cd ui
vercel
```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - What's your project's name? `forgeexec-ui` (or your choice)
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. **Set environment variables:**
```bash
vercel env add VITE_FORGEEXEC_API
# Enter: https://your-api-domain.com (or http://localhost:3000 for testing)

vercel env add VITE_GEMINI_API_KEY
# Enter: your-gemini-api-key-here
```

6. **Deploy to production:**
```bash
vercel --prod
```

### Option 2: GitHub + Vercel (Automated)

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Add ForgeExec UI"
git push origin main
```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure Project:**
   - Framework Preset: `Vite`
   - Root Directory: `ui`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **Add Environment Variables:**
   - `VITE_FORGEEXEC_API` = `https://your-api-domain.com`
   - `VITE_GEMINI_API_KEY` = `your-gemini-api-key`

7. **Click "Deploy"**

---

## Environment Variables

### Required Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FORGEEXEC_API` | ForgeExec API base URL | `https://api.yourdomain.com` |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### Setting Variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for:
   - Production
   - Preview
   - Development

---

## API Backend Deployment

Your ForgeExec API server also needs to be deployed. Options:

### Option A: Deploy API to Vercel
```bash
cd ..  # Back to root
vercel
```
Configure as Node.js project with `api-server.js` as entry point.

### Option B: Deploy to Railway/Render/Fly.io
Create a `Procfile` or deployment config for your chosen platform.

### Option C: Self-hosted
Deploy `api-server.js` on your own server and point `VITE_FORGEEXEC_API` to it.

---

## Post-Deployment Checklist

- [ ] UI deployed successfully
- [ ] Environment variables configured
- [ ] API backend deployed and accessible
- [ ] CORS configured on API to allow Vercel domain
- [ ] Test all 4 navigation tabs (QUEUE, ATLAS, CAPTURE, ORDERS)
- [ ] Verify backend connectivity
- [ ] Test job list loading
- [ ] Check console for any errors
- [ ] Mobile responsiveness verified
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### Build fails with TypeScript errors
- Run `npm run build` locally first to catch errors
- Check `tsconfig.json` is properly configured

### Environment variables not working
- Ensure variables start with `VITE_` prefix
- Redeploy after adding variables
- Check Vercel logs for variable visibility

### API connection issues
- Verify `VITE_FORGEEXEC_API` URL is correct
- Check CORS settings on API server
- Ensure API is deployed and accessible
- Test API endpoint directly: `curl https://your-api.com/health`

### 404 on page refresh
- Vercel should auto-handle SPA routing
- If not, add `vercel.json` with rewrites

---

## URLs After Deployment

- **Production:** `https://forgeexec-ui.vercel.app`
- **Preview:** `https://forgeexec-ui-[branch].vercel.app`
- **Development:** `http://localhost:5173`

---

## Continuous Deployment

Once connected to GitHub:
- Push to `main` → deploys to production
- Push to other branches → creates preview deployments
- Pull requests → automatic preview links

---

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for SSL certificate provisioning
5. Access via `https://yourdomain.com`

---

**Status:** Ready to deploy! 🚀
