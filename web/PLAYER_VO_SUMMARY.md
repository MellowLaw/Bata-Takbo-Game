# Player Voice Over (VO) Implementation Summary

## Overview
Random player voice lines that play during gameplay based on selected character gender (Jose/Male or Maria/Female). VO lines are chapter-specific and generic, playing randomly to create an immersive storytelling experience.

---

## Voice Over Files

### Male VO (Jose)
**Location:** `web/public/assets/audio/Male VO/`

| Filename | Chapter | Description |
|----------|---------|-------------|
| `mananagngal ex1.mp3` | Chapter 1 | Mananaggal specific line |
| `bungisngis ex1.mp3` | Chapter 2 | Bungisngis specific line |
| `kataw ex1.mp3` | Chapter 3 | Kataw specific line |
| `ang sabi ng mamatanda.mp3` | Any | "Ang sabi ng matatanda..." |
| `bulaklak.mp3` | Any | "Bulaklak..." |
| `hindi laging ukang halimaw.mp3` | Any | Warning line |
| `may dumaaan na hindi tao.mp3` | Any | "May dumaan na hindi tao..." |
| `wag kang titingala.mp3` | Any | "Wag kang titingala..." |
| `wag sagutin ang boses.mp3` | Any | "Wag sagutin ang boses..." |

### Female VO (Maria)
**Location:** `web/public/assets/audio/Female VO/`

| Filename | Chapter | Description |
|----------|---------|-------------|
| `ang manananggal daw ay.mp3` | Chapter 1 | Mananaggal specific line |
| `ang manananggal sa.mp3` | Chapter 1 | Mananaggal specific line |
| `ang bungisngis daw.mp3` | Chapter 2 | Bungisngis specific line |
| `kapag may kumanta sa tubig.mp3` | Chapter 3 | Kataw/water specific line |
| `akala namin.mp3` | Any | "Akala namin..." |
| `ang aswang daw.mp3` | Any | "Ang aswang daw..." |
| `ang sabi ng matatanda.mp3` | Any | "Ang sabi ng matatanda..." |
| `ang sabi nila.mp3` | Any | "Ang sabi nila..." |
| `ang sabi sabi sa baryo.mp3` | Any | "Ang sabi-sabi sa baryo..." |
| `at ngayong gabi.mp3` | Any | "At ngayong gabi..." |
| `may dumadaan na hindi tao.mp3` | Any | "May dumadaan na hindi tao..." |
| `may mga gabing.mp3` | Any | "May mga gabing..." |
| `may mga pangalan.mp3` | Any | "May mga pangalan..." |

---

## Implementation

### AudioManager.js
Added two new methods:

1. **`loadPlayerVO(scene, gender)`**
   - Loads all VO files based on gender ('male' or 'female')
   - Organizes files by chapter relevance
   - Stores gender in `this.playerGender`

2. **`playRandomPlayerVO(chapterId, options)`**
   - Plays a random VO line appropriate for the chapter
   - **Chapter-specific lines:** 30% chance (if available for chapter)
   - **Generic lines:** 70% chance (or fallback)
   - Options:
     - `volume`: Playback volume (default 0.9)
     - `forceGeneric`: Force generic line instead of chapter-specific

### GameScene.js
VO triggers added at:

| Trigger | Chance | Description |
|---------|--------|-------------|
| Game Start (3s delay) | 100% | Initial VO when gameplay begins |
| Periodic Timer | 100% | Every 25-40 seconds during gameplay |
| Boss Attack | 20% | Reaction to boss attack |
| Player Damage | 15% | Pain reaction when hit |
| Player Death | 100% | Final line on death |

### Player.js
VO triggers:
- `takeDamage()`: 15% chance to play generic VO line
- `die()`: 100% chance to play generic VO line

---

## Chapter Mapping

| Chapter ID | Boss | Chapter-Specific VO Keys (Male) | Chapter-Specific VO Keys (Female) |
|------------|------|----------------------------------|-------------------------------------|
| 1 | Mananaggal | `vo_male_mananaggal_ex1` | `vo_female_mananaggal_ay`, `vo_female_mananaggal_sa` |
| 2 | Bungisngis | `vo_male_bungisngis_ex1` | `vo_female_bungisngis` |
| 3 | Kataw | `vo_male_kataw_ex1` | `vo_female_kumanta_tubig` |
| 4+ | Various | Generic only | Generic only |

---

## Technical Details

### Audio Keys Registered

**Male VO Keys:**
- Chapter-specific: `vo_male_mananaggal_ex1`, `vo_male_bungisngis_ex1`, `vo_male_kataw_ex1`
- Generic: `vo_male_ang_sabi`, `vo_male_bulaklak`, `vo_male_hindi_laging`, `vo_male_may_dumaan`, `vo_male_wag_titingala`, `vo_male_wag_sagutin`

**Female VO Keys:**
- Chapter-specific: `vo_female_mananaggal_ay`, `vo_female_mananaggal_sa`, `vo_female_bungisngis`, `vo_female_kumanta_tubig`
- Generic: `vo_female_akala`, `vo_female_ang_aswang`, `vo_female_ang_sabi_matatanda`, `vo_female_ang_sabi_nila`, `vo_female_sabi_sayo_baryo`, `vo_female_at_ngayong_gabi`, `vo_female_may_dumadaan`, `vo_female_may_mga_gabing`, `vo_female_may_mga_pangalan`

### Volume Levels
- Game start: 0.9
- Periodic: 0.85
- Boss attack: 0.8
- Damage: 0.85
- Death: 0.9

### Timer Management
- VO timer is cleaned up on scene shutdown
- Prevents memory leaks and VO playing after game over

---

## Files Modified

1. **`web/src/game/AudioManager.js`**
   - Added `loadPlayerVO()` method
   - Added `playRandomPlayerVO()` method
   - Added `this.playerGender` property

2. **`web/src/game/GameScene.js`**
   - Added `audioManager.loadPlayerVO()` call in `preload()`
   - Added initial VO trigger (3s delay) in `create()`
   - Added periodic VO timer (25-40s interval)
   - Added boss attack VO trigger (20% chance)
   - Added VO timer cleanup in shutdown handler

3. **`web/src/game/Player.js`**
   - Added damage VO trigger (15% chance) in `takeDamage()`
   - Added death VO trigger in `die()`

---

## Usage Notes

- VO only plays if the audio file exists in cache (checked before playing)
- Chapter-specific lines reference the renamed MP3s (kataw, bungisngis, mananaggal)
- Generic lines play in any chapter, creating consistent storytelling
- Random selection prevents repetitive audio
- Volume is set high (0.8-0.9) to ensure VO is audible over game SFX

---

*Generated: Player VO Implementation Complete*
