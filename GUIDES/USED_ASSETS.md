# Bata, Takbo! — Used Assets Inventory

> **Last updated:** 2026-05-06  
> All paths are relative to `/web/public/`. Paths reflect the **post-reorganization** structure.  
> Dynamic sequence assets (blood splat, dark blood) are listed as ranges.

---

## 🔊 Audio

| Path | Used In | Notes |
|------|---------|-------|
| `/assets/audio/click_sound.mp3` | `main.js` | Button click SFX |
| `/assets/audio/hovering_sound.mp3` | `main.js` | Button hover SFX |
| `/assets/audio/menu_bg_music.mp3` | `MainMenu.js` | Main menu background music |

---

## 🔤 Fonts

| Path | Used In | Notes |
|------|---------|-------|
| `/assets/fonts/GigaSaturn.ttf` | `index.css` | Display / title font |
| `/assets/fonts/VCRosdNEUE.ttf` | `index.css` | Retro UI font |
| `/assets/fonts/DirtyHarold.ttf` | `index.css` | Flavour/accent font |

---

## 🧍 Entity

### Player
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/entity/character-icon/character.png` | `MainMenu.js`, `GestureTraining.js`, `TutorialScreen.js`, `GuestGuard.js`, `TutorialManager.js` | Static portrait / dialogue avatar |
| `/assets/entity/player/male/idle/idle_down.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/idle/idle_up.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/idle/idle_left.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/idle/idle_right.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/dash/dash-down.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/dash/dash-up.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/dash/dash-left-down.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |
| `/assets/entity/player/male/dash/dash-right-down.png` | `GameScene.js` | Spritesheet · 8 frames · 48×64 |

### Boss
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/entity/boss/chapter1/chapter-1-idle-sprite.png` | `GameScene.js` | Ch1 Blood Master idle · 576×324 per frame |
| `/assets/entity/boss/chapter1/boss_cast.png` | `GameScene.js` | Ch1 cast animation · 122×110 per frame |
| `/assets/entity/boss/chapter2/boss_idle.png` | `GameScene.js` | Ch2 Bungisngis idle + cast · 87×110; also Ch3 fallback |

---

## ✨ Visual FX

### General FX (all chapters)
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/fx/attack_up.png` | `GameScene.js` | Damage-tile glow · 18 frames · 128×128 |
| `/assets/fx/smoke_up.png` | `GameScene.js` | Damage-tile smoke intro · 21 frames · 64×64 |
| `/assets/fx/symbol_alert.png` | `GameScene.js` | Boss-attack warning · 80×80 |
| `/assets/fx/symbol_alert2.png` | `GameScene.js` | Alternate alert · 80×80 |
| `/assets/fx/lightning_burst.png` | `GameScene.js` | Lightning power-up FX · 64×64 |
| `/assets/fx/lives_up.png` | `GameScene.js` | Ruby/heal FX · 46 frames · 64×128 |
| `/assets/fx/lives_decreased.png` | `GameScene.js` | Damage taken FX · 64×64 |
| `/assets/fx/frozen.png` | `GameScene.js` | Diamond/freeze FX · 12 frames · 128×128 |
| `/assets/fx/villain_hpUP.png` | `GameScene.js` | Boss-heal FX · 12 frames · 64×64 |
| `/assets/fx/chest1.png` | `GameScene.js` | Common chest open · 14 frames · 64×64 |
| `/assets/fx/chest2.png` | `GameScene.js` | Rare chest open · 18 frames · 64×64 |
| `/assets/fx/chest3.png` | `GameScene.js` | Legendary chest open · 80 frames · 100×100 |
| `/assets/fx/chest4.png` | `GameScene.js` | Cursed chest open · 80 frames · 100×100 |
| `/assets/fx/moving_hit1.png` | `GameScene.js` | Ch1 horizontal-projectile hit · 44 frames · 32×32 |
| `/assets/fx/eye_explosion.png` | `GameScene.js` | Ch1 eyeball pop · 96×96 |

---

## 🖼️ Game UI (formerly `hud/`)

| Path | Used In | Notes |
|------|---------|-------|
| `/assets/ui/game-ui/grid.png` | `GameScene.js` | Ch1 battle grid background |
| `/assets/ui/game-ui/grid2.png` | `GameScene.js` | Ch2 battle grid background |
| `/assets/ui/game-ui/grid3.png` | `GameScene.js` | Ch3 battle grid background |
| `/assets/ui/game-ui/grid-second-bg.png` | `GameScene.js` | Right-panel background |
| `/assets/ui/game-ui/boss-frame.png` | `GameScene.js` | Boss portrait frame |
| `/assets/ui/game-ui/eye-camera.png` | `HUDScene.js` | Camera overlay for gesture eye tracking |
| `/assets/ui/game-ui/inventory.png` | `GameScene.js` | Inventory slot icon |
| `/assets/ui/game-ui/buttons.png` | `GameScene.js` | HUD button icons · 16×16 per frame |
| `/assets/ui/game-ui/gui-sprite.png` | `sw.js` | General GUI sprite sheet |
| `/assets/ui/game-ui/with-chair.png` | `ResultsScreen.js` | Victory/results screen background |
| `/assets/ui/game-ui/generic-sparks/GenericSparks-Sheet.png` | `GameScene.js` | Damage spark FX · 32×32 per frame |
| `/assets/ui/game-ui/minimum-damage/MinimumDamage-Sheet.png` | `GameScene.js` | Boss HP bar · 50 frames · 64×16 |
| `/assets/ui/game-ui/blood-screen/2left.png` | `GameScene.js` | Blood vignette — 2 HP left |
| `/assets/ui/game-ui/blood-screen/1.5left.png` | `GameScene.js` | Blood vignette — 1.5 HP left |
| `/assets/ui/game-ui/blood-screen/1left.png` | `GameScene.js` | Blood vignette — 1 HP left |
| `/assets/ui/game-ui/blood-screen/halfleft.png` | `GameScene.js` | Blood vignette — 0.5 HP left |

---

## 🎨 UI / Screens

### Backgrounds & Video
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/ui/backgrounds/animated_main_menu.mp4` | `MainMenu.js` | Main menu looping video |
| `/assets/ui/backgrounds/background.png` | `index.css` | Generic fallback background |
| `/assets/ui/backgrounds/about_background.jpg` | `index.css` | About screen BG |
| `/assets/ui/backgrounds/chapterselect_background.png` | `index.css` | Chapter select screen BG |
| `/assets/ui/backgrounds/settings_background.jpg` | `index.css` | Settings screen BG |
| `/assets/ui/backgrounds/leaderboard_background.jpg` | `index.css` | Leaderboard screen BG |
| `/assets/ui/backgrounds/spellbook_background.jpg` | `index.css` | Spellbook screen BG |
| `/assets/ui/backgrounds/gesturesetup_background.jpg` | `index.css` | Gesture setup screen BG |

### Title & Icons
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/ui/main-title.png` | `MainMenu.js`, `sw.js` | Game logo / title image |
| `/assets/ui/skull.png` | `index.css` | Decorative bullet-point icon |
| `/assets/ui/gesture-setup/bone-hand.png` | `GestureTraining.js` | "Rest" gesture icon |
| `/assets/ui/buttons.png` | `GameScene.js` | UI root copy of button sheet |

### Rank Medals
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/ui/gold.png` | `Leaderboard.js` | 1st place medal |
| `/assets/ui/silver.png` | `Leaderboard.js` | 2nd place medal |
| `/assets/ui/bronze.png` | `Leaderboard.js` | 3rd place medal |

### Chapter Selection Cards
| Path | Used In | Notes |
|------|---------|-------|
| `/assets/ui/chapter-selection/chapter1.png` | `ChapterSelect.js` | Ch1 card locked front |
| `/assets/ui/chapter-selection/chapter1a.png` | `ChapterSelect.js`, `Spellbook.js` | Ch1 card unlocked |
| `/assets/ui/chapter-selection/chapter2.png` | `ChapterSelect.js` | Ch2 card locked front |
| `/assets/ui/chapter-selection/chapter2a.png` | `ChapterSelect.js`, `Spellbook.js` | Ch2 card unlocked |
| `/assets/ui/chapter-selection/chapter3.png` | `ChapterSelect.js` | Ch3 card locked front |
| `/assets/ui/chapter-selection/chapter3a.png` | — | Ch3 card unlocked (reserved) |
| `/assets/ui/chapter-selection/chapter-front.png` | `ChapterSelect.js` | Generic locked-card front art |
| `/assets/ui/chapter-selection/chapter-back.png` | `ChapterSelect.js`, `Spellbook.js` | Generic locked-card back art |
| `/assets/ui/chapter-selection/chapter-select-idle/chapter1_idle.png` | `ChapterSelect.js` | Ch1 animated preview |
| `/assets/ui/chapter-selection/chapter-select-idle/chapter2_idle.png` | `ChapterSelect.js` | Ch2 animated preview |
| `/assets/ui/chapter-selection/chapter-select-idle/chapter3_idle.png` | `ChapterSelect.js` | Ch3 animated preview |

---

## 💊 Power-ups

| Path | Used In | Notes |
|------|---------|-------|
| `/assets/powerups/chests.png` | `GameScene.js` | Chest sprite sheet · 9 cols × 4 rows · 32×32 |
| `/assets/powerups/02.png` | `GameScene.js` | HUD power-up slot placeholder icon |

---

## 🏹 Projectiles — Shared

| Path | Notes |
|------|-------|
| `/assets/projectiles/shared/bone.png` | Player projectile 1 |
| `/assets/projectiles/shared/knife.png` | Player projectile 2 |
| `/assets/projectiles/shared/red-potion.png` | Player projectile 3 |
| `/assets/projectiles/shared/heart.png` | Loot drop — heals player |
| `/assets/projectiles/shared/brain.png` | Ch1 horizontal projectile |
| `/assets/projectiles/shared/ruby.png` | Loot — +½ HP |
| `/assets/projectiles/shared/diamond.png` | Loot — freeze |
| `/assets/projectiles/shared/monster-hand.png` | Ch1 horizontal projectile |
| `/assets/projectiles/shared/monster-finger.png` | Ch1 horizontal projectile |
| `/assets/projectiles/shared/monster-feet.png` | Ch1 horizontal projectile |

---

## 🩸 Projectiles — Chapter 1 (Blood Master / Duende)

| Path | Notes |
|------|-------|
| `/assets/projectiles/chapter-1/blood_chem.png` | Blood chem wave · 1540×93 per frame |
| `/assets/projectiles/chapter-1/eye/eyeball.png` | Eyeball projectile · 64×64 |
| `/assets/projectiles/chapter-1/hands-1.png` | Phase 2 hand attack |
| `/assets/projectiles/chapter-1/hand-2.png` | Phase 3 hand attack |
| `/assets/projectiles/chapter-1/hand-3.png` | Phase 4 hand attack |
| `/assets/projectiles/chapter-1/ultimate/attack.png` | Ult start · 8 frames · 128×128 |
| `/assets/projectiles/chapter-1/ultimate/loop.png` | Ult loop · 5 frames · 128×128 |
| `/assets/projectiles/chapter-1/ultimate/end.png` | Ult end · 6 frames · 128×128 |
| `/assets/projectiles/chapter-1/dark-blood/1_0.png` … `1_14.png` | **15 frames** — dark blood sequence (dynamic `i = 0–14`) |
| `/assets/projectiles/chapter-1/blood-splat/1_000.png` … `1_059.png` | **60 frames** — blood splat sequence (dynamic `str = 000–059`) |

---

## 🌿 Projectiles — Chapter 2 (Bungisngis)

| Path | Notes |
|------|-------|
| `/assets/projectiles/chapter-2/bee-swarm.png` | 29 frames · 192×192 |
| `/assets/projectiles/chapter-2/hibiscus.png` | 21 frames · 192×192 |
| `/assets/projectiles/chapter-2/hibiscus-burst.png` | 38 frames · 192×192 |
| `/assets/projectiles/chapter-2/growing-vines.png` | 25 frames · 192×192 |
| `/assets/projectiles/chapter-2/carrot-rain.png` | 28 frames · 192×192 |
| `/assets/projectiles/chapter-2/exploding-eggs.png` | 40 frames · 192×192 |
| `/assets/projectiles/chapter-2/Plant3_Attack.png` | Plant melee · 4 dirs × 7 frames · 64×64 |
| `/assets/projectiles/chapter-2/Plant1_Attack.png` | Plant ranged · 4 dirs × 7 frames · 64×64 |
| `/assets/projectiles/chapter-2/Acid-01.png` | Acid charge/launch · 16 frames · 32×32 |
| `/assets/projectiles/chapter-2/Acid-02Repeatable.png` | Acid travel loop · 12 frames · 56×32 |
| `/assets/projectiles/chapter-2/Acid-02Ending.png` | Acid splat end · 6 frames · 56×32 |

---

## 🌊 Projectiles — Chapter 3 (Kataw)

### Ambient FX
| Path | Notes |
|------|-------|
| `/assets/projectiles/chapter-3/blue/blue0.png` | Whirl · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/blue/blue3.png` | Sonic · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/blue/blue4.png` | Ring · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/blue/blue5.png` | Bubble · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/blue/blue16.png` | Fireblade · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/blue/blue19.png` | Dark-orbit · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/blue/blue21.png` | Thunder · 4 frames · 32×32 |
| `/assets/projectiles/chapter-3/Smoke-Spawn.png` | Smoke · 13 frames · 64×64 |

### Minions
| Path | Notes |
|------|-------|
| `/assets/projectiles/chapter-3/bat/Bat-IdleFly.png` | 9 frames · 64×64 |
| `/assets/projectiles/chapter-3/bat/Bat-Attack1.png` | 8 frames · 64×64 |
| `/assets/projectiles/chapter-3/fish-king/Idle.png` | 8 frames · 250×250 |
| `/assets/projectiles/chapter-3/fish-king/Attack1.png` | 8 frames · 250×250 |
| `/assets/projectiles/chapter-3/fish-king/Attack2.png` | 8 frames · 250×250 |
| `/assets/projectiles/chapter-3/jellyfish/Idle.png` | 4 frames · 48×48 |
| `/assets/projectiles/chapter-3/jellyfish/Walk.png` | 4 frames · 48×48 |
| `/assets/projectiles/chapter-3/jellyfish/Death.png` | 6 frames · 48×48 |
| `/assets/projectiles/chapter-3/jellyfish/Attack.png` | 4 frames · 48×48 |
| `/assets/projectiles/chapter-3/shark/Idle.png` | 4 frames · 48×48 |
| `/assets/projectiles/chapter-3/shark/Walk.png` | 4 frames · 48×48 |
| `/assets/projectiles/chapter-3/shark/Attack.png` | 6 frames · 48×48 |
| `/assets/projectiles/chapter-3/angler/Walk.png` | 4 frames · 48×48 |
| `/assets/projectiles/chapter-3/nemo-fish/normal-actions/normalswim.png` | 4 frames · 64×64 |
| `/assets/projectiles/chapter-3/nemo-fish/normal-actions/normalchomp.png` | 4 frames · 64×64 |
| `/assets/projectiles/chapter-3/nemo-fish/normal-actions/normalswimdiagdown.png` | 4 frames · 64×64 |
| `/assets/projectiles/chapter-3/nemo-fish/normal-actions/normalswimdiagup.png` | 4 frames · 64×64 |
| `/assets/projectiles/chapter-3/nemo-fish/normal-actions/normaltiltdownchomp.PNG` | 4 frames · 64×64 |
| `/assets/projectiles/chapter-3/nemo-fish/normal-actions/normaltiltupchomp.png` | 4 frames · 64×64 |
| `/assets/projectiles/chapter-3/snake/snake.png` | 14 frames · 64×64 |
| `/assets/projectiles/chapter-3/siren1/Idle.png` | 128×128 |
| `/assets/projectiles/chapter-3/siren2/Idle.png` | 128×128 |
| `/assets/projectiles/chapter-3/siren3/Idle.png` | 128×128 |
| `/assets/projectiles/chapter-3/siren3/Special.png` | 128×128 |
| `/assets/projectiles/chapter-3/cthulu.png` | Cthulhu boss · 105 frames · 192×112 |

### Water Beams
| Path | Notes |
|------|-------|
| `/assets/projectiles/chapter-3/water-beams/Dark-Bolt.png` | 12 frames · 64×88 |
| `/assets/projectiles/chapter-3/water-beams/Fire-bomb.png` | 15 frames · 64×64 |
| `/assets/projectiles/chapter-3/water-beams/Lightning.png` | 11 frames · 64×128 |
| `/assets/projectiles/chapter-3/water-beams/spark.png` | 8 frames · 32×32 |
| `/assets/projectiles/chapter-3/water-beams/water-spiral.png` | 6 frames · 32×32 |
| `/assets/projectiles/chapter-3/water-beams/water-beam.png` | 4 frames · 63×32 |
| `/assets/projectiles/chapter-3/water-beams/water-beam2.png` | 4 frames · 48×32 |
| `/assets/projectiles/chapter-3/water-beams/water-burst.png` | 6 frames · 63×48 |

### Explosions
| Path | Notes |
|------|-------|
| `/assets/projectiles/chapter-3/explosions/explosion-1-b.png` | 13 frames · 80×48 |
| `/assets/projectiles/chapter-3/explosions/explosion-2-b.png` | 8 frames · 48×48 |
| `/assets/projectiles/chapter-3/explosions/explosion-3-b.png` | 7 frames · 48×48 |
| `/assets/projectiles/chapter-3/explosions/explosion-4-b.png` | 12 frames · 128×128 |
| `/assets/projectiles/chapter-3/explosions/explosion-2-a.png` | 64 frames · 256×256 |
| `/assets/projectiles/chapter-3/explosions/explosion-3-a.png` | 64 frames · 256×256 |
| `/assets/projectiles/chapter-3/explosions/explosion-4-a.png` | 64 frames · 256×256 |
| `/assets/projectiles/chapter-3/explosions/explosion-1-d.png` | 8 frames · 64×64 |
| `/assets/projectiles/chapter-3/explosions/explosion-2-d.png` | 10 frames · 128×80 |
| `/assets/projectiles/chapter-3/explosions/explosion-3-d.png` | 22 frames · 192×192 |

---

## 📊 Summary

| Category | Static Files |
|----------|-------------|
| Audio | 3 |
| Fonts | 3 |
| Entity (player + boss) | 12 |
| Visual FX | 15 |
| Game UI | 16 |
| UI / Screens | 22 |
| Power-ups | 2 |
| Projectiles — Shared | 10 |
| Projectiles — Ch1 static | 8 |
| Projectiles — Ch1 dynamic sequences | 75 frames |
| Projectiles — Ch2 | 11 |
| Projectiles — Ch3 | 47 |
| **Total static references** | **~149** |
| **Total files incl. sequences** | **~224** |
