# Boss Attack Reference

## Chapter 1 — Aswang (Blood Mechanics)
**HP:** 5 | **Attack Pool:** 3 regular (random, no repeat) + 1 ultimate on HP damage

| ID | Method | Name | Description |
|----|--------|------|-------------|
| 0 | `ch1AttackCrimsonSplatter` | **Crimson Splatter** | 3–4 blood droplets fall from the sky onto random tiles |
| 1 | `ch1AttackBleedingEye` | **Bleeding Eye** | A giant eye locks onto player position and flies toward them, leaving a dripping blood trail |
| 2 | `ch1AttackBloodVolley` | **Blood Volley** | 3–5 rhythm beats — dismembered hands appear at grid edges and fire blood beams at player's live position |
| ULT | `ch1AttackBloodVortexPull` | **Blood Vortex Pull** | Vortex forms at center, pulls player toward it tile-by-tile. No damage — repositions player |

---

## Chapter 2 — Bungisngis (Nature/Forest)
**HP:** 8 | **Attack Pool:** 8 regular (Beeswarm↔Hibiscus can never be consecutive) + 2 alternating ultimates on each HP damage

| ID | Method | Name | Description |
|----|--------|------|-------------|
| 0 | `ch2AttackBeeswarm` | **Beeswarm** | 100 bees sweep across the entire grid from both sides simultaneously — visual distraction, no damage |
| 1 | `ch2AttackHibiscus` | **Hibiscus Pollen Burst** | Giant hibiscus drops onto center tile, then chain-reaction pollen bursts ripple outward ring by ring |
| 2 | `ch2AttackVines` | **Strangling Vines** | 3×3 zone around player gets vined — if caught, player is frozen and must complete a 5-arrow QTE to escape (10s timer, damage on fail) |
| 3 | `ch2AttackCarrotRain` | **Carrot Rain** | 3-wave meteor barrage: 2 horizontal lanes → 2 vertical lanes → 3×3 ring around player. Each lane has 1 safe gap |
| 4 | `ch2AttackExplodingEggs` | **Exploding Eggs** | 5–10 eggs dropped on random tiles, bounce-land then explode with persistent damage zone |
| 5 | `ch2AttackSnappingFlora` | **Snapping Flora** | 3 melee snap-plants placed on safe tiles ≥2 from player — lock their cell, attack nearby, persist 8 seconds |
| 6 | `ch2AttackAcidSpitter` | **Acid Spitter** | 1 ranged plant per row (7 total), alternating left/right sides — each fires acid hitting 3 random columns on its row |
| 7 | `ch2AttackGolemQuakeNotes` | **Golem Quake Notes** | 2–3 golems slam ground from board edges, sending musical notes rolling across their entire rows |
| ULT-A | `ch2AttackNoteBurstUltimate` | **Note Burst Spiral** | Inward spiral: note bursts hit every tile from edges spiraling to center |
| ULT-B | `ch2AttackBunnyStampedeUltimate` | **Bunny Stampede** | 4 waves of bunnies arc-bounce across grid from alternating sides, landing on 3 spots each |

> ULT-A and ULT-B alternate on each HP hit (odd = Note Burst, even = Bunny Stampede).

---

## Chapter 3 — Kataw (Ocean/Sea Creatures)
**HP:** 10 | **Attack Pool:** 9 regular (random, no repeat) + 1 ultimate on each HP damage

| ID | Method | Name | Description |
|----|--------|------|-------------|
| 0 | `ch3KatawExplosionPattern1` | **Kataw Explosion — Pattern 1** | Outer ring → middle ring → inner ring explosion sequence (outside-in) |
| 1 | `ch3FishKingMultiSpell` | **Fish King Multi-Spell** | Fish King casts 4 sequential spells: Dark Bolts (15–20 tiles) → Fire Bombs (4× 3×3 blasts) → Lightning Checkerboard (half-board) → Spark Balls (rolling across 3 rows) |
| 2 | `ch3SharkLanes` | **Shark Lanes** | Sharks charge right-to-left across all rows except 2 random safe rows |
| 3 | `ch3BatDiveBomb` | **Bat Dive Bomb** | 4 waves of 10 bats each dive-bomb random single tiles with lightning impact FX |
| 4 | `ch3SirensLure` | **Siren's Kiss** | Siren teleports player to bottom row, reverses all controls, fires 5 waves of column beams. Lasts 13 seconds |
| 5 | `ch3DiamondStormPattern1` | **Diamond Storm** | 3-step explosion sequence in a diamond/scatter pattern (Y→R→P) |
| 6 | `ch3MonsterAmbush` | **Monster Ambush** | Monsters spawn in an expanding flower pattern from center outward in 4 sequential waves |
| 7 | `ch3PrismaticBeamStorm` | **Prismatic Beam Storm** | 4 waves of 6 beams firing in random directions (horizontal, vertical, diagonal ↘, diagonal ↗) |
| 8 | `ch3AbyssalSpiral` | **Abyssal Spiral** | Monsters spawn in expanding spiral rings from center outward, ends with a full edge-tile finale |
| ULT | `ch3UltimateRotatingBarrage` | **Abyssal Trail** | 15-second fire trail — permanent fire spawns on every tile the player leaves; idle 800ms = fire on current tile |

---

## All Chapters — Shared Mechanic

| Trigger | Name | Description |
|---------|------|-------------|
| Every 4th wave | **Golden Tile** | Spawns near player (±2 tiles), 10s to collect — deals 1 damage to boss on pickup |
