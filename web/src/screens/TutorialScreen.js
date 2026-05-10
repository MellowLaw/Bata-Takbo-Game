/**
 * TutorialScreen
 * Standalone guided gameplay tutorial — uses a real Chapter 1 grid/boss
 * but runs fully scripted events instead of the normal attack loop.
 */
import { state } from '../utils/StateManager.js';
import { GameScreen } from './GameScreen.js';
import { TutorialManager } from '../utils/TutorialManager.js';

export const TutorialScreen = {
  render() {
    return GameScreen.render();
  },

  async onEnter(el, params) {
    // 1. Boot the actual game engine with isTutorial: true
    await GameScreen.onEnter(el, { chapterId: 1, isTutorial: true });

    this.tutorialManager = new TutorialManager('screen-container');
    const portrait = '/assets/entity/character-icon/character.png';

    // ── Tutorial Steps ──────────────────────────────────────────────────────
    const steps = [
      // Step 0 – Intro (auto-advance after 3s)
      {
        text: 'Welcome to the battlefield! This is a 5×5 grid. You stand on it and must dodge the boss attacks.',
        portrait,
        position: 'center',
        autoAdvance: { type: 'time', duration: 4000 }
      },

      // Steps 1-4 – Movement (auto-advance when player moves in that direction)
      {
        text: 'Use your hand gestures to move. Try going ↑ UP!',
        portrait,
        position: 'center',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'up' }
      },
      {
        text: 'Nice! Now try ↓ DOWN.',
        portrait,
        position: 'center',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'down' }
      },
      {
        text: 'Good! Try ← LEFT.',
        portrait,
        position: 'center',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'left' }
      },
      {
        text: 'Almost there — try → RIGHT!',
        portrait,
        position: 'center',
        autoAdvance: { type: 'playerMoved', check: (dir) => dir === 'right' }
      },

      // Step 5 – Free movement
      {
        text: 'Great! Move freely for a bit — get comfortable with the controls.',
        portrait,
        position: 'center',
        autoAdvance: { type: 'time', duration: 6000 }
      },

      // Step 6 – Attack intro
      {
        text: 'The boss will attack you! Watch the RED tiles — those show where danger is coming.',
        portrait,
        position: 'center',
        onEnter: () => state.emit('tutorial:triggerAttack', 0),
        autoAdvance: { type: 'attackComplete' }
      },

      // Step 7 – Second attack
      {
        text: 'DODGE! Move away before the attack hits!',
        portrait,
        position: 'center',
        onEnter: () => state.emit('tutorial:triggerAttack', 1),
        autoAdvance: { type: 'attackComplete' }
      },

      // Step 8 – Third attack + explanation
      {
        text: 'If you stand on a tile when it explodes — you take damage. Watch the bottom for your HP!',
        portrait,
        position: 'center',
        onEnter: () => state.emit('tutorial:triggerAttack', 2),
        autoAdvance: { type: 'attackComplete' }
      },

      // Step 9 – Teach counter-attacking via golden tile
      {
        text: "Now it's YOUR turn. See the glowing golden tile? Step on it to damage the boss!",
        portrait,
        position: 'center',
        onEnter: () => {
          // Small delay so the dialogue renders before the tile spawns
          setTimeout(() => state.emit('tutorial:spawnDamageTile'), 500);
        },
        autoAdvance: { type: 'bossDamaged' }
      },

      // Step 10 – Practice round: dodge attacks, then attack the boss
      {
        text: "Let's put it all together! Dodge the boss, then step on the golden tile when it appears.",
        portrait,
        position: 'center',
        onEnter: () => {
          // Queue a small combat sequence: attack 0 → attack 1 → golden tile
          // Boss._tutorialSimpleAttack takes ~3s (2s warning + ~1s explosion).
          setTimeout(() => state.emit('tutorial:triggerAttack', 0), 800);
          setTimeout(() => state.emit('tutorial:triggerAttack', 1), 4500);
          setTimeout(() => state.emit('tutorial:spawnDamageTile'), 8500);
        },
        autoAdvance: { type: 'bossDamaged' }
      },

      // Step 11 – Done
      {
        text: "You're ready for the real action! Good luck, warrior!",
        portrait,
        position: 'center',
        buttons: [{ label: '▶ Begin Adventure', action: 'next' }]
      }
    ];

    // Wait a tick for Phaser to fully boot before starting
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

    // Unsubscribe all state listeners
    if (this._unsubs) { this._unsubs.forEach(fn => fn()); this._unsubs = []; }

    // Stop tutorial manager
    if (this.tutorialManager) { this.tutorialManager.skip(); this.tutorialManager = null; }

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
          // Only advance if we're still on this step
          if (this.tutorialManager?.currentStep === idx) {
            this.tutorialManager.update('time');
          }
        }, delay);
      }
    }, 200);
  },

  async _finish() {
    if (this._timePoll) { clearInterval(this._timePoll); this._timePoll = null; }

    console.log('[TUTORIAL-DEBUG] TutorialScreen._finish(): setting tutorialComplete = true');
    state.set('tutorialComplete', true);
    await state.saveTutorialState();

    // Destroy the game, then go to chapter select.
    if (GameScreen.game) { GameScreen.game.destroy(true); GameScreen.game = null; }
    window.__screenManager.history = ['main-menu'];
    window.__screenManager.navigate('chapter-select', {}, false);
  }
};
