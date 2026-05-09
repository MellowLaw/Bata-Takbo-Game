/**
 * CharacterSelect — Modal screen to pick Male (gesture) or Female (keyboard/d-pad) before a chapter
 */
import { state } from '../utils/StateManager.js';

export const CharacterSelect = {
  render() {
    return `
      <div class="char-select-overlay screen">
        <div class="char-select-modal">
          <h1 class="char-select-title">CHOOSE YOUR CHARACTER</h1>
          <p class="char-select-subtitle">Your choice affects how you control your hero.</p>

          <div class="char-select-cards">

            <!-- MALE -->
            <div class="char-card" id="char-card-male" data-gender="male">
              <div class="char-card__portrait">
                <canvas class="char-card__canvas" id="char-canvas-male"></canvas>
              </div>
              <div class="char-card__info">
                <span class="char-card__name">BAYANI</span>
                <span class="char-card__gender-tag">MALE</span>
                <div class="char-card__control-badge">
                  <span class="char-card__control-icon">✋</span>
                  <span class="char-card__control-label">Hand Gesture</span>
                </div>
              </div>
              <div class="char-card__select-btn">SELECT</div>
            </div>

            <!-- FEMALE -->
            <div class="char-card" id="char-card-female" data-gender="female">
              <div class="char-card__portrait">
                <canvas class="char-card__canvas" id="char-canvas-female"></canvas>
              </div>
              <div class="char-card__info">
                <span class="char-card__name">DIWATA</span>
                <span class="char-card__gender-tag">FEMALE</span>
                <div class="char-card__control-badge">
                  <span class="char-card__control-icon">⌨️</span>
                  <span class="char-card__control-label">Keyboard / D-Pad</span>
                </div>
              </div>
              <div class="char-card__select-btn">SELECT</div>
            </div>

          </div>

          <button class="back-btn char-select-back" id="btn-char-back">Back</button>
        </div>
      </div>
    `;
  },

  onEnter(el, params) {
    this._params = params || {};
    this._animIds = [];

    el.querySelector('#btn-char-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // ── Sprite sheet setup ──────────────────────────────────────────────────
    // a.png: 5 frames laid out horizontally in a single row
    const TOTAL_FRAMES = 5;
    const FRAME_MS = 140; // ~7 fps — slow idle blink/breathe feel

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
      startCanvas(el.querySelector('#char-canvas-male'),   img, 0); // frame 0
      startCanvas(el.querySelector('#char-canvas-female'), img, 2); // frame 2
    };
    img.src = '/assets/entity/character-icon/a.png';

    // Image already cached (e.g. hot-reload)
    if (img.complete && img.naturalWidth) img.onload();

    // ── Card click ──────────────────────────────────────────────────────────
    el.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', () => {
        const gender = card.dataset.gender;
        state.set('selectedCharacter', gender);

        const chapterId = this._params.chapterId || 1;

        if (gender === 'male') {
          const isTrained = state.get('gestureModelTrained');
          if (!isTrained) {
            alert("WARNING: You haven't trained your hand gestures yet!\nPlease complete Gesture Setup first before playing as the Male character.");
            return;
          }
        }

        window.__screenManager.navigate('game-screen', { chapterId, character: gender });
      });
    });
  },

  onLeave() {
    // Cancel all running animation frames
    this._animIds.forEach(id => cancelAnimationFrame(id));
    this._animIds = [];
  },
};
