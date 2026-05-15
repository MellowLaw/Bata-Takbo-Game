# Chapter 3 SFX Implementation Summary

## Overview
This document lists all sound effects (SFX) added to Chapter 3 (Kataw - Water/Sea Boss) to create an immersive pixel game experience.

---

## Attack 0: Kataw Explosion Pattern (ch3KatawExplosionPattern1-3)
**Description:** Grid-based explosion patterns with cascading color-coded blasts

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_water_splash` (variants 1-3) | Water splash start | Attack start |
| `ch3_voltaic_blast` (variants 1-2) | Explosion impact | Each visual explosion (every 4th) |

**Sound Details:**
- Water Splash: `DSGNMisc_MOVEMENT-Sparkly Water_HY_PC-001.wav` through 003
- Voltaic Blast: `DSGNImpt_EXPLOSION-Voltaic Blast_HY_PC-001.wav` through 002
- Volume: 0.75 for splash, 0.7 for blasts
- Note: Also covers Abyssal Cross Patterns 1-4 and Diamond Storm Patterns 1-4 (via shared helper)

---

## Attack 1: Fish King Multi Spell (ch3FishKingMultiSpell)
**Description:** Fish King boss casts 4 different spells in sequence

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_underwater` | Underwater ambiance | Attack start |
| `ch3_spell_cast` | Dark bolt casting | Spell 0 (Dark Bolt) phase |
| `ch3_electric_hit` (variants 1-2) | Dark bolt impact | Every 3rd dark bolt |
| `ch3_energy_noise` | Fire bomb charge | Spell 1 (Fire Bomb) phase |
| `ch3_pyro_burst` (variants 1-2) | Fire bomb explosion | Each fire bomb explosion |
| `ch3_wet_electricity` | Lightning charge | Spell 2 (Lightning) phase |
| `ch3_shimmer_electric` (variants 1-2) | Lightning strike | Lightning strike |
| `ch3_skill_release` | Spark launch | Spell 3 (Spark) phase |

**Sound Details:**
- Underwater: `MAGSpel_CAST-Underwater_HY_PC-001.wav`
- Spell Cast: `MAGSpel_CAST-Zippy Particle_HY_PC-001.wav`
- Electric Hit: `DSGNImpt_EXPLOSION-Electric Hit_HY_PC-001.wav` through 002
- Energy Noise: `MAGSpel_CAST-Energy Noise_HY_PC-001.wav`
- Pyro Burst: `DSGNImpt_EXPLOSION-Pyro Burst_HY_PC-001.wav` through 002
- Wet Electricity: `MAGSpel_CAST-Wet Electricity_HY_PC-001.wav`
- Shimmer Electric: `DSGNImpt_EXPLOSION-Shimmer Electric_HY_PC-001.wav` through 002
- Skill Release: `DSGNTonl_SKILL RELEASE-Laser Whoosh 1_HY_PC-001.wav`

---

## Attack 2: Shark Lanes (ch3SharkLanes)
**Description:** Sharks swim across rows with safe lanes for dodging

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_water_splash_2` | Water splash warning | Attack start |
| `ch3_fish_swish` (variants 1-2) | Shark spawn | Each shark appearance |

**Sound Details:**
- Water Splash 2: `DSGNMisc_MOVEMENT-Sparkly Water_HY_PC-002.wav`
- Fish Swish: `DSGNMisc_MOVEMENT-Bubbly Laser Swish_HY_PC-001.wav` through 002

---

## Attack 3: Bat Dive Bomb (ch3BatDiveBomb)
**Description:** 4 waves of bats dive-bombing from above with lightning FX

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_electric_hit` | Electric entrance | Attack start (entrance flash) |
| `ch3_laser_electric_zap` (variants 1-2) | Bat dive | Each bat dive |
| `ch3_hit_fleeting` (variants 1-2) | Impact | Bat landing impact |

**Sound Details:**
- Electric Hit: `DSGNImpt_EXPLOSION-Electric Hit_HY_PC-001.wav`
- Laser Electric Zap: `DSGNMisc_HIT-Laser Electric Zap_HY_PC-001.wav` through 002
- Hit Fleeting: `DSGNMisc_HIT-Fleeting Hit_HY_PC-001.wav` through 002

---

## Attack 4: Siren's Lure (ch3SirensLure)
**Description:** Siren boss walks and fires inversion beams

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_shimmer_tone` | Shimmer entrance | Attack start |
| `ch3_spell_cast` | Spell entrance | Flashy entrance effect |
| `ch3_critical_strike` (variants 1-2) | Siren attack | Each beam attack animation |

**Sound Details:**
- Shimmer Tone: `MAGAngl_BUFF-Shimmer Tone_HY_PC-001.wav`
- Spell Cast: `MAGSpel_CAST-Zippy Particle_HY_PC-001.wav`
- Critical Strike: `DSGNMisc_SKILL IMPACT-Critical Strike_HY_PC-001.wav` through 002

---

## Attack 5: Diamond Storm Pattern (ch3DiamondStormPattern1)
**Description:** Diamond-shaped explosion patterns (via shared helper)

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_water_splash` (variants 1-3) | Water splash start | Attack start |
| `ch3_voltaic_blast` (variants 1-2) | Explosion impact | Each visual explosion |

**Sound Details:** Same as Kataw Explosion Pattern (uses shared helper)

---

## Attack 6: Monster Ambush (ch3MonsterAmbush)
**Description:** Flower pattern of monsters spawning in waves

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_monster_summon` | Monster summon intro | Attack start |
| `ch3_monster_step` (variants 1-2) | Monster spawn | Each wave spawn |

**Sound Details:**
- Monster Summon: `MAGSpel_CAST-Noise Summon_HY_PC-001.wav`
- Monster Step: `DSGNImpt_EXPLOSION-Thud_HY_PC-001.wav` through 002

---

## Attack 7: Prismatic Beam Storm (ch3PrismaticBeamStorm)
**Description:** Multi-directional beam attacks in waves

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_beam_charge` | Beam charge | Attack start |
| `ch3_laser_shot` (variants 1-2) | Beam fire | Each beam fired |
| `ch3_skill_impact` (variants 1-2) | Beam origin explosion | Light showers explosion |

**Sound Details:**
- Beam Charge: `DSGNMisc_PROJECTILE-Laser Scintillating_HY_PC-001.wav`
- Laser Shot: `DSGNMisc_PROJECTILE-Laser Shot_HY_PC-001.wav` through 002
- Skill Impact: `DSGNMisc_SKILL IMPACT-Highest Laser_HY_PC-001.wav` through 002

---

## Attack 8: Abyssal Spiral (ch3AbyssalSpiral)
**Description:** Spiral pattern of expanding monster rings

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_teleport` | Spiral entrance | Attack start |
| `ch3_shimmer_tone` (variants 1-2) | Monster spawn | Every 2nd wave spawn |
| `ch3_monster_summon_2` | Finale summon | Grand finale phase |

**Sound Details:**
- Teleport: `MAGSpel_CAST-Teleport Downer_HY_PC-001.wav`
- Shimmer Tone: `MAGAngl_BUFF-Shimmer Tone_HY_PC-001.wav` through 002
- Monster Summon 2: `MAGSpel_CAST-Noise Summon_HY_PC-002.wav`

---

## Chapter 3 Ultimate: Abyssal Trail (ch3UltimateRotatingBarrage)
**Description:** 15-second rotating fire trail that covers the grid

| SFX File | Usage | Trigger Point |
|----------|-------|---------------|
| `ch3_eruption` | Ultimate intro | Big dramatic intro |
| `ch3_beam_fire` (variants 1-2) | Fire placement | Every 3rd fire placed |
| `ch3_energy_dissipate` | Clear fires | When clearing all fires |

**Sound Details:**
- Eruption: `DSGNImpt_EXPLOSION-Eruption_HY_PC-001.wav`
- Beam Fire: `DSGNMisc_PROJECTILE-Laser Bursts_HY_PC-001.wav` through 002
- Energy Dissipate: `DSGNMisc_SKILL IMPACT-Energy Dissipate_HY_PC-001.wav`

---

## Complete SFX Asset List (AudioManager.js)

### Water Splashes (3 variants)
- `ch3_water_splash` - `DSGNMisc_MOVEMENT-Sparkly Water_HY_PC-001.wav`
- `ch3_water_splash_2` - `DSGNMisc_MOVEMENT-Sparkly Water_HY_PC-002.wav`
- `ch3_water_splash_3` - `DSGNMisc_MOVEMENT-Sparkly Water_HY_PC-003.wav`

### Water Lasers (2 variants)
- `ch3_watery_laser` - `DSGNMisc_MOVEMENT-Watery Laser_HY_PC-001.wav`
- `ch3_watery_laser_2` - `DSGNMisc_MOVEMENT-Watery Laser_HY_PC-002.wav`

### Water Bolts (2 variants)
- `ch3_water_bolt` - `DSGNMisc_PROJECTILE-Water Bolt_HY_PC-001.wav`
- `ch3_water_bolt_2` - `DSGNMisc_PROJECTILE-Water Bolt_HY_PC-002.wav`

### Bubble Pops (2 variants)
- `ch3_bubble_pop` - `DSGNMisc_PROJECTILE-Clicky Bubbly_HY_PC-001.wav`
- `ch3_bubble_pop_2` - `DSGNMisc_PROJECTILE-Clicky Bubbly_HY_PC-002.wav`

### Fish Swish (2 variants)
- `ch3_fish_swish` - `DSGNMisc_MOVEMENT-Bubbly Laser Swish_HY_PC-001.wav`
- `ch3_fish_swish_2` - `DSGNMisc_MOVEMENT-Bubbly Laser Swish_HY_PC-002.wav`

### Underwater/Electricity (4 variants)
- `ch3_underwater` - `MAGSpel_CAST-Underwater_HY_PC-001.wav`
- `ch3_underwater_2` - `MAGSpel_CAST-Underwater_HY_PC-002.wav`
- `ch3_wet_electricity` - `MAGSpel_CAST-Wet Electricity_HY_PC-001.wav`
- `ch3_wet_electricity_2` - `MAGSpel_CAST-Wet Electricity_HY_PC-002.wav`

### Electric Effects (5 variants)
- `ch3_electric_hit` - `DSGNImpt_EXPLOSION-Electric Hit_HY_PC-001.wav`
- `ch3_electric_hit_2` - `DSGNImpt_EXPLOSION-Electric Hit_HY_PC-002.wav`
- `ch3_shimmer_electric` - `DSGNImpt_EXPLOSION-Shimmer Electric_HY_PC-001.wav`
- `ch3_shimmer_electric_2` - `DSGNImpt_EXPLOSION-Shimmer Electric_HY_PC-002.wav`
- `ch3_laser_electric_zap` - `DSGNMisc_HIT-Laser Electric Zap_HY_PC-001.wav`
- `ch3_laser_electric_zap_2` - `DSGNMisc_HIT-Laser Electric Zap_HY_PC-002.wav`

### Explosions (6 variants)
- `ch3_voltaic_blast` - `DSGNImpt_EXPLOSION-Voltaic Blast_HY_PC-001.wav`
- `ch3_voltaic_blast_2` - `DSGNImpt_EXPLOSION-Voltaic Blast_HY_PC-002.wav`
- `ch3_eruption` - `DSGNImpt_EXPLOSION-Eruption_HY_PC-001.wav`
- `ch3_eruption_2` - `DSGNImpt_EXPLOSION-Eruption_HY_PC-002.wav`
- `ch3_pyro_burst` - `DSGNImpt_EXPLOSION-Pyro Burst_HY_PC-001.wav`
- `ch3_pyro_burst_2` - `DSGNImpt_EXPLOSION-Pyro Burst_HY_PC-002.wav`

### Bubbly Movement (4 variants)
- `ch3_bubbly_laser_swish` - `DSGNMisc_MOVEMENT-Bubbly Laser Swish_HY_PC-001.wav`
- `ch3_bubbly_laser_swish_2` - `DSGNMisc_MOVEMENT-Bubbly Laser Swish_HY_PC-002.wav`
- `ch3_bubbly_passby` - `SWSH_MOVEMENT-Bubbly Passby_HY_PC-001.wav`
- `ch3_bubbly_resonance` - `SWSH_MOVEMENT-Bubbly Resonance_HY_PC-001.wav`

### Magic Casting (6 variants)
- `ch3_spell_cast` - `MAGSpel_CAST-Zippy Particle_HY_PC-001.wav`
- `ch3_spell_cast_2` - `MAGSpel_CAST-Zippy Particle_HY_PC-002.wav`
- `ch3_energy_noise` - `MAGSpel_CAST-Energy Noise_HY_PC-001.wav`
- `ch3_energy_noise_2` - `MAGSpel_CAST-Energy Noise_HY_PC-002.wav`
- `ch3_teleport` - `MAGSpel_CAST-Teleport Downer_HY_PC-001.wav`
- `ch3_teleport_2` - `MAGSpel_CAST-Teleport Downer_HY_PC-002.wav`

### Skill Impacts (7 variants)
- `ch3_skill_impact` - `DSGNMisc_SKILL IMPACT-Highest Laser_HY_PC-001.wav`
- `ch3_skill_impact_2` - `DSGNMisc_SKILL IMPACT-Highest Laser_HY_PC-002.wav`
- `ch3_critical_strike` - `DSGNMisc_SKILL IMPACT-Critical Strike_HY_PC-001.wav`
- `ch3_critical_strike_2` - `DSGNMisc_SKILL IMPACT-Critical Strike_HY_PC-002.wav`
- `ch3_energy_dissipate` - `DSGNMisc_SKILL IMPACT-Energy Dissipate_HY_PC-001.wav`
- `ch3_skill_release` - `DSGNTonl_SKILL RELEASE-Laser Whoosh 1_HY_PC-001.wav`
- `ch3_skill_release_2` - `DSGNTonl_SKILL RELEASE-Laser Whoosh 2_HY_PC-001.wav`

### Buff/Aura (4 variants)
- `ch3_buff_healing` - `MAGAngl_BUFF-Healing Gusts_HY_PC-001.wav`
- `ch3_buff_healing_2` - `MAGAngl_BUFF-Healing Gusts_HY_PC-002.wav`
- `ch3_shimmer_tone` - `MAGAngl_BUFF-Shimmer Tone_HY_PC-001.wav`
- `ch3_shimmer_tone_2` - `MAGAngl_BUFF-Shimmer Tone_HY_PC-002.wav`

### Monster (4 variants)
- `ch3_monster_summon` - `MAGSpel_CAST-Noise Summon_HY_PC-001.wav`
- `ch3_monster_summon_2` - `MAGSpel_CAST-Noise Summon_HY_PC-002.wav`
- `ch3_monster_step` - `DSGNImpt_EXPLOSION-Thud_HY_PC-001.wav`
- `ch3_monster_step_2` - `DSGNImpt_EXPLOSION-Thud_HY_PC-002.wav`

### Beams/Lasers (6 variants)
- `ch3_beam_charge` - `DSGNMisc_PROJECTILE-Laser Scintillating_HY_PC-001.wav`
- `ch3_beam_charge_2` - `DSGNMisc_PROJECTILE-Laser Scintillating_HY_PC-002.wav`
- `ch3_beam_fire` - `DSGNMisc_PROJECTILE-Laser Bursts_HY_PC-001.wav`
- `ch3_beam_fire_2` - `DSGNMisc_PROJECTILE-Laser Bursts_HY_PC-002.wav`
- `ch3_laser_shot` - `DSGNMisc_PROJECTILE-Laser Shot_HY_PC-001.wav`
- `ch3_laser_shot_2` - `DSGNMisc_PROJECTILE-Laser Shot_HY_PC-002.wav`

### Mecha/Engine (3 variants)
- `ch3_engine_blast` - `DSGNImpt_EXPLOSION-Mecha Engine Blast_HY_PC-001.wav`
- `ch3_engine_blast_2` - `DSGNImpt_EXPLOSION-Mecha Engine Blast_HY_PC-002.wav`
- `ch3_mecha_damage` - `DSGNImpt_EXPLOSION-Mecha Damage_HY_PC-001.wav`

### Hits (6 variants)
- `ch3_hit_fleeting` - `DSGNMisc_HIT-Fleeting Hit_HY_PC-001.wav`
- `ch3_hit_fleeting_2` - `DSGNMisc_HIT-Fleeting Hit_HY_PC-002.wav`
- `ch3_hit_laser` - `DSGNMisc_HIT-Laser Hit_HY_PC-001.wav`
- `ch3_hit_laser_2` - `DSGNMisc_HIT-Laser Hit_HY_PC-002.wav`
- `ch3_hit_synth` - `DSGNMisc_HIT-Synth Hit_HY_PC-001.wav`
- `ch3_hit_synth_2` - `DSGNMisc_HIT-Synth Hit_HY_PC-002.wav`

---

## Total SFX Assets Added: 64 sound files

## Implementation Notes

1. **Randomization**: Most attacks use randomized variants (1-3 variants) to prevent audio fatigue
2. **Volume Scaling**: Volumes range from 0.6 to 0.9 depending on attack importance
3. **Rate Limiting**: 
   - Explosion sequences play sounds every 4th visual
   - Ultimate plays beam fire sounds every 3rd fire placement
   - Shark Lanes, SirensLure use staggered timing
4. **Layering**: Multiple sounds layered for impact (e.g., electric hit + laser zap)
5. **Spatial Audio**: All sounds played through Phaser's global audio system

## Files Modified

1. `web/src/game/AudioManager.js` - Added 64 new SFX asset loaders
2. `web/src/game/Boss.js` - Added SFX triggers to all Chapter 3 attack methods:
   - `_executeSpecificExplosionSequence` (shared helper)
   - `ch3FishKingMultiSpell`
   - `ch3SharkLanes`
   - `ch3JellyfishCurtain`
   - `ch3NemoSwarm`
   - `ch3BatDiveBomb`
   - `ch3PrismaticBeamStorm`
   - `ch3SirensLure`
   - `ch3MonsterAmbush`
   - `ch3AbyssalSpiral`
   - `ch3UltimateRotatingBarrage`

---

*Generated: Chapter 3 SFX Implementation Complete*
