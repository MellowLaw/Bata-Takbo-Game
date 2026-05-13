/**
 * ModeSelect — Choose between Normal and INF mode for a chapter.
 * Uses the same flip-card mechanic as ChapterSelect.
 * Flow: ChapterSelect → ModeSelect → CharacterSelect
 */
import { state } from '../utils/StateManager.js';

export const ModeSelect = {
  render(params = {}) {
    const chapterId = params.chapterId || 1;
    const progress = state.get('chapterProgress') || {};
    const completed = progress.chaptersCompleted || [];
    const chapterCleared = completed.includes(chapterId);

    return `
      <div class="chapter-select screen" id="mode-select-screen">
        <div class="ambient-stars"></div>
        <div class="ambient-glow"></div>
        <button class="back-btn" id="btn-ms-back">Back</button>

        <h1 class="screen-title" style="animation: fadeInUp 0.5s ease forwards;">
          PILIIN ANG LABAN
        </h1>
        <p class="ch-hint">Pumili ng iyong landas &nbsp;·&nbsp; normal o walang katapusan.</p>

        <div class="chapter-select__cards" style="justify-content: center;">

          <!-- NORMAL MODE CARD -->
          <div class="ch-flip-wrapper unlocked" id="ms-card-normal" style="animation-delay: 0.08s">
            <div class="ch-flip-inner">
              <div class="ch-face ch-face--back">
                <img src="/assets/ui/chapter-selection/chapter-back.png" alt="Normal" />
              </div>
              <div class="ch-face ch-face--front" style="
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; gap: 10px; background: #1a1208;
              ">
                <img src="/assets/ui/chapter-selection/chapter-front.png" alt="Normal Mode"
                  style="width: 80%; height: 60%; object-fit: contain;" />
                <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.9rem,2vw,1.3rem); color:#ffd700; letter-spacing:2px; text-align:center;">NORMAL</div>
                <div style="font-family:'VCR',monospace; font-size:clamp(0.55rem,1.2vw,0.8rem); color:rgba(255,255,255,0.6); text-align:center; padding: 0 8px;">
                  Talunin ang boss<br>at i-clear ang chapter
                </div>
              </div>
            </div>
          </div>

          <!-- INF MODE CARD -->
          <div class="ch-flip-wrapper ${chapterCleared ? 'unlocked' : 'locked'}" id="ms-card-inf" style="animation-delay: 0.2s">
            <div class="ch-flip-inner">
              <div class="ch-face ch-face--back">
                <img src="/assets/ui/chapter-selection/chapter-back.png" alt="INF" />
              </div>
              <div class="ch-face ch-face--front" style="
                display: flex; flex-direction: column; align-items: center;
                justify-content: center; gap: 10px; background: #0a0a1a;
              ">
                ${chapterCleared ? `
                  <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(2rem,5vw,3.5rem); color:#00cfff; line-height:1;">∞</div>
                  <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(0.9rem,2vw,1.3rem); color:#00cfff; letter-spacing:2px; text-align:center;">INF MODE</div>
                  <div style="font-family:'VCR',monospace; font-size:clamp(0.55rem,1.2vw,0.8rem); color:rgba(255,255,255,0.6); text-align:center; padding: 0 8px;">
                    Survive forever<br>Leaderboard · Speed scales up
                  </div>
                ` : `
                  <div style="font-family:'GigaSaturn',sans-serif; font-size:clamp(1.5rem,3vw,2.5rem); color:rgba(255,255,255,0.3); line-height:1;">🔒</div>
                  <div style="font-family:'VCR',monospace; font-size:clamp(0.55rem,1.2vw,0.8rem); color:rgba(255,255,255,0.35); text-align:center; padding: 0 8px;">
                    I-clear muna ang chapter<br>para ma-unlock
                  </div>
                `}
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  onEnter(el, params = {}) {
    this._params = params;
    const chapterId = params.chapterId || 1;

    el.querySelector('#btn-ms-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

    const navigate = (isInfMode) => {
      window.__screenManager.navigate('character-select', { chapterId, isInfMode });
    };

    // Normal card
    const normalCard = el.querySelector('#ms-card-normal');
    normalCard.addEventListener('click', () => {
      if (isTouchDevice()) {
        if (!normalCard.classList.contains('flipped')) {
          normalCard.classList.add('flipped');
        } else {
          navigate(false);
        }
      } else {
        navigate(false);
      }
    });

    // INF card (only if unlocked)
    const infCard = el.querySelector('#ms-card-inf');
    if (infCard.classList.contains('unlocked')) {
      infCard.addEventListener('click', () => {
        if (isTouchDevice()) {
          if (!infCard.classList.contains('flipped')) {
            infCard.classList.add('flipped');
          } else {
            navigate(true);
          }
        } else {
          navigate(true);
        }
      });
    }
  },

  onLeave() {},
};
