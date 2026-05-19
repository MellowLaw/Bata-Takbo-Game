# Diagnostic Report — Bata, Takbo! (Final Project Rubric Self-Assessment)

**Project:** Bata, Takbo! — A Survival Game  
**Stack:** Node.js / Express backend · Vanilla JS + Phaser 4 frontend (Vite) · PostgreSQL (Neon) · MediaPipe + TF.js KNN gesture control  
**Date:** May 2026

---

## 1. System Integration & Architecture

**Estimated Band: Developing → Proficient (75–84%)**

### What is present
- A single Express server (`server/server.js`) exposes all REST endpoints under three route prefixes: `/auth`, `/admin`, and `/leaderboard`.
- The frontend (`web/`) consumes every one of those routes through a Vite dev-proxy and the same base URL in production. There is effectively **one backend, one database** serving both web and mobile-like gesture input.
- `StateManager` acts as a thin pub/sub state bus that keeps client state in sync across screens.
- `ScreenManager` acts as a client-side router; all 18 screens are registered in `main.js` and share the same state singleton.

### What is missing / weak
- **No formal architecture pattern** (Microservices, Clean Architecture, layered MVC). The entire service logic — auth, admin, leaderboard, encryption, email — lives in one 1 273-line monolithic file (`server.js`). There is no service layer, no controller layer, no route file split.
- **No dedicated mobile client.** The project uses a web browser in landscape orientation as a stand-in for mobile. There is no native app (Kivy, BeeWare, React Native, Flutter) consuming the backend.
- The `db.js` compatibility shim (SQLite `?` → PostgreSQL `$N` conversion) is a workaround for a migration that was never fully cleaned up; raw `$1`/`$2` literals leak into `server.js` (e.g. leaderboard query line 1247) while other queries still use `?`, making the data layer inconsistent.
- Token blacklist is an **in-memory `Set`** — it is wiped on every server restart, which is a reliability and correctness gap.

### Recommendation
Split `server.js` into `routes/`, `controllers/`, and `services/` directories. Move the token blacklist to Redis or a DB table. Create a simple mobile wrapper (React Native or Flutter) that calls the same API.

---

## 2. Python Web & Mobile Compatibility

**Estimated Band: Beginner (< 70%)**

### What is present
- The backend is **Node.js/Express**, not Python. No Django, Flask, or FastAPI is present anywhere in the repository.
- The frontend is Vanilla JS + Phaser 4. The gesture pipeline uses MediaPipe (JS SDK) + TF.js KNN — entirely JavaScript.

### What is missing / weak
- The rubric explicitly requires a **Python backend** and recommends Kivy/BeeWare or React Native/Flutter for mobile.
- There is no Python component at all. This criterion will be scored at or near zero unless the team ports the backend or adds a Python microservice.

### Recommendation
Introduce at least a minimal **FastAPI** microservice (e.g., a gesture inference endpoint or a score validation service) that the Express server proxies. This satisfies the "Python-based Core Service" requirement without a full rewrite. For mobile, a React Native thin client consuming the existing REST API would satisfy the cross-platform requirement.

---

## 3. Information Assurance (IA)

**Estimated Band: Proficient → Exceptional (85–95%)**

### What is present
| Control | Implementation | File / Line |
|---|---|---|
| **AES-256-GCM encryption at rest** | User's `encrypted_data` field is AES-256-GCM encrypted on registration and decrypted on profile load | `server.js:231–238`, `server.js:384–391` |
| **bcrypt password hashing** | Cost factor 12 on registration and password change | `server.js:225–226`, `server.js:538–539` |
| **JWT authentication** | `HttpOnly`, `SameSite=lax`, `Secure` (in prod) cookie; 30-day expiry; `invalidate_before` per-user invalidation | `server.js:96–112`, `server.js:306–314` |
| **Token blacklisting** | In-memory `Set` for single-session invalidation; DB-level `invalidate_before` for all-device logout | `server.js:94`, `server.js:681–692` |
| **SQL injection prevention** | All queries use parameterized inputs via `db.get/run/all` wrapper; `isValidUsername` / `isValidEmail` sanitization before DB touch | `server.js:134–148`, `db.js:9–12` |
| **Rate limiting** | `express-rate-limit`: 25 req/min on `/auth`, 10 req/min on login, 5 req/hr on password reset | `server.js:68–92` |
| **Helmet.js** | HTTP security headers applied globally | `server.js:57` |
| **Account lockout** | 5 failed attempts → 15-minute lockout stored in DB | `server.js:334–344` |
| **Admin privilege checks** | `adminMiddleware` verifies `is_admin` flag on every admin route | `server.js:115–128` |
| **Input validation** | Username, email, password complexity enforced server-side | `server.js:182–208` |

### What is missing / weak
- **Data in transit:** HTTPS/TLS is assumed from the hosting platform (Neon + Netlify/ngrok) but is **not enforced in code**. There is no `app.use` redirect from HTTP to HTTPS, no HSTS header configured via Helmet.
- **Helmet CSP is disabled** (`contentSecurityPolicy: false`) — this is a notable omission for a web game that loads external scripts (MediaPipe CDN).
- The **in-memory token blacklist** is not persistent; a server restart silently un-blacklists all tokens.
- The `reset_token` stored in the DB is a plain 6-digit integer — low entropy, guessable by brute force if rate limiting were bypassed.
- `encrypted_data` protects registration metadata but **game progress (`game_data`) is stored in plaintext JSON** in the database.

### Recommendation
Enable Helmet CSP with a proper `script-src` allowlist. Add HSTS. Persist the token blacklist. Encrypt `game_data` the same way `encrypted_data` is handled. Use a cryptographically random reset token (`crypto.randomBytes`) instead of `Math.random()`.

---

## 4. Reliability & Sustainability

**Estimated Band: Developing → Proficient (75–82%)**

### What is present
- PostgreSQL connection pool with `max: 10`, idle/connection timeouts, and a pool error handler (`db.js:55–57`).
- Fatal startup guard: process exits if `JWT_SECRET` or `AES_SECRET_KEY` are missing (`server.js:23–26`).
- DB migrations use `ALTER TABLE … ADD COLUMN IF NOT EXISTS` for safe incremental schema updates.
- Admin accounts are idempotently seeded from environment variables.
- `StateManager` catches and logs all event listener errors.

### What is missing / weak
- **No process manager** (PM2, Docker, systemd) configuration committed to the repo. If the Node process crashes, it stays down.
- **No automated tests** — no unit tests, integration tests, or end-to-end tests found in the repository.
- **No logging framework** — all logging is ad-hoc `console.log/error`. No structured log output, no log levels, no log rotation.
- **No health-check endpoint** — there is no `GET /health` that an uptime monitor or load balancer can poll.
- The monolithic `server.js` makes future maintenance difficult; adding a new feature requires reading the entire file to understand all interdependencies.
- The `tokenBlacklist` `Set` leaks memory in long-running servers as tokens are never evicted after expiry.

### Recommendation
Add a `GET /health` endpoint. Add a `pm2.config.js` or `Dockerfile`. Introduce `winston` or `pino` for structured logging. Write at minimum one integration test per auth flow.

---

## 5. Cloud Deployment & Virtualization

**Estimated Band: Developing (70–78%)**

### What is present
- The database is hosted on **Neon.tech** (serverless PostgreSQL), a cloud-managed service. `db.js` correctly handles SSL for remote connections.
- The frontend is built with Vite and is deployable to Netlify (standard static host). `vite.config.js` exposes a `VITE_API_URL` environment variable for production wiring.
- The ngrok host (`chaperone-bok-speckled.ngrok-free.dev`) in `vite.config.js` suggests active use of tunneling for development/demo.

### What is missing / weak
- **No containerization** — no `Dockerfile`, no `docker-compose.yml`.
- **No CI/CD pipeline** — no GitHub Actions, no build/deploy workflow file in `.git/` or `.windsurf/`.
- **No cloud server deployment config** — the backend (`server/`) has no Heroku `Procfile`, Render `render.yaml`, Railway config, or equivalent. It is likely run manually.
- **No monitoring or alerting** setup (e.g., UptimeRobot, Datadog, Sentry).
- Vite's `allowedHosts: ['all']` is a security risk in production.

### Recommendation
Write a `Dockerfile` for the Express backend and deploy it to Render or Railway. Add a GitHub Actions workflow for automated build + deploy. Remove `allowedHosts: ['all']` and restrict to specific domains.

---

## 6. API Gateway & Core Service Design

**Estimated Band: Developing → Proficient (76–83%)**

### What is present
- A **single Express app** acts as the central gateway for all three clients (web browser, gesture input, admin dashboard).
- All routes share `authMiddleware` and `adminMiddleware` as a consistent auth layer.
- The Vite dev proxy (`/auth`, `/admin`, `/leaderboard`) simulates an API gateway pattern for local development.
- Endpoints are logically grouped (`/auth/*` for user management, `/admin/*` for moderation, `/leaderboard/*` for scores).

### What is missing / weak
- **No actual API Gateway** (Kong, AWS API Gateway, Nginx) — routing, SSL termination, and rate limiting are all baked into the application itself.
- **No Python Core Service** as required by the rubric — Node.js is the sole backend language.
- No API versioning (`/v1/`, `/v2/`), which makes future breaking changes risky.
- No OpenAPI / Swagger documentation for the REST API.

### Recommendation
Document all endpoints using **Swagger/OpenAPI** (e.g., `swagger-jsdoc` + `swagger-ui-express`). Add a `/v1/` prefix. Optionally introduce an Nginx reverse proxy in front of the Express server to handle SSL, compression, and basic routing.

---

## 7. Data Security & Encryption

**Estimated Band: Proficient (82–88%)**

### What is present
- **AES-256-GCM** (authenticated encryption) for `encrypted_data` at rest.
- **bcrypt (cost 12)** for password hashing — industry standard, not reversible.
- **JWT in HttpOnly cookies** prevents XSS-based token theft; `Secure` flag in production prevents transmission over HTTP.
- Parameterized queries throughout prevent SQL injection.

### What is missing / weak
- `game_data` (chapter progress, settings, bestiary) is stored as **plaintext JSON** — not encrypted at rest.
- `gestureModel` blobs are stored as plaintext JSON in `user_gesture_models`.
- **HTTPS is not enforced by the application** — TLS depends entirely on the hosting platform.
- The AES key (`AES_SECRET_KEY`) is a single shared key; there is no key rotation mechanism.
- Helmet CSP is disabled, which opens the door to XSS that could then exfiltrate data.

---

## 8. Cloud Scalability & Load Handling

**Estimated Band: Beginner → Developing (65–73%)**

### What is present
- PostgreSQL connection pool (`max: 10`) provides basic connection reuse.
- Neon's serverless PostgreSQL scales compute automatically.
- Rate limiting prevents individual clients from overloading the server.

### What is missing / weak
- **No horizontal scaling** — the Node.js server is a single process with no cluster mode or load balancer.
- The in-memory `tokenBlacklist` `Set` is not shared between processes, so any multi-process or multi-instance deployment would break token revocation.
- No caching layer (Redis, in-memory LRU) for leaderboard queries, which currently run full window-function scans on every request.
- No auto-scaling configuration for the backend hosting.
- No performance testing or benchmarks to characterize load limits.

### Recommendation
Use Node.js `cluster` module or PM2 cluster mode. Move the token blacklist to Redis (which also enables a caching layer for leaderboard reads). Add `Cache-Control` headers on the public leaderboard endpoint.

---

## 9. Mobile & Web Synchronization

**Estimated Band: Proficient (80–87%)**

### What is present
- `StateManager._syncToServer()` sends a full state snapshot (`settings`, `tutorialComplete`, `gestureSetupComplete`, `chapterProgress`, `bestiary`, `gestureModel`) to `/auth/save-data` on every meaningful state change.
- `StateManager.hydrateFromServer()` pulls authoritative state from `/auth/me` immediately after login, overwriting any local stale state — preventing cross-account data bleed.
- The gesture KNN model is synced to and from the server (stored in `user_gesture_models` table), so a player's trained gestures follow their account across devices.
- Guest vs. registered session handling (`_isGuest()`) prevents syncing for unauthenticated users.

### What is missing / weak
- Synchronization is **request/response only** — there is no WebSocket or Server-Sent Events for real-time updates.
- There is no **conflict resolution strategy** if the same account is logged in on two devices simultaneously and both make progress.
- No **native mobile client** — the "mobile" experience is the same web app in a browser. True cross-platform sync between a native app and web is not demonstrated.
- Gesture model sync sends and receives the full KNN tensor data (potentially several MB) on every save — no delta sync.

---

## 10. Technical Documentation

**Estimated Band: Developing (70–76%)**

### What is present
- JSDoc-style comments on key classes (`StateManager`, `GestureClassifier`, `GestureController`).
- `.env.example` provides a complete environment variable reference.
- Inline comments explain non-obvious decisions (placeholder conversion, token blacklisting, pool error handling).

### What is missing / weak
- **No architecture diagram** showing the relationship between frontend, backend, database, and gesture pipeline.
- **No API documentation** (Swagger/Postman collection/README table of endpoints).
- **No deployment procedure document** — how to deploy from scratch is not written down anywhere.
- **No security policy document** describing the IA controls in place.
- The `GUIDES/` directory in the repo appears empty.
- `README.md` does not exist at the project root.

### Recommendation
Create a root `README.md` covering: project overview, local setup instructions, environment variable reference, and a list of all API endpoints. Add a simple architecture diagram (even ASCII/Mermaid). The `GUIDES/` folder should contain at minimum a deployment guide and a security overview.

---

## 11. Innovation & Practicality

**Estimated Band: Proficient → Exceptional (85–92%)**

### What is present
- **Hand gesture control** using MediaPipe Hands + a custom KNN classifier (TF.js) trained per-user in the browser. This is a genuinely novel input method for a browser-based game and goes well beyond standard keyboard/mouse controls.
- The KNN model is **personalized per user** and persisted both locally (IndexedDB) and in the cloud (PostgreSQL), surviving across devices and sessions.
- The gesture training flow (`GestureTraining.js`) provides an in-app UI for users to record and retrain their own gesture samples — a complete ML feedback loop in the browser.
- The admin dashboard includes **cheat detection flags** (`cheat_score`, suspicious score thresholds), ban/unban workflow, and force-logout capability — practical moderation tooling for a live game.
- The game supports **three chapters**, two control modes (gesture / keyboard), and an endless survival mode with a per-chapter, per-control-type leaderboard.

### What is missing / weak
- The gesture pipeline is entirely client-side; there is no server-side model validation or inference, which means a malicious client could fabricate gesture inputs.
- The project would benefit from a short **demo video or interactive walkthrough** to showcase innovation to evaluators.

---

## Summary Table

| Rubric Criterion | Estimated Band | Key Gap |
|---|---|---|
| System Integration & Architecture | Developing–Proficient | Monolithic server, no mobile native client |
| Python Web & Mobile Compatibility | **Beginner** | No Python component whatsoever |
| Information Assurance | Proficient–Exceptional | HTTPS not enforced, CSP disabled, game_data unencrypted |
| Reliability & Sustainability | Developing–Proficient | No tests, no process manager, in-memory blacklist |
| Cloud Deployment & Virtualization | **Developing** | No Docker, no CI/CD, backend not containerized |
| API Gateway & Core Service Design | Developing–Proficient | No Python core service, no API versioning/docs |
| Data Security & Encryption | Proficient | game_data plaintext, HTTPS depends on host |
| Cloud Scalability & Load Handling | Beginner–Developing | Single process, in-memory blacklist, no caching |
| Mobile & Web Synchronization | Proficient | No native mobile client, no real-time push |
| Technical Documentation | **Developing** | No README, no architecture diagram, no API docs |
| Innovation & Practicality | Proficient–Exceptional | Strong — gesture ML is the standout feature |

---

## Priority Action Items

1. **[Critical — Python requirement]** Add a minimal FastAPI microservice (e.g., score validation or a gesture inference endpoint). This is the single biggest rubric gap.
2. **[High — Documentation]** Write `README.md`, add a Mermaid architecture diagram, and document all REST endpoints.
3. **[High — Deployment]** Add `Dockerfile` + GitHub Actions CI/CD. This covers Cloud Deployment & Virtualization.
4. **[Medium — Security]** Enable Helmet CSP, enforce HTTPS redirect, encrypt `game_data` at rest, replace Math.random reset tokens with `crypto.randomBytes`.
5. **[Medium — Reliability]** Move token blacklist to Redis or a DB table. Add a `GET /health` endpoint. Introduce at least smoke-level integration tests.
6. **[Low — Scalability]** Add leaderboard response caching. Enable PM2 cluster mode.
