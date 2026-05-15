# Bata, Takbo! — Deployment Plan
> Status: In Progress | Last updated: May 2026

---

## Chosen Stack for Production

| Layer | Service | Cost |
|---|---|---|
| **Frontend** | AWS S3 + CloudFront | Free tier (12mo) then ~$1/mo |
| **Backend** | AWS EC2 t3.micro | Free tier (12mo) then ~$8/mo |
| **Database** | Supabase (PostgreSQL) | **Free forever** (500MB, no expiry) |
| **SSL/HTTPS** | AWS Certificate Manager | Free |

### Why AWS EC2 + Supabase (not full AWS)?
- Supabase is **free forever** vs RDS which expires after 12 months ($15-25/mo after)
- Supabase has a web dashboard — easy to inspect data, no SSH needed
- PostgreSQL is a drop-in replacement for SQLite with minor syntax changes
- EC2 stays free for 12 months, cheap after (~$8/mo t3.micro)
- This combo is the most cost-effective for a student project long-term

### Final Architecture
```
User Browser / APK
       │
       ▼
CloudFront (HTTPS CDN)
       │
  ┌────┴────┐
  │         │
  ▼         ▼
S3 Bucket  EC2 t3.micro
(Frontend  (Express API :3001)
 dist/)         │
                ▼
          Supabase (PostgreSQL)
          [free, hosted in cloud]
```

---

## PHASE 0 — Do This First (Local Code Prep)
> Complete before touching any cloud console.

### Step 0.1 — Create your `.env` file
```
cd server
copy .env.example .env
```
Open `server/.env` and fill in:
```
NODE_ENV=development
PORT=3001
JWT_SECRET=<paste first generated key>
AES_SECRET_KEY=<paste second key — MUST be exactly 32 chars, trim if needed>
```
> The two keys you already generated with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` — use those.
> AES key must be **exactly 32 characters** — take the first 32 chars of the second generated hex string.

### Step 0.2 — Test locally one final time
```powershell
# Terminal 1 — backend
cd server
npm install
node server.js

# Terminal 2 — frontend
cd web
npm install
npm run dev
```
Open http://localhost:5173 — test register, login, play a chapter, check leaderboard.

### Step 0.3 — Verify the production build works
```powershell
cd web
npm run build
npm run preview
```
Open http://localhost:4173 — should look identical to dev.

---

## PHASE 1 — Supabase (Database)
> Free forever, set up in 5 minutes.

### Step 1.1 — Create Supabase project
1. Go to https://supabase.com → Sign up (free)
2. Click **New Project**
3. Name: `bata-takbo` | Region: pick closest to Philippines (Singapore `ap-southeast-1`)
4. Set a strong database password → save it somewhere safe
5. Wait ~2 minutes for project to provision

### Step 1.2 — Get your connection string
1. In Supabase dashboard → **Project Settings** → **Database**
2. Copy the **Connection string** (URI format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
3. Add to `server/.env`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```

### Step 1.3 — Migrate your schema to PostgreSQL
Run this SQL in **Supabase → SQL Editor**:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  encrypted_data TEXT,
  game_data TEXT,
  failed_attempts INTEGER DEFAULT 0,
  lockout_time BIGINT DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  banned INTEGER DEFAULT 0,
  ban_reason TEXT,
  cheat_score REAL DEFAULT 0,
  last_login BIGINT,
  reset_token TEXT,
  reset_token_expiry BIGINT,
  username_changed_at BIGINT,
  invalidate_before BIGINT
);

CREATE TABLE IF NOT EXISTS endless_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  survival_seconds INTEGER NOT NULL,
  control_type TEXT NOT NULL CHECK(control_type IN ('gesture', 'keyboard')),
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS inf_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  chapter_id INTEGER NOT NULL CHECK(chapter_id IN (1, 2, 3)),
  score INTEGER NOT NULL,
  waves_survived INTEGER NOT NULL DEFAULT 0,
  survival_seconds INTEGER NOT NULL DEFAULT 0,
  control_type TEXT NOT NULL CHECK(control_type IN ('gesture', 'keyboard')),
  created_at BIGINT NOT NULL
);
```
Click **Run** — all 3 tables should be created with no errors.

### Step 1.4 — Update `server/db.js` for PostgreSQL
> This is a separate coding session — see note at bottom of this file.

---

## PHASE 2 — AWS Account Setup

### Step 2.1 — Create AWS account
1. Go to https://aws.amazon.com → **Create an AWS Account**
2. Requires a credit/debit card — **you will NOT be charged** during free tier if you follow this plan
3. Choose **Basic Support (Free)**
4. After signup → go to **Billing → Budgets → Create Budget**
   - Type: Cost budget | Amount: $5 | Alert at 80% → sends email before you'd ever be charged

### Step 2.2 — Set your region
- Top-right corner of AWS Console → select **Asia Pacific (Singapore) ap-southeast-1**
- Stay in this region for everything

---

## PHASE 3 — Frontend Deployment (S3 + CloudFront)

### Step 3.1 — Build the frontend
```powershell
cd web
npm run build
# Output is in web/dist/
```

### Step 3.2 — Create S3 bucket
1. AWS Console → **S3** → **Create bucket**
2. Bucket name: `bata-takbo-frontend` (must be globally unique — add random suffix if taken)
3. Region: `ap-southeast-1`
4. **Uncheck** "Block all public access" → confirm
5. Leave everything else default → **Create bucket**

### Step 3.3 — Upload frontend files
1. Open your bucket → **Upload**
2. Drag entire contents of `web/dist/` (not the folder itself, the contents inside)
3. Click **Upload**

### Step 3.4 — Enable static website hosting
1. Bucket → **Properties** tab → scroll to **Static website hosting** → **Edit**
2. Enable → Index document: `index.html` → Error document: `index.html` (SPA fallback)
3. **Save**
4. Copy the **Bucket website endpoint** URL — test it in browser (should show your game)

### Step 3.5 — Create CloudFront distribution (HTTPS)
1. AWS Console → **CloudFront** → **Create distribution**
2. Origin domain: select your S3 bucket website endpoint (paste the URL from Step 3.4)
3. Viewer protocol policy: **Redirect HTTP to HTTPS**
4. Default root object: `index.html`
5. **Create distribution** → wait ~5 minutes to deploy
6. Copy your CloudFront URL: `https://xxxxxx.cloudfront.net` — this is your live frontend

### Step 3.6 — Fix SPA routing (404 on refresh)
1. CloudFront → your distribution → **Error pages** tab
2. **Create custom error response**:
   - HTTP error code: `403` → Response page path: `/index.html` → HTTP response code: `200`
   - Repeat for `404`

---

## PHASE 4 — Backend Deployment (EC2)

### Step 4.1 — Launch EC2 instance
1. AWS Console → **EC2** → **Launch instance**
2. Name: `bata-takbo-server`
3. AMI: **Ubuntu Server 24.04 LTS** (free tier eligible)
4. Instance type: **t3.micro** (free tier)
5. Key pair: **Create new key pair**
   - Name: `bata-takbo-key`
   - Type: RSA | Format: `.pem`
   - **Download and save it** — you cannot get it again
   - Save it to a safe place e.g. `C:/Users/Lawrence/.ssh/bata-takbo-key.pem`
6. Network settings:
   - Allow SSH (port 22) — source: My IP
   - Allow HTTP (port 80) — source: Anywhere
   - Allow HTTPS (port 443) — source: Anywhere
   - Allow Custom TCP port 3001 — source: Anywhere (temporary, remove later)
7. Storage: 30GB (free tier max)
8. **Launch instance**

### Step 4.2 — Connect to your EC2 instance
```powershell
# In PowerShell (Windows)
ssh -i "C:/Users/Lawrence/.ssh/bata-takbo-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```
Get your EC2 public IP from: EC2 → Instances → your instance → **Public IPv4 address**

### Step 4.3 — Install Node.js on EC2
```bash
# Run these commands after SSH-ing in
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # should show v20.x
npm --version
```

### Step 4.4 — Install PM2 (keeps server running after disconnect)
```bash
sudo npm install -g pm2
```

### Step 4.5 — Upload your server code to EC2
**Option A — From GitHub (recommended):**
```bash
# On EC2
sudo apt-get install -y git
git clone https://github.com/Jechrispotato/Bata-Takbo---A-Survival-Game.git
cd Bata-Takbo---A-Survival-Game/server
npm install
```

**Option B — Direct upload with SCP:**
```powershell
# On your local machine
scp -i "C:/Users/Lawrence/.ssh/bata-takbo-key.pem" -r ./server ubuntu@<EC2-IP>:~/server
```

### Step 4.6 — Create `.env` on EC2
```bash
# On EC2, inside the server folder
nano .env
```
Paste and fill in:
```
NODE_ENV=production
PORT=3001
JWT_SECRET=<your 128-char hex key>
AES_SECRET_KEY=<exactly 32 chars from your second key>
DATABASE_URL=<your Supabase connection string>
FRONTEND_URL=https://xxxxxx.cloudfront.net
EMAIL_USER=<your gmail>
EMAIL_PASS=<your gmail app password>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```
Save: `Ctrl+O` → `Enter` → `Ctrl+X`

### Step 4.7 — Start the server with PM2
```bash
cd ~/Bata-Takbo---A-Survival-Game/server
pm2 start server.js --name bata-takbo-api
pm2 startup     # makes it auto-start on reboot
pm2 save
pm2 logs        # verify no errors
```
Test: open `http://<EC2-IP>:3001/leaderboard/endless?controlType=keyboard` in browser — should return JSON.

### Step 4.8 — Set up Nginx as reverse proxy (port 80 → 3001)
```bash
sudo apt-get install -y nginx

sudo nano /etc/nginx/sites-available/bata-takbo
```
Paste:
```nginx
server {
    listen 80;
    server_name <YOUR-EC2-PUBLIC-IP>;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/bata-takbo /etc/nginx/sites-enabled/
sudo nginx -t        # test config
sudo systemctl restart nginx
```
Test: `http://<EC2-IP>/leaderboard/endless?controlType=keyboard` (no port) — should work.

---

## PHASE 5 — Connect Frontend to Backend

### Step 5.1 — Update Vite config for production API URL
In `web/vite.config.js`, the proxy only works in dev. For production, add the EC2 URL as an env variable.

Create `web/.env.production`:
```
VITE_API_URL=http://<YOUR-EC2-PUBLIC-IP>
```

Then in any frontend fetch calls, use `import.meta.env.VITE_API_URL` as the base.
> **Note**: if all fetch calls already use relative paths (`/auth/login`) the Vite proxy handles dev, but in production the built files need to know the actual API server. Check how your frontend calls the API — this may need a code pass.

### Step 5.2 — Rebuild and re-upload frontend
```powershell
cd web
npm run build
# Re-upload web/dist/ contents to S3 (replace all files)
```

### Step 5.3 — Invalidate CloudFront cache
1. CloudFront → your distribution → **Invalidations** tab
2. **Create invalidation** → path: `/*`
3. Wait ~1 minute → your CloudFront URL now serves the new build

---

## PHASE 6 — Verify Everything Works End-to-End

### Checklist
- [ ] Open CloudFront URL in browser → game loads
- [ ] Register a new account
- [ ] Login → profile loads correctly
- [ ] Play a chapter → score saves
- [ ] Leaderboard shows your score
- [ ] Logout → redirected to login
- [ ] Test on mobile browser (Chrome Android)
- [ ] PWA: "Add to Home Screen" prompt appears

---

## PHASE 7 — PWA → APK (After deployment is live)

### Option A: PWABuilder (Easiest — no code)
1. Go to https://pwabuilder.com
2. Enter your CloudFront URL
3. Fix any PWA warnings it shows (manifest icons, service worker)
4. Click **Package for stores** → **Android** → Download
5. You get a signed `.apk` + `.aab` — install directly or upload to Play Store

### Option B: Bubblewrap CLI
```powershell
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://xxxxxx.cloudfront.net/manifest.json
bubblewrap build
```

### Play Store
- One-time $25 Google Play developer fee
- Upload `.aab` file → fill store listing → publish

---

## PHASE 8 — Updates After Deployment

### Updating the frontend
```powershell
cd web
npm run build
# Upload web/dist/ to S3 again
# Create CloudFront invalidation /* 
```

### Updating the backend
```bash
# On EC2 via SSH
cd ~/Bata-Takbo---A-Survival-Game
git pull origin master
cd server
npm install   # only if package.json changed
pm2 restart bata-takbo-api
pm2 logs      # verify clean restart
```

---

## Pending Code Tasks Before Deployment

### 1. Migrate `server/db.js` from SQLite → PostgreSQL (pg)
Key changes needed:
- Replace `sqlite`/`sqlite3` with `pg` package
- `AUTOINCREMENT` → `SERIAL`  
- `INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`
- `db.run()` / `db.get()` / `db.all()` → `pool.query()`
- Use `DATABASE_URL` from env for connection

### 2. Verify all frontend API calls work with absolute URL in production
- Check if fetch calls use relative paths (`/auth/login`) or hardcoded `localhost`
- Add `VITE_API_URL` env var support if needed

### 3. PWA manifest + service worker
- Verify `web/public/manifest.json` has correct icons (192×192, 512×512)
- Verify service worker is registered

---

## Cost Summary

| Service | Free Period | After Free Tier |
|---|---|---|
| EC2 t3.micro | 12 months free | ~$8/mo |
| S3 + CloudFront | 12 months free | ~$1/mo |
| Supabase | **Forever free** (500MB) | $25/mo if exceeded |
| AWS Certificate Manager | Always free | Free |
| **Total** | **$0 for 12 months** | **~$9/mo** |
