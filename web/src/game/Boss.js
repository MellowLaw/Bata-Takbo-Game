import * as Phaser from 'phaser';
import { Projectile } from './Projectile.js';
import { state } from '../utils/StateManager.js';

export class Boss {
  /**
   * @param {Phaser.Scene} scene 
   * @param {import('./Grid.js').Grid} grid 
   */
  constructor(scene, grid, isTutorial = false) {
    this.scene = scene;
    this.grid = grid;
    this.isTutorial = isTutorial;
    
    // In tutorial mode, we want a lot of HP so it doesn't die.
    if (this.isTutorial) {
      this.maxHp = 999;
    } else if (scene.chapterId === 1) {
      this.maxHp = 5;
    } else if (scene.chapterId === 2) {
      this.maxHp = 8;
    } else if (scene.chapterId === 3) {
      this.maxHp = 10;
    } else {
      this.maxHp = 5; // Default fallback
    }
    this.hp = this.maxHp;
    this.lastAttackId = -1;
    this.secondLastAttackId = -1; // Track two back to prevent problematic pairs
    this.waveCount = 0;

    // Boss sprite is rendered by HUDScene (since HUD covers the left panel).
    // Projectiles originate from the top-center of the grid area.
    const gridCenterX = grid.offsetX + (grid.tileSize * grid.cols) / 2;
    this.projectileOriginX = gridCenterX;
    this.projectileOriginY = grid.offsetY - 30;

    this.cheatMode = false; // Activated by the secret cheat code
    
    if (this.isTutorial) {
      // In tutorial, don't start the normal attack loop.
      // We will listen for specific tutorial events to trigger simple attacks.
      this.unsubTutorialAttack = state.on('tutorial:triggerAttack', (stepIndex) => {
        this.tutorialAttack(stepIndex);
      });
      this.unsubTutorialDamageTile = state.on('tutorial:spawnDamageTile', () => {
        this.spawnDamageTile();
      });
      this.scene.events.once('shutdown', () => {
        if (this.unsubTutorialAttack) this.unsubTutorialAttack();
        if (this.unsubTutorialDamageTile) this.unsubTutorialDamageTile();
      });
    } else {
      this.startAttackLoop();
    }
  }

  startAttackLoop() {
    this.attackCycleCount = 0;
    this.lastAttackId = -1;

    // Explicit 3-second startup breather before the very first shot
    this.attackTimer = this.scene.time.delayedCall(3000, this.executeAttack, [], this);

    // Phase 4: Time Stop buff listener
    this.scene.events.on('boss:timestop', (isStopped) => {
      if (this.attackTimer) {
        this.attackTimer.paused = isStopped;
      }
    });
  }

  tutorialAttack(stepIndex) {
    this.scene.events.emit('boss:attack');
    let duration = 0;

    if (stepIndex === 0) {
      // Very simple: single column warning (column 2)
      duration = this._tutorialSimpleAttack([{ c: 2, r: 0 }, { c: 2, r: 1 }, { c: 2, r: 2 }, { c: 2, r: 3 }, { c: 2, r: 4 }]);
    } else if (stepIndex === 1) {
      // Simple row warning (row 2)
      duration = this._tutorialSimpleAttack([{ c: 0, r: 2 }, { c: 1, r: 2 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 2 }]);
    } else if (stepIndex === 2) {
      // Small cross in the center
      duration = this._tutorialSimpleAttack([
        { c: 2, r: 1 }, { c: 1, r: 2 }, { c: 2, r: 2 }, { c: 3, r: 2 }, { c: 2, r: 3 }
      ]);
    }

    // Wait for the attack to finish then notify state
    this.scene.time.delayedCall(duration, () => {
      state.emit('tutorial:attackComplete');
    });
  }

  _tutorialSimpleAttack(tiles) {
    const WARNING_MS = 2000; // 2s red tile telegraph — longer so player can react

    // 1. Show red telegraph tiles
    tiles.forEach(pos => {
      this.grid.telegraph(pos.c, pos.r, WARNING_MS);
    });

    // 2. After warning, trigger explosions
    this.scene.time.delayedCall(WARNING_MS, () => {
      tiles.forEach(pos => {
        const gPos = this.grid.getPixelPosition(pos.c, pos.r);

        // Explosion sprite
        const exp = this.scene.add.sprite(gPos.x, gPos.y, 'eye_explosion')
          .setOrigin(0.5, 0.6).setDepth(30).setScale(1.5);
        if (this.scene.anims.exists('anim_eye_explosion')) {
          exp.play('anim_eye_explosion');
          exp.once('animationcomplete', () => exp.destroy());
        } else {
          this.scene.time.delayedCall(400, () => exp.destroy());
        }

        // Player hit check
        if (this.scene.player.col === pos.c && this.scene.player.row === pos.r
            && !this.scene.player.isDashing) {
          this.scene.player.takeDamage();
        }
      });
    });

    return WARNING_MS + 600; // total duration before next step
  }

  executeAttack() {
    this.waveCount++;

    // --- CHEAT MODE: boss sleeps, double loot rains ---
    if (this.cheatMode) {
      this._executeCheatWave();
      return;
    }

    let currentAttackDuration = 2000; // Baseline fallback

    // Every 4th wave, spawn the Golden Damage Tile
    if (this.waveCount % 4 === 0) {
      this.spawnDamageTile();
      currentAttackDuration = 4000;
    } else {
      const targets = [];
      this.attackCycleCount++;

      // Boss Phase 4 Loot Logistics: Spawn a drop every 5 attacks
      if (this.attackCycleCount % 5 === 0 && this.grid.spawnChest) {
        const gt = this.scene.goldenTile; // active attack tile position
        const freeSpots = [];
        for (let r = 0; r < this.grid.rows; r++) {
          for (let c = 0; c < this.grid.cols; c++) {
            if (this.grid.cells[r][c].status === 'safe' &&
              (c !== this.scene.player.col || r !== this.scene.player.row) &&
              !(gt && gt.col === c && gt.row === r) &&
              !this.grid.hasChestAt(c, r)) {
              freeSpots.push({ c, r });
            }
          }
        }
        if (freeSpots.length > 0) {
          const spot = Phaser.Math.RND.pick(freeSpots);
          const roll = Math.random();

          if (roll > 0.85) {
            this.grid.spawnRuby(spot.c, spot.r);
          } else if (roll > 0.70) {
            this.grid.spawnDiamond(spot.c, spot.r);
          } else {
            let rarity = 0; // Common Green
            if (roll > 0.50) rarity = 8; // Cursed skull chest
            else if (roll > 0.40) rarity = 2; // Legendary Gold
            else if (roll > 0.20) rarity = 1; // Rare Blue

            this.grid.spawnChest(spot.c, spot.r, rarity);
          }
        }
      }

      // Chapter 1 Specific Attack Routing
      if (this.scene.chapterId === 1) {
        this.scene.events.emit('boss:attack');

        // Fairness Rule #5: Pure randomization WITH History Blocking (Anti-Repeat Logic)
        let patternId;
        do {
          patternId = Phaser.Math.Between(0, 2);
        } while (patternId === this.lastAttackId);
        this.lastAttackId = patternId;

        if (patternId === 0) currentAttackDuration = this.ch1AttackCrimsonSplatter();
        else if (patternId === 1) currentAttackDuration = this.ch1AttackBleedingEye();
        else currentAttackDuration = this.ch1AttackBloodVolley();

      } else if (this.scene.chapterId === 2) {
        this.scene.events.emit('boss:attack');

        // 7 unique attack patterns with anti-repeat and anti-pair logic
        // Beeswarm (0) and Hibiscus (1) must NEVER be consecutive in either order
        const BEESWARM = 0, HIBISCUS = 1;
        let pattern;
        let safetyCounter = 0;
        do {
          pattern = Phaser.Math.Between(0, 6);
          safetyCounter++;
          // Block: same as last, OR beeswarm↔hibiscus adjacent pair
          const isBadPair = (pattern === BEESWARM && this.lastAttackId === HIBISCUS) ||
                            (pattern === HIBISCUS && this.lastAttackId === BEESWARM);
        } while (safetyCounter < 20 && (pattern === this.lastAttackId || 
          ((pattern === BEESWARM && this.lastAttackId === HIBISCUS) ||
           (pattern === HIBISCUS && this.lastAttackId === BEESWARM))));
        
        this.secondLastAttackId = this.lastAttackId;
        this.lastAttackId = pattern;

        if (pattern === 0) currentAttackDuration = this.ch2AttackBeeswarm();
        else if (pattern === 1) currentAttackDuration = this.ch2AttackHibiscus();
        else if (pattern === 2) currentAttackDuration = this.ch2AttackVines();
        else if (pattern === 3) currentAttackDuration = this.ch2AttackCarrotRain();
        else if (pattern === 4) currentAttackDuration = this.ch2AttackExplodingEggs();
        else if (pattern === 5) currentAttackDuration = this.ch2AttackSnappingFlora();
        else currentAttackDuration = this.ch2AttackAcidSpitter();
      } else if (this.scene.chapterId === 3) {
        this.scene.events.emit('boss:attack');
        // 11 Unique attacks with anti-repeat
        let pattern;
        do {
          pattern = Phaser.Math.Between(0, 22);
        } while (pattern === this.lastAttackId);
        
        this.secondLastAttackId = this.lastAttackId;
        this.lastAttackId = pattern;

        // Route to the completely randomized Kataw attacks
        switch (pattern) {
          case 0: currentAttackDuration = this.ch3KatawExplosionPattern1(); break;
          case 1: currentAttackDuration = this.ch3FishKingMultiSpell(); break;
          case 2: currentAttackDuration = this.ch3SharkLanes(); break;
          case 3: currentAttackDuration = this.ch3JellyfishCurtain(); break;
          case 4: currentAttackDuration = this.ch3NemoSwarm(); break;
          case 5: currentAttackDuration = this.ch3BatDiveBomb(); break;
          case 6: currentAttackDuration = this.ch3BioluminescentBlackout(); break;
          case 7: currentAttackDuration = this.ch3WhirlpoolMaze(); break;
          case 8: currentAttackDuration = this.ch3SirensLure(); break;
          case 9: currentAttackDuration = this.ch3MedusaGaze(); break;
          case 10: currentAttackDuration = this.ch3CthulhuRifts(); break;
          case 11: currentAttackDuration = this.ch3SirenSnakeChase(); break;
          case 12: currentAttackDuration = this.ch3FishKingSummonerWave(); break;
          case 13: currentAttackDuration = this.ch3KatawExplosionPattern2(); break;
          case 14: currentAttackDuration = this.ch3KatawExplosionPattern3(); break;
          case 15: currentAttackDuration = this.ch3AbyssalCrossPattern1(); break;
          case 16: currentAttackDuration = this.ch3AbyssalCrossPattern2(); break;
          case 17: currentAttackDuration = this.ch3AbyssalCrossPattern3(); break;
          case 18: currentAttackDuration = this.ch3AbyssalCrossPattern4(); break;
          case 19: currentAttackDuration = this.ch3DiamondStormPattern1(); break;
          case 20: currentAttackDuration = this.ch3DiamondStormPattern2(); break;
          case 21: currentAttackDuration = this.ch3DiamondStormPattern3(); break;
          case 22: currentAttackDuration = this.ch3DiamondStormPattern4(); break;
          default: currentAttackDuration = 2000;
        }
      } else {
        // Fallback/Legacy for other chapters until implemented
        targets.push({
          c: Phaser.Math.Between(0, this.grid.cols - 1),
          r: Phaser.Math.Between(0, this.grid.rows - 1)
        });
      }
      // Tell HUDScene to play boss attack animation (for chapters that use generic projectiles)
      if (this.scene.chapterId !== 1 && this.scene.chapterId !== 2) this.scene.events.emit('boss:attack');

      // Unleash generic projectiles with strict Fairness Rule (legacy format)
      const telegraphTime = Phaser.Math.Between(1500, 2000);
      currentAttackDuration = telegraphTime + 500; // Track the legacy duration logic

      targets.forEach(t => {
        this.grid.telegraph(t.c, t.r, telegraphTime);
        this.scene.time.delayedCall(telegraphTime, () => {
          if (this.hp > 0) {
            new Projectile(this.scene, this.grid, t.c, t.r);
          }
        });
      });
    }

    // Dynamic Cascading Pause Scheduler setup
    // This strictly ensures the game rests for precisely 3.0 seconds AFTER the active attack phase completely clears!
    if (this.hp > 0) {
      if (this.attackTimer) this.attackTimer.remove(); // Safely clear old references
      this.attackTimer = this.scene.time.delayedCall(currentAttackDuration + 3000, this.executeAttack, [], this);
    }
  }

  /** Linger damage check over an area to punish players who walk into active effect sprites */
  createDamageZone(tiles, duration) {
    this.scene.time.addEvent({
      delay: 100,
      repeat: Math.floor(duration / 100) - 1,
      callback: () => {
        if (this.scene.isGameOver) return;
        const p = this.scene.player;
        if (tiles.some(t => t.c === p.col && t.r === p.row)) {
          p.takeDamage();
        }
      }
    });
  }

  // ── Cheat wave: no attacks, doubled loot ───────────────────────────
  _executeCheatWave() {
    this.attackCycleCount++;
    let duration = 2000;

    // Spawn golden attack tile every 2 waves (double the normal rate)
    // On the bonus run, spawn a second tile 600ms later for true doubling
    if (this.waveCount % 2 === 0) {
      this.spawnDamageTile();
      this.scene.time.delayedCall(600, () => {
        if (this.hp > 0) this.spawnDamageTile();
      });
      duration = 3500;
    }

    // Spawn 2 chests every 2 cycles instead of 1 chest every 5
    if (this.attackCycleCount % 2 === 0 && this.grid.spawnChest) {
      const gt = this.scene.goldenTile;
      const freeSpots = [];
      for (let r = 0; r < this.grid.rows; r++) {
        for (let c = 0; c < this.grid.cols; c++) {
          if (this.grid.cells[r][c].status === 'safe' &&
            (c !== this.scene.player.col || r !== this.scene.player.row) &&
            !(gt && gt.col === c && gt.row === r) &&
            !this.grid.hasChestAt(c, r)) {
            freeSpots.push({ c, r });
          }
        }
      }
      // Spawn up to 2 chests from random free spots
      for (let i = 0; i < 2 && freeSpots.length > 0; i++) {
        const idx = Phaser.Math.Between(0, freeSpots.length - 1);
        const spot = freeSpots.splice(idx, 1)[0];
        const roll = Math.random();

        if (roll > 0.85) {
          this.grid.spawnRuby(spot.c, spot.r);
        } else if (roll > 0.70) {
          this.grid.spawnDiamond(spot.c, spot.r);
        } else {
          let rarity = 0;
          if (roll > 0.50) rarity = 8; // Cursed chest
          else if (roll > 0.40) rarity = 2;
          else if (roll > 0.20) rarity = 1;
          this.grid.spawnChest(spot.c, spot.r, rarity);
        }
      }
    }

    // Schedule next cheat wave (faster cycle — 1s breather)
    if (this.hp > 0) {
      if (this.attackTimer) this.attackTimer.remove();
      this.attackTimer = this.scene.time.delayedCall(duration + 1000, this.executeAttack, [], this);
    }
  }

  // ================= CHAPTER 1 BLOOD MECHANICS =================

  ch1AttackCrimsonSplatter() {
    const numAttacks = Phaser.Math.Between(3, 4);
    for (let i = 0; i < numAttacks; i++) {
      const c = Phaser.Math.Between(0, this.grid.cols - 1);
      const r = Phaser.Math.Between(0, this.grid.rows - 1);
      this.grid.telegraph(c, r, 1500);

      this.scene.time.delayedCall(1500, () => {
        const dest = this.grid.getPixelPosition(c, r);
        const startY = dest.y - 450; // Drop from sky high

        // Force angle downwards naturally, scale up the 16px beam to be 6x larger
        const blood = this.scene.add.sprite(dest.x, startY, 'blood_chem', 6);
        blood.setDisplaySize(80, 20).setRotation(Math.PI / 2).setDepth(30);

        this.scene.tweens.add({
          targets: blood, y: dest.y, duration: 400, ease: 'Power2',
          onComplete: () => {
            blood.destroy();
            // Scale up the 32px splat to 5x
            const splat = this.scene.add.sprite(dest.x, dest.y, 'blood_splat_000').setScale(5.0).setDepth(20);
            splat.play('anim_blood_splat').once('animationcomplete', () => splat.destroy());

            // Native Area Damage Check
            if (this.scene.player.col === c && this.scene.player.row === r) {
              this.scene.player.takeDamage();
            }
          }
        });
      });
    }
    // Execution duration is precisely 1500ms warning + 400ms physical impact
    return 1900;
  }

  ch1AttackBleedingEye() {
    // Lock onto player immediately but do not adjust!
    const c = this.scene.player.col;
    const r = this.scene.player.row;
    this.grid.telegraph(c, r, 1500);

    // Spawn eye off-screen
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -50 : this.scene.scale.width + 50;
    const startY = -100;

    // Eye is 2500x2500 native. Dialed up to 0.06
    const eye = this.scene.add.sprite(startX, startY, 'ch1_eye').setScale(1.5).setDepth(40);
    eye.play('anim_ch1_eye');
    // The asset natively faces right, so flip it if it comes from the right
    if (fromLeft) {
      eye.setFlipX(true);
    }

    const dest = this.grid.getPixelPosition(c, r);

    // Animate to target over 1.5s warning period (giving the dripping trail time to render continuously)
    this.scene.tweens.add({
      targets: eye, x: dest.x, y: dest.y, duration: 1500, ease: 'Cubic.easeIn',
      onComplete: () => {
        eye.destroy();
        // Eye explosion FX
        const splat = this.scene.add.sprite(dest.x, dest.y, 'eye_explosion').setScale(2.0).setDepth(22);
        splat.play('anim_eye_explosion').once('animationcomplete', () => splat.destroy());
        // Exact Area Damage Check
        if (this.scene.player.col === c && this.scene.player.row === r) {
          this.scene.player.takeDamage();
        }
      }
    });

    // Dripping Trail loop - stamps a dark frame every 50 ms in its wake
    const dripCount = Math.floor(1500 / 50);
    const dripTimer = this.scene.time.addEvent({
      delay: 50, repeat: dripCount - 1,
      callback: () => {
        // Dark blood is 16px native. Scale up 7x for a wide, heavy trail
        const drip = this.scene.add.sprite(eye.x, eye.y, 'dark_blood_0').setScale(7.0).setDepth(35);
        drip.play('anim_dark_blood');
        this.scene.tweens.add({
          targets: drip, alpha: 0, scale: 2.0, y: drip.y + 60, duration: 800, onComplete: () => drip.destroy()
        });
      }
    });

    // Execution physically takes 1500ms to arrive directly at the target, and splat clears itself organically
    return 1500;
  }

  ch1AttackBloodVolley() {
    // Rhythm Combo: 3 to 5 rapid burst beats
    const numShots = Phaser.Math.Between(3, 5);
    let sequenceDelay = 0;

    for (let i = 0; i < numShots; i++) {
      this.scene.time.delayedCall(sequenceDelay, () => {
        const roll = Math.random();
        let handImg = 'ch1_hand1';
        let startLoc = { x: 0, y: 0 };

        // Recompute target on the player at the start of each individual beat to force them to react constantly
        const targetCol = Phaser.Math.Clamp(this.scene.player.col, 0, this.grid.cols - 1);
        const targetRow = Phaser.Math.Clamp(this.scene.player.row, 0, this.grid.rows - 1);
        const dest = this.grid.getPixelPosition(targetCol, targetRow);

        let scaleOverride = 1.0;

        // Tether spawns VISIBLY ON the border of the physical grid so it plays nice with tight camera zooms.
        const gridRight = this.grid.offsetX + (this.grid.cols * this.grid.tileSize);
        const gridTop = this.grid.offsetY;
        const gridBottom = this.grid.offsetY + (this.grid.rows * this.grid.tileSize);

        if (roll < 0.33) {
          handImg = 'ch1_hand1'; // Native: 1080x1663 -> Scale down heavily
          startLoc = { x: dest.x, y: gridBottom - 10 }; // Just barely hugging the bottom tile line
          scaleOverride = 0.09;
        } else if (roll < 0.66) {
          handImg = 'ch1_hand2'; // Native: 344x240 -> Mid scale
          startLoc = { x: gridRight - 40, y: gridTop + 20 }; // Pushed significantly IN to the grid top-right
          scaleOverride = 0.35;
        } else {
          handImg = 'ch1_hand3'; // Native: 181x322 -> Less scaled down
          startLoc = { x: gridRight - 40, y: gridBottom - 40 }; // Pushed significantly IN to the grid bottom-right
          scaleOverride = 0.5;
        }

        // Hand flashes into view
        const hand = this.scene.add.sprite(startLoc.x, startLoc.y, handImg).setScale(scaleOverride).setDepth(50);

        // Calculate angle once to point hand toward target
        const targetAngle = Math.atan2(dest.y - startLoc.y, dest.x - startLoc.x);

        // Adjust base rotations so fingers point correctly
        // ch1_hand1 points UP by default ( -Math.PI/2 )
        // ch1_hand2 faces top-right
        // ch1_hand3 faces bottom-right
        if (handImg === 'ch1_hand1') hand.setRotation(targetAngle + Math.PI / 2);
        else hand.setRotation(targetAngle);

        this.grid.telegraph(targetCol, targetRow, 1000);

        this.scene.time.delayedCall(1000, () => {
          hand.destroy();
          const blood = this.scene.add.sprite(startLoc.x, startLoc.y, 'blood_chem', 6).setDisplaySize(80, 20).setDepth(45);

          // Calculates precise geometry projection angle to face the target exactly
          const angle = Math.atan2(dest.y - startLoc.y, dest.x - startLoc.x);
          blood.setRotation(angle);

          // Blood trail: stamp blood_chem images along the path
          const trailTimer = this.scene.time.addEvent({
            delay: 30, repeat: Math.floor(200 / 30) - 1,
            callback: () => {
              if (!blood || !blood.active) return;
              const trail = this.scene.add.sprite(blood.x, blood.y, 'blood_chem', 6)
                .setDisplaySize(60, 15).setDepth(40).setAlpha(0.7).setRotation(angle);
              this.scene.tweens.add({ targets: trail, alpha: 0, scale: 0.02, duration: 300, onComplete: () => trail.destroy() });
            }
          });

          // High-speed beam connection
          this.scene.tweens.add({
            targets: blood, x: dest.x, y: dest.y, duration: 200,
            onComplete: () => {
              blood.destroy();
              trailTimer.remove();
              const splat = this.scene.add.sprite(dest.x, dest.y, 'blood_splat_000').setScale(5.0).setDepth(20);
              splat.play('anim_blood_splat').once('animationcomplete', () => splat.destroy());

              if (this.scene.player.col === targetCol && this.scene.player.row === targetRow) {
                this.scene.player.takeDamage();
              }
            }
          });
        });
      });
      sequenceDelay += 1300; // Perfect Rhythm interval space
    }
    // Execution physically encompasses the staggered looping timing until the final beam lands
    return (numShots - 1) * 1300 + 1200;
  }

  // ================= CHAPTER 2: BUNGISNGIS MECHANICS =================

  /** Attack 1: The Beeswarm — Diagonal Sweep */
  ch2AttackBeeswarm() {
    // X pattern: Sweep 1 (TL->BR) then Sweep 2 (TR->BL)
    const tiles1 = [];
    const tiles2 = [];
    const tilesByRow1 = {};
    const tilesByRow2 = {};
    
    for (let c = 0; c < this.grid.cols; c++) {
      for (let r = 0; r < this.grid.rows; r++) {
        if (Math.abs(r - c) <= 1) {
          tiles1.push({ c, r });
          if (!tilesByRow1[r]) tilesByRow1[r] = [];
          tilesByRow1[r].push({ c, r });
        }
        if (Math.abs(r - (this.grid.cols - 1 - c)) <= 1) {
          tiles2.push({ c, r });
          if (!tilesByRow2[r]) tilesByRow2[r] = [];
          tilesByRow2[r].push({ c, r });
        }
      }
    }

    const scale = this.grid.tileSize * 1.8;
    const travelTime = 2500; // Make bees fly faster so sequential attack isn't too agonizing
    const rowWindow = travelTime / this.grid.rows;
    const offscreen = travelTime * 0.15;

    const executeSwarm = (tiles, tilesByRow, baseStart, baseEnd, isFlip) => {
      // Telegraph just this line
      tiles.forEach(t => this.grid.telegraph(t.c, t.r, 1200));

      this.scene.time.delayedCall(1200, () => {
        if (this.hp <= 0) return;
        
        const s = this.grid.getPixelPosition(baseStart.c, baseStart.r);
        const e = this.grid.getPixelPosition(baseEnd.c, baseEnd.r);
        
        const dx = e.x - s.x;
        const dy = e.y - s.y;
        const startOffX = s.x - dx * 0.5;
        const startOffY = s.y - dy * 0.5;
        const endOffX = e.x + dx * 0.5;
        const endOffY = e.y + dy * 0.5;

        const perpX = -dy; 
        const perpY = dx;
        const mag = Math.sqrt(perpX*perpX + perpY*perpY);
        const pNormX = perpX / mag;
        const pNormY = perpY / mag;

        for (let i = 0; i < 60; i++) {
          const spread = Phaser.Math.Between(-200, 200); 
          const longitudinalOffset = Phaser.Math.Between(-400, 400); 
          
          const beeScale = scale * Phaser.Math.FloatBetween(0.5, 1.1);
          const startX = startOffX + (pNormX * spread) + ( (dx/mag) * longitudinalOffset );
          const startY = startOffY + (pNormY * spread) + ( (dy/mag) * longitudinalOffset );
          
          const bee = this.scene.add.sprite(startX, startY, 'ch2_beeswarm')
            .setDisplaySize(beeScale, beeScale).setDepth(50 + i).setFlipX(isFlip);
            
          bee.setTint(i % 4 === 0 ? 0xbbbbbb : (i % 3 === 0 ? 0xdddddd : 0xffffff));
          bee.setAlpha(Phaser.Math.FloatBetween(0.8, 1.0));
            
          bee.play('anim_ch2_beeswarm_in').once('animationcomplete', () => bee.play('anim_ch2_beeswarm_loop'));

          this.scene.tweens.add({
            targets: bee,
            x: endOffX + (startX - startOffX),
            y: endOffY + (startY - startOffY),
            duration: travelTime + Phaser.Math.Between(-200, 200), 
            ease: 'Linear',
            onComplete: () => {
              if (bee.active) {
                bee.play('anim_ch2_beeswarm_out').once('animationcomplete', () => bee.destroy());
              }
            }
          });
        }

        // Damage strictly follows the physical location of the bees vertically
        for (let r = 0; r < this.grid.rows; r++) {
          const rowStart = offscreen + r * rowWindow;
          this.scene.time.delayedCall(rowStart, () => {
            if (this.hp <= 0) return;
            // Only deal damage to the tiles in the active row for this specific line
            const rowTiles = tilesByRow[r] || [];
            this.createDamageZone(rowTiles, rowWindow);
          });
        }
      });
    };

    // 1. Sweep Top-Left to Bottom-Right
    executeSwarm(tiles1, tilesByRow1, {c: 0, r: 0}, {c: this.grid.cols-1, r: this.grid.rows-1}, false);
    
    // 2. Wait, then sweep Top-Right to Bottom-Left
    this.scene.time.delayedCall(2200, () => {
      if (this.hp <= 0) return;
      executeSwarm(tiles2, tilesByRow2, {c: this.grid.cols-1, r: 0}, {c: 0, r: this.grid.rows-1}, true);
    });

    // Total cooldown: 2200 (delay for 2nd) + 1200 (telegraph) + 2500 (travel) + 600 buffer = 6500
    return 6500;
  }

  /** Attack 2: Hibiscus Pollen Burst — Concentric Rings Sequence */
  ch2AttackHibiscus() {
    const mc = Math.floor(this.grid.cols / 2);
    const mr = Math.floor(this.grid.rows / 2);
    const centerPos = this.grid.getPixelPosition(mc, mr);

    // Telegraph center
    this.grid.telegraph(mc, mr, 800);

    // SCALE: Hibiscus landing sprite — change tileSize multiplier to resize
    const hibiscusScale = this.grid.tileSize * 2.0;
    const hibiscus = this.scene.add.sprite(centerPos.x, centerPos.y - 200, 'ch2_hibiscus')
      .setDisplaySize(hibiscusScale, hibiscusScale)
      .setDepth(35)
      .setAlpha(0);

    // Drop the hibiscus onto the center tile
    this.scene.tweens.add({
      targets: hibiscus,
      y: centerPos.y, alpha: 1,
      duration: 800, ease: 'Bounce.easeOut',
      onComplete: () => {
        hibiscus.play('anim_ch2_hibiscus');
        
        // Delay before beginning the burst sequence
        this.scene.time.delayedCall(1200, () => {
          if (this.hp <= 0) return;

          // Visual wobble for anticipation
          this.scene.tweens.add({
            targets: hibiscus,
            scaleX: hibiscusScale * 1.15,
            scaleY: hibiscusScale * 0.85,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              if (this.hp <= 0) return;
              
              const burstScale = this.grid.tileSize * 1.5;

              // Sequence 0: burst Center tile
              const b = this.scene.add.sprite(centerPos.x, centerPos.y, 'ch2_hibiscus_burst')
                .setDisplaySize(burstScale, burstScale).setDepth(36);
              b.play('anim_ch2_hibiscus_burst');
              b.once('animationcomplete', () => b.destroy());
              this.createDamageZone([{c: mc, r: mr}], 1500);

              // Destroy plant with a nice fade-out so it doesn't just vanish
              this.scene.tweens.add({
                targets: hibiscus, alpha: 0, scale: hibiscus.scale * 1.5,
                duration: 600, onComplete: () => hibiscus.destroy()
              });

              // True chain reaction: each ring only fires AFTER previous ring's animation ends
              const maxDist = Math.max(mc, this.grid.cols - 1 - mc, mr, this.grid.rows - 1 - mr);
              
              const fireRing = (d) => {
                if (d > maxDist || this.hp <= 0) return;
                
                const ringTiles = [];
                for (let c = 0; c < this.grid.cols; c++) {
                  for (let r = 0; r < this.grid.rows; r++) {
                    if (Math.max(Math.abs(c - mc), Math.abs(r - mr)) === d) ringTiles.push({ c, r });
                  }
                }

                // Telegraph this ring
                ringTiles.forEach(t => this.grid.telegraph(t.c, t.r, 500));

                this.scene.time.delayedCall(500, () => {
                  if (this.hp <= 0) return;

                  let animsComplete = 0;
                  ringTiles.forEach(t => {
                    const dest = this.grid.getPixelPosition(t.c, t.r);
                    const ringBurst = this.scene.add.sprite(dest.x, dest.y, 'ch2_hibiscus_burst')
                      .setDisplaySize(burstScale, burstScale).setDepth(36);
                    ringBurst.play('anim_ch2_hibiscus_burst');
                    ringBurst.once('animationcomplete', () => {
                      ringBurst.destroy();
                      animsComplete++;
                      // When ALL tiles in this ring finish animating, fire the next ring
                      if (animsComplete >= ringTiles.length) {
                        fireRing(d + 1);
                      }
                    });
                  });

                  // Damage only while animation is playing
                  this.createDamageZone(ringTiles, 1800);
                });
              };

              fireRing(1);
            }
          });
        });
      }
    });

    return 6000; // Generous duration to allow full chain to complete
  }

  /** Attack 3: Strangling Vines — Immobilization + Gesture QTE */
  ch2AttackVines() {
    const pCol = this.scene.player.col;
    const pRow = this.scene.player.row;

    // Telegraph a 3x3 area centered on player
    const vineTiles = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const c = Phaser.Math.Clamp(pCol + dx, 0, this.grid.cols - 1);
        const r = Phaser.Math.Clamp(pRow + dy, 0, this.grid.rows - 1);
        vineTiles.push({ c, r });
        this.grid.telegraph(c, r, 1200);
      }
    }

    // After warning, spawn vines and check if player is caught
    this.scene.time.delayedCall(1200, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;

      // Spawn vine animations on EVERY tile in the 3x3 regardless of escape
      const vineSprites = [];
      const vineScale = this.grid.tileSize * 1.6;
      vineTiles.forEach(t => {
        const dest = this.grid.getPixelPosition(t.c, t.r);
        const vine = this.scene.add.sprite(dest.x, dest.y, 'ch2_vines')
          .setDisplaySize(vineScale, vineScale) // 1 to 1 instead of 1.2 height
          .setDepth(25);
        vine.play('anim_ch2_vines_grow');
        vine.once('animationcomplete', () => vine.play('anim_ch2_vines_idle'));
        vineSprites.push(vine);
      });

      // Check if player is ACTUALLY in the zone to be frozen
      const caught = vineTiles.some(t => t.c === this.scene.player.col && t.r === this.scene.player.row);
      if (!caught) {
        // Player escaped! Just let the vines despawn automatically after 2s
        this.scene.time.delayedCall(2000, () => {
          vineSprites.forEach(v => {
            v.play('anim_ch2_vines_shrink');
            v.once('animationcomplete', () => v.destroy());
          });
        });
        return; 
      }

      // Freeze the player
      this.scene.player.isFrozen = true;
      this.scene.player.sprite.setTint(0x44aa44);
      const playerPos = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);



      // QTE: Show 3 random arrow prompts
      const directions = ['up', 'down', 'left', 'right'];
      const arrows = { up: '⬆', down: '⬇', left: '⬅', right: '➡' };
      const sequence = [];
      for (let i = 0; i < 3; i++) sequence.push(Phaser.Math.RND.pick(directions));

      let qteIndex = 0;
      const qteTexts = [];

      // Render all 3 arrows above the player
      for (let i = 0; i < 3; i++) {
        const txt = this.scene.add.text(
          playerPos.x - 40 + i * 40, playerPos.y - 70,
          arrows[sequence[i]],
          { fontFamily: 'VCR', fontSize: '28px', color: i === 0 ? '#ffff00' : '#888888', stroke: '#000', strokeThickness: 4 }
        ).setOrigin(0.5).setDepth(600);
        qteTexts.push(txt);
      }

      const titleTxt = this.scene.add.text(playerPos.x, playerPos.y - 100, 'BREAK FREE!', {
        fontFamily: 'GigaSaturn', fontSize: '16px', color: '#ff4444', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(600);

      // Listen for correct gestures
      const onGesture = (direction) => {
        if (this.scene.isGameOver || qteIndex >= 3) return;
        if (direction.toLowerCase() === sequence[qteIndex]) {
          // Correct! Highlight completed arrow green
          qteTexts[qteIndex].setColor('#00ff00');
          qteIndex++;
          if (qteIndex < 3) {
            qteTexts[qteIndex].setColor('#ffff00'); // Highlight next
          }
          if (qteIndex >= 3) {
            // QTE complete! Free the player
            cleanupQte(true);
          }
        }
      };

      const cleanupQte = (escaped) => {
        // Unsub gesture
        if (this.scene._vineQteUnsub) {
          this.scene._vineQteUnsub();
          this.scene._vineQteUnsub = null;
        }
        // Remove arrows
        qteTexts.forEach(t => t.destroy());
        titleTxt.destroy();
        // Unfreeze player
        this.scene.player.isFrozen = false;
        this.scene.player.sprite.clearTint();
        // Shrink vines
        vineSprites.forEach(v => {
          if (v.active) {
            v.play('anim_ch2_vines_shrink');
            v.once('animationcomplete', () => v.destroy());
          }
        });

        if (escaped) {
          const txt = this.scene.add.text(playerPos.x, playerPos.y - 60, 'ESCAPED!', {
            fontFamily: 'VCR', fontSize: '20px', color: '#00ff00', stroke: '#000', strokeThickness: 5
          }).setOrigin(0.5).setDepth(600);
          this.scene.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
        }
      };

      // Subscribe to gesture events
      this.scene._vineQteUnsub = state.on('gesture:detected', onGesture);

      // 10 second window to escape — deal damage only if they completely failed
      this.scene.time.delayedCall(10000, () => {
        if (qteIndex < 3 && this.scene.player.isFrozen) {
          // Failed to escape in time — deal real damage
          this.scene.player.takeDamage();
          cleanupQte(false);
        }
      });
    });

    return 4000;
  }

  /** Attack 4: Carrot Rain — Line Attack */
  ch2AttackCarrotRain() {
    // Pick 1 to 3 distinct rows OR distinct columns (NO diagonals)
    const isRow = Math.random() > 0.5;
    const numLines = Phaser.Math.Between(1, 3);
    const chosenLines = [];

    while (chosenLines.length < numLines) {
      const idx = Phaser.Math.Between(0, (isRow ? this.grid.rows : this.grid.cols) - 1);
      if (!chosenLines.includes(idx)) chosenLines.push(idx);
    }

    const tiles = [];
    chosenLines.forEach(idx => {
      if (isRow) {
        for (let c = 0; c < this.grid.cols; c++) tiles.push({ c, r: idx });
      } else {
        for (let r = 0; r < this.grid.rows; r++) tiles.push({ c: idx, r });
      }
    });

    // Telegraph all tiles
    tiles.forEach(t => this.grid.telegraph(t.c, t.r, 1500));

    // Stagger carrot drops
    tiles.forEach((t, i) => {
      this.scene.time.delayedCall(1500 + i * 150, () => {
        if (this.hp <= 0) return;
        const dest = this.grid.getPixelPosition(t.c, t.r);
        // Carrots fall from top-right
        const startX = dest.x + 200;
        const startY = dest.y - 350;

        // SCALE: Carrot sprite — change tileSize multiplier to resize
        const carrotScale = this.grid.tileSize * 1.5;
        const carrot = this.scene.add.sprite(startX, startY, 'ch2_carrot')
          .setDisplaySize(carrotScale, carrotScale) // ← SCALE CONTROL
          .setDepth(40)
          .setRotation(-0.5); // Slight angle for falling from top-right

        this.scene.tweens.add({
          targets: carrot,
          x: dest.x, y: dest.y,
          rotation: 0,
          duration: 350, ease: 'Power2',
          onComplete: () => {
            carrot.play('anim_ch2_carrot');
            carrot.once('animationcomplete', () => carrot.destroy());
            // Damage check on impact - lingers for the duration of the animation
            this.createDamageZone([{ c: t.c, r: t.r }], 1200);
          }
        });
      });
    });

    return 1500 + tiles.length * 150 + 500;
  }

  /** Attack 5: Exploding Eggs — Spot Hazard */
  ch2AttackExplodingEggs() {
    const numEggs = Phaser.Math.Between(5, 10);
    const chosen = [];

    for (let i = 0; i < numEggs; i++) {
      let c, r, attempts = 0;
      do {
        c = Phaser.Math.Between(0, this.grid.cols - 1);
        r = Phaser.Math.Between(0, this.grid.rows - 1);
        attempts++;
      } while (attempts < 15 && chosen.some(t => t.c === c && t.r === r));
      chosen.push({ c, r });
    }

    // Telegraph
    chosen.forEach(t => this.grid.telegraph(t.c, t.r, 1500));

    // Drop eggs after warning
    chosen.forEach(t => {
      this.scene.time.delayedCall(1500, () => {
        if (this.hp <= 0) return;
        const dest = this.grid.getPixelPosition(t.c, t.r);

        // SCALE: Egg sprite — change tileSize multiplier to resize
        const eggScale = this.grid.tileSize * 1.4;
        const egg = this.scene.add.sprite(dest.x, dest.y - 150, 'ch2_eggs')
          .setDisplaySize(eggScale, eggScale * 1.2) // ← SCALE CONTROL (w, h)
          .setDepth(40);

        this.scene.tweens.add({
          targets: egg,
          y: dest.y,
          duration: 400, ease: 'Bounce.easeOut',
          onComplete: () => {
            egg.play('anim_ch2_eggs');
            egg.once('animationcomplete', () => egg.destroy());
            this.scene.cameras.main.shake(150, 0.01);
            // Persistent damage zone while it explodes
            this.createDamageZone([{c: t.c, r: t.r}], 1800);
          }
        });
      });
    });

    return 1600;
  }

  /** Attack 6: Snapping Flora — Melee Trap (Persistent, fire-and-forget) */
  ch2AttackSnappingFlora() {
    for (let i = 0; i < 3; i++) {
      // Find a safe tile ≥2 tiles from the player
      let pc, pr, attempts = 0;
      do {
        pc = Phaser.Math.Between(0, this.grid.cols - 1);
        pr = Phaser.Math.Between(0, this.grid.rows - 1);
        attempts++;
      } while (attempts < 20 && (
        Math.abs(pc - this.scene.player.col) + Math.abs(pr - this.scene.player.row) < 2 ||
        this.grid.hasChestAt(pc, pr) ||
        this.grid.cells[pr][pc].status !== 'safe' ||
        this.scene.persistentEntities.some(e => e.col === pc && e.row === pr)
      ));

      // If we couldn't find a spot after 20 tries (unlikely unless grid is packed), skip
      if (attempts >= 20) continue;

      const pos = this.grid.getPixelPosition(pc, pr);
      this.grid.setCellStatus(pc, pr, 'locked', 0x336633);

      // SCALE: Melee plant sprite — change multiplier to resize
      const plantScale = this.grid.tileSize / 64 * 1.8;
      const plant = this.scene.add.sprite(pos.x, pos.y, 'ch2_plant_melee', 0)
        .setScale(plantScale) // ← SCALE CONTROL
        .setDepth(18)
        .setAlpha(0);

      // Add a persistent light red danger cross indicating its melee range (up, down, left, right)
      // Clamp each arm so it stays strictly within the board edges
      const size = this.grid.tileSize;
      const gridLeft   = this.grid.offsetX;
      const gridRight  = this.grid.offsetX + this.grid.cols * this.grid.tileSize;
      const gridTop    = this.grid.offsetY;
      const gridBottom = this.grid.offsetY + this.grid.rows * this.grid.tileSize;

      const dangerZone = this.scene.add.graphics();
      dangerZone.fillStyle(0xff0000, 0.25); // faint red

      // Horizontal bar: clamp left/right edges to grid bounds
      const hLeft  = Math.max(gridLeft,  pos.x - size * 1.5);
      const hRight = Math.min(gridRight, pos.x + size * 1.5);
      dangerZone.fillRect(hLeft, pos.y - size * 0.5, hRight - hLeft, size);

      // Vertical bar: clamp top/bottom edges to grid bounds
      const vTop    = Math.max(gridTop,    pos.y - size * 1.5);
      const vBottom = Math.min(gridBottom, pos.y + size * 1.5);
      dangerZone.fillRect(pos.x - size * 0.5, vTop, size, vBottom - vTop);

      dangerZone.setDepth(15);
      dangerZone.setAlpha(0);

      // Pop-in animation
      this.scene.tweens.add({
        targets: [plant, dangerZone], alpha: 1, duration: 300, ease: 'Back.easeOut'
      });

      const entity = { type: 'melee', col: pc, row: pr, sprite: plant, danger: dangerZone, active: true, _attackCooldown: false };
      this.scene.persistentEntities.push(entity);

      // Remove after 8 seconds
      entity.timer = this.scene.time.delayedCall(8000, () => {
        if (!entity.active) return;
        entity.active = false;
        this.grid.setCellStatus(pc, pr, 'safe');
        this.scene.tweens.add({
          targets: [plant, dangerZone], alpha: 0, scale: 0, duration: 300,
          onComplete: () => {
            plant.destroy();
            dangerZone.destroy();
            const idx = this.scene.persistentEntities.indexOf(entity);
            if (idx !== -1) this.scene.persistentEntities.splice(idx, 1);
          }
        });
      });

      entity.onAttackComplete = () => {
        entity.active = false;
        if (entity.timer) entity.timer.remove();
        this.grid.setCellStatus(entity.col, entity.row, 'safe');
        this.scene.tweens.add({
          targets: [plant, dangerZone], alpha: 0, scale: 0, quantity: 0, duration: 300,
          onComplete: () => {
            plant.destroy();
            dangerZone.destroy();
            const idx = this.scene.persistentEntities.indexOf(entity);
            if (idx !== -1) this.scene.persistentEntities.splice(idx, 1);
          }
        });
      };
    }

    return 1000;
  }

  /** Attack 7: Acid Spitter — Wall of Ranged Plants (3 right, 4 left), each fires 3 shots of 3 random tiles */
  ch2AttackAcidSpitter() {
    const SHOTS_PER_PLANT = 3;
    const SHOT_DELAY = 1000;
    const PLANT_SCALE = this.grid.tileSize / 64 * 2.0;
    const PROJ_SCALE  = this.grid.tileSize / 32 * 0.5;
    const SPLAT_SCALE = this.grid.tileSize / 32 * 0.8;

    const gridLeft  = this.grid.offsetX;
    const gridRight = this.grid.offsetX + this.grid.cols * this.grid.tileSize;
    const offscreenPad = 80;

    const allRows = Array.from({ length: this.grid.rows }, (_, i) => i);
    Phaser.Utils.Array.Shuffle(allRows);
    const rightRows = allRows.slice(0, 3);
    const leftRows  = allRows.slice(3, 7);

    const totalDuration = SHOTS_PER_PLANT * SHOT_DELAY + 2500;

    const spawnPlantAndFire = (plantRow, side) => {
      const isRight = side === 'right';
      const pixelY  = this.grid.getPixelPosition(0, plantRow).y;
      const pixelX  = isRight ? gridRight + offscreenPad : gridLeft - offscreenPad;

      // Row 3 (frames 14) = left, Row 4 (frames 21) = right  — correct per sprite sheet
      const idleFrame = isRight ? 14 : 21; // left-facing for right-side, right-facing for left-side
      const plant = this.scene.add.sprite(pixelX, pixelY, 'ch2_plant_ranged', idleFrame)
        .setScale(PLANT_SCALE).setDepth(18).setAlpha(0);

      this.scene.tweens.add({ targets: plant, alpha: 1, duration: 400, ease: 'Back.easeOut' });

      for (let shot = 0; shot < SHOTS_PER_PLANT; shot++) {
        this.scene.time.delayedCall(500 + shot * SHOT_DELAY, () => {
          if (this.hp <= 0 || this.scene.isGameOver) return;

          // Play correct facing animation
          plant.play(isRight ? 'anim_ch2_plant_ranged_left' : 'anim_ch2_plant_ranged_right');

          // Pick 3 random UNIQUE columns on THIS plant's own row
          const targetTiles = [];
          const usedCols = new Set();
          let safety = 0;
          while (targetTiles.length < 3 && safety++ < 30) {
            const tc = Phaser.Math.Between(0, this.grid.cols - 1);
            if (!usedCols.has(tc)) {
              usedCols.add(tc);
              targetTiles.push({ c: tc, r: plantRow }); // Always fires on its own row
            }
          }

          // Telegraph all 3 target tiles
          targetTiles.forEach(({ c, r }) => this.grid.telegraph(c, r, 700));

          this.scene.time.delayedCall(700, () => {
            if (this.hp <= 0 || this.scene.isGameOver) return;

            targetTiles.forEach(({ c, r }) => {
              const targetPos = this.grid.getPixelPosition(c, r);
              const startX = isRight ? gridRight + 10 : gridLeft - 10;

              // Step 1: Charge at the plant mouth
              const charge = this.scene.add.sprite(pixelX, pixelY, 'ch2_acid_charge', 0)
                .setScale(PROJ_SCALE).setDepth(41);
              charge.play('anim_ch2_acid_charge');

              // anim_ch2_acid_charge: 10 frames @ 12fps = ~833ms
              const CHARGE_MS = Math.floor(10 / 12 * 1000);

              charge.once('animationcomplete', () => {
                charge.destroy();

                // Step 2: Travel (Acid-02Repeatable) from edge toward target tile
                const angle = Math.atan2(targetPos.y - pixelY, targetPos.x - pixelX);
                const travel = this.scene.add.sprite(startX, pixelY, 'ch2_acid_travel', 0)
                  .setScale(PROJ_SCALE).setDepth(42).setRotation(angle);
                travel.play('anim_ch2_acid_travel');

                const dist = Math.sqrt((targetPos.x - startX) ** 2 + (targetPos.y - pixelY) ** 2);
                const travelDuration = Math.max(400, dist * 0.8);

                // Pre-spawn splat ONE FRAME before travel ends — no gap!
                const ONE_FRAME = 16;

                this.scene.time.delayedCall(travelDuration - ONE_FRAME, () => {
                  if (this.hp <= 0 || this.scene.isGameOver) return;
                  // Step 3: Splat — last 6 frames of Acid-01.png (frames 10-15)
                  const splat = this.scene.add.sprite(targetPos.x, targetPos.y, 'ch2_acid_charge', 10)
                    .setScale(SPLAT_SCALE).setDepth(20);
                  splat.play('anim_ch2_acid_burst');
                  splat.once('animationcomplete', () => splat.destroy());
                  this.createDamageZone([{ c, r }], 1200);
                });

                this.scene.tweens.add({
                  targets: travel,
                  x: targetPos.x, y: targetPos.y,
                  duration: travelDuration, ease: 'Linear',
                  onComplete: () => travel.destroy()
                });
              });
            });
          });
        });
      }

      // Fade plant out after all shots done
      this.scene.time.delayedCall(totalDuration, () => {
        if (plant.active) {
          this.scene.tweens.add({
            targets: plant, alpha: 0, duration: 400,
            onComplete: () => plant.destroy()
          });
        }
      });
    };

    rightRows.forEach(r => spawnPlantAndFire(r, 'right'));
    leftRows.forEach(r  => spawnPlantAndFire(r, 'left'));

    return totalDuration + 500;
  }

  spawnDamageTile() {
    // Fairness Rule #3: Spawn relatively close to player (within 2-3 tiles)
    // Retry up to 10 times to avoid landing on a cell that already has a chest
    let tC, tR;
    let attempts = 0;
    do {
      tC = Phaser.Math.Clamp(
        this.scene.player.col + Phaser.Math.Between(-2, 2),
        0, this.grid.cols - 1
      );
      tR = Phaser.Math.Clamp(
        this.scene.player.row + Phaser.Math.Between(-2, 2),
        0, this.grid.rows - 1
      );
      attempts++;
    } while (
      attempts < 10 &&
      ((tC === this.scene.player.col && tR === this.scene.player.row) ||
        this.grid.hasChestAt(tC, tR))
    );

    this.scene.events.emit('damageTile:spawned', tC, tR);

    // Player has 10 seconds to reach the golden tile before it despawns.
    this.scene.time.delayedCall(10000, () => {
      this.scene.events.emit('damageTile:despawned', tC, tR);
      this.grid.render();
    });
  }

  takeDamage() {
    this.hp--;
    this.scene.cameras.main.shake(200, 0.02);
    this.scene.events.emit('boss:damaged', this.hp, this.maxHp);

    if (this.isTutorial) {
      state.emit('tutorial:bossDamaged');
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  heal(amount = 1) {
    if (this.hp <= 0) return; // Don't heal if dead
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.scene.events.emit('boss:damaged', this.hp, this.maxHp);
  }

  die() {
    if (this.attackTimer) this.attackTimer.remove();
    console.log("BOSS DEFEATED");
    this.scene.events.emit('boss:died');
  }
  // ======== CHAPTER 3: KATAW — 14 ATTACKS ========

  // Helper: play smoke at pixel pos, callback when done
  _spawnSmoke(x, y, onDone) {
    const smoke = this.scene.add.sprite(x, y, 'ch3_smoke_spawn')
      .setDepth(120).setScale(2).play('anim_ch3_smoke');
    smoke.once('animationcomplete', () => { smoke.destroy(); if (onDone) onDone(); });
  }

  // ─── ATTACK: Kataw Explosion Pattern 1 (attack-1_1) ──────────────────────
  ch3KatawExplosionPattern1() {
    const grid = this._decodeGridPattern(`
R0: Y Y Y Y Y Y Y Y Y
R1: Y R R R R R R R Y
R2: Y R P P P P P R Y
R3: Y R P . . . P R Y
R4: Y R P . . . P R Y
R5: Y R P . . . P R Y
R6: Y R P P P P P R Y
R7: Y R R R R R R R Y
R8: Y Y Y Y Y Y Y Y Y
    `);
    const steps = [
      { type: '1', duration: 866, tiles: grid['Y'] },
      { type: '2', duration: 533, tiles: grid['R'] },
      { type: '3', duration: 466, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1': 1.5, '2': 1.2, '3': 1.2 });
  }
  
  // ─── ATTACK: Kataw Explosion Pattern 2 (attack-1_2) ──────────────────────
  ch3KatawExplosionPattern2() {
    const grid = this._decodeGridPattern(`
R0: P P P P P P P P P
R1: P R R R R R R R P
R2: P R . . . . . R P
R3: P R . Y Y Y . R P
R4: P R . Y Y Y . R P
R5: P R . Y Y Y . R P
R6: P R . . . . . R P
R7: P R R R R R R R P
R8: P P P P P P P P P
    `);
    const steps = [
      { type: '3', duration: 466, tiles: grid['P'] },
      { type: '2', duration: 533, tiles: grid['R'] },
      { type: '1', duration: 866, tiles: grid['Y'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1': 1.5, '2': 1.2, '3': 1.2 });
  }
  
  // ─── ATTACK: Kataw Explosion Pattern 3 (attack-1_3) ──────────────────────
  ch3KatawExplosionPattern3() {
    const grid = this._decodeGridPattern(`
R0: P P P P P P P P P
R1: P . . . . . . . P
R2: P . R R R R R . P
R3: P . R . . . R . P
R4: P . R . Y . R . P
R5: P . R . . . R . P
R6: P . R R R R R . P
R7: P . . . . . . . P
R8: P P P P P P P P P
    `);
    const steps = [
      { type: '3', duration: 466, tiles: grid['P'] },
      { type: '2', duration: 533, tiles: grid['R'] },
      { type: '1', duration: 866, tiles: grid['Y'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1': 2.0, '2': 1.2, '3': 1.2 });
  }

  _decodeGridPattern(gridStr) {
    const rows = gridStr.trim().split('\n').filter(r => r.trim() !== '');
    const tilesByColor = { 'O': [], 'R': [], 'P': [], 'Y': [] };
    rows.forEach((row, r) => {
      const cells = row.trim().split(/\s+/);
      let startIndex = 0;
      if (cells.length > 0 && cells[0].startsWith('R')) startIndex = 1;
      for (let i = startIndex; i < cells.length; i++) {
        const cell = cells[i];
        const c = i - startIndex;
        if (cell === '🟠' || cell === 'O') tilesByColor['O'].push({ c, r });
        else if (cell === '🔴' || cell === 'R') tilesByColor['R'].push({ c, r });
        else if (cell === '🟣' || cell === 'P') tilesByColor['P'].push({ c, r });
        else if (cell === '🟡' || cell === 'Y') tilesByColor['Y'].push({ c, r });
      }
    });
    return tilesByColor;
  }

  _executeSpecificExplosionSequence(steps, scaleOverrides) {
    const ts = this.grid.tileSize;
    let currentSpawnTime = 1100;
    let maxAttackDuration = currentSpawnTime;

    steps.forEach((step) => {
      let telegraphTime = currentSpawnTime - 1100;
      if (telegraphTime < 0) telegraphTime = 0;

      let animKey = 'anim_ch3_explosion_' + step.type;
      let duration = step.duration;
      let scaleMultiplier = scaleOverrides[step.type] || 1.2;

      const tiles = step.tiles;

      this.scene.time.delayedCall(telegraphTime, () => {
        if (this.hp <= 0 || this.scene.isGameOver) return;
        tiles.forEach(t => {
          if (t.c >= 0 && t.c < this.grid.cols && t.r >= 0 && t.r < this.grid.rows) {
            this.grid.telegraph(t.c, t.r, 1100);
          }
        });
      });

      this.scene.time.delayedCall(currentSpawnTime, () => {
        if (this.hp <= 0 || this.scene.isGameOver) return;
        tiles.forEach(t => {
          if (t.c >= 0 && t.c < this.grid.cols && t.r >= 0 && t.r < this.grid.rows) {
            const pix = this.grid.getPixelPosition(t.c, t.r);
            const exp = this.scene.add.sprite(pix.x, pix.y, animKey.replace('anim_', ''))
              .setDepth(60).setDisplaySize(ts * scaleMultiplier, ts * scaleMultiplier).play(animKey);
            exp.once('animationcomplete', () => exp.destroy());

            if (this.scene.player.col === t.c && this.scene.player.row === t.r) {
              this.scene.player.takeDamage();
            }
          }
        });
      });

      maxAttackDuration = Math.max(maxAttackDuration, currentSpawnTime + duration);
      currentSpawnTime += 100; // 100ms rapid cascade overlap
    });

    return maxAttackDuration + 500;
  }

  // ─── ABYSSAL CROSS ───────────────────────────
  ch3AbyssalCrossPattern1() {
    const grid = this._decodeGridPattern(`
R0: Y Y R . P . R Y Y
R1: Y . R . P . R . Y
R2: R R . . P . . R R
R3: . . . . P . . . .
R4: Y P P P P P P P P
R5: . . . . P . . . .
R6: R R . . P . . R R
R7: Y . R . P . R . Y
R8: Y Y R . P . R Y Y
    `);
    const steps = [
      { type: '4a', duration: 2666, tiles: grid['Y'] || grid['O'] },
      { type: '2a', duration: 2666, tiles: grid['R'] },
      { type: '3a', duration: 2666, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '4a': 1.8, '2a': 1.8, '3a': 1.8 });
  }

  ch3AbyssalCrossPattern2() {
    const grid = this._decodeGridPattern(`
R0: . Y . Y P Y . Y .
R1: R R R R P R R R R
R2: . Y . Y P Y . Y .
R3: R R R R P R R R R
R4: P P P P P P P P P
R5: R R R R P R R R R
R6: . Y . Y P Y . Y .
R7: R R R R P R R R R
R8: . Y . Y P Y . Y .
    `);
    const steps = [
      { type: '4a', duration: 2666, tiles: grid['Y'] || grid['O'] },
      { type: '2a', duration: 2666, tiles: grid['R'] },
      { type: '3a', duration: 2666, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '4a': 1.8, '2a': 1.8, '3a': 1.8 });
  }

  ch3AbyssalCrossPattern3() {
    const grid = this._decodeGridPattern(`
R0: R Y Y Y P Y Y Y R
R1: R . . . P . . . R
R2: R R R R P R R R R
R3: R . . . P . . . R
R4: P P P P P P P P P
R5: R . . . P . . . R
R6: R R R R P R R R R
R7: R . . . P . . . R
R8: R Y Y Y P Y Y Y R
    `);
    const steps = [
      { type: '4a', duration: 2666, tiles: grid['Y'] || grid['O'] },
      { type: '2a', duration: 2666, tiles: grid['R'] },
      { type: '3a', duration: 2666, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '4a': 1.8, '2a': 1.8, '3a': 1.8 });
  }

  ch3AbyssalCrossPattern4() {
    const grid = this._decodeGridPattern(`
R0: Y Y R Y P Y R Y Y
R1: Y . R . P . R . Y
R2: R R R R P R R R R
R3: Y . R . P . R . Y
R4: P P P P P P P P P
R5: Y . R . P . R . Y
R6: R R R R P R R R R
R7: Y . R . P . R . Y
R8: Y Y R Y P Y R Y Y
    `);
    const steps = [
      { type: '4a', duration: 2666, tiles: grid['Y'] || grid['O'] },
      { type: '2a', duration: 2666, tiles: grid['R'] },
      { type: '3a', duration: 2666, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '4a': 1.8, '2a': 1.8, '3a': 1.8 });
  }

  // ─── DIAMOND STORM ───────────────────────────
  ch3DiamondStormPattern1() {
    const grid = this._decodeGridPattern(`
R0: . . . . . . . . .
R1: . Y . . Y . . Y .
R2: . . R . . . R . .
R3: . . . P P P . . .
R4: . Y . P P P . Y .
R5: . . . P P P . . .
R6: . . R . . . R . .
R7: . Y . . Y . . Y .
R8: . . . . . . . . .
    `);
    const steps = [
      { type: '1d', duration: 533, tiles: grid['Y'] || grid['O'] },
      { type: '2d', duration: 666, tiles: grid['R'] },
      { type: '3d', duration: 1466, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1d': 1.5, '2d': 1.5, '3d': 1.5 });
  }

  ch3DiamondStormPattern2() {
    const grid = this._decodeGridPattern(`
R0: R . . . P . . . R
R1: . R . Y P Y . R .
R2: . . R . P . R . .
R3: . Y . R P R . Y .
R4: P P P P P P P P P
R5: . Y . R P R . Y .
R6: . . R . P . R . .
R7: . R . Y P Y . R .
R8: R . . . P . . . R
    `);
    const steps = [
      { type: '1d', duration: 533, tiles: grid['Y'] || grid['O'] },
      { type: '2d', duration: 666, tiles: grid['R'] },
      { type: '3d', duration: 1466, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1d': 1.5, '2d': 1.5, '3d': 1.5 });
  }

  ch3DiamondStormPattern3() {
    const grid = this._decodeGridPattern(`
R0: Y . . . R . . . Y
R1: . Y . . R . . Y .
R2: . . P P P P P . .
R3: . . P Y R Y P . .
R4: R R P R R R P R R
R5: . . P Y R Y P . .
R6: . . P P P P P . .
R7: . Y . . R . . Y .
R8: Y . . . R . . . Y
    `);
    const steps = [
      { type: '1d', duration: 533, tiles: grid['Y'] || grid['O'] },
      { type: '2d', duration: 666, tiles: grid['R'] },
      { type: '3d', duration: 1466, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1d': 1.5, '2d': 1.5, '3d': 1.5 });
  }

  ch3DiamondStormPattern4() {
    const grid = this._decodeGridPattern(`
R0: . . . . Y . . . .
R1: . . . . R . . . .
R2: . . R . . . R . .
R3: . . . P P P . . .
R4: Y R . P . P . R Y
R5: . . . P P P . . .
R6: . . R . . . R . .
R7: . . . . R . . . .
R8: . . . . Y . . . .
    `);
    const steps = [
      { type: '1d', duration: 533, tiles: grid['Y'] || grid['O'] },
      { type: '2d', duration: 666, tiles: grid['R'] },
      { type: '3d', duration: 1466, tiles: grid['P'] }
    ];
    return this._executeSpecificExplosionSequence(steps, { '1d': 1.5, '2d': 1.5, '3d': 1.5 });
  }

  // ─── ATTACK 1.5: Fish King Summoner Wave ───────────────────────────
  ch3FishKingSummonerWave() {
    const ts   = this.grid.tileSize;
    const edgeX = this.grid.getPixelPosition(this.grid.cols - 1, 0).x + ts * 3;
    const midY  = this.grid.getPixelPosition(0, Math.floor(this.grid.rows / 2)).y;

    // Make Fish King exactly 5x5 tiles in display size
    const fkSize = ts * 5;

    this._spawnSmoke(edgeX, midY, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;
      const king = this.scene.add.sprite(edgeX, midY, 'ch3_fishking_idle')
        .setDepth(100).setFlipX(true).setDisplaySize(fkSize, fkSize).play('anim_ch3_fishking_idle');

      let wavesDone = 0;
      const doWave = () => {
        if (this.hp <= 0 || this.scene.isGameOver) { king.destroy(); return; }
        king.play('anim_ch3_fishking_wand');
        king.once('animationcomplete', () => {
          if (this.hp <= 0 || this.scene.isGameOver) { king.destroy(); return; }
          king.play('anim_ch3_fishking_idle');

          const sharkCount = Phaser.Math.Between(1, 2);
          const jellyCount = Phaser.Math.Between(1, 2);

          for (let s = 0; s < sharkCount; s++) {
            const r = Phaser.Math.Between(0, this.grid.rows - 1);
            const startPix = this.grid.getPixelPosition(this.grid.cols, r);
            const endPix   = this.grid.getPixelPosition(-1, r);
            
            // Telegraph the row
            this.grid.telegraphRow(r, 600);
            
            this.scene.time.delayedCall(600, () => {
              if (this.hp <= 0 || this.scene.isGameOver) return;
              const shark = this.scene.add.sprite(startPix.x, startPix.y, 'ch3_shark_walk')
                .setDepth(35).setFlipX(true).setDisplaySize(ts * 1.5, ts * 1.5).play('anim_ch3_shark_walk'); // bigger shark
              
              this.scene.tweens.add({
                targets: shark, x: endPix.x, duration: 2500,
                onUpdate: () => {
                  if (!shark.active) return;
                  const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
                  if (this.scene.player.row === r && Math.abs(shark.x - pPix.x) < ts * 0.75) {
                    shark.play('anim_ch3_shark_attack', true);
                    this.scene.player.takeDamage();
                  }
                },
                onComplete: () => shark.destroy()
              });
            });
          }

          for (let j = 0; j < jellyCount; j++) {
            this.scene.time.delayedCall(j * 400, () => {
              if (this.hp <= 0 || this.scene.isGameOver) return;
              const c = Phaser.Math.Between(0, this.grid.cols - 1);
              const startPix = this.grid.getPixelPosition(c, this.grid.rows);
              const endPix   = this.grid.getPixelPosition(c, -4);
              
              this.grid.telegraphCol(c, 600);
              
              this.scene.time.delayedCall(600, () => {
                if (this.hp <= 0 || this.scene.isGameOver) return;
                const jelly = this.scene.add.sprite(startPix.x, startPix.y, 'ch3_jelly_walk')
                  .setDepth(35).setDisplaySize(ts * 1.5, ts * 1.5).play('anim_ch3_jelly_walk'); // bigger jellyfish
                this.scene.tweens.add({
                  targets: jelly, y: endPix.y, duration: 2800,
                  onUpdate: () => {
                    if (!jelly.active) return;
                    const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
                    if (this.scene.player.col === c && Math.abs(jelly.y - pPix.y) < ts * 0.75) {
                      jelly.play('anim_ch3_jelly_attack', true);
                      this.scene.player.takeDamage();
                    }
                  },
                  onComplete: () => {
                    jelly.play('anim_ch3_jelly_death');
                    jelly.once('animationcomplete', () => jelly.destroy());
                  }
                });
              });
            });
          }

          wavesDone++;
          if (wavesDone < 3) {
            this.scene.time.delayedCall(2000, () => doWave());
          } else {
            this.scene.time.delayedCall(1500, () => {
              this._spawnSmoke(edgeX, midY, null);
              king.destroy();
            });
          }
        });
      };
      doWave();
    });
    return 10000;
  }

  // ─── ATTACK 2: Fish King Multi Spell ─────────────────────────────
  ch3FishKingMultiSpell() {
    const ts     = this.grid.tileSize;
    const edgeX  = this.grid.getPixelPosition(this.grid.cols - 1, 0).x + ts * 3;
    const midY   = this.grid.getPixelPosition(0, Math.floor(this.grid.rows / 2)).y;
    const fkSize = ts * 5;

    this._spawnSmoke(edgeX, midY, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;
      const king = this.scene.add.sprite(edgeX, midY, 'ch3_fishking_idle')
        .setDepth(100).setFlipX(true).setDisplaySize(fkSize, fkSize).play('anim_ch3_fishking_idle');

      let spellIndex = 0;
      const doNextSpell = () => {
        if (spellIndex >= 4 || this.hp <= 0 || this.scene.isGameOver) {
           this._spawnSmoke(edgeX, midY, null);
           king.destroy();
           return;
        }

        king.play('anim_ch3_fishking_spell');
        king.once('animationcomplete', () => {
          if (this.hp <= 0 || this.scene.isGameOver) { king.destroy(); return; }
          king.play('anim_ch3_fishking_idle');

          if (spellIndex === 0) {
            // Dark Bolt: 15-20 random tiles, now with clear telegraphs
            const count = Phaser.Math.Between(15, 20);
            for (let i = 0; i < count; i++) {
              this.scene.time.delayedCall(i * 200, () => {
                if (this.hp <= 0 || this.scene.isGameOver) return;
                const c = Phaser.Math.Between(0, this.grid.cols - 1);
                const r = Phaser.Math.Between(0, this.grid.rows - 1);
                this.grid.telegraph(c, r, 600);
                this.scene.time.delayedCall(600, () => {
                  if (this.hp <= 0 || this.scene.isGameOver) return;
                  const p = this.grid.getPixelPosition(c, r);
                  const spr = this.scene.add.sprite(p.x, p.y, 'ch3_darkbolt').setDepth(50).setScale(1.5).play('anim_ch3_darkbolt');
                  if (this.scene.player.col === c && this.scene.player.row === r) {
                    this.scene.player.takeDamage();
                  }
                  this.scene.time.delayedCall(400, () => this.scene.tweens.add({ targets: spr, alpha: 0, duration: 200, onComplete: () => spr.destroy() }));
                });
              });
            }

          } else if (spellIndex === 1) {
            // Fire Bomb: 4 bombs each hitting 3x3 area
            for (let i = 0; i < 4; i++) {
              this.scene.time.delayedCall(i * 700, () => {
                if (this.hp <= 0 || this.scene.isGameOver) return;
                const cc = Phaser.Math.Between(1, this.grid.cols - 2);
                const cr = Phaser.Math.Between(1, this.grid.rows - 2);
                
                const cells = [];
                for (let dc = -1; dc <= 1; dc++)
                  for (let dr = -1; dr <= 1; dr++)
                    cells.push({ c: cc + dc, r: cr + dr });
                    
                cells.forEach(cell => this.grid.telegraph(cell.c, cell.r, 800));
                
                this.scene.time.delayedCall(800, () => {
                  if (this.hp <= 0 || this.scene.isGameOver) return;
                  const p = this.grid.getPixelPosition(cc, cr);
                  const spr = this.scene.add.sprite(p.x, p.y, 'ch3_firebomb')
                    .setDepth(55).setDisplaySize(ts * 3, ts * 3).play('anim_ch3_firebomb');
                  this.scene.cameras.main.shake(150, 0.018);
                  
                  // Damage player if in 3x3
                  const pRow = this.scene.player.row;
                  const pCol = this.scene.player.col;
                  if (Math.abs(pCol - cc) <= 1 && Math.abs(pRow - cr) <= 1) {
                     this.scene.player.takeDamage();
                  }
                  
                  this.scene.time.delayedCall(600, () => this.scene.tweens.add({ targets: spr, alpha: 0, duration: 200, onComplete: () => spr.destroy() }));
                });
              });
            }
            
          } else if (spellIndex === 2) {
            // Lightning: checkerboard half board with telegraphs
            const startC = Phaser.Math.Between(0, Math.floor(this.grid.cols / 2));
            const startR = Phaser.Math.Between(0, Math.floor(this.grid.rows / 2));
            const cells = [];
            for (let r = startR; r < this.grid.rows; r++) {
              for (let c = startC; c < this.grid.cols; c++) {
                if ((c + r) % 2 === 0) continue;
                cells.push({c,r});
                this.grid.telegraph(c, r, 1200);
              }
            }
            this.scene.time.delayedCall(1200, () => {
               if (this.hp <= 0 || this.scene.isGameOver) return;
               cells.forEach(({c,r}) => {
                  const p = this.grid.getPixelPosition(c, r);
                  const spr = this.scene.add.sprite(p.x, p.y, 'ch3_lightning').setDepth(50).setScale(ts / 64).play('anim_ch3_lightning');
                  if (this.scene.player.col === c && this.scene.player.row === r) {
                     this.scene.player.takeDamage();
                  }
                  this.scene.time.delayedCall(800, () => spr.destroy());
               });
            });

          } else if (spellIndex === 3) {
            // Spark: ball rolling left→right on 3 random rows, 3x3 in size
            const rows = [];
            while (rows.length < 3) {
              const r = Phaser.Math.Between(1, this.grid.rows - 2);
              if (!rows.includes(r)) rows.push(r);
            }
            rows.forEach((r, idx) => {
              this.scene.time.delayedCall(idx * 500, () => {
                const startX = this.grid.getPixelPosition(-2, r).x; // start way offscreen
                const endX   = this.grid.getPixelPosition(this.grid.cols + 2, r).x;
                const y      = this.grid.getPixelPosition(0, r).y;
                
                // telegraph the 3 rows initially to warn player
                this.grid.telegraphRow(r-1, 1000);
                this.grid.telegraphRow(r, 1000);
                this.grid.telegraphRow(r+1, 1000);
                
                this.scene.time.delayedCall(1000, () => {
                  if (this.hp <= 0 || this.scene.isGameOver) return;
                  const ball = this.scene.add.sprite(startX, y, 'ch3_spark')
                    .setDepth(55).setDisplaySize(ts * 3, ts * 3).play('anim_ch3_spark');
                  
                  this.scene.tweens.add({
                    targets: ball, x: endX, duration: 3000,
                    onUpdate: () => {
                      if (!ball.active) return;
                      const pC = this.scene.player.col;
                      const pR = this.scene.player.row;
                      const pPix = this.grid.getPixelPosition(pC, pR);
                      // if within 1 row of center and hit horizontally
                      if (Math.abs(pR - r) <= 1 && Math.abs(ball.x - pPix.x) < ts * 1.5) {
                        this.scene.player.takeDamage();
                      }
                    },
                    onComplete: () => ball.destroy()
                  });
                });
              });
            });
          }

          const totalDur = spellIndex === 0 ? 20 * 200 + 1200
                         : spellIndex === 1 ? 4 * 700 + 1800
                         : spellIndex === 2 ? 2000
                         : 4500;
          this.scene.time.delayedCall(totalDur, () => {
            spellIndex++;
            doNextSpell();
          });
        });
      };
      
      doNextSpell();
    });
    
    return 18000;
  }

  // ─── ATTACK 3: Shark Lanes ────────────────────────────────────────
  ch3SharkLanes() {
    const ts = this.grid.tileSize;

    // 2 sharks, each covers a 3-row lane
    const usedStarts = new Set();
    const laneStarts = [];
    while (laneStarts.length < 2) {
      const s = Phaser.Math.Between(0, this.grid.rows - 3);
      if (!usedStarts.has(s) && !usedStarts.has(s-1) && !usedStarts.has(s+1)) { 
        usedStarts.add(s); laneStarts.push(s); 
      }
    }

    laneStarts.forEach(startRow => {
      const laneRows = [startRow, startRow + 1, startRow + 2];
      const midRow   = startRow + 1;

      laneRows.forEach(r => this.grid.telegraphRow(r, 1200));

      const idleX = this.grid.getPixelPosition(this.grid.cols, midRow).x + ts * 2;
      const idleY = this.grid.getPixelPosition(0, midRow).y;
      
      this.scene.time.delayedCall(1200, () => {
        this._spawnSmoke(idleX, idleY, () => {
          if (this.hp <= 0 || this.scene.isGameOver) return;
          const shark = this.scene.add.sprite(idleX, idleY, 'ch3_shark_walk')
            .setDepth(40).setFlipX(true).setDisplaySize(ts * 3, ts * 3).play('anim_ch3_shark_walk'); // 3 rows tall

          const destX = this.grid.getPixelPosition(-4, midRow).x;
          this.scene.tweens.add({
            targets: shark, x: destX, duration: 1800,
            onUpdate: () => {
              if (!shark.active) return;
              const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
              if (laneRows.includes(this.scene.player.row) && Math.abs(shark.x - pPix.x) < ts * 1.5) {
                shark.play('anim_ch3_shark_attack', true);
                this.scene.player.takeDamage();
              }
            },
            onComplete: () => {
              this._spawnSmoke(shark.x, shark.y, null);
              shark.destroy();
            }
          });
        });
      });
    });
    return 5500;
  }

  // ─── ATTACK 4: Jellyfish Curtain ─────────────────────────────────
  ch3JellyfishCurtain() {
    const ts = this.grid.tileSize;

    // 2 jellyfish, each covers a 3-column section
    const usedStarts = new Set();
    const laneStarts = [];
    while (laneStarts.length < 2) {
      const s = Phaser.Math.Between(0, this.grid.cols - 3);
      if (!usedStarts.has(s) && !usedStarts.has(s-1) && !usedStarts.has(s+1)) { 
        usedStarts.add(s); laneStarts.push(s); 
      }
    }

    laneStarts.forEach(startCol => {
      const laneCols = [startCol, startCol + 1, startCol + 2];
      const midCol   = startCol + 1;

      laneCols.forEach(c => this.grid.telegraphCol(c, 1200));

      const startX = this.grid.getPixelPosition(midCol, 0).x;
      const startY = this.grid.getPixelPosition(0, this.grid.rows).y + ts * 2;
      const endY   = this.grid.getPixelPosition(0, -4).y;

      this.scene.time.delayedCall(1200, () => {
        this._spawnSmoke(startX, startY, () => {
          if (this.hp <= 0 || this.scene.isGameOver) return;
          const jelly = this.scene.add.sprite(startX, startY, 'ch3_jelly_walk')
            .setDepth(35).setDisplaySize(ts * 3, ts * 3).play('anim_ch3_jelly_walk'); // 3 columns wide

          this.scene.tweens.add({
            targets: jelly, y: endY, duration: 2500,
            onUpdate: () => {
              if (!jelly.active) return;
              const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
              if (laneCols.includes(this.scene.player.col) && Math.abs(jelly.y - pPix.y) < ts * 1.5) {
                jelly.play('anim_ch3_jelly_attack', true);
                this.scene.player.takeDamage();
              }
            },
            onComplete: () => {
              this._spawnSmoke(jelly.x, jelly.y, null);
              jelly.play('anim_ch3_jelly_death');
              jelly.once('animationcomplete', () => jelly.destroy());
            }
          });
        });
      });
    });
    return 5500;
  }

  // ─── ATTACK 5: Nemo Swarm ─────────────────────────────────────────
  ch3NemoSwarm() {
    const ts = this.grid.tileSize;
    const nemoSize = ts * 1.5;

    const availableRows = Array.from({length: this.grid.rows}, (_, i) => i);
    Phaser.Utils.Array.Shuffle(availableRows);

    for (let i = 0; i < 4; i++) {
        const sR = availableRows.pop();
        const startY = this.grid.getPixelPosition(0, sR).y;
          const startX = this.grid.getPixelPosition(this.grid.cols + 2, sR).x; // start way offscreen 

          this.grid.telegraphRow(sR, 1200);

          this.scene.time.delayedCall(1200 + i * 800, () => {
             if (this.hp <= 0 || this.scene.isGameOver) return;

             const nemo = this.scene.add.sprite(startX, startY, 'ch3_nemo_swim')
               .setDepth(45).setDisplaySize(nemoSize, nemoSize).play('anim_ch3_nemo');

             let currentR = sR;
             let currentCol = this.grid.cols + 2;

             const stepNemo = () => {
                if (this.hp <= 0 || this.scene.isGameOver || !nemo.active) return;
                
                let targetR = currentR;
                let animKey = 'anim_ch3_nemo';
                
                if (currentCol < this.grid.cols && currentCol > 0) {
                    if (Math.random() < 0.35) {
                        const up = Math.random() > 0.5;
                        if (up && currentR > 0) { targetR--; animKey = 'anim_ch3_nemo_diagup'; }
                        else if (!up && currentR < this.grid.rows - 1) { targetR++; animKey = 'anim_ch3_nemo_diagdn'; }
                        else if (currentR === 0) { targetR++; animKey = 'anim_ch3_nemo_diagdn'; }
                        else if (currentR === this.grid.rows - 1) { targetR--; animKey = 'anim_ch3_nemo_diagup'; }
                    }
                }
                
                currentCol--;
                const targetPix = this.grid.getPixelPosition(currentCol, targetR);
                
                nemo.play(animKey, true);
                
                if (currentCol >= -1 && currentCol <= this.grid.cols) {
                   this.grid.telegraph(currentCol, targetR, 350);
                }

                this.scene.tweens.add({
                    targets: nemo, x: targetPix.x, y: targetPix.y, duration: 350,
                    onUpdate: () => {
                       if (!nemo.active) return;
                       const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
                       if (Math.abs(nemo.x - pPix.x) < ts * 0.75 && Math.abs(nemo.y - pPix.y) < ts * 0.75) {
                           nemo.play('anim_ch3_nemo_chomp', true);
                           this.scene.player.takeDamage();
                       }
                    },
                    onComplete: () => {
                        currentR = targetR;
                        if (currentCol <= -3) {
                            nemo.setVisible(false);
                            this._spawnSmoke(nemo.x, nemo.y, () => nemo.destroy());
                        } else {
                            stepNemo();
                        }
                    }
                });
             };
             stepNemo();
          });
        }
    return 9500;
  }

  // ─── ATTACK 6: Bat Dive Bomb ──────────────────────────────────────
  ch3BatDiveBomb() {
    const ts = this.grid.tileSize;
    const batSize = ts * 3; // covers 3x3 tiles

    // Pick 3 random unique center points
    const centers = [];
    while(centers.length < 3) {
      const c = Phaser.Math.Between(1, this.grid.cols - 2);
      const r = Phaser.Math.Between(1, this.grid.rows - 2);
      if (!centers.find(pt => pt.c === c && pt.r === r)) centers.push({c, r});
    }

    centers.forEach((pt, idx) => {
      this.scene.time.delayedCall(idx * 400, () => { // Faster spawn rate
        if (this.hp <= 0 || this.scene.isGameOver) return;
        const pix = this.grid.getPixelPosition(pt.c, pt.r);

        for (let dc = -1; dc <= 1; dc++)
          for (let dr = -1; dr <= 1; dr++)
             this.grid.telegraph(pt.c + dc, pt.r + dr, 800); // Shorter telegraph

        this.scene.time.delayedCall(800, () => {
          if (this.hp <= 0 || this.scene.isGameOver) return;

          const bat = this.scene.add.sprite(pix.x, pix.y - 400, 'ch3_bat_fly')
            .setDepth(70).setDisplaySize(batSize, batSize).play('anim_ch3_bat_fly');

          this.scene.tweens.add({
            targets: bat, y: pix.y, duration: 250, ease: 'Quad.easeIn', // Faster dive
            onComplete: () => {
              bat.play('anim_ch3_bat_hit');
              this.scene.cameras.main.shake(140, 0.016);

              if (Math.abs(this.scene.player.col - pt.c) <= 1 && Math.abs(this.scene.player.row - pt.r) <= 1) {
                  this.scene.player.takeDamage();
              }

              bat.once('animationcomplete', () => {
                bat.play('anim_ch3_bat_fly');
                this.scene.tweens.add({ targets: bat, y: pix.y - 500, alpha: 0, duration: 400, onComplete: () => bat.destroy() });
              });
            }
          });
        });
      });
    });
    return 4000;
  }

  // ─── ATTACK 7: Bioluminescent Blackout ───────────────────────────
  ch3BioluminescentBlackout() {
    const ts = this.grid.tileSize;
    const cx = this.grid.offsetX + (this.grid.cols * ts) / 2;
    const cy = this.grid.offsetY + (this.grid.rows * ts) / 2;

    const dark = this.scene.add.rectangle(cx, cy,
      this.grid.cols * ts + 80, this.grid.rows * ts + 80, 0x000011, 0.85).setDepth(20);

    // 3 anglers with clear circles
    const anglerData = [];
    for (let i = 0; i < 3; i++) {
      const ac = Phaser.Math.Between(1, this.grid.cols - 2);
      const ar = Phaser.Math.Between(1, this.grid.rows - 2);
      const ap = this.grid.getPixelPosition(ac, ar);

      const halo = this.scene.add.circle(ap.x, ap.y, ts * 1.5, 0xddeeff, 0.35).setDepth(21);
      const halo2 = this.scene.add.circle(ap.x, ap.y, ts * 1.0, 0xffffff, 0.45).setDepth(21);

      const angler = this.scene.add.sprite(ap.x, ap.y, 'ch3_angler')
        .setDepth(22).setScale(ts / 48 * 1.5).play('anim_ch3_angler');

      this.scene.tweens.add({ targets: [angler, halo, halo2], x: ap.x + Phaser.Math.Between(-ts, ts), y: ap.y + Phaser.Math.Between(-ts, ts), duration: 2500, yoyo: true, repeat: 1 });

      anglerData.push({ angler, halo, halo2, ac, ar });
    }

    // Flashlight effect: bring player above dark if near light
    const baselinePlayerDepth = this.scene.player.sprite.depth || 10;
    const lightCheckTimer = this.scene.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        if (!this.scene || !this.scene.player || !this.scene.player.sprite.active) return;
        let inLight = false;
        const px = this.scene.player.sprite.x;
        const py = this.scene.player.sprite.y;
        anglerData.forEach(a => {
           if (Math.abs(a.angler.x - px) <= ts * 1.5 && Math.abs(a.angler.y - py) <= ts * 1.5) {
              inLight = true;
           }
        });
        if (inLight) this.scene.player.sprite.setDepth(25);
        else this.scene.player.sprite.setDepth(baselinePlayerDepth);
      }
    });

    for (let i = 0; i < 15; i++) {
      this.scene.time.delayedCall(i * 350, () => {
        if (this.hp <= 0 || this.scene.isGameOver) return;
        const c = Phaser.Math.Between(0, this.grid.cols - 1);
        const r = Phaser.Math.Between(0, this.grid.rows - 1);
        
        const nearSafe = anglerData.some(a => Math.abs(a.ac - c) <= 1 && Math.abs(a.ar - r) <= 1);
        if (nearSafe) return;
        
        this.grid.telegraph(c, r, 500);
        this.scene.time.delayedCall(500, () => {
           if (this.hp <= 0 || this.scene.isGameOver) return;
           const p = this.grid.getPixelPosition(c, r);
           const bolt = this.scene.add.sprite(p.x, p.y, 'ch3_darkbolt').setDepth(28).setScale(1.5).play('anim_ch3_darkbolt');
           if (this.scene.player.col === c && this.scene.player.row === r) {
              this.scene.player.takeDamage();
           }
           this.scene.time.delayedCall(600, () => bolt.destroy());
        });
      });
    }

    this.scene.time.delayedCall(6500, () => {
      lightCheckTimer.remove();
      if (this.scene.player && this.scene.player.sprite.active) {
         this.scene.player.sprite.setDepth(baselinePlayerDepth);
      }
      this.scene.tweens.add({ targets: dark, alpha: 0, duration: 800, onComplete: () => dark.destroy() });
      anglerData.forEach(a => {
        this.scene.tweens.add({ targets: [a.angler, a.halo, a.halo2], alpha: 0, duration: 500, onComplete: () => { a.angler.destroy(); a.halo.destroy(); a.halo2.destroy(); } });
      });
    });

    return 8000;
  }

  // ─── ATTACK 8: Whirlpool Hashtag ─────────────────────────────────
  ch3WhirlpoolMaze() {
    const ts = this.grid.tileSize;
    // user asks: "hashtag but 4 rows 4 columns" -> 1, 3, 5, 7 on 9x9 grid
    const hashCols = [1, 3, 5, 7];
    const hashRows = [1, 3, 5, 7];

    // Telegraph all rows and cols 
    hashRows.forEach(r => this.grid.telegraphRow(r, 1500));
    hashCols.forEach(c => this.grid.telegraphCol(c, 1500));

    this.scene.time.delayedCall(1500, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;
      const spirals = [];
      const damageTiles = new Set();
      
      // Collect all tiles
      hashRows.forEach(r => {
        for (let c = 0; c < this.grid.cols; c++) {
           damageTiles.add(`${c},${r}`);
           const p = this.grid.getPixelPosition(c, r);
           const spr = this.scene.add.sprite(p.x, p.y, 'ch3_waterspiral')
             .setDepth(40).setDisplaySize(ts, ts).play('anim_ch3_waterspiral');
           spirals.push(spr);
        }
      });
      hashCols.forEach(c => {
        for (let r = 0; r < this.grid.rows; r++) {
           damageTiles.add(`${c},${r}`);
           const p = this.grid.getPixelPosition(c, r);
           const spr = this.scene.add.sprite(p.x, p.y, 'ch3_waterspiral')
             .setDepth(40).setDisplaySize(ts, ts).setAngle(90).play('anim_ch3_waterspiral'); // Top to bottom facing
           spirals.push(spr);
        }
      });
      
      this.scene.cameras.main.shake(200, 0.015);

      const checkDmg = this.scene.time.addEvent({
         delay: 150, loop: true,
         callback: () => {
            const playerKey = `${this.scene.player.col},${this.scene.player.row}`;
            if (damageTiles.has(playerKey)) {
                this.scene.player.takeDamage();
                if (!this.scene.player.isCharmed) {
                  this.scene.player.isCharmed = true;
                  this.scene.time.delayedCall(2000, () => { this.scene.player.isCharmed = false; });
                }
            }
         }
      });
      
      this.scene.time.delayedCall(2500, () => {
         checkDmg.remove();
         spirals.forEach(s => s.destroy());
      });
    });

    return 6000;
  }

  // ─── ATTACK 9: Siren's Lure ──────────────────────────────────────
  ch3SirensLure() {
    const ts = this.grid.tileSize;
    const mc = Math.floor(this.grid.cols / 2);
    // Spawn ON the first row, not off grid
    const pix = this.grid.getPixelPosition(mc, 0);

    this._spawnSmoke(pix.x, pix.y, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;
      const siren = this.scene.add.sprite(pix.x, pix.y, 'ch3_siren1')
        .setDepth(100).setScale(1.2).play('anim_ch3_siren1');

      const warn = this.scene.add.text(
        this.grid.getPixelPosition(Math.floor(this.grid.cols / 2), 4).x, 
        this.grid.getPixelPosition(Math.floor(this.grid.cols / 2), 4).y - 40,
        "CONTROLS INVERTED!", { fontSize: '24px', color: '#ff00aa', fontStyle: 'bold', stroke: '#000', strokeThickness: 5 }
      ).setOrigin(0.5).setDepth(200);
      this.scene.tweens.add({ targets: warn, alpha: 0.4, yoyo: true, repeat: 5, duration: 400, onComplete: () => warn.destroy() });

      this.scene.cameras.main.flash(300, 0, 80, 255);
      this.scene.player.isCharmed = true;

      // 5 waves of beams
      let wave = 0;
      const doWave = () => {
         if (wave >= 5 || this.hp <= 0 || this.scene.isGameOver) return;
         
         const isGiant = Math.random() < 0.25;

         if (isGiant) {
            const mgC = Phaser.Math.Between(1, this.grid.cols - 2);
            this.grid.telegraphCol(mgC - 1, 550);
            this.grid.telegraphCol(mgC, 550);
            this.grid.telegraphCol(mgC + 1, 550);
            
            this.scene.time.delayedCall(550, () => {
               if (this.hp <= 0 || this.scene.isGameOver) return;
               const beamX = this.grid.getPixelPosition(mgC, 0).x;
               const beamStartY = this.grid.getPixelPosition(mgC, -3).y;
               const beamEndY   = this.grid.getPixelPosition(mgC, this.grid.rows + 3).y;

               const isBeam2 = Math.random() > 0.5;
               const beamAnim = isBeam2 ? 'anim_ch3_waterbeam2' : 'anim_ch3_waterbeam';
               const angle = isBeam2 ? 270 : 90;

               const beam = this.scene.add.sprite(beamX, beamStartY, 'ch3_waterbeam')
                 .setDepth(15).setDisplaySize(ts * 3, ts * 3).setAngle(angle).play(beamAnim);

               this.scene.tweens.add({
                 targets: beam, y: beamEndY, duration: 800, // fast
                 onUpdate: () => {
                   if (!beam.active) return;
                   if (Math.abs(this.scene.player.col - mgC) <= 1) {
                     const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
                     if (Math.abs(beam.y - pPix.y) < ts * 1.5) this.scene.player.takeDamage();
                   }
                 },
                 onComplete: () => beam.destroy()
               });
            });
         } else {
            const colsToHit = [];
            while (colsToHit.length < 3) {
               const rc = Phaser.Math.Between(0, this.grid.cols - 1);
               if (!colsToHit.includes(rc)) colsToHit.push(rc);
            }
            
            colsToHit.forEach(c => {
               this.grid.telegraphCol(c, 700);
               this.scene.time.delayedCall(700, () => {
                  if (this.hp <= 0 || this.scene.isGameOver) return;
                  const beamX = this.grid.getPixelPosition(c, 0).x;
                  const beamStartY = this.grid.getPixelPosition(c, -3).y;
                  const beamEndY   = this.grid.getPixelPosition(c, this.grid.rows + 3).y;

                  const isBeam2 = Math.random() > 0.5;
                  const beamAnim = isBeam2 ? 'anim_ch3_waterbeam2' : 'anim_ch3_waterbeam';
                  const angle = isBeam2 ? 270 : 90;

                  const beam = this.scene.add.sprite(beamX, beamStartY, 'ch3_waterbeam')
                    .setDepth(15).setDisplaySize(ts, ts * 0.5).setAngle(angle).play(beamAnim);

                  this.scene.tweens.add({
                    targets: beam, y: beamEndY, duration: 1800, // slower
                    onUpdate: () => {
                      if (!beam.active) return;
                      if (this.scene.player.col === c) {
                        const pPix = this.grid.getPixelPosition(c, this.scene.player.row);
                        if (Math.abs(beam.y - pPix.y) < ts * 0.5) this.scene.player.takeDamage();
                      }
                    },
                    onComplete: () => beam.destroy()
                  });
               });
            });
         }
         
         wave++;
         this.scene.time.delayedCall(2200, doWave);
      };
      
      this.scene.time.delayedCall(600, doWave);

      this.scene.time.delayedCall(12000, () => {
        this.scene.player.isCharmed = false;
        this._spawnSmoke(siren.x, siren.y, null);
        siren.destroy();
      });
    });

    return 11000;
  }



  // ─── ATTACK 11: Medusa Gaze ───────────────────────────────────────
  ch3MedusaGaze() {
    const ts = this.grid.tileSize;
    const mc = Math.floor(this.grid.cols / 2);
    const pix = this.grid.getPixelPosition(mc, 0); // Spawn on first row

    this._spawnSmoke(pix.x, pix.y, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;
      const siren = this.scene.add.sprite(pix.x, pix.y, 'ch3_siren2')
        .setDepth(100).setScale(1.3).play('anim_ch3_siren2');

      const warn = this.scene.add.text(
        this.grid.getPixelPosition(mc, 4).x, this.grid.getPixelPosition(mc, 4).y,
        "DON'T MOVE!", { fontSize: '24px', color: '#ff0000', fontStyle: 'bold', stroke: '#000', strokeThickness: 5 }
      ).setOrigin(0.5).setDepth(200);
      this.scene.tweens.add({ targets: warn, alpha: 0.4, yoyo: true, repeat: 4, duration: 400, onComplete: () => warn.destroy() });

      let gazeActive = false;
      const onPlayerMove = () => {
        if (!gazeActive || this.scene.player.isPetrified) return;
        this.scene.player.isPetrified = true;
        this.scene.player.takeDamage();
        const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
        const bubble = this.scene.add.sprite(pPix.x, pPix.y, 'ch3_fx_bubble').setDepth(120).setScale(3).play('anim_ch3_fx_bubble');
        this.scene.time.delayedCall(3500, () => {
          this.scene.player.isPetrified = false;
          this.scene.tweens.add({ targets: bubble, alpha: 0, scale: 0, duration: 300, onComplete: () => bubble.destroy() });
        });
        gazeActive = false; // Only hit once during this window
      };

      this.scene.events.on('player:moved', onPlayerMove);

      this.scene.time.delayedCall(3000, () => {
        gazeActive = true;
        this.scene.cameras.main.flash(800, 255, 255, 255);
        // If already dynamically moving the moment flash triggers, boom
        if (this.scene.player.isMoving) onPlayerMove();
        
        this._spawnSmoke(siren.x, siren.y, null);
        siren.destroy();
      });
      
      this.scene.time.delayedCall(3800, () => {
        gazeActive = false;
        this.scene.events.off('player:moved', onPlayerMove);
      });
    });

    return 5500;
  }

  // ─── ATTACK 12: Cthulhu Rifts ─────────────────────────────────────
  ch3CthulhuRifts() {
    const ts = this.grid.tileSize;
    const spawnC = Phaser.Math.Between(2, this.grid.cols - 3);
    const spawnR = Phaser.Math.Between(2, this.grid.rows - 3);
    const spawnPix = this.grid.getPixelPosition(spawnC, spawnR);

    this._spawnSmoke(spawnPix.x, spawnPix.y, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;

      const cthulhu = this.scene.add.sprite(spawnPix.x, spawnPix.y, 'ch3_cthulhu')
        .setDepth(80).setScale(1.5).play('anim_ch3_cthulhu_idle');

      const ringSize = ts * 3;
      const ring = this.scene.add.sprite(spawnPix.x, spawnPix.y, 'ch3_fx_ring')
        .setDepth(79).setDisplaySize(ringSize, ringSize).play('anim_ch3_fx_ring');

      const ringDmgTimer = this.scene.time.addEvent({
        delay: 300, loop: true,
        callback: () => {
          if (!ring.active) return;
          const pPix = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
          if (Math.abs(ring.x - pPix.x) < ts * 1.2 && Math.abs(ring.y - pPix.y) < ts * 1.2
            && !(Math.abs(ring.x - pPix.x) < ts * 0.3 && Math.abs(ring.y - pPix.y) < ts * 0.3)) {
            this.scene.player.takeDamage();
          }
        }
      });

      let wanderC = spawnC, wanderR = spawnR;
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
      let facing = 1;

      const wander = () => {
        if (this.hp <= 0 || this.scene.isGameOver) return;
        cthulhu.play('anim_ch3_cthulhu_fly', true);
        const [dc, dr] = dirs[Phaser.Math.Between(0, 3)];
        // Clamp heavily so it doesn't leave board
        wanderC = Phaser.Math.Clamp(wanderC + dc, 1, this.grid.cols - 2);
        wanderR = Phaser.Math.Clamp(wanderR + dr, 1, this.grid.rows - 2);
        if (dc < 0) { cthulhu.setFlipX(true); facing = 0; }
        else if (dc > 0) { cthulhu.setFlipX(false); facing = 1; }
        const wp = this.grid.getPixelPosition(wanderC, wanderR);
        this.scene.tweens.add({
          targets: [cthulhu, ring], x: wp.x, y: wp.y, duration: 600,
          onComplete: () => cthulhu.play('anim_ch3_cthulhu_idle', true)
        });
      };
      const wanderTimer = this.scene.time.addEvent({ delay: 700, repeat: 4, callback: wander });

      this.scene.time.delayedCall(3800, () => {
        const performCthulhuSequence = () => {
          // Attack 1: Whirlpool Cast
          cthulhu.play('anim_ch3_cthulhu_cast');
          let wc = Phaser.Math.Between(1, this.grid.cols - 2);
          let wr = Phaser.Math.Between(1, this.grid.rows - 2);
          
          for(let dc=-1; dc<=1; dc++) for(let dr=-1; dr<=1; dr++) this.grid.telegraph(wc+dc, wr+dr, 1000);
          
          this.scene.time.delayedCall(1000, () => {
             if (this.hp <= 0 || this.scene.isGameOver) return;
             const wp2 = this.grid.getPixelPosition(wc, wr);
             const whirl = this.scene.add.sprite(wp2.x, wp2.y, 'ch3_fx_whirl')
               .setDepth(55).setDisplaySize(ts * 3, ts * 3).play('anim_ch3_fx_whirl');

             const whirlDmg = this.scene.time.addEvent({
               delay: 200, repeat: 10,
               callback: () => {
                 if (!whirl.active) return;
                 const pC = this.scene.player.col, pR = this.scene.player.row;
                 if (Math.abs(pC - wc) <= 1 && Math.abs(pR - wr) <= 1) this.scene.player.takeDamage();
               }
             });

             const driftDir = dirs[Phaser.Math.Between(0, 3)];
             const newWC = Phaser.Math.Clamp(wc + driftDir[0] * 2, 0, this.grid.cols - 1);
             const newWR = Phaser.Math.Clamp(wr + driftDir[1] * 2, 0, this.grid.rows - 1);
             const newPix = this.grid.getPixelPosition(newWC, newWR);
             this.scene.tweens.add({ targets: whirl, x: newPix.x, y: newPix.y, duration: 2000, onComplete: () => { whirlDmg.remove(); whirl.destroy(); } });
          });

          // Attack 2: Fireblade Slash natively queued afterwards
          this.scene.time.delayedCall(2500, () => {
            if (this.hp <= 0 || this.scene.isGameOver) return;
            cthulhu.play('anim_ch3_cthulhu_slash');
            cthulhu.once('animationcomplete', () => {
                if (cthulhu.active) cthulhu.play('anim_ch3_cthulhu_idle');
            });
            
            const pC = this.scene.player.col;
            const pR = this.scene.player.row;
            let dc = 0, dr = 0;
            if (pC > wanderC) dc = 1; else if (pC < wanderC) dc = -1;
            if (pR > wanderR) dr = 1; else if (pR < wanderR) dr = -1;
            
            if (dc === 0 && dr === 0) dc = 1;
            
            const pathTiles = [];
            let sc = wanderC, sr = wanderR;
            while (sc >= -2 && sc <= this.grid.cols + 1 && sr >= -2 && sr <= this.grid.rows + 1) {
                sc += dc; sr += dr;
                pathTiles.push({c: sc, r: sr});
            }
            
            pathTiles.forEach(pt => {
                for (let dd = -1; dd <= 1; dd++) {
                    for (let ddd = -1; ddd <= 1; ddd++) {
                        this.grid.telegraph(pt.c + dd, pt.r + ddd, 1500); // Slower 1.5s telegraph
                    }
                }
            });
            
            this.scene.time.delayedCall(1500, () => {
                if (this.hp <= 0 || this.scene.isGameOver) return;
                const startPix = this.grid.getPixelPosition(wanderC, wanderR);
                const destC = wanderC + dc * 12;
                const destR = wanderR + dr * 12;
                const destPix = this.grid.getPixelPosition(destC, destR);
                
                let bladeAngle = 0; // Default LEFT
                if (dc === 1 && dr === 0) bladeAngle = 180;
                else if (dc === 0 && dr === -1) bladeAngle = 90;
                else if (dc === 0 && dr === 1) bladeAngle = 270;
                else if (dc === -1 && dr === -1) bladeAngle = 45;
                else if (dc === 1 && dr === -1) bladeAngle = 135;
                else if (dc === 1 && dr === 1) bladeAngle = 225;
                else if (dc === -1 && dr === 1) bladeAngle = 315;
                
                const blade = this.scene.add.sprite(startPix.x, startPix.y, 'ch3_fx_fireblade')
                   .setDepth(85).setDisplaySize(ts * 3, ts * 3).setAngle(bladeAngle).play('anim_ch3_fx_fireblade');
                   
                this.scene.tweens.add({
                   targets: blade, x: destPix.x, y: destPix.y, duration: 3200, // slower travel
                   onUpdate: () => {
                       if (!blade.active) return;
                       const pcx = this.grid.getPixelPosition(this.scene.player.col, this.scene.player.row);
                       if (Math.abs(blade.x - pcx.x) < ts * 1.5 && Math.abs(blade.y - pcx.y) < ts * 1.5) {
                           this.scene.player.takeDamage();
                       }
                   },
                   onComplete: () => blade.destroy()
                });
            });
          });

          this.scene.time.delayedCall(7500, () => {
            wanderTimer.remove(); ringDmgTimer.remove();
            cthulhu.setVisible(false);
            ring.setVisible(false);
            this._spawnSmoke(cthulhu.x, cthulhu.y, () => {
                ring.destroy(); cthulhu.destroy();
            });
          });
        };
        performCthulhuSequence();
      });
    });

    return 12500;
  }



  // ─── ATTACK 14: Siren Snake Chase ────────────────────────────────
  ch3SirenSnakeChase() {
    const ts = this.grid.tileSize;
    const mc = Math.floor(this.grid.cols / 2);
    const spawnPix = this.grid.getPixelPosition(mc, 0); // Spawns on board

    this._spawnSmoke(spawnPix.x, spawnPix.y, () => {
      if (this.hp <= 0 || this.scene.isGameOver) return;
      const siren = this.scene.add.sprite(spawnPix.x, spawnPix.y, 'ch3_siren3_idle')
        .setDepth(100).setScale(1.2).play('anim_ch3_siren3_idle');

      siren.play('anim_ch3_siren3_special');
      this.scene.cameras.main.shake(300, 0.015);

      const snakeSize = ts * 1.5;

      for (let i = 0; i < 4; i++) {
        this.scene.time.delayedCall(i * 1200, () => {
          if (this.hp <= 0 || this.scene.isGameOver) return;
          let sC = mc + (i % 2 === 0 ? -1 : 1);
          let sR = 1;
          sC = Phaser.Math.Clamp(sC, 0, this.grid.cols - 1);

          const np = this.grid.getPixelPosition(sC, sR);
          const snake = this.scene.add.sprite(np.x, np.y, 'ch3_snake')
            .setDepth(45).setDisplaySize(snakeSize, snakeSize).play('anim_ch3_snake');

          const tick = this.scene.time.addEvent({
            delay: 600, repeat: 12,
            callback: () => {
              if (this.hp <= 0 || this.scene.isGameOver) return;
              const pC = this.scene.player.col, pR = this.scene.player.row;
              let dc = 0, dr = 0;
              if (sC < pC) dc = 1; else if (sC > pC) dc = -1;
              if (sR < pR) dr = 1; else if (sR > pR) dr = -1;
              if (dc !== 0 && dr !== 0) { Math.random() > 0.5 ? (dr = 0) : (dc = 0); }

              sC = Phaser.Math.Clamp(sC + dc, 0, this.grid.cols - 1);
              sR = Phaser.Math.Clamp(sR + dr, 0, this.grid.rows - 1);

              snake.setFlipX(dc > 0);
              
              // Red telegraph for next tile
              this.grid.telegraph(sC, sR, 550);

              const snp = this.grid.getPixelPosition(sC, sR);
              this.scene.tweens.add({ targets: snake, x: snp.x, y: snp.y, duration: 580 });

              // Check if player is on the newly moved tile
              this.scene.time.delayedCall(580, () => {
                 if (this.scene.player.col === sC && this.scene.player.row === sR) {
                    this.scene.player.takeDamage();
                 }
              });
            }
          });

          this.scene.time.delayedCall(7800, () => {
            tick.remove();
            if (snake.active) this.scene.tweens.add({ targets: snake, alpha: 0, scale: 0, duration: 300, onComplete: () => snake.destroy() });
          });
        });
      }

      this.scene.time.delayedCall(5000, () => {
        this._spawnSmoke(siren.x, siren.y, null);
        siren.destroy();
      });
    });

    return 11000;
  }
}
