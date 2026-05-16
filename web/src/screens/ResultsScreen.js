import { state } from '../utils/StateManager.js';

export const ResultsScreen = {
  render() {
    const result = state.get('lastGameResult') || { isVictory: false, score: 0, timeSurvived: 0 };
    
    // Format mm:ss
    const m = Math.floor(result.timeSurvived / 60).toString().padStart(2, '0');
    const s = Math.floor(result.timeSurvived % 60).toString().padStart(2, '0');
    
    const isVictory = result.isVictory;
    const isEndless = result.isEndless === true;
    const isInfMode = result.isInfMode === true;
    const wavesSurvived = result.wavesSurvived || 0;
    const chapterLabel = result.chapterId === 1 ? 'CH1' : result.chapterId === 2 ? 'CH2' : 'CH3';

    if (isInfMode) {
      return `
        <div class="results-screen screen results-screen--endless" style="
          position: relative; display: flex; align-items: stretch; background: #000; overflow: hidden;
        ">
          <img id="kill-cam-bg" style="
            position: absolute; inset: 0; width: 100%; height: 100%;
            object-fit: cover; filter: sepia(40%) brightness(0.35) saturate(2) hue-rotate(180deg);
            transform: rotate(-5deg) scale(1.12); transform-origin: center; z-index: 0;
          " />
          <div style="
            position: absolute; inset: 0;
            background: linear-gradient(to right, rgba(0,0,0,0.97) 30%, rgba(0,0,0,0.6) 60%, transparent 100%);
            z-index: 1;
          "></div>
          <div style="
            position: relative; z-index: 2;
            width: clamp(60%, 65%, 70%);
            display: flex; flex-direction: column; justify-content: center;
            padding: clamp(16px,4vw,40px) clamp(16px,3vw,40px) clamp(16px,4vw,40px) clamp(20px,8vw,100px);
          ">
            <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(2.5rem,8vw,5rem); color:#00cfff; line-height:1; letter-spacing:2px; margin-bottom:4px;">∞</div>
            <h1 style="font-family:'GigaSaturn',sans-serif; font-size:clamp(1.4rem,4vw,3rem); color:#00cfff; margin:0 0 clamp(12px,2vh,28px) 0; line-height:1; letter-spacing:2px;">${chapterLabel} NORMAL MODE</h1>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:clamp(12px,2vh,24px);">
              <div style="display:flex; align-items:baseline; gap:0; flex-wrap:wrap;">
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.75rem,1.8vw,1.4rem); color:rgba(255,255,255,0.9); min-width:clamp(120px,18vw,200px); letter-spacing:1px;">WAVES:</span>
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.85rem,2vw,1.6rem); color:#00cfff;">${wavesSurvived}</span>
              </div>
              <div style="display:flex; align-items:baseline; gap:0; flex-wrap:wrap;">
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.75rem,1.8vw,1.4rem); color:rgba(255,255,255,0.9); min-width:clamp(120px,18vw,200px); letter-spacing:1px;">SURVIVED:</span>
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.85rem,2vw,1.6rem); color:white;">${m}:${s}</span>
              </div>
              <div style="display:flex; align-items:baseline; gap:0; flex-wrap:wrap;">
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.75rem,1.8vw,1.4rem); color:rgba(255,255,255,0.9); min-width:clamp(120px,18vw,200px); letter-spacing:1px;">SCORE:</span>
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.85rem,2vw,1.6rem); color:#ffd700;">${result.score.toLocaleString()}</span>
              </div>
            </div>
            <hr style="border:0; border-top:2px solid rgba(0,207,255,0.4); margin:0 0 clamp(12px,3vh,32px) 0; width:60%;">
            <div id="inf-lb-status" style="
              font-family:'VCR',monospace; font-size:clamp(0.7rem,1.5vw,1rem);
              color:rgba(0,207,255,0.8); margin-bottom:clamp(10px,2vh,20px); min-height:1.4em;
            "></div>
            <div style="display:flex; gap:clamp(16px,4vw,60px); align-items:center; flex-wrap:wrap;">
              <button class="menu-btn" id="btn-results-retry" style="
                font-family:'GigaSaturn',sans-serif; font-size:clamp(1rem,2.5vw,2rem);
                padding:0; margin:0; min-width:0; background:transparent; border:none; color:white;
                letter-spacing:2px; min-height:44px; touch-action:manipulation;
              ">RETRY</button>
              <button class="menu-btn" id="btn-results-lb" style="
                font-family:'GigaSaturn',sans-serif; font-size:clamp(1rem,2.5vw,2rem);
                padding:0; margin:0; min-width:0; background:transparent; border:none; color:#00cfff;
                letter-spacing:2px; min-height:44px; touch-action:manipulation;
              ">LEADERBOARD</button>
              <button class="menu-btn" id="btn-results-menu" style="
                font-family:'GigaSaturn',sans-serif; font-size:clamp(1rem,2.5vw,2rem);
                padding:0; margin:0; min-width:0; background:transparent; border:none; color:white;
                letter-spacing:2px; min-height:44px; touch-action:manipulation;
              ">MENU</button>
            </div>
          </div>
        </div>
      `;
    }

    if (isEndless) {
      return `
        <div class="results-screen screen results-screen--endless" style="
          position: relative; display: flex; align-items: stretch; background: #000; overflow: hidden;
        ">
          <img id="kill-cam-bg" style="
            position: absolute; inset: 0; width: 100%; height: 100%;
            object-fit: cover; filter: sepia(80%) brightness(0.4) saturate(1.6) hue-rotate(20deg);
            transform: rotate(-5deg) scale(1.12); transform-origin: center; z-index: 0;
          " />
          <div style="
            position: absolute; inset: 0;
            background: linear-gradient(to right, rgba(0,0,0,0.97) 30%, rgba(0,0,0,0.6) 60%, transparent 100%);
            z-index: 1;
          "></div>
          <a id="btn-download-killcam" href="#" download="bata_takbo_endless.png" style="
            position: absolute; top: 20px; right: 24px; z-index: 10; color: white;
            text-decoration: none; opacity: 0; transition: opacity 0.4s;
          ">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
          <div style="
            position: relative; z-index: 2;
            width: clamp(60%, 65%, 70%);
            display: flex; flex-direction: column; justify-content: center;
            padding: clamp(16px,4vw,40px) clamp(16px,3vw,40px) clamp(16px,4vw,40px) clamp(20px,8vw,100px);
          ">
            <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(2.5rem,8vw,5rem); color:#ffd700; line-height:1; letter-spacing:2px; margin-bottom:4px;">∞</div>
            <h1 style="font-family:'GigaSaturn',sans-serif; font-size:clamp(1.4rem,4vw,3.5rem); color:#ffd700; margin:0 0 clamp(12px,2vh,28px) 0; line-height:1; letter-spacing:2px;">ENDLESS BATTLE</h1>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:clamp(12px,2vh,24px);">
              <div style="display:flex; align-items:baseline; gap:0; flex-wrap:wrap;">
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.75rem,1.8vw,1.4rem); color:rgba(255,255,255,0.9); min-width:clamp(120px,18vw,200px); letter-spacing:1px;">SURVIVED:</span>
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.85rem,2vw,1.6rem); color:white;">${m}:${s}</span>
              </div>
              <div style="display:flex; align-items:baseline; gap:0; flex-wrap:wrap;">
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.75rem,1.8vw,1.4rem); color:rgba(255,255,255,0.9); min-width:clamp(120px,18vw,200px); letter-spacing:1px;">SCORE:</span>
                <span style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.85rem,2vw,1.6rem); color:#ffd700;">${result.score.toLocaleString()}</span>
              </div>
            </div>
            <hr style="border:0; border-top:2px solid rgba(255,215,0,0.5); margin:0 0 clamp(12px,3vh,32px) 0; width:60%;">
            <div id="endless-lb-status" style="
              font-family:'VCR',monospace; font-size:clamp(0.7rem,1.5vw,1rem);
              color:rgba(255,215,0,0.8); margin-bottom:clamp(10px,2vh,20px); min-height:1.4em;
            "></div>
            <div style="display:flex; gap:clamp(16px,4vw,60px); align-items:center; flex-wrap:wrap;">
              <button class="menu-btn" id="btn-results-retry" style="
                font-family:'GigaSaturn',sans-serif; font-size:clamp(1rem,2.5vw,2rem);
                padding:0; margin:0; min-width:0; background:transparent; border:none; color:white;
                letter-spacing:2px; min-height:44px; touch-action:manipulation;
              ">RETRY</button>
              <button class="menu-btn" id="btn-results-lb" style="
                font-family:'GigaSaturn',sans-serif; font-size:clamp(1rem,2.5vw,2rem);
                padding:0; margin:0; min-width:0; background:transparent; border:none; color:#ffd700;
                letter-spacing:2px; min-height:44px; touch-action:manipulation;
              ">LEADERBOARD</button>
              <button class="menu-btn" id="btn-results-menu" style="
                font-family:'GigaSaturn',sans-serif; font-size:clamp(1rem,2.5vw,2rem);
                padding:0; margin:0; min-width:0; background:transparent; border:none; color:white;
                letter-spacing:2px; min-height:44px; touch-action:manipulation;
              ">MENU</button>
            </div>
          </div>
        </div>
      `;
    }

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
            width: clamp(60%, 65%, 70%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: clamp(16px, 4vw, 40px) clamp(16px, 3vw, 40px) clamp(16px, 4vw, 40px) clamp(20px, 8vw, 100px);
          ">
            <!-- Title -->
            <h1 class="results-title" style="
              font-family: 'GigaSaturn', sans-serif;
              font-size: clamp(1.8rem, 6vw, 5.5rem);
              color: #ffd700;
              margin: 0 0 clamp(16px, 3vh, 40px) 0;
              line-height: 1;
              letter-spacing: 2px;
            ">CHAPTER CLEARED</h1>

            <!-- Stats rows -->
            <div class="results-stats" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: clamp(12px, 2vh, 30px);">
              <div style="display: flex; align-items: baseline; gap: 0; flex-wrap: wrap;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.75rem, 1.8vw, 1.4rem); color: rgba(255,255,255,0.9); min-width: clamp(120px, 18vw, 200px); letter-spacing: 1px;">SURVIVAL TIME:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.85rem, 2vw, 1.6rem); color: white;">${m}:${s}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0; flex-wrap: wrap;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.75rem, 1.8vw, 1.4rem); color: rgba(255,255,255,0.9); min-width: clamp(120px, 18vw, 200px); letter-spacing: 1px;">TOTAL SCORE:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.85rem, 2vw, 1.6rem); color: #ffd700;">${result.score.toLocaleString()}</span>
              </div>
            </div>

            <!-- Ch3 completion: bonus level unlock banner -->
            ${result.chapterId === 3 ? `
            <div style="
              display: flex; align-items: center; gap: 10px;
              margin-bottom: clamp(10px, 2vh, 20px);
              padding: 10px 14px;
              background: rgba(255,215,0,0.08);
              border: 1px solid rgba(255,215,0,0.35);
              border-radius: 4px;
              max-width: clamp(260px, 45vw, 440px);
            ">
              <span style="font-size: clamp(1.4rem,3vw,2rem); line-height:1;">∞</span>
              <div>
                <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.6rem,1.4vw,1rem); color:#ffd700; letter-spacing:2px;">BONUS LEVEL UNLOCKED</div>
                <div style="font-family:'VCR',monospace; font-size:clamp(0.5rem,1.1vw,0.8rem); color:rgba(255,255,255,0.55); margin-top:2px;">WALANG KATAPUSAN · ENDLESS BATTLE</div>
              </div>
            </div>` : ''}

            <!-- Separator -->
            <hr class="results-separator" style="border: 0; border-top: 2px solid rgba(255,215,0,0.5); margin: 0 0 clamp(12px, 3vh, 40px) 0; width: 60%;">

            <!-- Action buttons -->
            <div class="results-actions" style="display: flex; gap: clamp(16px, 4vw, 60px); align-items: center; flex-wrap: wrap;">
              ${result.chapterId < 3 ? `<button class="menu-btn" id="btn-results-next" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: clamp(1rem, 2.5vw, 2rem);
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: #ffd700;
                letter-spacing: 2px; min-height: 44px; touch-action: manipulation;
              ">NEXT</button>` : ''}
              <button class="menu-btn" id="btn-results-retry" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: clamp(1rem, 2.5vw, 2rem);
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px; min-height: 44px; touch-action: manipulation;
              ">RETRY</button>
              <button class="menu-btn" id="btn-results-menu" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: clamp(1rem, 2.5vw, 2rem);
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px; min-height: 44px; touch-action: manipulation;
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
            width: clamp(60%, 65%, 70%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: clamp(16px, 4vw, 40px) clamp(16px, 3vw, 40px) clamp(16px, 4vw, 40px) clamp(20px, 8vw, 100px);
          ">
            <!-- GAME OVER title -->
            <h1 class="results-title" style="
              font-family: 'GigaSaturn', sans-serif;
              font-size: clamp(2rem, 8vw, 7.5rem);
              color: white;
              margin: 0 0 clamp(16px, 3vh, 40px) 0;
              line-height: 1;
              letter-spacing: 2px;
            ">GAME OVER</h1>

            <!-- Stats rows -->
            <div class="results-stats" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: clamp(12px, 2vh, 30px);">
              <div style="display: flex; align-items: baseline; gap: 0; flex-wrap: wrap;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.75rem, 1.8vw, 1.4rem); color: rgba(255,255,255,0.9); min-width: clamp(120px, 18vw, 200px); letter-spacing: 1px;">SURVIVAL TIME:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.85rem, 2vw, 1.6rem); color: white;">${m}:${s}</span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 0; flex-wrap: wrap;">
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.75rem, 1.8vw, 1.4rem); color: rgba(255,255,255,0.9); min-width: clamp(120px, 18vw, 200px); letter-spacing: 1px;">TOTAL SCORE:</span>
                <span style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.85rem, 2vw, 1.6rem); color: white;">${result.score.toLocaleString()}</span>
              </div>
            </div>

            <!-- Separator -->
            <hr class="results-separator" style="border: 0; border-top: 2px solid rgba(255,255,255,0.5); margin: 0 0 clamp(12px, 3vh, 40px) 0; width: 60%;">

            <!-- Action buttons -->
            <div class="results-actions" style="display: flex; gap: clamp(16px, 4vw, 60px); align-items: center; flex-wrap: wrap;">
              <button class="menu-btn" id="btn-results-retry" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: clamp(1rem, 2.5vw, 2rem);
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px; min-height: 44px; touch-action: manipulation;
              ">RETRY</button>
              <button class="menu-btn" id="btn-results-menu" style="
                font-family: 'GigaSaturn', sans-serif;
                font-size: clamp(1rem, 2.5vw, 2rem);
                padding: 0; margin: 0; min-width: 0;
                background: transparent; border: none; color: white;
                letter-spacing: 2px; min-height: 44px; touch-action: manipulation;
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
    const isEndless = result.isEndless === true;
    const isInfMode = result.isInfMode === true;

    if (isInfMode) {
      el.querySelector('#btn-results-retry').addEventListener('click', () => {
        window.__screenManager.navigate('game-screen', { chapterId: result.chapterId, character: result.character || 'male', control: result.control || 'keyboard', isInfMode: true });
      });
      el.querySelector('#btn-results-menu').addEventListener('click', () => {
        window.__screenManager.navigate('main-menu');
      });
      const lbBtn = el.querySelector('#btn-results-lb');
      if (lbBtn) lbBtn.addEventListener('click', () => window.__screenManager.navigate('leaderboard'));
      this._submitInfScore(el, result);
      this.generateCollage(el, false);
      return;
    }

    if (isEndless) {
      // Wire endless buttons
      el.querySelector('#btn-results-retry').addEventListener('click', () => {
        window.__screenManager.navigate('game-screen', { chapterId: 4, character: result.character || 'male', control: result.control || 'keyboard' });
      });
      el.querySelector('#btn-results-menu').addEventListener('click', () => {
        window.__screenManager.navigate('main-menu');
      });
      const lbBtn = el.querySelector('#btn-results-lb');
      if (lbBtn) {
        lbBtn.addEventListener('click', () => {
          window.__screenManager.navigate('leaderboard');
        });
      }

      // Submit score to leaderboard if registered user
      this._submitEndlessScore(el, result);

      // Generate collage for background
      this.generateCollage(el, false);
      return;
    }

    // Trigger screen entrance animation
    const screen = el.querySelector('.results-screen');
    if (screen) {
      screen.classList.remove('victory-enter', 'gameover-enter');
      void screen.offsetWidth;
      screen.classList.add(isVictory ? 'victory-enter' : 'gameover-enter');
    }

    const btnNext = el.querySelector('#btn-results-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        window.__screenManager.navigate('game-screen', { chapterId: result.chapterId + 1, character: result.character || 'male', control: result.control || 'keyboard' });
      });
    }

    el.querySelector('#btn-results-retry').addEventListener('click', () => {
      window.__screenManager.navigate('game-screen', { chapterId: result.chapterId, character: result.character || 'male', control: result.control || 'keyboard' });
    });

    el.querySelector('#btn-results-menu').addEventListener('click', () => {
      window.__screenManager.navigate('main-menu');
    });

    // Always generate collage (both victory and game over)
    this.generateCollage(el, isVictory);
  },

  async _submitInfScore(el, result) {
    const statusEl = el.querySelector('#inf-lb-status');
    if (!state.get('isAuthenticated')) {
      if (statusEl) statusEl.textContent = 'Sign in to submit your score to the Normal Mode leaderboard!';
      return;
    }
    if (statusEl) statusEl.textContent = 'Submitting score...';
    const controlType = result.control === 'gesture' ? 'gesture' : 'keyboard';
    try {
      const res = await fetch('/leaderboard/inf', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: result.chapterId,
          score: result.score,
          wavesSurvived: result.wavesSurvived || 0,
          survivalSeconds: result.timeSurvived,
          controlType
        })
      });
      if (res.ok) {
        if (statusEl) statusEl.textContent = '✓ Score submitted to Normal Mode leaderboard!';
      } else {
        if (statusEl) statusEl.textContent = 'Could not submit score.';
      }
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Offline — score not submitted.';
    }
  },

  async _submitEndlessScore(el, result) {
    const statusEl = el.querySelector('#endless-lb-status');

    // Only registered (non-guest) users can submit
    if (!state.get('isAuthenticated')) {
      if (statusEl) statusEl.textContent = 'Sign in to submit your score to the leaderboard!';
      return;
    }

    if (statusEl) statusEl.textContent = 'Submitting score...';

    const controlType = result.control === 'gesture' ? 'gesture' : 'keyboard';

    try {
      const res = await fetch('/leaderboard/endless', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survivalSeconds: result.timeSurvived, controlType })
      });
      if (res.ok) {
        if (statusEl) statusEl.textContent = '✓ Score submitted to leaderboard!';
      } else {
        if (statusEl) statusEl.textContent = 'Could not submit score.';
      }
    } catch (e) {
      if (statusEl) statusEl.textContent = 'Offline — score not submitted.';
    }
  },

  generateCollage(el, isVictory = false) {
    const imagesSrc = state.get('killCamImages') || [];
    const bgImg = el.querySelector('#kill-cam-bg');
    const dlBtn = el.querySelector('#btn-download-killcam');

    if (imagesSrc.length === 0) {
      if (bgImg) bgImg.src = '/assets/ui/backgrounds/login_background.png';
      return;
    }

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

