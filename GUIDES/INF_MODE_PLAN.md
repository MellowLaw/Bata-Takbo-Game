# Per-Chapter INF Mode — Implementation Plan

## Overview
Each chapter gets its own endless survival mode. The boss has infinite HP — it never dies. Instead, attacks loop forever with progressive speed scaling. Players compete on **score** (dodged attacks + golden tile pickups + time bonus) via a dual leaderboard split by control type. Unlocked per-chapter after clearing that chapter normally.

---

## Design Decisions & Rationale

### 1. Speed Scaling — Yes, Do It
Progressive speed scaling is the right call. Here's why:
- **Thrilling** — the pressure ramp keeps players engaged ("just one more wave")
- **Skill differentiation** — top players are separated not by luck but by how long they handle the speed
- **Reference games** — Geometry Dash, Crypt of the Necrodancer, and most bullet hells all do this
- **RNG is fine** — over a long run the random attack pool averages out; top players survive longer *because* they handle bad RNG, not despite it

**Speed Ramp Formula:**
```javascript
// Applied to telegraph duration and attack travel speed
// Starts at 1.0, softcaps at 2.5x — never gets physically undodgeable
const speedMultiplier = Math.min(1.0 + (waveCount * 0.015), 2.5);

// Telegraph duration scales DOWN (less warning time)
const telegraphMs = Math.max(400, 1200 / speedMultiplier);

// Applied inside Boss.executeAttack() via this.infSpeedMultiplier
```

Scaling starts subtle (~+1.5% per wave), so the first 20 waves feel normal. Wave 50 is noticeably faster. Wave 100+ is genuinely punishing.

### 2. Score System
Score rewards **skill expression**, not just survival time. Three components:

```
SCORE = (waves_survived × 100)          ← primary: how far you got
      + (golden_tiles_collected × 50)   ← skill: risky pickups under fire
      + (time_alive_seconds × 2)        ← tiebreaker: rewarding efficiency
      + (perfect_waves × 25)            ← bonus: no-damage waves
```

**Golden Tiles** — these are the existing loot/power-up tiles the boss already spawns. In INF mode they give score instead of (or in addition to) their normal effect. No new mechanic needed — just emit a `inf:tilecollected` event and accumulate.

**Perfect Wave** — a wave where the player takes 0 damage. Already trackable via `player.hp` before/after each `executeAttack()` cycle.

### 3. Leaderboard Fairness — RNG Verdict
RNG is acceptable and common in competitive games (Hades, Dead Cells, Slay the Spire). The attack pool is the same for everyone — no player gets a guaranteed easy sequence. The skill ceiling comes from handling *any* attack, not memorizing a fixed pattern. This is actually **healthier for a leaderboard** since it can't be pattern-solved.

---

## Database

Extends the existing `endless_scores` table pattern. New table in `db.js`:

```sql
CREATE TABLE IF NOT EXISTS inf_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  chapter_id INTEGER NOT NULL CHECK(chapter_id IN (1, 2, 3)),
  score INTEGER NOT NULL,
  waves_survived INTEGER NOT NULL,
  survival_seconds INTEGER NOT NULL,
  control_type TEXT NOT NULL CHECK(control_type IN ('gesture', 'keyboard')),
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inf_scores_ranking
ON inf_scores(chapter_id, control_type, score DESC);
```

Migration: add `try { await db.exec('CREATE TABLE IF NOT EXISTS inf_scores ...') } catch(e){}` in `db.js` alongside existing migrations.

---

## Server Endpoints

Two new endpoints in `server.js`, mirroring `/leaderboard/endless`:

```
POST /leaderboard/inf
  Body: { chapterId, score, wavesSurvived, survivalSeconds, controlType }
  Auth: required (registered users only)
  Validation: min 30s run, score ≤ waves×200+seconds×3 (anti-cheat ceiling)

GET /leaderboard/inf?chapterId=1&controlType=keyboard
  Returns: top 20 best scores per user (GROUP BY user_id, MAX score)
  Public: no auth required
```

### Caching Strategy
The game uses **SQLite** (no Redis). For this scale, **in-memory server-side caching** is sufficient:

```javascript
// Simple Map cache in server.js — no Redis needed
const lbCache = new Map();
const LB_CACHE_TTL = 60_000; // 1 minute

// On GET /leaderboard/inf:
const cacheKey = `inf_${chapterId}_${controlType}`;
const cached = lbCache.get(cacheKey);
if (cached && Date.now() - cached.ts < LB_CACHE_TTL) {
  return res.json({ entries: cached.data });
}
// ... run DB query, then:
lbCache.set(cacheKey, { data: rows, ts: Date.now() });
```

**Why this is fine for your scale:**
- SQLite handles ~10k reads/sec easily
- Leaderboard fetches are infrequent (only on results screen load)
- 1-minute cache means the DB gets hit at most once per minute per leaderboard tab
- If you ever scale to thousands of concurrent users, swap the Map for Redis — the interface is identical (`get`/`set`/`TTL`)
- Cache is invalidated automatically on POST (new score submitted)

---

## Game Logic Changes

### Boss.js
```javascript
// New property set by GameScene when inf mode is active
this.isInfMode = false;
this.infWaveCount = 0;
this.infSpeedMultiplier = 1.0;

// In executeAttack() — instead of checking hp <= 0 to stop:
if (this.isInfMode) {
  this.infWaveCount++;
  this.infSpeedMultiplier = Math.min(1.0 + (this.infWaveCount * 0.015), 2.5);
  // Never call showGameOver on boss death — reset HP instead
  this.hp = this.maxHp;
}
```

Telegraph calls inside attacks already use a duration parameter — multiply it by `(1 / this.infSpeedMultiplier)` to speed up warnings proportionally.

### GameScene.js
```javascript
// Passed via GameScreen navigation data
this.isInfMode = data.isInfMode || false;
this.infScore = 0;
this.infPerfectWave = true; // reset each wave

// On player.takeDamage() in inf mode: this.infPerfectWave = false
// On each executeAttack() complete: accumulate score, reset infPerfectWave
// On player death (hp === 0): call showGameOver with inf score instead of chapter score
```

### HUDScene.js
In INF mode, replace the boss HP bar area with a **wave counter + score display**. The boss HP bar is meaningless since the boss never dies.

---

## Leaderboard Screen Changes

The existing `Leaderboard.js` screen gets a new tab row:

```
[ ENDLESS ] [ CH1 INF ] [ CH2 INF ] [ CH3 INF ]
            [ keyboard / gesture toggle ]
```

Each tab fetches `GET /leaderboard/inf?chapterId=X&controlType=Y`.
Same display format as the existing endless leaderboard.

---

## Implementation Order

### Step 1 — Database & Server (½ day)
1. Add `inf_scores` table to `db.js`
2. Add POST + GET `/leaderboard/inf` endpoints to `server.js` with in-memory cache

### Step 2 — Game Logic (1 day)
1. Add `isInfMode` flag to `Boss.js` — reset HP on "death" instead of triggering victory
2. Add speed multiplier applied to telegraph durations
3. Add score accumulation in `GameScene.js` (waves + golden tiles + time + perfect)
4. Pass `isInfMode: true` from `ChapterSelect` as a mode toggle

### Step 3 — HUD (½ day)
1. In `HUDScene.js` — swap boss HP bar for wave counter in inf mode
2. Show live score in top bar (already has `scoreText`)

### Step 4 — Results & Submit (½ day)
1. Add `_submitInfScore()` to `ResultsScreen.js` (copy of `_submitEndlessScore`)
2. Add inf-specific results layout showing wave reached + score

### Step 5 — Leaderboard UI (½ day)
1. Add CH1/CH2/CH3 INF tabs to `Leaderboard.js`
2. Wire fetch to new endpoint

**Total: ~3 days of focused work**

---

## Anti-Cheat

Server-side validation on POST `/leaderboard/inf`:
```javascript
// Impossible score ceiling — catches injected scores
const maxPossibleScore = (wavesSurvived * 200) + (survivalSeconds * 3);
if (score > maxPossibleScore) return res.status(400).json({ error: 'Invalid score' });

// Minimum time sanity check (~15s per wave minimum)
if (survivalSeconds < wavesSurvived * 15) return res.status(400).json({ error: 'Impossible speed' });
```

---

## Summary

| Aspect | Decision |
|--------|----------|
| Speed scaling | Yes — +1.5%/wave, softcap 2.5× |
| Score formula | Waves×100 + tiles×50 + seconds×2 + perfect×25 |
| RNG fairness | Acceptable — same pool for all, skill = handling any pattern |
| Leaderboard split | keyboard vs gesture per chapter (6 boards total) |
| Caching | In-memory Map, 60s TTL — no Redis needed at this scale |
| DB | New `inf_scores` table, same SQLite setup |
| Complexity | ~3 days — reuses all existing attack infrastructure |
