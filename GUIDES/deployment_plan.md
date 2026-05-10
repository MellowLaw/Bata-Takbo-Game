# Bata, Takbo! — Deployment Plan
> Status: In Progress | Last updated: May 2026

## Stack Overview
- **Frontend**: Vite + Vanilla JS PWA (`web/`)
- **Backend**: Node.js + Express (`server/`)
- **Database**: SQLite (dev) → needs upgrade for production
- **ML**: TensorFlow.js hand gesture (runs client-side, no server needed)

---

## Priority 1: AWS (Primary Target)

### Why AWS Free Tier fits this project
From free-for-dev:
- **EC2** — 750 hrs/month of `t3.micro` (12 months free) → runs Express server
- **S3** — 5GB storage, 20K GET, 2K PUT (12 months) → hosts built frontend assets
- **CloudFront** — 1TB egress/month free → CDN in front of S3
- **RDS** — 750 hrs/month `db.t3.micro`, 20GB SSD (12 months) → replace SQLite with MySQL/PostgreSQL
- **Elastic Beanstalk** — free (you pay only for underlying EC2/RDS) → easiest deploy path

### Architecture
```
User → CloudFront (CDN) → S3 (built frontend)
                       ↘
                        EC2 / Elastic Beanstalk (Express API)
                               ↓
                             RDS (MySQL)
```

### Step-by-Step AWS Plan

#### Phase A — Prep (do before deployment)
- [ ] 1. Replace SQLite with MySQL in `server/db.js` (RDS-compatible)
- [ ] 2. Move all secrets (`JWT_SECRET`, DB credentials) to environment variables
- [ ] 3. Build script: `npm run build` in `/web` → outputs to `web/dist/`
- [ ] 4. Make Express serve `web/dist/` as static files (fallback to `index.html` for SPA)
- [ ] 5. Add a `Procfile` or `package.json` start script for Elastic Beanstalk
- [ ] 6. Add `manifest.json` + service worker if not already done (PWA requirement)

#### Phase B — AWS Setup
- [ ] 1. Create AWS account → enable Free Tier alerts
- [ ] 2. Create RDS instance (MySQL `db.t3.micro`, free tier)
- [ ] 3. Run DB migrations on RDS
- [ ] 4. Create Elastic Beanstalk Node.js app → upload zipped repo
- [ ] 5. Set environment variables in EB console (DB_HOST, JWT_SECRET, etc.)
- [ ] 6. Create S3 bucket → upload `web/dist/` → enable static hosting
- [ ] 7. Create CloudFront distribution → origin = S3 bucket
- [ ] 8. Point CloudFront to custom domain (if available) via Route 53

#### Phase C — CI/CD (optional but recommended)
- [ ] Use AWS CodePipeline (1 free pipeline/month) connected to GitHub
- [ ] Auto-build + deploy on push to `master`

### Estimated Free Tier Usage (12 months)
| Service | Free Limit | Expected Usage |
|---|---|---|
| EC2 t3.micro | 750 hrs/mo | ~720 hrs (always on) ✅ |
| RDS t3.micro | 750 hrs/mo | ~720 hrs ✅ |
| S3 | 5GB / 20K GET | Low ✅ |
| CloudFront | 1TB/mo | Very low ✅ |
| Data transfer | 100GB/mo EC2 | Depends on players |

> ⚠️ After 12 months free tier expires → EC2 + RDS will cost ~$15-25/month

---

## Priority 2: Alternatives (Free Forever options from free-for-dev)

### Option A — Render.com (Easiest, recommended for dev/staging)
- Free web service (Node.js) — **spins down after 15 min inactivity**
- Free PostgreSQL — 1GB
- Auto-deploy from GitHub
- **Good for**: testing, demo, staging environment

### Option B — Railway (Good middle ground)
- $5/month free credit
- Node.js + PostgreSQL
- No sleep on free tier
- **Good for**: low-traffic production

### Option C — Clever Cloud (EU-based)
- From free-for-dev: free MySQL + PostgreSQL databases
- €20 free credits at signup
- **Good for**: GDPR-compliant European deployment

---

## PWA → APK Conversion Plan

### Is it possible? YES ✅

PWAs can be wrapped into an APK using **TWA (Trusted Web Activity)** — Google's official method. No Flutter or React Native needed.

### Method 1: TWA via Bubblewrap (Recommended)
**What it is**: Wraps your PWA URL into a native Android APK using Chrome Custom Tabs.

**Requirements**:
- [ ] PWA must have a valid `manifest.json` (name, icons 192px + 512px, `start_url`, `display: standalone`)
- [ ] PWA must be served over **HTTPS** (hence needing deployment first)
- [ ] Add `/.well-known/assetlinks.json` to your server (links APK to domain)

**Steps**:
1. Install Bubblewrap CLI: `npm install -g @bubblewrap/cli`
2. Run `bubblewrap init --manifest https://yourdomain.com/manifest.json`
3. Run `bubblewrap build` → generates `.apk` + `.aab`
4. Sign the APK with a keystore
5. Upload `.aab` to Google Play Store (or distribute `.apk` directly)

**Cost**: Free. Google Play Store = one-time $25 registration fee.

### Method 2: PWABuilder (No-code, easier)
- Go to [pwabuilder.com](https://pwabuilder.com)
- Enter your deployed PWA URL
- Download Android package → generates TWA APK automatically
- Also generates iOS package (requires Mac + Apple Developer account $99/yr)

### Method 3: Capacitor (More control)
- Wraps PWA into a native shell with access to native APIs
- Useful if you need camera access for the gesture system on mobile
- More setup but gives access to `@capacitor/camera` etc.

### iOS Note
- iOS does NOT support TWA
- Need Capacitor or Cordova + Mac + Apple Developer account ($99/yr)
- PWA on iOS works as "Add to Home Screen" but limited (no push notifs, no offline camera)

---

## Current PWA Checklist
- [ ] `web/public/manifest.json` exists with correct fields
- [ ] Service worker registered in `main.js`
- [ ] Icons: 192×192 and 512×512 PNG
- [ ] `display: "standalone"` in manifest
- [ ] HTTPS (required after deployment)
- [ ] Offline fallback page

---

## Recommended Order of Operations
1. **Finish game features** (currently in progress)
2. **Phase A prep** — swap SQLite → MySQL, env vars, static serving
3. **Deploy to Render** (free, fast) for testing/demo
4. **Deploy to AWS** for production (once stable)
5. **PWA polish** — manifest, service worker, icons
6. **Generate APK** via PWABuilder once HTTPS is live
