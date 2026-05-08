import { state } from '../utils/StateManager.js';

export const ResultsScreen = {
  render() {
    const result = state.get('lastGameResult') || { isVictory: false, score: 0, timeSurvived: 0 };
    
    // Format mm:ss
    const m = Math.floor(result.timeSurvived / 60).toString().padStart(2, '0');
    const s = (result.timeSurvived % 60).toString().padStart(2, '0');
    
    const isVictory = result.isVictory;

    return `
      <div class="results-screen screen" style="
        position: relative;
        display: flex; 
        align-items: stretch; 
        background: #000;
        overflow: hidden;
      ">

        ${isVictory ? `
          <!-- Victory Layout: Kill Cam as full BG (warm gold tint), stats panel on left -->

          <!-- Full-screen kill cam background (gold/sepia tint) -->
          <img id="kill-cam-bg" style="
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            filter: sepia(60%) brightness(0.5) saturate(1.4);
            transform: rotate(-5deg) scale(1.12);
            transform-origin: center;
            z-index: 0;
          " />

          <!-- Dark gradient overlay: heavy on left, transparent on right -->
          <div style="
            position: absolute; inset: 0;
            background: linear-gradient(to right, rgba(0,0,0,0.97) 30%, rgba(0,0,0,0.6) 60%, transparent 100%);
            z-index: 1;
          "></div>

          <!-- Download button — top right -->
          <a id="btn-download-killcam" href="#" download="bata_takbo_victory.png" style="
            position: absolute;
            top: 20px; right: 24px;
            z-index: 10;
            color: white;
            text-decoration: none;
            opacity: 0;
            transition: opacity 0.4s;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>

          <!-- Left stats panel -->
          <div style="
            position: relative;
            z-index: 2;
            width: 55%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 40px 0 100px;
          ">
            <!-- Title -->
            <h1 class="results-title" style="
              font-family: 'GigaSaturn', sans-serif;
              font-size: 5.5rem;
              color: #ffd700;
              margin: 0 0 40px 0;
              line-height: 1;
              letter-spacing: 2px;
            ">CHAPTER CLEARED</h1>

            <!-- Stats rows -->
            <div class="results-stats" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 30px;">
              <div style="display: flex; align-items: baseline; gap: 0;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.4rem; color: rgba(255,255,255,0.9); width: 200px; letter-spacing: 1px;">SURVIVAL TIME:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.6rem; color: white;">${m}:${s}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.4rem; color: rgba(255,255,255,0.9); width: 200px; letter-spacing: 1px;">TOTAL SCORE:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.6rem; color: #ffd700;">${result.score.toLocaleString()}</span>
              </div>
            </div>

            <!-- Separator -->
            <hr class="results-separator" style="border: 0; border-top: 2px solid rgba(255,215,0,0.5); margin: 0 0 40px 0; width: 60%;">

            <!-- Action buttons -->
            <div class="results-actions" style="display: flex; gap: 60px; align-items: center;">
              ${result.chapterId < 3 ? `<button class="menu-btn" id="btn-results-next" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: 2rem;
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: #ffd700;
                letter-spacing: 2px;
              ">NEXT</button>` : ''}
              <button class="menu-btn" id="btn-results-retry" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: 2rem;
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px;
              ">RETRY</button>
              <button class="menu-btn" id="btn-results-menu" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: 2rem;
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px;
              ">MENU</button>
            </div>
          </div>
        ` : `
          <!-- Game Over Layout: Kill Cam as full BG (B&W), stats panel on left -->

          <!-- Full-screen B&W collage background -->
          <img id="kill-cam-bg" style="
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            filter: grayscale(100%) brightness(0.55);
            transform: rotate(-5deg) scale(1.12);
            transform-origin: center;
            z-index: 0;
          " />

          <!-- Dark gradient overlay: heavy on left, transparent on right -->
          <div style="
            position: absolute; inset: 0;
            background: linear-gradient(to right, rgba(0,0,0,0.97) 30%, rgba(0,0,0,0.6) 60%, transparent 100%);
            z-index: 1;
          "></div>

          <!-- Download button — top right -->
          <a id="btn-download-killcam" href="#" download="bata_takbo_killcam.png" style="
            position: absolute;
            top: 20px; right: 24px;
            z-index: 10;
            color: white;
            text-decoration: none;
            opacity: 0;
            transition: opacity 0.4s;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>

          <!-- Left stats panel -->
          <div style="
            position: relative;
            z-index: 2;
            width: 55%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 40px 0 100px;
          ">
            <!-- GAME OVER title -->
            <h1 class="results-title" style="
              font-family: 'GigaSaturn', sans-serif;
              font-size: 7.5rem;
              color: white;
              margin: 0 0 40px 0;
              line-height: 1;
              letter-spacing: 2px;
            ">GAME OVER</h1>

            <!-- Stats rows -->
            <div class="results-stats" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 30px;">
              <div style="display: flex; align-items: baseline; gap: 0;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.4rem; color: rgba(255,255,255,0.9); width: 200px; letter-spacing: 1px;">SURVIVAL TIME:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.6rem; color: white;">${m}:${s}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.4rem; color: rgba(255,255,255,0.9); width: 200px; letter-spacing: 1px;">TOTAL SCORE:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: 1.6rem; color: white;">${result.score.toLocaleString()}</span>
              </div>
            </div>

            <!-- Separator -->
            <hr class="results-separator" style="border: 0; border-top: 2px solid rgba(255,255,255,0.5); margin: 0 0 40px 0; width: 60%;">

            <!-- Action buttons -->
            <div class="results-actions" style="display: flex; gap: 60px; align-items: center;">
              <button class="menu-btn" id="btn-results-retry" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: 2rem;
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px;
              ">RETRY</button>
              <button class="menu-btn" id="btn-results-menu" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: 2rem;
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px;
              ">MENU</button>
            </div>
          </div>
        `}
      </div>
    `;
  },

  onEnter(el) {
    const result = state.get('lastGameResult') || { chapterId: 1, isVictory: false };
    const isVictory = result.isVictory;

    // Trigger screen entrance animation
    const screen = el.querySelector('.results-screen');
    if (screen) {
      // Force reflow to ensure animation always replays
      screen.classList.remove('victory-enter', 'gameover-enter');
      void screen.offsetWidth;
      screen.classList.add(isVictory ? 'victory-enter' : 'gameover-enter');
    }

    const btnNext = el.querySelector('#btn-results-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        window.__screenManager.navigate('game-screen', { chapterId: result.chapterId + 1 });
      });
    }

    el.querySelector('#btn-results-retry').addEventListener('click', () => {
      window.__screenManager.navigate('game-screen', { chapterId: result.chapterId });
    });

    el.querySelector('#btn-results-menu').addEventListener('click', () => {
      window.__screenManager.navigate('main-menu');
    });

    // Always generate collage (both victory and game over)
    this.generateCollage(el, isVictory);
  },

  generateCollage(el, isVictory = false) {
    const imagesSrc = state.get('killCamImages') || [];
    const bgImg = el.querySelector('#kill-cam-bg');
    const dlBtn = el.querySelector('#btn-download-killcam');

    if (imagesSrc.length === 0) return;

    const loadPromises = imagesSrc.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    });

    const overlayPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = '/assets/ui/killcam_overlay.png';
    });

    Promise.all([Promise.all(loadPromises), overlayPromise]).then(([images, overlayImg]) => {
      const w = 400, h = 300;

      // --- Canvas 1: full-color base collage (no overlay) for BG display ---
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = w * 2;
      baseCanvas.height = h * 2;
      const baseCtx = baseCanvas.getContext('2d');
      baseCtx.fillStyle = '#000';
      baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

      const positions = [{x:0,y:0},{x:w,y:0},{x:0,y:h},{x:w,y:h}];
      if (images.length === 1) {
        baseCtx.drawImage(images[0], 0, 0, baseCanvas.width, baseCanvas.height);
      } else {
        images.forEach((img, i) => {
          if (i < 4) baseCtx.drawImage(img, positions[i].x, positions[i].y, w, h);
        });
      }

      // Set the B&W background (CSS grayscale handles the look on screen)
      bgImg.src = baseCanvas.toDataURL('image/png');

      // --- Canvas 2: full-color collage + overlay for download ---
      const dlCanvas = document.createElement('canvas');
      dlCanvas.width = baseCanvas.width;
      dlCanvas.height = baseCanvas.height;
      const dlCtx = dlCanvas.getContext('2d');
      dlCtx.drawImage(baseCanvas, 0, 0);
      if (overlayImg) {
        dlCtx.drawImage(overlayImg, 0, 0, dlCanvas.width, dlCanvas.height);
      }

      dlBtn.href = dlCanvas.toDataURL('image/png');
      dlBtn.style.opacity = '1';
    });
  }
};

