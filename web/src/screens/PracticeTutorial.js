/**
 * PracticeTutorial — A simplified tutorial for new users
 * Works with both gesture and keyboard controls
 * Uses a 5x5 grid to teach: movement, avoiding attacks, and picking up sword
 */
import { state } from '../utils/StateManager.js';
import { GameScreen } from './GameScreen.js';
import { TutorialManager } from '../utils/TutorialManager.js';
import { gestureController } from '../gesture/GestureController.js';

export const PracticeTutorial = {
  render() {
    return `
      <div class="practice-tutorial-screen screen" style="
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      ">
        <!-- Background image set by HUDScene -->
        <div id="phaser-container" style="width: 100%; height: 100%;"></div>
        
        <!-- Camera PiP (hidden in practice mode) -->
        <div class="game-screen__camera-pip" id="game-camera-pip" style="
          position: absolute; 
          bottom: 40px; 
          left: 40px;
          width: 200px;
          height: 200px;
          border: none;
          overflow: hidden;
          background: #000;
          z-index: 50;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
          display: none;
        ">
          <video id="game-video" style="width: 100%; height: 100%; object-fit: contain;"></video>
          <canvas id="game-canvas" width="640" height="480" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;"></canvas>
        </div>

        <!-- Timer Display (hidden in practice mode) -->
        <div id="game-timer-dom" style="display: none;">00:00</div>

        <!-- Pause Menu (from GameScreen) -->
        <div id="pause-menu" class="pause-menu" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        ">
          <h2 style="font-family: 'GigaSaturn', sans-serif; color: #f0e6d3; font-size: 2rem; margin-bottom: 2rem;">PAUSED</h2>
          <button id="btn-resume" class="menu-btn">Resume</button>
          <button id="btn-restart" class="menu-btn">Restart</button>
          <button id="btn-quit" class="menu-btn">Quit</button>
        </div>
      </div>
    `;
  },

  async onEnter(el, params) {
    // Determine control method - from params or state
    this.controlMethod = params.control || state.get('selectedControl') || 'keyboard';
    state.set('selectedControl', this.controlMethod);
    
    // Boot the actual game engine with isPracticeTutorial flag
    await GameScreen.onEnter(el, { 
      chapterId: 1, 
      isTutorial: true,  // Use tutorial mode to disable normal attack loop
      isPracticeTutorial: true,
      character: params.character || 'male',
      control: this.controlMethod
    });

    this.tutorialManager = new TutorialManager('screen-container');
    const portrait = '/assets/entity/character-icon/character.png';
    
    // Get control method display text
    const controlText = this.controlMethod === 'gesture' 
      ? 'hand gestures' 
      : 'arrow keys or WASD';

    // ── Tutorial Steps ──────────────────────────────────────────────────────
    const steps = [
      // Step 0 – Welcome (bottom position so it doesn't overlap grid)
      {
        text: `Welcome! Let's learn how to play using ${controlText}.`,
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'time', duration: 3000 }
      },

      // Step 1 – Grid intro
      {
        text: 'This is your battlefield. You are the character in the center.',
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'time', duration: 3000 }
      },

      // Steps 2-5 – Movement practice (one direction each)
      {
        text: `Let's move! Use ${this.controlMethod === 'gesture' ? 'your hand gesture' : 'the UP arrow or W key'} to go ↑ UP!`,
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'up' }
      },
      {
        text: 'Great! Now try ↓ DOWN.',
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'down' }
      },
      {
        text: 'Good! Try ← LEFT.',
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'left' }
      },
      {
        text: 'Now try → RIGHT!',
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'right' }
      },

      // Step 6 – Free movement
      {
        text: 'Excellent! Move freely around the grid to get comfortable.',
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'time', duration: 4000 }
      },

      // Step 7 – Attack warning intro
      {
        text: 'Now learn about attacks! Watch for RED tiles — danger is coming!',
        portrait,
        position: 'bottom',
        autoAdvance: { type: 'time', duration: 3500 }
      },

      // Step 8 – First attack (safe demo)
      {
        text: 'See the red tiles? Move away before they explode!',
        portrait,
        position: 'bottom',
        onEnter: () => state.emit('tutorial:triggerAttack', 0),
        autoAdvance: { type: 'attackComplete' }
      },

      // Step 9 – Second attack (real but forgiving)
      {
        text: 'Good! Here comes another one. Avoid the red tiles!',
        portrait,
        position: 'bottom',
        onEnter: () => state.emit('tutorial:triggerAttack', 1),
        autoAdvance: { type: 'attackComplete' }
      },

      // Step 10 – Sword intro
      {
        text: 'Now for the counter-attack! See the GOLDEN tile? Step on it to strike!',
        portrait,
        position: 'bottom',
        onEnter: () => {
          setTimeout(() => state.emit('tutorial:spawnDamageTile'), 500);
        },
        autoAdvance: { type: 'bossDamaged' }
      },

      // Step 11 – Practice round
      {
        text: 'Perfect! Let\'s put it all together. Dodge, then strike!',
        portrait,
        position: 'bottom',
        onEnter: () => {
          const t1 = setTimeout(() => state.emit('tutorial:triggerAttack', 0), 800);
          const t2 = setTimeout(() => state.emit('tutorial:spawnDamageTile'), 5000);
          this._pendingTimers = [t1, t2];
        },
        autoAdvance: { type: 'bossDamaged' }
      },

      // Step 12 – Congratulations!
      {
        text: 'Congratulations! You\'ve mastered the basics. You can now play the real game!',
        portrait,
        position: 'bottom',
        buttons: [{ label: '🎉 Start Playing!', action: 'next' }]
      }
    ];

    // Wait for Phaser to fully boot before starting
    this._startDelay = setTimeout(() => {
      this.tutorialManager.start(steps, {
        onComplete: () => this._finish(),
        onSkip: () => this._finish()
      });

      // ── Event wiring ──────────────────────────────────────────────────────
      this._unsubs = [];

      // Player movement
      this._unsubs.push(state.on('player:moved', (dir) => {
        this.tutorialManager.update('playerMoved', dir);
      }));

      // Boss attack finished
      this._unsubs.push(state.on('tutorial:attackComplete', () => {
        this.tutorialManager.update('attackComplete');
      }));

      // Boss took damage (player stepped on golden tile)
      this._unsubs.push(state.on('tutorial:bossDamaged', () => {
        this.tutorialManager.update('bossDamaged');
      }));

      // Start time-advance polling
      this._startTimePoll();

    }, 2500);
  },

  onLeave() {
    // Clean up timers
    if (this._startDelay) { clearTimeout(this._startDelay); this._startDelay = null; }
    if (this._timePoll) { clearInterval(this._timePoll); this._timePoll = null; }
    if (this._stepTimer) { clearTimeout(this._stepTimer); this._stepTimer = null; }
    if (this._pendingTimers) { this._pendingTimers.forEach(clearTimeout); this._pendingTimers = []; }

    // Unsubscribe all state listeners
    if (this._unsubs) { this._unsubs.forEach(fn => fn()); this._unsubs = []; }

    // Stop tutorial manager
    if (this.tutorialManager) { this.tutorialManager.skip(); this.tutorialManager = null; }

    // Stop camera if using gesture control
    if (this.controlMethod === 'gesture') {
      gestureController.stopCamera();
    }

    // Shut down game engine
    GameScreen.onLeave();
  },

  _startTimePoll() {
    this._handledTimeSteps = new Set();

    this._timePoll = setInterval(() => {
      if (!this.tutorialManager?.isActive) {
        clearInterval(this._timePoll);
        return;
      }

      const idx = this.tutorialManager.currentStep;
      const step = this.tutorialManager.steps[idx];

      if (step?.autoAdvance?.type === 'time' && !this._handledTimeSteps.has(idx)) {
        this._handledTimeSteps.add(idx);
        const delay = step.autoAdvance.duration ?? 3000;
        this._stepTimer = setTimeout(() => {
          if (this.tutorialManager?.currentStep === idx) {
            this.tutorialManager.update('time');
          }
        }, delay);
      }
    }, 200);
  },

  async _finish() {
    if (this._timePoll) { clearInterval(this._timePoll); this._timePoll = null; }

    // Mark practice tutorial as complete
    state.set('practiceTutorialComplete', true);
    state.set('tutorialComplete', true); // Also mark overall tutorial complete
    await state.saveTutorialState();
    await state.savePracticeTutorialState();

    // Destroy the game
    if (GameScreen.game) { 
      GameScreen.game.destroy(true); 
      GameScreen.game = null; 
    }
    
    // Go to main menu
    window.__screenManager.history = [];
    window.__screenManager.navigate('main-menu', {}, false);
  }
};
