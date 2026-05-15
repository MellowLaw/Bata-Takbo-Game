# Chapter 2 SFX Implementation Summary

## Overview
This document lists all sound effects (SFX) added to Chapter 2 (Bungisngis - Nature/Plant Boss) to create an immersive pixel game experience.

---

## Attack 1: Beeswarm (ch2AttackBeeswarm)
**Description:** Horizontal bee swarm sweep across the board as visual distraction

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_bee_swarm` (variants 1-3) | Bee swarm spawn sound | When attack starts |

**Sound Details:**
- Base File: `DSGNMisc_MOVEMENT-Bats Flying_HY_PC-001.wav` through 003
- Volume: 0.7
- Randomized between 3 variants for variety

---

## Attack 2: Hibiscus Pollen Burst (ch2AttackHibiscus)
**Description:** Flower drops in center and releases concentric ring bursts of pollen

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_nature_summon` | Nature magic summon | Attack start (flower appears) |
| `ch2_plant_pop` | Flower landing pop | When hibiscus lands on center tile |
| `ch2_pollen_burst` (variants 1-2) | Pollen explosion | Center burst and each ring expansion |
| `ch2_spore_release` | Spore release ambiance | Center burst |

**Sound Details:**
- Nature Summon: `MAGSpel_CAST-Sharp Summon_HY_PC-001.wav`
- Plant Pop: `MAGSpel_CAST-Critter Transformation_HY_PC-001.wav`
- Pollen Burst: `DSGNMisc_SKILL IMPACT-Bubbly Zaps_HY_PC-001.wav` through 002
- Spore Release: `DSGNTonl_SKILL RELEASE-Shimmery Bubbles_HY_PC-001.wav`

---

## Attack 3: Strangling Vines (ch2AttackVines)
**Description:** 3x3 vine trap with QTE escape mechanic

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_vine_swish` (variants 1-4) | Vine warning swish | Attack start (telegraph phase) |
| `ch2_plant_grow` (variants 1-2) | Vines growing | When vines spawn after telegraph |

**Sound Details:**
- Vine Swish: `SWSH_MOVEMENT-Bamboo Whip_HY_PC-001.wav` through 003, `SWSH_MOVEMENT-Reso Swish_HY_PC-001.wav`
- Plant Grow: `MAGSpel_CAST-Growing Strength_HY_PC-001.wav` through 002

---

## Attack 4: Carrot Rain (ch2AttackCarrotRain)
**Description:** Staged meteor-style carrot barrage with safe gaps

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_nature_magic_2` | Nature magic cast | Attack start |
| `ch2_nature_burst` (variants 1-3) | Carrot impact explosion | Each carrot landing |

**Sound Details:**
- Nature Magic 2: `MAGSpel_CAST-Birdsong_HY_PC-002.wav`
- Nature Burst: `DSGNImpt_EXPLOSION-Grainy Burst_HY_PC-001.wav` through 002, `DSGNImpt_EXPLOSION-Crunchy Burst_HY_PC-002.wav`

---

## Attack 5: Exploding Eggs (ch2AttackExplodingEggs)
**Description:** 5-10 eggs drop and explode creating persistent hazard zones

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_nature_summon_2` | Plant summon | Attack start |
| `ch2_egg_crack` (variants 1-2) | Egg cracking | Each egg landing/exploding |
| `ch2_nature_burst` | Explosion impact | Each egg explosion |

**Sound Details:**
- Nature Summon 2: `MAGSpel_CAST-Sharper Summon_HY_PC-001.wav`
- Egg Crack: `DSGNImpt_EXPLOSION-Crunching_HY_PC-001.wav` through 002
- Nature Burst: `DSGNImpt_EXPLOSION-Grainy Burst_HY_PC-001.wav`

---

## Attack 6: Snapping Flora (ch2AttackSnappingFlora)
**Description:** Persistent melee trap plants that snap when player approaches

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_plant_pop` | Plant pop-in | Attack start |
| `ch2_plant_grow` (variants 1-2) | Plant growth | Each snapping flora spawn |

**Sound Details:**
- Plant Pop: `MAGSpel_CAST-Critter Transformation_HY_PC-001.wav`
- Plant Grow: `MAGSpel_CAST-Growing Strength_HY_PC-001.wav` through 002

---

## Attack 7: Acid Spitter (ch2AttackAcidSpitter)
**Description:** 7 plants (1 per row) shoot 3 acid projectiles each

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_nature_summon` | Plant summon | Attack start |
| `ch2_plant_grow` (variants 1-2) | Ranged plant growth | Each acid plant spawn |
| `ch2_acid_spit` (variants 1-3) | Acid projectile launch | Each acid shot fired |
| `ch2_acid_splat` (variants 1-2) | Acid impact | Each acid projectile landing |

**Sound Details:**
- Nature Summon: `MAGSpel_CAST-Sharp Summon_HY_PC-001.wav`
- Plant Grow: `MAGSpel_CAST-Growing Strength_HY_PC-001.wav` through 002
- Acid Spit: `DSGNMisc_CAST-Slime Ball_HY_PC-001.wav` through 003
- Acid Splat: `DSGNImpt_EXPLOSION-Sand Impact_HY_PC-001.wav` through 002

---

## Attack 8: Golem Quake Notes (ch2AttackGolemQuakeNotes)
**Description:** Side golems spawn and shake musical note bursts across rows

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_earth_rumble` | Earth rumble | Attack start |
| `ch2_golem_step` (variants 1-2) | Golem spawn thud | Each golem appearance |
| `ch2_golem_quake` | Quake sound | When notes start firing |
| `ch2_note_hit` (variants 1-2) | Musical note hit | Each note burst |

**Sound Details:**
- Earth Rumble: `DSGNMisc_CAST-Mecha Vibration_HY_PC-001.wav`
- Golem Step: `DSGNImpt_EXPLOSION-Thud_HY_PC-001.wav` through 002
- Golem Quake: `DSGNImpt_EXPLOSION-Eruption_HY_PC-001.wav`
- Note Hit: `DSGNTonl_SKILL IMPACT-Retro Laser 1_HY_PC-001.wav`, `DSGNTonl_SKILL IMPACT-Retro Laser 2_HY_PC-001.wav`

---

## Ultimate 1: Note Burst Spiral (ch2AttackNoteBurstUltimate)
**Description:** Spiral pattern of note bursts collapsing inward to center

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_wind_gust` | Wind gust | Ultimate start |
| `ch2_nature_magic` | Nature magic ambiance | Ultimate start |
| `ch2_note_burst` (variants 1-2) | Note explosion | Every 3rd burst (rate limited) |

**Sound Details:**
- Wind Gust: `MAGAngl_BUFF-Healing Gusts_HY_PC-001.wav`
- Nature Magic: `MAGSpel_CAST-Birdsong_HY_PC-001.wav`
- Note Burst: `DSGNTonl_SKILL IMPACT-Energetic Impact_HY_PC-001.wav` through 002

---

## Ultimate 2: Bunny Stampede (ch2AttackBunnyStampedeUltimate)
**Description:** Bouncing bunny arcs from both edges across waves

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch2_nature_magic_2` | Nature magic | Ultimate start |
| `ch2_bunny_hop` (variants 1-2) | Bunny hop | Bunny spawn and each bounce |
| `ch2_bunny_land` (variants 1-2) | Bunny land impact | Each landing |

**Sound Details:**
- Nature Magic 2: `MAGSpel_CAST-Birdsong_HY_PC-002.wav`
- Bunny Hop: `DSGNMisc_MOVEMENT-Jump Sparkle_HY_PC-001.wav` through 002
- Bunny Land: `DSGNImpt_MELEE-Magic Kick_HY_PC-001.wav` through 002

---

## Complete SFX Asset List (AudioManager.js)

### Bee/Flying Sounds (3 variants)
- `ch2_bee_swarm` - `DSGNMisc_MOVEMENT-Bats Flying_HY_PC-001.wav`
- `ch2_bee_swarm_2` - `DSGNMisc_MOVEMENT-Bats Flying_HY_PC-002.wav`
- `ch2_bee_swarm_3` - `DSGNMisc_MOVEMENT-Bats Flying_HY_PC-003.wav`

### Bubbly/Projectile Sounds (3 variants)
- `ch2_bubbly_shot` - `DSGNMisc_PROJECTILE-Bubbly Wubbly_HY_PC-001.wav`
- `ch2_bubbly_shot_2` - `DSGNMisc_PROJECTILE-Bubbly Wubbly_HY_PC-002.wav`
- `ch2_click_bubbly` - `DSGNMisc_PROJECTILE-Clicky Bubbly_HY_PC-001.wav`

### Nature Magic/Summon Sounds (4 variants)
- `ch2_nature_magic` - `MAGSpel_CAST-Birdsong_HY_PC-001.wav`
- `ch2_nature_magic_2` - `MAGSpel_CAST-Birdsong_HY_PC-002.wav`
- `ch2_nature_summon` - `MAGSpel_CAST-Sharp Summon_HY_PC-001.wav`
- `ch2_nature_summon_2` - `MAGSpel_CAST-Sharper Summon_HY_PC-001.wav`

### Wind/Gust Sounds (3 variants)
- `ch2_wind_gust` - `MAGAngl_BUFF-Healing Gusts_HY_PC-001.wav`
- `ch2_wind_gust_2` - `MAGAngl_BUFF-Healing Gusts_HY_PC-002.wav`
- `ch2_wind_gust_3` - `MAGAngl_BUFF-Shimmering Winds_HY_PC-001.wav`

### Acid/Slime Sounds (5 variants)
- `ch2_acid_spit` - `DSGNMisc_CAST-Slime Ball_HY_PC-001.wav`
- `ch2_acid_spit_2` - `DSGNMisc_CAST-Slime Ball_HY_PC-002.wav`
- `ch2_acid_spit_3` - `DSGNMisc_CAST-Slime Ball_HY_PC-003.wav`
- `ch2_acid_splat` - `DSGNImpt_EXPLOSION-Sand Impact_HY_PC-001.wav`
- `ch2_acid_splat_2` - `DSGNImpt_EXPLOSION-Sand Impact_HY_PC-002.wav`

### Plant Growth Sounds (4 variants)
- `ch2_plant_grow` - `MAGSpel_CAST-Growing Strength_HY_PC-001.wav`
- `ch2_plant_grow_2` - `MAGSpel_CAST-Growing Strength_HY_PC-002.wav`
- `ch2_plant_pop` - `MAGSpel_CAST-Critter Transformation_HY_PC-001.wav`
- `ch2_plant_pop_2` - `MAGSpel_CAST-Critter Transformation_HY_PC-002.wav`

### Vine Swish Sounds (4 variants)
- `ch2_vine_swish` - `SWSH_MOVEMENT-Bamboo Whip_HY_PC-001.wav`
- `ch2_vine_swish_2` - `SWSH_MOVEMENT-Bamboo Whip_HY_PC-002.wav`
- `ch2_vine_swish_3` - `SWSH_MOVEMENT-Bamboo Whip_HY_PC-003.wav`
- `ch2_vine_swish_4` - `SWSH_MOVEMENT-Reso Swish_HY_PC-001.wav`

### Explosion/Burst Sounds (5 variants)
- `ch2_nature_burst` - `DSGNImpt_EXPLOSION-Grainy Burst_HY_PC-001.wav`
- `ch2_nature_burst_2` - `DSGNImpt_EXPLOSION-Grainy Burst_HY_PC-002.wav`
- `ch2_nature_burst_3` - `DSGNImpt_EXPLOSION-Crunchy Burst_HY_PC-002.wav`
- `ch2_egg_crack` - `DSGNImpt_EXPLOSION-Crunching_HY_PC-001.wav`
- `ch2_egg_crack_2` - `DSGNImpt_EXPLOSION-Crunching_HY_PC-002.wav`

### Golem/Earth Sounds (4 variants)
- `ch2_golem_step` - `DSGNImpt_EXPLOSION-Thud_HY_PC-001.wav`
- `ch2_golem_step_2` - `DSGNImpt_EXPLOSION-Thud_HY_PC-002.wav`
- `ch2_golem_quake` - `DSGNImpt_EXPLOSION-Eruption_HY_PC-001.wav`
- `ch2_earth_rumble` - `DSGNMisc_CAST-Mecha Vibration_HY_PC-001.wav`

### Note/Music Sounds (3 variants)
- `ch2_note_hit` - `DSGNTonl_SKILL IMPACT-Retro Laser 1_HY_PC-001.wav`
- `ch2_note_hit_2` - `DSGNTonl_SKILL IMPACT-Retro Laser 2_HY_PC-001.wav`
- `ch2_note_burst` - `DSGNTonl_SKILL IMPACT-Energetic Impact_HY_PC-001.wav`

### Bunny/Animal Sounds (4 variants)
- `ch2_bunny_hop` - `DSGNMisc_MOVEMENT-Jump Sparkle_HY_PC-001.wav`
- `ch2_bunny_hop_2` - `DSGNMisc_MOVEMENT-Jump Sparkle_HY_PC-002.wav`
- `ch2_bunny_land` - `DSGNImpt_MELEE-Magic Kick_HY_PC-001.wav`
- `ch2_bunny_land_2` - `DSGNImpt_MELEE-Magic Kick_HY_PC-002.wav`

### Pollen/Spore Sounds (4 variants)
- `ch2_pollen_burst` - `DSGNMisc_SKILL IMPACT-Bubbly Zaps_HY_PC-001.wav`
- `ch2_pollen_burst_2` - `DSGNMisc_SKILL IMPACT-Bubbly Zaps_HY_PC-002.wav`
- `ch2_spore_release` - `DSGNTonl_SKILL RELEASE-Shimmery Bubbles_HY_PC-001.wav`
- `ch2_flower_wobble` - `DSGNMisc_MOVEMENT-Whimsy Chimes_HY_PC-001.wav`

### Snap/Melee Sounds (3 variants)
- `ch2_snap` - `DSGNMisc_MELEE-Sword Slash_HY_PC-001.wav`
- `ch2_snap_2` - `FGHTImpt_MELEE-Crunch Kick_HY_PC-001.wav`
- `ch2_snap_3` - `FGHTImpt_MELEE-Gut Kick_HY_PC-001.wav`

### Projectile Whoosh Sounds (3 variants)
- `ch2_proj_whoosh` - `DSGNMisc_MOVEMENT-Whoosh Sweep_HY_PC-001.wav`
- `ch2_proj_whoosh_2` - `DSGNMisc_MOVEMENT-Whoosh Sweep_HY_PC-002.wav`
- `ch2_proj_fall` - `DSGNMisc_MOVEMENT-Coin Whoosh_HY_PC-001.wav`

### Impact/Hit Sounds (3 variants)
- `ch2_nature_hit` - `DSGNMisc_HIT-Hit Noise_HY_PC-001.wav`
- `ch2_nature_hit_2` - `DSGNMisc_HIT-Hit Rattle_HY_PC-001.wav`
- `ch2_nature_hit_3` - `DSGNMisc_HIT-Sweep Hit_HY_PC-001.wav`

---

## Total SFX Assets Added: 58 sound files

## Implementation Notes

1. **Randomization**: Most attacks use randomized variants to prevent audio fatigue
2. **Volume Scaling**: Volumes range from 0.6 to 0.9 depending on attack importance
3. **Rate Limiting**: The Note Burst Ultimate plays sounds every 3rd burst to avoid audio clutter
4. **Layering**: Multiple sounds are layered for impact (e.g., egg crack + nature burst)
5. **Spatial Audio**: All sounds are played through Phaser's global audio system

## Files Modified

1. `web/src/game/AudioManager.js` - Added 58 new SFX asset loaders
2. `web/src/game/Boss.js` - Added SFX triggers to all Chapter 2 attack methods

---

*Generated: Chapter 2 SFX Implementation Complete*
