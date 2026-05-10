/**
 * CharacterSelect — Two-step full-screen flow matching the chapter-select style.
 * Step 1: Choose Your Vessel (character portrait)
 * Step 2: Choose Your Movement (hand gesture / keyboard)
 */
import { state } from '../utils/StateManager.js';

export const CharacterSelect = {
  render() {
    return `
      <div class="cs-screen screen">
        <div class="ambient-stars"></div>
        <div class="ambient-glow"></div>

        <button class="back-btn" id="btn-cs-back">Back</button>

        <!-- ══ STEP 1: CHARACTER ══ -->
        <div class="cs-step" id="cs-step-1">
          <h1 class="screen-title" style="animation: fadeInUp 0.5s ease forwards;">
            CHOOSE YOUR VESSEL
          </h1>
          <p class="cs-sub">Who will face the darkness?</p>

          <div class="cs-items">
            <div class="cs-item" data-gender="male" style="animation-delay:0.08s">
              <div class="cs-portrait">
                <canvas class="cs-canvas" id="char-canvas-male"></canvas>
              </div>
              <span class="cs-name">BAYANI</span>
              <span class="cs-tag">Male</span>
            </div>

            <div class="cs-item" data-gender="female" style="animation-delay:0.18s">
              <div class="cs-portrait">
                <canvas class="cs-canvas" id="char-canvas-female"></canvas>
              </div>
              <span class="cs-name">DIWATA</span>
              <span class="cs-tag">Female</span>
            </div>
          </div>
        </div>

        <!-- ══ STEP 2: CONTROL ══ -->
        <div class="cs-step cs-step--hidden" id="cs-step-2">
          <h1 class="screen-title" style="animation: fadeInUp 0.5s ease forwards;">
            CHOOSE YOUR MOVEMENT
          </h1>
          <p class="cs-sub">How will you move through the shadows?</p>

          <div class="cs-items">
            <div class="cs-item cs-item--ctrl" data-control="gesture" style="animation-delay:0.08s">
              <img class="cs-ctrl-icon" src="/assets/ui/hand.png" alt="Hand Gesture" draggable="false" />
              <span class="cs-name">Hand Gesture</span>
              <span class="cs-tag">Camera-based</span>
            </div>

            <div class="cs-item cs-item--ctrl" data-control="keyboard" style="animation-delay:0.18s">
              <img class="cs-ctrl-icon" src="/assets/ui/keyboard.png" alt="Keyboard" draggable="false" />
              <span class="cs-name">Keyboard / D-Pad</span>
              <span class="cs-tag">Arrow keys or touch</span>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  onEnter(el, params) {
    this._params  = params || {};
    this._animIds = [];
    this._gender  = null;

    // ── Back / step navigation ───────────────────────────────────────────────
    const step1 = el.querySelector('#cs-step-1');
    const step2 = el.querySelector('#cs-step-2');
    const backBtn = el.querySelector('#btn-cs-back');

    backBtn.addEventListener('click', () => {
      if (!step2.classList.contains('cs-step--hidden')) {
        // Go back to step 1
        step2.classList.add('cs-step--hidden');
        step1.classList.remove('cs-step--hidden');
      } else {
        window.__screenManager.back();
      }
    });

    // ── Sprite sheet animation ───────────────────────────────────────────────
    const TOTAL_FRAMES = 5;
    const FRAME_MS = 140;

    const startCanvas = (canvasEl, imgEl, frameOffset) => {
      const ctx = canvasEl.getContext('2d');
      let frameIndex = frameOffset;
      let lastTime = 0;
      const fw = imgEl.width / TOTAL_FRAMES;
      const fh = imgEl.height;
      canvasEl.width  = fw;
      canvasEl.height = fh;
      const draw = (idx) => {
        ctx.clearRect(0, 0, fw, fh);
        ctx.drawImage(imgEl, idx * fw, 0, fw, fh, 0, 0, fw, fh);
      };
      draw(frameIndex);
      const animate = (ts) => {
        if (!lastTime) lastTime = ts;
        if (ts - lastTime >= FRAME_MS) {
          frameIndex = (frameIndex + 1) % TOTAL_FRAMES;
          draw(frameIndex);
          lastTime = ts;
        }
        this._animIds.push(requestAnimationFrame(animate));
      };
      this._animIds.push(requestAnimationFrame(animate));
    };

    const img = new Image();
    img.onload = () => {
      startCanvas(el.querySelector('#char-canvas-male'),   img, 0);
      startCanvas(el.querySelector('#char-canvas-female'), img, 2);
    };
    img.src = '/assets/entity/character-icon/a.png';
    if (img.complete && img.naturalWidth) img.onload();

    // ── Step 1: pick character → advance to step 2 ──────────────────────────
    step1.querySelectorAll('.cs-item').forEach(item => {
      item.addEventListener('click', () => {
        this._gender = item.dataset.gender;
        step1.classList.add('cs-step--hidden');
        step2.classList.remove('cs-step--hidden');
      });
    });

    // ── Step 2: pick control → navigate ─────────────────────────────────────
    step2.querySelectorAll('.cs-item').forEach(item => {
      item.addEventListener('click', () => {
        const control = item.dataset.control;

        if (control === 'gesture') {
          const isTrained = state.get('gestureModelTrained') || state.get('gestureSetupComplete');
          if (!isTrained) {
            alert("WARNING: You haven't trained your hand gestures yet!\nPlease complete Gesture Setup first.");
            return;
          }
        }

        const gender = control === 'gesture' ? 'male' : 'female';
        state.set('selectedCharacter', gender);
        const chapterId = this._params.chapterId || 1;
        window.__screenManager.navigate('game-screen', { chapterId, character: gender });
      });
    });
  },

  onLeave() {
    this._animIds.forEach(id => cancelAnimationFrame(id));
    this._animIds = [];
  },
};
