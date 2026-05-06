# Account Management Enhancement Plan

> Goal: make every piece of player data (progress, hand-gesture model, tutorial completion, settings) **per-account**, keep a working **guest mode** with an *unsaved-progress* exit warning, and prepare the project for cloud hosting on AWS using a Backend-as-a-Service (BaaS).

---

## 1. Current State (what we have today)

- **Backend:** local Node/Express + SQLite at `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/server.js:1-201`. JWT in HttpOnly cookie, bcrypt hashes, AES-GCM encrypted blob per user (`encrypted_data` column).
- **Database file:** `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/database.sqlite` — currently dropped & re-seeded on every boot (see `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/db.js:19`). **This must change** before going live.
- **Client state:** `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/utils/StateManager.js:1-201`. All saved data goes to plain `localStorage` keys:
  - `bata_takbo_settings`
  - `bata_takbo_tutorial`
  - `bata_takbo_bestiary`
  - `bata_takbo_progress`
  - (gesture model is also stored locally — needs verification in `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/gesture/`)
- **Problem:** these keys are shared across every account that logs in on the same browser. Account B sees Account A's progress.

---

## 2. Per-Account Data Scoping (client-side refactor)

### 2.1 Namespacing strategy
Replace flat `localStorage` keys with a **scoped key** that includes the user identity:

```
bata_takbo:<scope>:<key>
```

where `<scope>` is:
- `guest` — for unauthenticated play (cleared on exit warning if user declines to register)
- `u:<userId>` — for a logged-in account (e.g. `u:42`)

Examples:
- `bata_takbo:guest:progress`
- `bata_takbo:u:42:tutorial`
- `bata_takbo:u:42:gestureModel`

### 2.2 Refactor `StateManager`
In `StateManager.js`:
1. Add a `currentScope` field (default `guest`).
2. Wrap every `localStorage.getItem` / `setItem` in helpers `_lsGet(key)` / `_lsSet(key, val)` that prepend the scope.
3. Add a method `switchScope(newScope)` that:
   - Saves any pending state under the old scope.
   - Reloads `settings`, `tutorialComplete`, `bestiary`, `chapterProgress`, `gestureModel` from the new scope (or defaults if none exist).
   - Emits `scope:changed`.
4. On successful login → `state.switchScope('u:' + userId)`.
5. On logout → `state.switchScope('guest')`.

### 2.3 Gesture model per account
The trained gesture model is currently device-scoped (see comment at `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/utils/StateManager.js:165`). Move it under the same scope so each account has its own training:
- Key: `bata_takbo:u:<id>:gestureModel`
- For the cloud sync version, store the serialized model JSON in the user's `encrypted_data` blob (or a dedicated `gesture_model` table when we migrate to a real DB).

### 2.4 Cloud sync (later, after BaaS migration)
Two-tier persistence:
1. **Always** write locally (fast, offline-friendly).
2. **If logged in**, also push to the backend on debounce (e.g. 2 s after last change) via `PUT /me/save`.
3. On login, fetch `GET /me/save` and merge: server wins on conflict, but only if `serverUpdatedAt > localUpdatedAt`.

---

## 3. Guest Mode + Exit Warning

### 3.1 Behavior
- Guest can play everything, train gestures, see tutorials.
- All guest data is written under the `guest` scope so it does not pollute real accounts.
- When guest tries to **close the tab, refresh, or click "Quit / Back to Login"**, show a warning:
  > *"You're playing as a guest. Your progress, gestures, and tutorial completion will not be saved unless you connect to an account. Continue anyway?"*

### 3.2 Implementation
- Browser-level: hook `beforeunload` only when `state.get('currentScope') === 'guest'` **and** there is non-trivial progress (e.g. any chapter started or gesture trained). Standard pattern:
  ```js
  window.addEventListener('beforeunload', (e) => {
    if (shouldWarnGuest()) {
      e.preventDefault();
      e.returnValue = ''; // browsers show generic dialog
    }
  });
  ```
  Note: browsers ignore custom text in `beforeunload`; the message is shown only inside the in-game UI.
- In-game level: intercept clicks on the *Logout / Back to Main Menu / Quit* buttons in `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/screens/MainMenu.js` and show a custom modal (reuse `DialogueBox` or a small `ConfirmDialog`) with two buttons: **"Connect an account"** (→ `LoginScreen`) and **"Continue as guest"** (→ proceed).

### 3.3 Acceptance criteria
- [ ] Logging in then logging out reverts to `guest` scope and the menu shows a *"You are a guest"* badge.
- [ ] Guest data and account data never leak into each other (verify with two accounts on same browser).
- [ ] Closing the tab as a guest with non-empty progress fires the browser confirm.
- [ ] Quitting from the main menu as a guest opens the custom modal.

---

## 4. Backend / Hosting Decision

### 4.1 The choices
| Option | Pros | Cons | Verdict for this game |
|---|---|---|---|
| **Firebase (GCP)** | Easiest auth + Firestore + Hosting, generous free tier, real-time sync built-in. | Vendor lock-in to Google. Querying is limited compared to SQL. | ⭐ Best for fast shipping. |
| **Supabase** | Postgres (real SQL), auth, storage, row-level security, open source, can self-host later. | Smaller free tier than Firebase, fewer regions. | ⭐ Best if you want SQL + portability. |
| **AWS Amplify** | First-party AWS, integrates Cognito + DynamoDB/AppSync + S3 + CloudFront. | Steeper learning curve, IAM complexity, costs add up. | Good if you must stay on AWS. |
| **Roll your own on AWS** (EC2 + RDS or Lightsail + Postgres) | Full control. | You manage OS, patches, scaling, backups, TLS. | Overkill for an indie game right now. |

### 4.2 Recommendation
**Use Supabase** for the backend (auth + Postgres + storage), and **AWS S3 + CloudFront** for hosting the static `web/dist` build.

Why this combo:
- Supabase replaces the entire `server/` folder with a hosted Postgres + JWT auth + REST/RPC. You get email/password, OAuth, row-level security, and a JS SDK that drops straight into the Vite app.
- The game itself is a static SPA after `vite build`. S3 + CloudFront is the cheapest, fastest way to serve it globally. (Alternatively: Vercel/Netlify if AWS is not a hard requirement.)
- You can migrate to self-hosted Postgres on AWS later without rewriting client code, because Supabase uses standard Postgres + PostgREST.

If you specifically need to stay 100% inside AWS, the equivalent stack is:
- **Amazon Cognito** (auth) → replaces JWT login.
- **DynamoDB** or **Aurora Serverless v2 Postgres** (data).
- **API Gateway + Lambda** (or AWS Amplify) for endpoints.
- **S3 + CloudFront** for the SPA.
- **Route 53** + ACM for the domain & TLS.

### 4.3 Database schema (Supabase / Postgres)
```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table save_data (
  user_id uuid primary key references profiles(id) on delete cascade,
  chapter_progress jsonb not null default '{"chaptersUnlocked":[1],"chaptersCompleted":[],"bestScores":{}}',
  tutorial_complete jsonb not null default '{"gameplayComplete":false,"gestureComplete":false}',
  bestiary jsonb not null default '{}',
  settings jsonb not null default '{}',
  gesture_model jsonb,
  updated_at timestamptz default now()
);

-- Row Level Security: a user can only read/write their own row.
alter table save_data enable row level security;
create policy "own save" on save_data
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### 4.4 Migration path from current Express server
1. Keep `server/` running locally for now.
2. Add a thin abstraction `web/src/auth/AuthClient.js` with methods `login`, `register`, `logout`, `getMe`, `saveData`, `loadData`.
3. Implement two backends behind that interface:
   - `LocalAuthClient` → calls `http://localhost:3001/auth/...` (current code).
   - `SupabaseAuthClient` → uses `@supabase/supabase-js`.
4. Switch via an env var `VITE_AUTH_PROVIDER=local|supabase`.
5. Once Supabase works end-to-end, retire `server/`.

---

## 5. Can I Still Develop Locally?

**Yes — and you should.** Cloud hosting only changes *where the production build runs*. Local dev stays the same:

- `npm run dev` in `web/` keeps using Vite's dev server at `http://localhost:5173`.
- For Supabase: point the SDK at the hosted project URL, or run `supabase start` (Docker) for a fully local Postgres mirror.
- For AWS-only: use `sam local` / `amplify mock` for local Lambdas, or just keep the current Express server as the dev backend and only deploy when you want to test cloud paths.
- Use two `.env` files:
  - `.env.development` → local backend.
  - `.env.production` → cloud backend, baked into the `vite build` artifact uploaded to S3.

Deploy flow once configured:
1. Edit code locally → test on `localhost:5173`.
2. `npm run build` in `web/` → outputs to `web/dist/`.
3. `aws s3 sync web/dist s3://your-bucket --delete`.
4. `aws cloudfront create-invalidation --distribution-id XYZ --paths "/*"`.
5. (Optional) wire this up as a GitHub Action so every push to `main` deploys automatically.

---

## 6. Implementation Order (suggested)

1. **Client refactor** — scoped `StateManager` (Section 2). No backend change required; immediately fixes the "accounts share data" bug.
2. **Guest exit warning** — modal + `beforeunload` (Section 3).
3. **Stop dropping the SQLite table** on boot (`@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/db.js:19`) and add `/me/save` GET/PUT endpoints that read/write `encrypted_data`. This already gives real per-account cloud save without changing providers.
4. **Pick BaaS** — set up a Supabase project (free), port auth + save endpoints, gate behind `VITE_AUTH_PROVIDER`.
5. **Static hosting** — `vite build` → S3 + CloudFront, custom domain via Route 53.
6. **Polish** — analytics, password reset email (Supabase gives this for free), leaderboard table.

---

## 7. Resolved Decisions

- **Auth model:** **Email + password** (with email verification + password reset). Supabase handles all of this out of the box.
- **Guest migration:** When a guest registers, **merge their guest progress into the new account** as a one-time operation, then clear the `guest` scope.
- **Hosting:** Supabase (backend) + AWS S3 + CloudFront (static SPA).

---

## 8. Local Dev + GitHub + Supabase — How They Coexist

**Yes, you can keep editing `web/` locally and pushing to GitHub exactly like today.** The three layers are independent:

| Layer | Where it lives | What it does |
|---|---|---|
| Source code | Your laptop + GitHub | The Vite app you edit. |
| Supabase project | `https://<your-ref>.supabase.co` | Auth + Postgres + APIs. Just an HTTPS endpoint your code calls. |
| Static host | AWS S3 + CloudFront | Serves `web/dist/` to players. |

Editing `web/src/...` locally → `npm run dev` → browser at `localhost:5173` calls the **same** Supabase project as production. No deploy needed to test.

**Recommended:** create **two** Supabase projects:
- `bata-takbo-dev` — used by `.env.development`, safe to wipe.
- `bata-takbo-prod` — used by `.env.production`, real player data, restricted access.

---

## 9. Email-Based Auth — Step-by-Step Setup

### 9.1 Create the Supabase project
1. Go to <https://supabase.com> → sign in with GitHub → **New project**.
2. Pick a region close to your players (Singapore for PH/SEA).
3. Save the **Project URL** and **anon public key** (Settings → API). You will paste these into `.env`.
4. Save the **service_role key** somewhere safe (a password manager). **Never commit it. Never use it in the browser.** It bypasses all security rules.

### 9.2 Enable email auth
1. Authentication → Providers → **Email** → enable.
2. Turn ON **Confirm email** (forces verification before login).
3. Authentication → URL Configuration → set Site URL to your production domain (later) and add `http://localhost:5173` to additional redirect URLs.
4. Authentication → Email Templates → customize the confirmation + reset emails (optional but nicer).

### 9.3 Apply the schema
1. SQL Editor → New query → paste the schema from **Section 4.3** of this guide → Run.
2. Add a trigger so a `profiles` row is auto-created when a user signs up:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  insert into public.save_data (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 9.4 Install the SDK
In `web/`:
```bash
npm install @supabase/supabase-js
```

### 9.5 Wire it up in code
Create `web/src/auth/supabaseClient.js`:
```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Create `web/.env.development` and `web/.env.production`:
```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<paste anon public key>
```

### 9.6 Replace the current auth calls
In `LoginScreen.js` (currently calls `localhost:3001/auth/...`), swap to:
```js
// Sign up
const { data, error } = await supabase.auth.signUp({
  email, password,
  options: { data: { username } }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Password reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});

// Get current user (call on app boot)
const { data: { user } } = await supabase.auth.getUser();
```

### 9.7 Save / load player data
```js
// Save (debounced ~2s after last change)
await supabase.from('save_data').update({
  chapter_progress: state.get('chapterProgress'),
  tutorial_complete: state.get('tutorialComplete'),
  bestiary: state.get('bestiary'),
  settings: state.get('settings'),
  gesture_model: state.get('gestureModel'),
  updated_at: new Date().toISOString()
}).eq('user_id', user.id);

// Load (on login)
const { data } = await supabase.from('save_data').select('*').eq('user_id', user.id).single();
```

Row Level Security (already in Section 4.3) makes sure users can only touch their own row. The `anon` key in the browser is safe to expose.

---

## 10. Security Checklist (do these, in order)

### 10.1 Secrets
- [ ] **Never** commit `.env*` files. Add to `.gitignore`:
  ```
  web/.env
  web/.env.*
  !web/.env.example
  ```
- [ ] Commit only `web/.env.example` with empty placeholder values.
- [ ] **Anon key** = safe in browser (designed for that). **Service-role key** = server only, store in AWS Secrets Manager or a password manager. Never paste it into client code.
- [ ] Rotate the JWT/AES secrets currently hardcoded at `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/server.js:12-13` before retiring that server. Treat them as compromised since they're in git history.

### 10.2 Database
- [ ] **Enable Row Level Security on every table.** No exceptions. (Schema in 4.3 already does this for `save_data`; do it for `profiles` and any leaderboard table too.)
- [ ] Write explicit RLS policies. Default-deny.
- [ ] For leaderboards: **never let the client write the score directly**. Use a Supabase **Edge Function** or a Postgres `security definer` function that validates the score (e.g. server-side replay check, max plausible value).

### 10.3 Auth hardening
- [ ] Email confirmation ON.
- [ ] Set minimum password length = 8 (Authentication → Policies).
- [ ] Enable **leaked password protection** (Authentication → Policies — Supabase checks against HaveIBeenPwned).
- [ ] Set rate limiting on auth (Authentication → Rate Limits) — defaults are sane, but raise/lower as needed.
- [ ] Configure CAPTCHA for sign-up if you see bot traffic (hCaptcha is free + supported).

### 10.4 Transport & cookies
- [ ] Production site **must** be HTTPS only. CloudFront → "Redirect HTTP to HTTPS".
- [ ] Supabase already issues secure tokens; the SDK stores them in `localStorage` by default. If you want stricter, configure cookie storage with `SameSite=Lax; Secure`.

### 10.5 Code hygiene
- [ ] No `console.log` of tokens, emails, or save data in production builds.
- [ ] Validate every user input client-side **and** in DB constraints (`check` constraints, length limits on `username`, etc.).
- [ ] Pin dependency versions in `package.json` (no floating `^` for security-sensitive packages like `@supabase/supabase-js`, `bcryptjs`).
- [ ] Run `npm audit` before each release.

### 10.6 AWS side (when deploying the SPA)
- [ ] S3 bucket: **block all public access**. Serve only through CloudFront with an Origin Access Control.
- [ ] CloudFront: attach an SSL certificate via AWS Certificate Manager (free).
- [ ] Add security headers via CloudFront response policy: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a sensible `Content-Security-Policy` allowing your Supabase domain.
- [ ] IAM: create a deploy-only user with `s3:PutObject` + `cloudfront:CreateInvalidation` on **only** the resources it needs. Don't deploy with your root account.

### 10.7 What to do if a key leaks
1. Supabase dashboard → Settings → API → **Reset anon/service_role key**.
2. Update `.env.production`, redeploy SPA.
3. Update any GitHub Actions / Lambda env vars.
4. Force-logout all users: Authentication → Users → "Sign out all users".

---

## 11. Guest → Account Migration

When a logged-out guest with progress hits **Sign up**:

1. Before submitting the registration form, snapshot the current guest scope:
   ```js
   const guestSnapshot = {
     chapter_progress: state.get('chapterProgress'),
     tutorial_complete: state.get('tutorialComplete'),
     bestiary: state.get('bestiary'),
     settings: state.get('settings'),
     gesture_model: state.get('gestureModel'),
   };
   ```
2. Call `supabase.auth.signUp(...)`.
3. **After email verification + first login**, run a one-time merge:
   ```js
   const { data: existing } = await supabase.from('save_data')
     .select('*').eq('user_id', user.id).single();
   const merged = mergeProgress(existing, guestSnapshot); // see rules below
   await supabase.from('save_data').update(merged).eq('user_id', user.id);
   ```
4. Clear the guest scope locally:
   ```js
   Object.keys(localStorage)
     .filter(k => k.startsWith('bata_takbo:guest:'))
     .forEach(k => localStorage.removeItem(k));
   ```
5. Switch scope: `state.switchScope('u:' + user.id)`.

**Merge rules** (`mergeProgress`):
- `chaptersUnlocked` → union of both arrays.
- `chaptersCompleted` → union.
- `bestScores[chapter]` → max of guest and server.
- `bestiary` → union of keys; per entry, max kill count.
- `tutorial_complete` → OR (true wins).
- `settings` → guest wins (most recent intent).
- `gesture_model` → keep guest's if server has none, else keep server's.

UI: show a small toast "Welcome! We brought your guest progress with you." so the player knows it happened.

---

## 12. Push Notifications

**Supabase has no built-in push service** (unlike Firebase / FCM). You have three options:

### 12.1 Comparison
| Option | Pros | Cons |
|---|---|---|
| **OneSignal** | Easiest. Free up to 10k subs. Dashboard for sending. SDK drops into Vite app. | Third-party vendor. |
| **Web Push API** + Supabase Edge Functions | Free, no third party, fully under your control. Standards-based. | More code to write (VAPID keys, service worker, subscription table). |
| **FCM (Firebase)** | Battle-tested. Works on Android/Chrome best. | Adds a second vendor just for push. |

**Recommendation:** start with **OneSignal** for speed; migrate to Web Push later if you want to drop the dependency.

### 12.2 What to notify (ideas for *Bata Takbo*)
- **Daily play reminder** — "Kataw is restless. Come back today!"
- **Streak protection** — "Don't break your 5-day streak — play one round."
- **New content** — "Chapter 4 is live. New boss available."
- **Leaderboard rivalry** — "Someone just beat your best score in Chapter 2."
- **Event-based** — Halloween/Christmas-themed bosses or skins.
- **Re-engagement** — "We haven't seen you in 7 days. Here's a free unlock."

Keep frequency low: **at most one push per 48 hours per user**. More than that = uninstall / block.

### 12.3 Implementation sketch (OneSignal route)
1. Create OneSignal account → new **Web Push** app → enter your CloudFront domain.
2. Add the SDK script to `index.html`:
   ```html
   <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
   ```
3. Initialize in `main.js`:
   ```js
   window.OneSignalDeferred = window.OneSignalDeferred || [];
   OneSignalDeferred.push(async (OneSignal) => {
     await OneSignal.init({ appId: import.meta.env.VITE_ONESIGNAL_APP_ID });
   });
   ```
4. Tag users by their Supabase user ID so you can target them:
   ```js
   OneSignal.login(user.id);
   ```
5. Trigger sends from the OneSignal dashboard, or from a **Supabase Edge Function** using their REST API + a `pg_cron` job for scheduled reminders.

### 12.4 Implementation sketch (Web Push route, no vendor)
1. Generate VAPID keys (`npx web-push generate-vapid-keys`). Store **public** in `.env`, **private** in Supabase Edge Function secrets.
2. Add `web/public/sw.js` service worker that handles `push` events.
3. After login, ask permission and subscribe:
   ```js
   const reg = await navigator.serviceWorker.register('/sw.js');
   const sub = await reg.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
   });
   await supabase.from('push_subscriptions').upsert({
     user_id: user.id, endpoint: sub.endpoint, keys: sub.toJSON().keys
   });
   ```
4. Edge Function `send-push`: query `push_subscriptions`, use `web-push` npm lib to send.
5. Schedule with `pg_cron`:
   ```sql
   select cron.schedule('daily-reminder', '0 18 * * *', $$ select net.http_post('https://<ref>.functions.supabase.co/send-push', '{"campaign":"daily"}'::jsonb) $$);
   ```

### 12.5 iOS caveat
Web Push on iOS Safari only works if the user **installs the game as a PWA** (Add to Home Screen) and is on iOS 16.4+. For Android/desktop it just works. Plan messaging accordingly.

---

## 13. Audit + Fixes Applied (May 2026)

After the co-dev's account system landed, an audit found three real bugs. All three are fixed in code as listed below.

### 13.1 Chapter / bestiary progress was never persisted
**Symptom:** unlocking Chapter 2 by beating Chapter 1 did not survive a tab close or logout.

**Root cause:** `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/game/GameScene.js:1281-1286` did `state.set('chapterProgress', ...)` but never called `state.saveChapterProgress()`. Bestiary was the same — only localStorage, never the server.

**Fix:**
- `GameScene.js` now also saves `chaptersCompleted` and `bestScores`, and calls `state.saveChapterProgress()` after the `set`.
- `StateManager.saveBestiary()` is now `async` and syncs to the server like the other save methods.
- `_syncToServer()` payload now includes `bestiary` and `gestureSetupComplete`.
- `LoginScreen` hydrates `bestiary` from `data.gameData.bestiary`.

### 13.2 Server save was destructive
The old `/auth/save-data` overwrote the entire `game_data` JSON every call. A partial save (e.g. just `tutorialComplete`) would have wiped chapter progress.

**Fix:** server now reads existing `game_data`, **merges** the incoming fields, and writes back. See `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/server.js:247-272`.

### 13.3 Tutorial / gesture welcome prompt re-appearing every login
**Symptom:** logging in always showed the "Welcome to Bata, Takbo!" gesture-setup prompt even for users who had already trained their gestures.

**Root cause:** there was no way to record "gesture training done" separately from "gameplay tutorial done". The full tutorial flag (`tutorialComplete`) only flips true at the end of `TutorialScreen._finish`; if a player trained gestures but quit before finishing the gameplay tutorial, gestures had to be re-trained too.

**Fix:** introduced a separate `gestureSetupComplete` flag.
- Set to `true` in `GestureTraining._completeTutorial` (`@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/screens/GestureTraining.js:438-447`).
- Persisted via `StateManager.saveGestureSetupState()` (localStorage + server).
- On login (`LoginScreen.js`), it is also derived as `true` if a saved gesture model exists, so legacy accounts skip the prompt automatically.
- `MainMenu` Play handler: if `tutorialComplete` go to chapter select; else if `gestureSetupComplete` skip the welcome prompt and go straight to `tutorial-screen`; else show the full prompt.

### 13.4 Guest exit warning (new feature)
Implemented as discussed in Section 3:
- New helper `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/web/src/utils/GuestGuard.js` exposes `isGuest()`, `hasMeaningfulGuestProgress()`, `installBeforeUnloadGuard()`, and `confirmGuestLeave()`.
- `main.js` calls `installBeforeUnloadGuard()` so the browser shows its native confirm if a guest tries to refresh / close the tab while having any unlocked chapters, completed tutorial, trained gestures, or bestiary entries.
- `MainMenu` Logout button now calls `confirmGuestLeave()` for guests, with three options: **Connect / Create Account**, **Leave Anyway**, **Cancel**. Registered users keep the unchanged `state.logout()` behaviour.

### 13.5 Still TODO (out of scope of this pass)
- Move the hardcoded `JWT_SECRET` and `AES_SECRET_KEY` at `@/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/server.js:12-13` into env vars before any deploy.
- Migrate from local Express+SQLite to Supabase (see Section 9). The current per-user JSON blob approach will translate cleanly: `game_data` → the `save_data.*` jsonb columns.
- Implement guest→account merge from Section 11 once Supabase auth is live.
- Push notifications (Section 12).
