/**
 * ChapterSelect — Chapter selection screen with tarot card flip mechanic
 */
import { state } from '../utils/StateManager.js';

export const ChapterSelect = {
  render() {
    const progress = state.get('chapterProgress') || {};
    const unlocked = progress.chaptersUnlocked || [1];

    const chapters = [
      { id: 1, img: '/assets/ui/chapter-selection/chapter1.png', idle: '/assets/ui/chapter-selection/chapter-select-idle/chapter1_idle.png', name: 'Duende' },
      { id: 2, img: '/assets/ui/chapter-selection/chapter2.png', idle: '/assets/ui/chapter-selection/chapter-select-idle/chapter2_idle.png', name: 'Bungisngis' },
      { id: 3, img: '/assets/ui/chapter-selection/chapter3.png', idle: '/assets/ui/chapter-selection/chapter-select-idle/chapter3_idle.png', name: 'Kataw' },
    ];

    const cardsHtml = chapters.map((ch, i) => {
      const isUnlocked = unlocked.includes(ch.id);
      const frontImg = isUnlocked ? ch.img : '/assets/ui/chapter-selection/chapter-front.png';
      const idleImg = isUnlocked ? ch.idle : null;

      return `
        <div class="ch-flip-wrapper ${isUnlocked ? 'unlocked' : 'locked'}"
             data-chapter="${ch.id}"
             style="animation-delay: ${i * 0.12}s">
          <div class="ch-flip-inner">
            <!-- BACK face (tarot card back - default visible) -->
            <div class="ch-face ch-face--back">
              <img src="/assets/ui/chapter-selection/chapter-back.png" alt="Chapter Back" />
            </div>
            <!-- FRONT face (chapter image + idle spritesheet) -->
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
          SELECT CHAPTER
        </h1>

        <div class="chapter-select__cards">
          ${cardsHtml}
        </div>
      </div>
    `;
  },

  onEnter(el) {
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
      const FRAME_DURATION = 70; // ms per frame (12.5 fps - smooth but not too fast)
      const TOTAL_FRAMES = 100; // Only animate first 100 frames (10x10), skip empty ones
      const COLS = 11;
      const ROWS = 10;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
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

        function drawFrame(idx) {
          const col = idx % COLS;
          const row = Math.floor(idx / COLS);
          const fw = img.width / COLS;
          const fh = img.height / ROWS;
          const sx = col * fw;
          const sy = row * fh;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Draw at native resolution - no stretching
          ctx.drawImage(img, sx, sy, fw, fh, 0, 0, canvas.width, canvas.height);
        }

        function animate(timestamp) {
          if (!lastFrameTime) lastFrameTime = timestamp;
          const elapsed = timestamp - lastFrameTime;

          if (elapsed >= FRAME_DURATION) {
            frameIndex = (frameIndex + 1) % TOTAL_FRAMES;
            drawFrame(frameIndex);
            lastFrameTime = timestamp;
          }

          animationId = requestAnimationFrame(animate);
        }

        // Start animation on hover (after flip completes), stop on leave
        card.addEventListener('mouseenter', () => {
          if (img.complete) {
            // Wait for flip to complete (600ms), then start animating
            setTimeout(() => {
              lastFrameTime = 0;
              animationId = requestAnimationFrame(animate);
            }, 600);
          }
        });

        card.addEventListener('mouseleave', () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
          frameIndex = 0;
          if (img.complete) drawFrame(0);
        });
      }

      card.addEventListener('click', () => {
        const chapterId = parseInt(card.dataset.chapter);
        window.__screenManager.navigate('character-select', { chapterId });
      });
    });

    // Locked cards - no click handler (can't be clicked)

  },
};
