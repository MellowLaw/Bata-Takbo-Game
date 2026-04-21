# Chapter 3: Kataw Boss Fight — Asset Reference Guide

This is the definitive reference for every sprite, animation key, frame slice, and mechanic implemented for the Kataw boss fight. Use this to audit any "black box" sprite or debug animation issues.

---

## Sprite → Animation Key Master Table

| Asset File | Phaser Key | Frame Size | Frames | Animation Key(s) |
|---|---|---|---|---|
| `Bat/Bat-IdleFly.png` | `ch3_bat_fly` | 64×64 | 9 | `anim_ch3_bat_fly` |
| `Bat/Bat-Attack1.png` | `ch3_bat_hit` | 64×64 | 8 | `anim_ch3_bat_hit` (frame 5 = actual slash) |
| `Smoke-Spawn.png` | `ch3_smoke_spawn` | 64×64 | 13 | `anim_ch3_smoke` |
| `Fish-king/Idle.png` | `ch3_fishking_idle` | 250×250 | 8 | `anim_ch3_fishking_idle` |
| `Fish-king/Attack1.png` | `ch3_fishking_wand` | 250×250 | 8 | `anim_ch3_fishking_wand` |
| `Fish-king/Attack2.png` | `ch3_fishking_spell` | 250×250 | 8 | `anim_ch3_fishking_spell` |
| `JellyFish/Idle.png` | `ch3_jelly_idle` | 48×48 | 4 | `anim_ch3_jelly_idle` |
| `JellyFish/Walk.png` | `ch3_jelly_walk` | 48×48 | 4 | `anim_ch3_jelly_walk` |
| `JellyFish/Death.png` | `ch3_jelly_death` | 48×48 | 6 | `anim_ch3_jelly_death` |
| `JellyFish/Attack.png` | `ch3_jelly_attack` | 48×48 | 4 | `anim_ch3_jelly_attack` |
| `Shark/Idle.png` | `ch3_shark_idle` | 48×48 | 4 | `anim_ch3_shark_idle` |
| `Shark/Walk.png` | `ch3_shark_walk` | 48×48 | 4 | `anim_ch3_shark_walk` |
| `Shark/Attack.png` | `ch3_shark_attack` | 48×48 | 6 | `anim_ch3_shark_attack` |
| `Nemo-Fish/.../normalswim.png` | `ch3_nemo_swim` | 128×128 | 1 | `anim_ch3_nemo` |
| `Nemo-Fish/.../normalchomp.png` | `ch3_nemo_chomp` | 128×128 | 1 | `anim_ch3_nemo_chomp` |
| `Nemo-Fish/.../normalswimdiagdown.png` | `ch3_nemo_diagdn` | 128×128 | 1 | `anim_ch3_nemo_diagdn` |
| `Nemo-Fish/.../normalswimdiagup.png` | `ch3_nemo_diagup` | 128×128 | 1 | `anim_ch3_nemo_diagup` |
| `Nemo-Fish/.../normaltiltdownchomp.PNG` | `ch3_nemo_tiltdn` | 64×64 | 4 | `anim_ch3_nemo_tiltdn` |
| `Nemo-Fish/.../normaltiltupchomp.png` | `ch3_nemo_tiltup` | 64×64 | 4 | `anim_ch3_nemo_tiltup` |
| `Angler/Walk.png` | `ch3_angler` | 48×48 | varies | `anim_ch3_angler` |
| `Snake/snake.png` | `ch3_snake` | 112×128 | 4 | `anim_ch3_snake` |
| `Siren1/Idle.png` | `ch3_siren1` | 128×128 | varies | `anim_ch3_siren1` |
| `Siren2/Idle.png` | `ch3_siren2` | 128×128 | varies | `anim_ch3_siren2` |
| `Siren3/Idle.png` | `ch3_siren3_idle` | 128×128 | 7 | `anim_ch3_siren3_idle` |
| `Siren3/Special.png` | `ch3_siren3_special` | 128×128 | 5 | `anim_ch3_siren3_special` |
| `cthulu.png` | `ch3_cthulhu` | 192×112 | 105 total | See rows below |
| `Octopus Hand/constrict.png` | `ch3_octo_constrict` | 373×373 | ~68 | `anim_ch3_octo_constrict` |
| `Octopus Hand/curl-spritesheet.png` | `ch3_octo_curl` | 350×350 | ~72 | `anim_ch3_octo_curl` |
| `Octopus Hand/restraint-spritesheet.png` | `ch3_octo_restraint` | 204×204 | ~79 | `anim_ch3_octo_restraint` |
| `Octopus Hand/stab-spritesheet.png` | `ch3_octo_stab` | 147×147 | ~194 | `anim_ch3_octo_stab` |
| `Octopus Hand/thrust-spritesheet.png` | `ch3_octo_thrust` | 132×132 | ~173 | `anim_ch3_octo_thrust` |
| `Octopus Hand/thursts2-spritesheet.png` | `ch3_octo_thrusts2` | 132×132 | ~76 | `anim_ch3_octo_thrusts2` |
| `Water Beams/Dark-Bolt.png` | `ch3_darkbolt` | 64×88 | 12 | `anim_ch3_darkbolt` |
| `Water Beams/Fire-bomb.png` | `ch3_firebomb` | 64×64 | 15 | `anim_ch3_firebomb` |
| `Water Beams/Lightning.png` | `ch3_lightning` | 64×128 | 11 | `anim_ch3_lightning` |
| `Water Beams/spark.png` | `ch3_spark` | 32×32 | 8 | `anim_ch3_spark` |
| `Water Beams/water-spiral.png` | `ch3_waterspiral` | 32×32 | 6 | `anim_ch3_waterspiral` |
| `Water Beams/water-beam.png` | `ch3_waterbeam` | 63×32 | 4 | `anim_ch3_waterbeam` |
| `Water Beams/water-burst.png` | `ch3_waterburst` | 63×48 | 6 | `anim_ch3_waterburst` |
| `blue/blue0.png` | `ch3_fx_whirl` | 32×32 | 4 | `anim_ch3_fx_whirl` |
| `blue/blue3.png` | `ch3_fx_sonic` | 32×32 | 4 | `anim_ch3_fx_sonic` |
| `blue/blue4.png` | `ch3_fx_ring` | 32×32 | 4 | `anim_ch3_fx_ring` |
| `blue/blue5.png` | `ch3_fx_bubble` | 32×32 | 4 | `anim_ch3_fx_bubble` |
| `blue/blue16.png` | `ch3_fx_fireblade` | 32×32 | 4 | `anim_ch3_fx_fireblade` |
| `blue/blue19.png` | `ch3_fx_darkorbit` | 32×32 | 4 | `anim_ch3_fx_darkorbit` |
| `blue/blue21.png` | `ch3_fx_thunder` | 32×32 | 4 | `anim_ch3_fx_thunder` |

---

## Cthulhu Spritesheet Row Breakdown
`cthulu.png` is **2880×784 px** → **15 cols × 7 rows** of **192×112 px** each = 105 frames total.

| Row | Frames | Animation Key | Usage |
|---|---|---|---|
| 0 | 0–14 | `anim_ch3_cthulhu_idle` | Standing idle after spawn |
| 2 | 30–44 | `anim_ch3_cthulhu_fly` | Wandering across the grid |
| 3 | 45–59 | `anim_ch3_cthulhu_slash` | Row slash attack |
| 4 | 60–74 | `anim_ch3_cthulhu_cast` | 3×3 Whirlwind cast |

---

## Player.js Hooks Used by Chapter 3

| Property | Type | Used By |
|---|---|---|
| `player.history` | Array of `{col, row}` last 10 steps | Bat Dive Bomb targeting |
| `player.isCharmed` | Boolean — reverses gesture input | Siren's Lure, Whirlpool Maze |
| `player.isPetrified` | Boolean — blocks all movement | Medusa Gaze (bubble), Kraken Grasp |
| `player.forceMove(dc, dr, ms)` | Forced tile movement | Siren's Lure water sweep |

---

## The 14 Attacks — Complete Mechanic Reference

### Roster A: Fish & Minion Summons

**1. `ch3FishKingSummonerWave`**
- Fish King spawns right-edge via `anim_ch3_smoke`
- Plays `anim_ch3_fishking_idle` → swings wand 3 times (`anim_ch3_fishking_wand`)
- Each swing spawns 2–3 random minions: Angler (right→left), Shark (walk then attack-near-player), or Jellyfish (bottom→top, death at top)
- Despawns with smoke

**2. `ch3FishKingMultiSpell`**
- Fish King spawns right-edge via smoke
- Plays `anim_ch3_fishking_spell`
- Randomly picks ONE spell type for the whole burst:
  - **Dark Bolt** (`ch3_darkbolt`) — 10 random tiles
  - **Fire Bomb** (`ch3_firebomb`) — 10 random tiles
  - **Lightning** (`ch3_lightning`) — 8 random tiles
  - **Spark** (`ch3_spark`) — line across the row Fish King occupies (center row)
- Despawns with smoke

**3. `ch3SharkLanes`**
- Marks 4 random rows red for 4.5s
- Shark idles off right edge (`anim_ch3_shark_idle`) waiting
- Player stepping into a marked row trips the shark → it charges left (`anim_ch3_shark_walk`)
- If shark reaches player, plays `anim_ch3_shark_attack` and deals damage

**4. `ch3JellyfishCurtain`**
- 3–5 jellyfish spawn from below the grid
- Travel upward (`anim_ch3_jelly_walk`) through visible tiles
- If player is in the same tile as jellyfish → `anim_ch3_jelly_attack` + damage
- At top of grid plays `anim_ch3_jelly_death` and destroys

**5. `ch3NemoSwarm`**
- 3 Nemos spawn staggered, each from a random grid tile
- Pathfind toward player tile every 500ms using diagonal-aware animation:
  - Horizontal/vertical move → `anim_ch3_nemo`
  - Diagonal move → `anim_ch3_nemo_diagdn` / `anim_ch3_nemo_diagup`
  - On catch → `anim_ch3_nemo_chomp` + damage
- **Sharp 90° turn** stuns the Nemo for 2 ticks (1 second) giving the player an escape window

---

### Roster B: Board & Physics Traps

**6. `ch3BatDiveBomb`**
- Reads `player.history` for last 3 unique visited tiles
- Shows exclamation `symbol_alert` + red tile telegraph on each
- Bat flies down from 380px above (`anim_ch3_bat_fly`)
- On impact plays `anim_ch3_bat_hit` (attack frame 5 = slash moment)
- Flies back up and fades out

**7. `ch3BioluminescentBlackout`**
- Large dark rectangle covers the entire grid (85% opacity)
- Angler Fish crosses as the only light source
- 14 random `ch3_darkbolt` strikes hit random tiles during darkness
- Overlay fades after 6 seconds

**8. `ch3WhirlpoolMaze`**
- Alternating columns (1, 3, 5…) are telegraphed then struck
- Water spiral (`ch3_waterspiral`) falls top-to-bottom through each column
- Contact deals damage AND sets `player.isCharmed = true` for 2.5 seconds (reversed controls)

**9. `ch3SirensLure`**
- Siren 1 descends from top center → plays `anim_ch3_siren1`
- Sets `player.isCharmed = true` for 5 seconds
- 5 water beams (`ch3_waterbeam`) fall across random columns
- Each beam forces the player down 1 tile via `forceMove(0, 1)` if in that column
- Water burst (`ch3_waterburst`) plays at bottom when beam hits ground

**10. `ch3KrakenGrasp`**
- 4 "safe-looking" green tiles appear randomly
- Stepping on one triggers `ch3_octo_restraint` grab animation (scaled 0.4)
- Player is `isPetrified = true` — must tap screen **5 times** to escape
- Failure after 2.8s → damage + release

---

### Roster C: The God Summons

**11. `ch3MedusaGaze`**
- Siren 2 descends from top center → plays `anim_ch3_siren2`
- "DON'T MOVE!" text blinks for 1.6 seconds
- Camera flash at evaluation moment
- If `player.isMoving` is true → bubble trap (`ch3_fx_bubble` ×3 scale) + `isPetrified` for 3.5s + damage

**12. `ch3CthulhuRifts`**
- Cthulhu spawns via `anim_ch3_smoke` at a random grid position (not edges)
- Plays `anim_ch3_cthulhu_idle` then wanders 3–4 tiles using `anim_ch3_cthulhu_fly`
- While present, `ch3_fx_ring` (blue4) orbits in 8 surrounding tiles as a damage zone
- After wandering, randomly does ONE of:
  - **Slash** (`anim_ch3_cthulhu_slash`) → `ch3_fx_fireblade` sweeps his entire current row left-to-right
  - **Cast** (`anim_ch3_cthulhu_cast`) → `ch3_fx_whirl` (blue0) hits a 3×3 area around him
- Despawns via smoke

**13. `ch3OctopusSiege`**
- Telegraphs 3 consecutive rows (random start row)
- Giant Octopus appears right-edge, plays `anim_ch3_octo_constrict` OR `anim_ch3_octo_curl` (random each time)
- Damage sweeps right-to-left column by column across all 3 rows
- Additionally spawns 1–3 random stab/thrust attacks on other rows using `ch3_octo_stab`, `ch3_octo_thrust`, or `ch3_octo_thrusts2` (picked randomly each)

**14. `ch3SirenSnakeChase`**
- Siren 3 drops from above center, plays `anim_ch3_siren3_idle` → `anim_ch3_siren3_special` to summon
- 4 snakes spawn staggered every 900ms, alternating left/right of Siren
- Snakes track player with 4-directional pathfinding every 500ms
- Snakes auto-flip via `setFlipX` based on horizontal direction
- All snakes fade after 7 seconds, Siren despawns via smoke at 3.2s

---

## Octopus Pixel Notes
These sprites are PANORAMIC (very wide). Frame size equals the **height** as a square cell:
- `constrict.png` = 25615×373px → ~68 frames of 373×373
- `curl-spritesheet.png` = 25480×350px → ~72 frames of 350×350
- `restraint-spritesheet.png` = 16182×204px → ~79 frames of 204×204
- `stab-spritesheet.png` = 28578×147px → ~194 frames of 147×147
- `thrust-spritesheet.png` = 22876×132px → ~173 frames of 132×132
- `thursts2-spritesheet.png` = 10146×132px → ~76 frames of 132×132

All octopus sprites are rendered with `setOrigin(1, 0.5)` so they extend **left** naturally from the right screen edge.
