/**
 * GestureTraining — Hand gesture training screen
 * Connects to GestureController for real-time Mediapipe/KNN training
 */
import { gestureController } from '../gesture/GestureController.js';
import { state } from '../utils/StateManager.js';
import { TutorialManager } from '../utils/TutorialManager.js';

export const GestureTraining = {
  render() {
    return `
      <div class="gesture-screen screen">
        <button class="back-btn" id="btn-gesture-back">Back</button>
        
        <h1 class="screen-title" style="animation: fadeInUp 0.4s ease forwards;">
          Gesture Setup
        </h1>
        
        <div class="gesture-screen__camera" id="gesture-camera">
          <video id="webcam-video" style="display: none;"></video>
          <canvas id="webcam-canvas"></canvas>
          <div id="camera-loading" class="placeholder-content" style="position: absolute; top:0; left:0; height: 100%; width: 100%; pointer-events:none;">
            <div class="loading-spinner"></div>
            <span class="placeholder-text" style="font-size: var(--text-xs);">Initializing Camera...</span>
          </div>
        </div>

        <p class="text-center" style="font-size: var(--text-sm); color: white; margin-bottom: var(--space-md); max-width: 400px; animation: fadeInUp 0.4s ease 0.1s forwards;">
          Train the game to recognize YOUR hand gestures!
          Select a direction, make a gesture, and hold Record.
        </p>

        <div class="gesture-directions" style="animation: fadeInUp 0.4s ease 0.15s forwards;">
          <button class="gesture-dir-btn active" data-dir="up" id="dir-up">
            <span class="gesture-dir-btn__arrow">▲</span>
            <span class="gesture-dir-btn__label">UP</span>
            <span class="gesture-dir-btn__count">0</span>
          </button>
          <button class="gesture-dir-btn" data-dir="down" id="dir-down">
            <span class="gesture-dir-btn__arrow">▼</span>
            <span class="gesture-dir-btn__label">DOWN</span>
            <span class="gesture-dir-btn__count">0</span>
          </button>
          <button class="gesture-dir-btn" data-dir="left" id="dir-left">
            <span class="gesture-dir-btn__arrow">◄</span>
            <span class="gesture-dir-btn__label">LEFT</span>
            <span class="gesture-dir-btn__count">0</span>
          </button>
          <button class="gesture-dir-btn" data-dir="right" id="dir-right">
            <span class="gesture-dir-btn__arrow">►</span>
            <span class="gesture-dir-btn__label">RIGHT</span>
            <span class="gesture-dir-btn__count">0</span>
          </button>
          <button class="gesture-dir-btn" data-dir="idle" id="dir-idle">
            <span class="gesture-dir-btn__arrow"><img src="/assets/ui/bone-hand.png" alt="Rest" class="gesture-dir-btn__icon" /></span>
            <span class="gesture-dir-btn__label">REST</span>
            <span class="gesture-dir-btn__count">0</span>
          </button>
        </div>

        <div class="progress-bar" style="animation: fadeInUp 0.4s ease 0.2s forwards;">
          <div class="progress-bar__fill" style="width: 0%;" id="gesture-progress"></div>
        </div>
        <p class="text-primary" style="font-size: var(--text-xs); margin-bottom: var(--space-md);">
          <span id="progress-label">0 / 20</span> samples
        </p>

        <button class="gesture-record-btn" id="btn-record" style="animation: fadeInUp 0.4s ease 0.25s forwards;">
          Hold to Record
        </button>

        <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg); animation: fadeInUp 0.4s ease 0.3s forwards;">
          <button class="menu-btn" id="btn-test-gestures" style="font-size: var(--text-sm);">
            Test My Gestures
          </button>
          <button class="menu-btn" id="btn-export-gestures" style="font-size: var(--text-sm);">
            Export
          </button>
          <button class="menu-btn" id="btn-import-gestures" style="font-size: var(--text-sm);">
            Import
          </button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;" />
          <button class="menu-btn text-red" id="btn-reset-gestures" style="font-size: var(--text-sm);">
            Reset All
          </button>
        </div>
      </div>
    `;
  },

  async onEnter(el, params = {}) {
    this.videoEl = el.querySelector('#webcam-video');
    this.canvasEl = el.querySelector('#webcam-canvas');
    this.loadingUi = el.querySelector('#camera-loading');
    this.activeDir = 'up'; // default
    // If true: user was sent here from the Play button (gesture setup is required)
    // If false: user navigated here directly via the Gesture Setup button
    this.fromPlay = params.fromPlay || false;

    // Force canvas size to match video aspect locally
    this.canvasEl.width = 640;
    this.canvasEl.height = 480;

    // Back button
    el.querySelector('#btn-gesture-back').addEventListener('click', async () => {
      // Must save model when leaving
      await gestureController.saveModel();
      gestureController.stopCamera();
      window.__screenManager.back();
    });

    // Initialize controller and start camera
    try {
      await gestureController.initialize(this.videoEl, this.canvasEl);
      await gestureController.startCamera();
      // Hide loading spinner
      this.loadingUi.style.display = 'none';
      this._updateUIFromCounts();
      
      // Show tutorial if gesture setup hasn't been completed yet
      const counts = gestureController.getSampleCounts();
      const hasTrainedGestures = Object.values(counts).some(c => c >= 10);
      if (!hasTrainedGestures && !gestureController.isTesting) {
        this._startTutorial(el, this.fromPlay);
      }
      
    } catch (e) {
      this.loadingUi.innerHTML = `<span class="text-red">Camera Error. Refresh and allow permissions.</span>`;
    }

    // Direction buttons
    const dirBtns = el.querySelectorAll('.gesture-dir-btn');
    dirBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Drop test mode if clicking directions
        if (gestureController.isTesting) {
          this._toggleTestMode(el, false);
        }

        dirBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeDir = btn.dataset.dir;
        this._updateProgressUI(el);
      });
    });

    // Record button bindings
    const recordBtn = el.querySelector('#btn-record');
    
    const startRec = (e) => {
      if(e) e.preventDefault();
      // Cannot record while testing
      if (gestureController.isTesting) return;

      recordBtn.classList.add('recording');
      recordBtn.textContent = 'Recording...';
      gestureController.startRecording(this.activeDir);
    };

    const stopRec = (e) => {
      if(e) e.preventDefault();
      recordBtn.classList.remove('recording');
      recordBtn.textContent = 'Hold to Record';
      gestureController.stopRecording();
      // Auto-save briefly on stop
      gestureController.saveModel();
    };

    recordBtn.addEventListener('mousedown', startRec);
    window.addEventListener('mouseup', stopRec); // Catch release outside
    recordBtn.addEventListener('touchstart', startRec);
    window.addEventListener('touchend', stopRec);

    // Event listener for incoming sample counts
    this.unsubSampleAdded = state.on('gesture:sampleAdded', (data) => {
      this._updateUIFromCounts(data.counts);
      if (this.tutorialManager) {
        this.tutorialManager.update('sampleAdded', data.counts);
      }
    });

    // Event listener for gesture testing
    this.unsubGestureDetected = state.on('gesture:detected', (detectedDir) => {
      if (!gestureController.isTesting) return;

      // Reset styles
      dirBtns.forEach(b => b.classList.remove('active', 'trained'));
      
      if (detectedDir !== 'idle') {
        const targetBtn = el.querySelector(`#dir-${detectedDir}`);
        if(targetBtn) {
          targetBtn.classList.add('active', 'trained'); 
          // add a pulse animation
          targetBtn.style.animation = 'glowPulse 0.5s ease';
          setTimeout(()=> { targetBtn.style.animation = ''; }, 500);
        }
      }
    });

    // Test gestures Mode Toggle
    const testBtn = el.querySelector('#btn-test-gestures');
    testBtn.addEventListener('click', () => {
      this._toggleTestMode(el, !gestureController.isTesting);
    });

    // Reset gestures
    el.querySelector('#btn-reset-gestures').addEventListener('click', async () => {
      if (confirm('Reset all trained gestures? This cannot be undone.')) {
        await gestureController.resetAllGestures();
        alert('All gestures cleared.');
        this._updateUIFromCounts({});
      }
    });
    
    // Export gestures
    el.querySelector('#btn-export-gestures').addEventListener('click', async () => {
      if (gestureController.exportModelJSON) {
        await gestureController.exportModelJSON();
      }
    });
    
    // Import gestures
    const importInput = el.querySelector('#import-file-input');
    el.querySelector('#btn-import-gestures').addEventListener('click', () => {
      importInput.click();
    });
    
    importInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        if (gestureController.importModelJSON) {
          try {
            await gestureController.importModelJSON(e.target.files[0]);
            alert('Gestures imported successfully!');
            this._updateUIFromCounts();
          } catch (err) {
            alert('Failed to import gestures. Invalid file format.');
            console.error(err);
          }
        }
      }
      importInput.value = ''; // Reset input
    });
  },

  onLeave() {
    if (this.unsubSampleAdded) this.unsubSampleAdded();
    if (this.unsubGestureDetected) this.unsubGestureDetected();

    if (this.tutorialManager) {
      this.tutorialManager.skip();
      this.tutorialManager = null;
    }

    gestureController.isTesting = false;
    gestureController.stopRecording();
    // Safety sync
    gestureController.saveModel();
  },

  _updateUIFromCounts(overrideCounts = null) {
    const counts = overrideCounts || gestureController.getSampleCounts();
    const dirs = ['up', 'down', 'left', 'right', 'idle'];
    
    dirs.forEach(dir => {
      const count = counts[dir] || 0;
      const btn = document.querySelector(`#dir-${dir}`);
      if (btn) {
        btn.querySelector('.gesture-dir-btn__count').textContent = count;
        if (count >= 10) {
          btn.classList.add('trained');
        } else {
          btn.classList.remove('trained');
        }
      }
    });

    this._updateProgressUI(document);
  },

  _updateProgressUI(el) {
    const counts = gestureController.getSampleCounts();
    const count = counts[this.activeDir] || 0;
    const progressFill = el.querySelector('#gesture-progress');
    const progressLabel = el.querySelector('#progress-label');

    if (progressFill && progressLabel) {
      const target = 20; // Recommended target
      const pct = Math.min((count / target) * 100, 100);
      progressFill.style.width = `${pct}%`;
      progressFill.style.background = count >= 10 ? 'var(--accent-green)' : 'linear-gradient(90deg, var(--accent-orange), var(--accent-gold))';
      progressLabel.textContent = `${count} / ${target}`;
    }
  },

  _toggleTestMode(el, active) {
    const testBtn = el.querySelector('#btn-test-gestures');
    const recordBtn = el.querySelector('#btn-record');
    
    gestureController.isTesting = active;

    if (active) {
      testBtn.style.color = 'var(--accent-red)';
      testBtn.textContent = 'Stop Testing';
      
      // hide record button
      recordBtn.classList.add('hidden');
    } else {
      testBtn.style.backgroundColor = '';
      testBtn.style.color = '';
      testBtn.textContent = 'Test My Gestures';
      
      // show record button
      recordBtn.classList.remove('hidden');

      // Reselect the previous active tab
      const dirBtns = el.querySelectorAll('.gesture-dir-btn');
      dirBtns.forEach(b => b.classList.remove('active', 'trained'));
      el.querySelector(`#dir-${this.activeDir}`).classList.add('active');
    }
  },

  _startTutorial(el, fromPlay = false) {
    this.tutorialManager = new TutorialManager('screen-container');
    const portrait = '/assets/characters/character.png';
    
    const steps = [
      {
        text: "Welcome to Bata, Takbo! Before we begin, let's set up your hand gestures. You'll use your webcam to teach the game how you move!",
        portrait: portrait,
        position: 'top'
      },
      {
        text: "This is your camera view. Make sure your hand is clearly visible inside the frame!",
        portrait: portrait,
        position: 'top',
        highlight: '#gesture-camera',
        buttons: [{ label: 'Got it', action: 'next' }]
      },
      {
        text: "These are the gesture buttons. You will select a direction before you start recording.",
        portrait: portrait,
        position: 'top',
        highlight: '.gesture-directions',
        buttons: [{ label: 'Next', action: 'next' }]
      },
      {
        text: "Let's train the **UP** gesture. Make a clear upward hand signal, then press and hold the **Record** button until the bar fills.",
        highlight: "#btn-record",
        portrait: portrait,
        position: 'top',
        onEnter: () => el.querySelector('#dir-up').click(),
        autoAdvance: {
          type: 'sampleAdded',
          check: (counts) => counts.up >= 10
        }
      },
      {
        text: "Great! Now do the same for **DOWN**. Make a downward signal and hold record.",
        highlight: "#btn-record",
        portrait: portrait,
        position: 'top',
        onEnter: () => el.querySelector('#dir-down').click(),
        autoAdvance: {
          type: 'sampleAdded',
          check: (counts) => counts.down >= 10
        }
      },
      {
        text: "Now point **LEFT**.",
        highlight: "#btn-record",
        portrait: portrait,
        position: 'top',
        onEnter: () => el.querySelector('#dir-left').click(),
        autoAdvance: {
          type: 'sampleAdded',
          check: (counts) => counts.left >= 10
        }
      },
      {
        text: "And point **RIGHT**.",
        highlight: "#btn-record",
        portrait: portrait,
        position: 'top',
        onEnter: () => el.querySelector('#dir-right').click(),
        autoAdvance: {
          type: 'sampleAdded',
          check: (counts) => counts.right >= 10
        }
      },
      {
        text: "One more — make your **REST** pose. This is what your hand looks like when you're NOT moving (e.g., an open palm or fist).",
        highlight: "#btn-record",
        portrait: portrait,
        position: 'top',
        onEnter: () => el.querySelector('#dir-idle').click(),
        autoAdvance: {
          type: 'sampleAdded',
          check: (counts) => counts.idle >= 10
        }
      },
      {
        text: "Perfect! Let's test it. Click 'Test My Gestures', move your hand, and see if the arrows highlight correctly.",
        highlight: "#btn-test-gestures",
        portrait: portrait,
        position: 'top',
        buttons: [{ label: 'Done Testing', action: 'next' }]
      },
      {
        text: fromPlay
          ? "You're all set! Your gesture model has been saved. Let's jump into the game!"
          : "You're all set! Your gesture model has been saved. You can come back anytime to retrain.",
        portrait: portrait,
        position: 'top',
        buttons: [{ label: fromPlay ? 'Start Tutorial' : 'Done', action: 'next' }]
      }
    ];

    this.tutorialManager.start(steps, {
      onComplete: () => this._completeTutorial(fromPlay),
      onSkip: () => this._skipTutorial(fromPlay)
    });
  },

  async _skipTutorial(fromPlay) {
    // Case 1 — user opened Gesture Setup directly: just close the prompt, stay here
    // Case 2 — user came via Play button and skipped: skip tutorial and go to game
    if (fromPlay) {
      console.log('[TUTORIAL-DEBUG] GestureTraining._skipTutorial(): setting tutorialComplete = true');
      gestureController.stopCamera();
      window.__screenManager.history = ['main-menu'];
      state.set('tutorialComplete', true);
      await state.saveTutorialState();
      window.__screenManager.navigate('chapter-select', {}, false);
    }
    // else: do nothing — dialogue already hides itself via TutorialManager.skip()
  },
  
  async _completeTutorial(fromPlay = false) {
    await gestureController.saveModel();
    // We don't set tutorialComplete = true here because the gameplay tutorial is next.
    // It will be set to true at the end of TutorialScreen.js

    if (fromPlay) {
      // Came from Play — proceed to game tutorial
      gestureController.stopCamera();
      window.__screenManager.history = ['main-menu'];
      window.__screenManager.navigate('tutorial-screen', {}, false);
    }
    // else: user opened Gesture Setup directly — just stay on the screen.
    // The dialogue has already closed, model is saved, they can keep training.
  }
};
