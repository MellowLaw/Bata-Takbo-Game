# INF (Endless) Mode - Implementation Plan

## Overview
INF Mode is an endless survival mode where players face an infinite gauntlet of all bosses. The mode unlocks after completing all chapters, offering a skill-based competitive experience with separate leaderboards for different control schemes.

---

## Core Design Philosophy

### 1. **Accessibility vs. Mastery**
- Early waves should be winnable by average players (build confidence)
- Late waves should test mastery of ALL attack patterns
- Damage taken should be punishing but fair - one mistake = significant HP loss, not instant death

### 2. **Progressive Difficulty Scaling**
Instead of pure stat increases, use **layered complexity**:

| Wave Range | Boss HP | Attack Speed | Special Mechanics |
|------------|---------|--------------|-------------------|
| 1-5 | 100% | Normal | Standard patterns |
| 6-15 | +20% per wave | +10% faster | 2x simultaneous attacks |
| 16-30 | +30% per wave | +25% faster | 3x simultaneous attacks, faster telegraphs |
| 31+ | +50% per wave | +40% faster | All bosses have "enraged" variants |

### 3. **Boss Rotation System**
**RECOMMENDATION: Sequential with Random Attacks**

Why sequential?
- Predictable progression (players can plan strategy)
- Fair leaderboard comparison (same boss order)
- Psychological: "I'm on Wave 47, facing Kapre again!"

**Rotation Pattern:**
```
Wave 1: Chapter 1 Boss (Manananggal)
Wave 2: Chapter 2 Boss (Bungisngis)  
Wave 3: Chapter 3 Boss (Fish King)
Wave 4: Chapter 1 Boss (harder variant)
Wave 5: Chapter 2 Boss (harder variant)
...and so on
```

---

## Enhanced Attack Balance for INF Mode

### Problem: Some Attacks Are Undodgeable at High Speeds

**Solution: Attack Categorization with Scaling Limits**

#### Category A - "Predictable" (Can scale infinitely)
- Linear projectiles (bats, sharks)
- Fixed pattern attacks (explosion grids)
- Telegraph time always sufficient
- **Scaling:** Speed can increase 2x safely

#### Category B - "Reaction-Based" (Hard capped scaling)
- Sudden directional changes
- Instant appearance attacks (medusa gaze)
- Player position tracking
- **Scaling:** Speed capped at +25%, instead increase **frequency** of attacks

#### Category C - "Area Denial" (Modified for fairness)
- Large unavoidable zones
- Multiple overlapping hitboxes
- **INF Mode Modification:** 
  - Always leave at least 1 "safe tile"
  - Reduce hitbox size by 10% per wave after 20
  - Add visual "breathing room" indicators

### Specific Balance Adjustments for INF Mode

| Attack | Chapter | Issue at High Speed | INF Mode Fix |
|--------|---------|---------------------|--------------|
| Angler (Blackout) | 3 | Hard to see safe zones | Add pulsing safe zone borders |
| Medusa Gaze | 3 | Instant damage on move | Add 0.5s grace period before damage |
| Bat Dive Bomb | 3 | 5 bats = screen covered | Cap at 3 bats, increase speed instead |
| Shark Lanes | 3 | Multiple sharks = unavoidable | Max 3 simultaneous sharks |
| Siren's Lure | 3 | Snake too fast to outrun | Snake pauses every 3rd tile |

---

## Health & Survival Mechanics

### Player Health Scaling
```javascript
// Don't let player die in one hit
const maxPlayerHealth = 3; // Hearts system
const damagePerHit = 1;    // Always consistent

// Recovery mechanic
const healOnBossDefeat = 1; // Restore 1 heart per boss
const maxHeartsCap = 5;     // Can't overheal beyond 5
```

### Boss Health Formula
```javascript
// Exponential but bounded growth
const baseHealth = 1000;
const waveMultiplier = Math.min(1 + (wave * 0.15), 5); // Cap at 5x HP
const bossHealth = baseHealth * waveMultiplier;
```

---

## Dual Leaderboard System

### Separation Criteria
| Control Type | Input Method | Leaderboard |
|--------------|--------------|-------------|
| **Standard** | Keyboard / Touch D-pad / Gamepad | `leaderboard_standard` |
| **Gesture** | Hand tracking (MediaPipe) | `leaderboard_gesture` |

### Why Separate?
1. **Fairness**: Gesture has higher latency (~100-200ms) vs keyboard (instant)
2. **Different Skill Sets**: Gesture requires physical stamina, keyboard requires precision
3. **Prevents Hybrid Cheating**: Can't switch mid-run for advantage

### Leaderboard Schema
```sql
CREATE TABLE inf_leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    control_type TEXT CHECK(control_type IN ('standard', 'gesture')),
    wave_reached INTEGER NOT NULL,
    bosses_defeated INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    run_duration_seconds INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE -- Anti-cheat flag
);

-- Composite ranking: Wave first, then score
CREATE INDEX idx_leaderboard_ranking 
ON inf_leaderboard(control_type, wave_reached DESC, total_score DESC);
```

### Score Calculation
```javascript
// Rewards both survival and efficiency
const survivalScore = waveReached * 1000;
const speedBonus = Math.max(0, 300 - runDurationMinutes) * 10;
const perfectWaveBonus = wavesWithoutDamage * 50;
const totalScore = survivalScore + speedBonus + perfectWaveBonus;
```

---

## Technical Implementation Plan

### Phase 1: Core Infrastructure (Week 1)
1. **Database Schema**
   - Add `inf_leaderboard` table
   - Migration script for existing users

2. **State Manager Updates**
   - Add `inf_mode_unlocked` flag (set when all chapters completed)
   - Add `inf_best_wave` tracking per control type

3. **New Scene: INFModeScene.js**
   - Extends BaseBossScene
   - Dynamic boss loading based on wave number
   - Wave transition system

### Phase 2: Boss Adaptation (Week 2)
1. **Boss Factory Pattern**
   ```javascript
   class BossFactory {
       static createBossForWave(waveNumber, chapterId) {
           const boss = new Boss(chapterId);
           boss.applyINFScaling(waveNumber);
           return boss;
       }
   }
   ```

2. **Scaling System**
   - `applyINFScaling(wave)` method on Boss class
   - Configurable per-attack scaling rules

3. **Attack Modifiers**
   - Speed multiplier
   - HP multiplier  
   - Simultaneous attack count
   - Safe zone adjustments

### Phase 3: UI/UX (Week 3)
1. **INF Mode Menu**
   - Unlock notification popup
   - Best wave display per control type
   - Leaderboard preview

2. **In-Game HUD**
   - Wave counter (prominent)
   - Boss rotation indicator ("Next: Bungisngis")
   - Current scaling level ("Speed: 1.5x")

3. **Leaderboard Screen**
   - Tabbed view (Standard / Gesture)
   - Player rank highlight
   - "Watch Replay" button (future feature)

### Phase 4: Balance & Testing (Week 4)
1. **Internal Testing**
   - Playtest waves 1-50
   - Identify impossible attack combinations
   - Tune scaling curves

2. **Soft Launch**
   - Release to beta testers
   - Monitor average wave reached
   - Adjust difficulty distribution

---

## Anti-Cheat Measures

### Client-Side (Basic)
- Input validation (reject impossible movement speeds)
- Gesture confidence threshold (reject low-confidence classifications)
- Runtime integrity checks

### Server-Side (Primary)
```javascript
// Run validation on score submission
function validateRun(runData) {
    // 1. Check minimum possible time per wave
    const minTimePerWave = 45; // seconds
    if (runData.duration < runData.wave * minTimePerWave) {
        return { valid: false, reason: 'Impossible speed' };
    }
    
    // 2. Verify boss sequence matches server seed
    const expectedSequence = generateBossSequence(runData.seed);
    if (!arraysEqual(runData.bossOrder, expectedSequence)) {
        return { valid: false, reason: 'Sequence mismatch' };
    }
    
    // 3. Score calculation verification
    const expectedScore = calculateScore(runData);
    if (Math.abs(runData.score - expectedScore) > 100) {
        return { valid: false, reason: 'Score mismatch' };
    }
    
    return { valid: true };
}
```

---

## Monetization (Optional Future)

### Cosmetic-Only Approach
- **INF Skins**: Unlock palette swaps at wave milestones
  - Wave 10: Gold trim
  - Wave 25: Neon cyberpunk theme
  - Wave 50: True black & white classic

- **Taunt Emotes**: Usable between waves
  - Unlocked by perfect waves (no damage)

### Never Pay-to-Win
- No continues
- No power-ups
- Pure skill-based progression

---

## Open Questions for Discussion

1. **Should we allow "INF Mode Practice"?**
   - Option to practice any wave you've reached
   - No leaderboard impact
   - Risk: Players might grind only easy waves

2. **Weekly Rotations?**
   - Special weekly modifiers ("All attacks 2x speed", "Invisible telegraphs")
   - Separate weekly leaderboards

3. **Spectator Mode?**
   - Allow watching top players' runs
   - Educational for gesture users

4. **Guild/Clan System?**
   - Cooperative INF mode (share lives?)
   - Guild leaderboard (sum of top 5 members)

---

## Recommended First Steps

### Immediate (Today)
1. Add `inf_mode_unlocked` to StateManager
2. Create `INF_MODE_PLAN.md` (this document)
3. Design database schema

### This Week
1. Implement basic INFModeScene with sequential boss rotation
2. Add simple HP scaling (no attack speed yet)
3. Create placeholder leaderboard UI

### Testing Priority
1. Wave 1-10: Should be accessible to chapter 3 completers
2. Wave 20-30: Should challenge top 10% players
3. Wave 50+: Should be "Impossible but theoretically survivable"

---

## Summary

INF Mode transforms Bata, Takbo! from a chapter-based game into an infinite skill expression platform. The dual leaderboard system respects different playstyles while the progressive scaling ensures both accessibility and long-term mastery.

**Key Success Metrics:**
- 60%+ of chapter-completers try INF mode within 1 week
- Average wave reached: 12-15 for standard, 8-12 for gesture
- Top 1% players reach wave 40+
- No "impossible" attack combinations in first 50 waves
