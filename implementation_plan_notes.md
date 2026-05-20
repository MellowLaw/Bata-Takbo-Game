# 📝 Implementation Plan & Verification Notes

This file outlines the status of all gaps, refactoring steps, and security integrations. You can edit this file, check off items, or write your own observation notes directly here as you test the application.

---

## 🏁 Completed Remediations

### 1. Database-Backed Session Blacklist
- [x] Create `blacklisted_tokens` database table in `db.js`.
- [x] Implement token blacklist check in auth middleware (`helpers.js`).
- [x] Configure `/logout`, `/logout-all`, and `/delete-account` in `routes/auth.js` to insert invalid tokens into the database.
- **Your Notes:** 
  *(Double-click here or edit this file to add your test observations)*

### 2. Leaderboard Cache Strategy
- [x] Add in-memory cache variable with 30-second TTL in `routes/leaderboard.js`.
- [x] Intercept `GET /leaderboard/endless` queries to return cached results on concurrent hits.
- **Your Notes:** 
  *e.g. Test standard scoreboard loads and check response times.*

### 3. Server Health Monitoring Route
- [x] Implement GET `/health` route in `server.js` returning status JSON.
- **Your Notes:** 
  can this be added on the admin panel?

### 4. PWA Push Notifications & Offline UX
- [x] Dynamic VAPID auto-generation on backend boot.
- [x] Push listener and notification click handler daemon in `sw.js`.
- [x] Frontend subscription toggles in settings and offline network status banner.
- **Your Notes:** 
  *e.g. Toggle browser network to Offline and check if the red status banner drops down.*

### 5. Architectural Refactoring (MVC)
- [x] Relocate core routes to separate router files in `server/routes/`.
- [x] Separate middleware, rate-limiters, and crypto into `helpers.js`.
- [x] Rebuild `server.js` as a lightweight startup orchestrator.
- **Your Notes:** 
  *e.g. Ensure local startup (npm start) runs with no compiler warnings.*

---

## 🧪 Quick Reference: Run Commands

Use these commands in your terminals to boot the environment:

* **Backend server:**
  ```bash
  cd server
  npm start
  ```
* **Frontend client:**
  ```bash
  cd web
  npm run dev
  ```
* **Production frontend compilation:**
  ```bash
  cd web
  npm run build
  ```
