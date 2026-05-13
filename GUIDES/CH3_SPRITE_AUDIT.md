# Chapter 3 Sprite Audit
> Cross-reference of actual sprite sheet frames vs. what the code expects.
> **✅ OK** = matches | **⚠️ CHECK** = possible mismatch — verify visually | **❌ WRONG** = confirmed mismatch

---

## CREATURES

### Bat
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_bat_fly` | Bat-IdleFly.png | 64×64 | **9** (1 row) | 8 → end:8 | ✅ OK |
| `ch3_bat_hit` | Bat-Attack1.png | 64×64 | **8** (1 row) | 7 → end:7 | ✅ OK |
| *(unused)* | Bat-Attack2.png | 64×64 | **10** (1 row) | — | — not loaded |

> **Note:** Bat-Attack2.png exists but is never loaded or used.

---

### Fish King
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_fishking_idle` | Fish-king/Idle.png | 250×250 | **8** (1 row) | 7 → end:7 | ✅ OK |
| `ch3_fishking_wand` | Fish-king/Attack1.png | 250×250 | **8** (1 row) | 7 → end:7 | ✅ OK |
| `ch3_fishking_spell` | Fish-king/Attack2.png | 250×250 | **8** (1 row) | 7 → end:7 | ✅ OK |

---

### Shark
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_shark_idle` | Shark/Idle.png | 48×48 | **4** (1 row) | 3 → end:3 | ✅ OK |
| `ch3_shark_walk` | Shark/Walk.png | 48×48 | **4** (1 row) | 3 → end:3 | ✅ OK |
| `ch3_shark_attack` | Shark/Attack.png | 48×48 | **6** (1 row) | 5 → end:5 | ✅ OK |

---

### Jellyfish
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_jelly_idle` | JellyFish/Idle.png | 48×48 | **4** (1 row) | 3 → end:3 | ✅ OK |
| `ch3_jelly_walk` | JellyFish/Walk.png | 48×48 | **4** (1 row) | 3 → end:3 | ✅ OK |
| `ch3_jelly_attack` | JellyFish/Attack.png | 48×48 | **4** (1 row) | 3 → end:3 | ✅ OK |
| `ch3_jelly_death` | JellyFish/Death.png | 48×48 | **6** (1 row) | 5 → end:5 | ✅ OK |

---

### Nemo
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_nemo_swim` | normalswim.png | 64×64 | **4** (2×2) | 3 → end:3 | ✅ OK |
| `ch3_nemo_chomp` | normalchomp.png | 64×64 | **4** (2×2) | 3 → end:3 | ✅ OK |
| `ch3_nemo_diagdn` | normalswimdiagdown.png | 64×64 | **4** (2×2) | 3 → end:3 | ✅ OK |
| `ch3_nemo_diagup` | normalswimdiagup.png | 64×64 | **4** (2×2) | 3 → end:3 | ✅ OK |
| `ch3_nemo_tiltdn` | normaltiltdownchomp.PNG | 64×64 | **4** (1×4) | 3 → end:3 | ✅ OK |
| `ch3_nemo_tiltup` | normaltiltupchomp.png | 64×64 | **4** (1×4) | 3 → end:3 | ✅ OK |

---

### Snake
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_snake` | Snake/snake.png | 64×64 | **14** (2 rows × 7 cols) | 13 → end:13 | ✅ OK |

---

### Siren 1 (used in ch3SirensLure attack)
| Key | File | frameW×H | Frames in Sheet | Code end | Status |
|-----|------|-----------|-----------------|----------|--------|
| `ch3_siren1` | Siren1/Idle.png | 128×128 | **7** (1 row) | auto (all) | ⚠️ CHECK — anim uses `generateFrameNumbers('ch3_siren1')` with no start/end → auto-detects all frames. Confirm 7 frames parse correctly at 128×128 |
| `ch3_siren1_walk` | Siren1/Walk.png | **64×64** | ~**13** visible frames | 12 → end:12 | ❌ WRONG frameW — Walk.png frames appear to be **~80×100px** not 64×64. This causes the siren to appear huge/clipped and invisible on mobile. **Needs correct frameWidth/Height** |
| `ch3_siren1_attack` | Siren1/Attack_3.png | **64×64** | ~**10** visible frames | 9 → end:9 | ⚠️ CHECK — Attack_3.png frames also appear wider than 64px. Verify actual pixel dimensions |

> **Priority fix:** `ch3_siren1_walk` and `ch3_siren1_attack` — wrong frame size = garbled/oversized sprite on mobile.

---

### Siren 2 & 3 (currently not actively used in attacks but loaded)
| Key | File | frameW×H | Code | Status |
|-----|------|-----------|------|--------|
| `ch3_siren2` | Siren2/Idle.png | 128×128 | auto frames | ⚠️ CHECK |
| `ch3_siren3_idle` | Siren3/Idle.png | 128×128 | auto frames | ⚠️ CHECK |
| `ch3_siren3_special` | Siren3/Special.png | 128×128 | auto frames | ⚠️ CHECK |

---

### Cthulhu
| Key | File | frameW×H | Code | Status |
|-----|------|-----------|------|--------|
| `ch3_cthulhu` | cthulu.png | 96×56 | idle:0-14, fly:30-44, slash:45-59, cast:60-74 | ⚠️ CHECK — file comment says 192×112 per frame but loaded as 96×56. May be cutting frames in half |

---

## EXPLOSIONS (Kataw patterns)

| Key | File | frameW×H | Approx Frames | Code end | Status |
|-----|------|-----------|---------------|----------|--------|
| `ch3_explosion_1` | explosion-1-b.png | 80×48 | **~10** | 9 (via anim key `1`) | ⚠️ CHECK |
| `ch3_explosion_2` | explosion-2-b.png | 48×48 | **~5** | 4 (via anim key `2`) | ⚠️ CHECK |
| `ch3_explosion_3` | explosion-3-b.png | 48×48 | **~6** | 5 (via anim key `3`) | ⚠️ CHECK |
| `ch3_explosion_1d` | explosion-1-d.png | 64×64 | **~8** | 7 (via anim key `1d`) | ⚠️ CHECK |
| `ch3_explosion_2d` | explosion-2-d.png | 128×80 | **~10** | 9 (via anim key `2d`) | ⚠️ CHECK |
| `ch3_explosion_3d` | explosion-3-d.png | ~~192×192~~ → **48×48** | ~20 | 19 | ✅ FIXED — frameW/H corrected to 48×48 |

> **Fixed:** `ch3_explosion_4a` was a duplicate of `ch3_explosion_4` (same file). Removed the duplicate load and anim registration.

---

## WATER BEAMS / PROJECTILES

| Key | File | frameW×H | Frames | Code end | Status |
|-----|------|-----------|--------|----------|--------|
| `ch3_darkbolt` | Dark-Bolt.png | 64×88 | **12** | end:11 | ✅ OK |
| `ch3_firebomb` | Fire-bomb.png | 64×64 | **15** | end:14 | ✅ OK |
| `ch3_lightning` | Lightning.png | 64×128 | **11** | end:10 | ✅ OK |
| `ch3_tide_lightning` | tide_lightinging.png | 64×128 | **11** | end:10 | ✅ OK |
| `ch3_spark` | spark.png | 32×32 | **8** | end:7 | ✅ OK |
| `ch3_waterbeam` | water-beam.png | 63×32 | **4** | end:3 | ✅ OK |
| `ch3_waterbeam2` | water-beam2.png | 48×32 | **4** | end:3 | ✅ OK |
| `ch3_waterburst` | water-burst.png | 63×48 | **6** | end:5 | ✅ OK |
| `ch3_waterspiral` | water-spiral.png | 32×32 | **6** | end:5 | ✅ OK |
| `ch3_beam_multidir` | ~~sprite_sheet (3).png~~ → **ch3_beam_swirl.png** | **32×32** (actual 192×160) | **30** (6×5 grid) | end:29 | ✅ FIXED — renamed, frame size 64→32, count corrected to 30 |
| `ch3_light_showers` | light_showers.png | 64×64 | **12** | end:11 | ✅ OK |

---

## FX / MISC

| Key | File | frameW×H | Frames | Code end | Status |
|-----|------|-----------|--------|----------|--------|
| `ch3_smoke_spawn` | Smoke-Spawn.png | 64×64 | **13** | end:12 | ✅ OK |
| `ch3_monster2` | Monster2Pack.png | 64×32 | **24** (4×6) | end:23 | ✅ OK |
| `ch3_monster6` | Monster6Pack.png | 96×64 | **32** (4×8) | end:31 | ✅ OK |
| `ch3_explosion2` | Explosion 2 SpriteSheet.png | 48×48 | **18** | end:17 | ✅ OK |
| `eye_explosion` | fx/eye_explosion.png | 64×64 | varies | auto | ⚠️ CHECK |
| `ch3_fx_*` (7 blue FX) | blue/*.png | 32×32 | **4** each | end:3 | ✅ OK |

---

## SUMMARY OF ISSUES

### ✅ Fixed in This Session
| Issue | Fix Applied |
|-------|-------------|
| `ch3_beam_multidir` — was `sprite_sheet (3).png`, frameSize 64×64 (wrong), end:7 (wrong) | Renamed to `ch3_beam_swirl.png`, frameSize corrected to 32×32 (actual 192×160px), end:29 |
| `ch3_explosion_3a/3d` — frameWidth 192×192 (wrong) | Fixed to 48×48, end:19 |
| `ch3_explosion_4a` — duplicate of `ch3_explosion_4` | Removed duplicate load + anim |
| `ch3_explosion_1` anim end:12 (overcounts) | Fixed to end:9 (10 frames) |
| `ch3_explosion_2` anim end:7 (overcounts) | Fixed to end:4 (5 frames) |
| `ch3_explosion_3` anim end:6 (overcounts) | Fixed to end:5 (6 frames) |
| Siren `setScale(2.0)` fixed scale | Wrapped in `_mobileScale(2.0)` |
| `ch3_angler` — broken path (`angler/` vs `Angler/`), unused in attacks | Removed load + anim entirely |

### ❌ Still Needs Manual Fix
| Issue | What to do |
|-------|------------|
| `ch3_siren1_walk` — frameWidth 64 likely wrong | Open Walk.png in image editor, measure exact frame pixel width, update `GameScene.js` line 242 |

### ⚠️ Needs Visual Verification
| Issue | What to check |
|-------|---------------|
| `ch3_siren1_attack` frameWidth | Open Attack_3.png and measure actual pixel width per frame |
| `ch3_cthulhu` frameWidth 96 vs. commented 192 | Open cthulu.png and count cols to confirm |
| `ch3_explosion_1/2/3` (b variants) | Count frames visually to confirm end values |
| `ch3_explosion_1d/2d` (d variants) | Count frames visually to confirm end values |
| `ch3_siren2`, `ch3_siren3_*` | Check Siren2/ and Siren3/ folder frame sizes |

### 📐 Siren on Mobile (Size Issue)
The siren sprite (`setScale(2.0)` fixed, not using `_mobileScale`) appears too large on mobile because:
1. Wrong `frameWidth` causes Phaser to parse the sheet incorrectly → renders a wide slice instead of one character
2. `setScale(2.0)` is not wrapped in `_mobileScale()`

**Fix needed:** Correct `frameWidth/Height` for Walk.png + wrap siren scale in `_mobileScale()`.
