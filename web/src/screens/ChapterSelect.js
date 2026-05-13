/**
 * ChapterSelect — Chapter selection screen with tarot card flip mechanic
 */
import { state } from '../utils/StateManager.js';

export const ChapterSelect = {
  render() {
    const progress = state.get('chapterProgress') || {};
    const unlocked = progress.chaptersUnlocked || [1];
    const completed = progress.chaptersCompleted || [];

    const chapters = [
      { id: 1, img: '/assets/ui/chapter-selection/chapter1.png', idle: '/assets/ui/chapter-selection/chapter-select-idle/chapter1_idle.png', cover: '/assets/ui/chapter-selection/chapter1a.png', name: 'Duende' },
      { id: 2, img: '/assets/ui/chapter-selection/chapter2.png', idle: '/assets/ui/chapter-selection/chapter-select-idle/chapter2_idle.png', cover: '/assets/ui/chapter-selection/chapter2a.png', name: 'Bungisngis' },
      { id: 3, img: '/assets/ui/chapter-selection/chapter3.png', idle: '/assets/ui/chapter-selection/chapter-select-idle/chapter3_idle.png', cover: '/assets/ui/chapter-selection/chapter3a.png', name: 'Kataw' },
    ];

    const cardsHtml = chapters.map((ch, i) => {
      const isUnlocked = unlocked.includes(ch.id);
      const isCompleted = completed.includes(ch.id);
      const frontImg = isUnlocked ? ch.img : '/assets/ui/chapter-selection/chapter-front.png';
      const idleImg = isUnlocked ? ch.idle : null;
      const backImg = isCompleted ? ch.cover : '/assets/ui/chapter-selection/chapter-back.png';

      return `
        <div class="ch-flip-wrapper ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}"
             data-chapter="${ch.id}"
             style="animation-delay: ${i * 0.12}s">
          <div class="ch-flip-inner">
            <div class="ch-face ch-face--back">
              <img src="${backImg}" alt="Chapter ${ch.id}" />
            </div>
            <div class="ch-face ch-face--front">
              <img class="ch-front-static" src="${frontImg}" alt="${ch.name}" />
              ${isUnlocked ? `<canvas class="ch-front-idle-canvas" data-idle="${idleImg}"></canvas>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="chapter-select screen">
        <div class="ambient-stars"></div>
        <div class="ambient-glow"></div>
        <button class="back-btn" id="btn-ch-back">Back</button>

        <h1 class="screen-title" style="animation: fadeInUp 0.5s ease forwards;">
          BARAHA NG KATOTOHANAN
        </h1>

        <p class="ch-hint" id="ch-tap-hint">Ipakita ang hinaharap &nbsp;·&nbsp; at huwag kang kukurap.</p>

        <div class="chapter-select__cards">
          ${cardsHtml}
        </div>
      </div>
    `;
  },

  onEnter(el) {
    this._rafIds = [];

    // Back button
    el.querySelector('#btn-ch-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Card interactions - click navigates to game (CSS :hover handles flip)
    el.querySelectorAll('.ch-flip-wrapper.unlocked').forEach(card => {
      const canvas = card.querySelector('.ch-front-idle-canvas');
      let animationId = null;
      let frameIndex = 0;
      let lastFrameTime = 0;
      const FRAME_DURATION = 70;
      const TOTAL_FRAMES = 100;
      const COLS = 11;
      const ROWS = 10;

      // Hoist img/animate to card scope so click handler can always reference them
      let img = null;
      let animate = null;
      let drawFrame = null;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        img = new Image();
        img.src = canvas.dataset.idle;
        img.onload = () => {
          // Set canvas size to match single frame size (not compressed)
          const frameWidth = img.width / COLS;
          const frameHeight = img.height / ROWS;
          canvas.width = frameWidth;
          canvas.height = frameHeight;
          // Pre-render first frame
          drawFrame(0);
        };

        drawFrame = (idx) => {
          const col = idx % COLS;
          const row = Math.floor(idx / COLS);
          const fw = img.width / COLS;
          const fh = img.height / ROWS;
          const sx = col * fw;
          const sy = row * fh;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, sx, sy, fw, fh, 0, 0, canvas.width, canvas.height);
        };

        animate = (timestamp) => {
          if (!lastFrameTime) lastFrameTime = timestamp;
          const elapsed = timestamp - lastFrameTime;

          if (elapsed >= FRAME_DURATION) {
            frameIndex = (frameIndex + 1) % TOTAL_FRAMES;
            drawFrame(frameIndex);
            lastFrameTime = timestamp;
          }

          animationId = requestAnimationFrame(animate);
        };

        // Start animation on hover (after flip completes), stop on leave
        card.addEventListener('mouseenter', () => {
          if (img.complete) {
            // Wait for flip to complete (600ms), then start animating
            setTimeout(() => {
              if (!this._rafIds) return;
              lastFrameTime = 0;
              animationId = requestAnimationFrame(animate);
              this._rafIds.push(animationId);
            }, 600);
          }
        });

        card.addEventListener('mouseleave', () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
            this._rafIds = this._rafIds ? this._rafIds.filter(id => id !== animationId) : [];
            animationId = null;
          }
          frameIndex = 0;
          if (img.complete) drawFrame(0);
        });
      }

      const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

      card.addEventListener('click', () => {
        const chapterId = parseInt(card.dataset.chapter);

        if (isTouchDevice()) {
          // Mobile: first tap flips, second tap navigates
          if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
            // Hide hint once any card is flipped
            const hint = document.getElementById('ch-tap-hint');
            if (hint) hint.style.opacity = '0';
            // Start idle animation after flip completes
            if (canvas && img && img.complete && animate) {
              setTimeout(() => {
                if (!this._rafIds) return;
                lastFrameTime = 0;
                animationId = requestAnimationFrame(animate);
                this._rafIds.push(animationId);
              }, 650);
            }
          } else {
            window.__screenManager.navigate('mode-select', { chapterId });
          }
        } else {
          // Desktop: hover flips, click navigates immediately
          window.__screenManager.navigate('mode-select', { chapterId });
        }
      });
    });

    // Locked cards - no click handler (can't be clicked)
  },

  onLeave() {
    if (this._rafIds) {
      this._rafIds.forEach(id => cancelAnimationFrame(id));
      this._rafIds = null;
    }
  },
};
