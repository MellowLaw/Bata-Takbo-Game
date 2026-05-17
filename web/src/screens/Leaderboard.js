/**
 * Leaderboard — Endless Battle global leaderboard
 * Two boards: Hand Gesture control vs D-Pad/Keyboard control
 */
import { state } from '../utils/StateManager.js';

export const Leaderboard = {
  render() {
    return `
      <div class="leaderboard-screen screen">
        <button class="back-btn" id="btn-lb-back">Back</button>

        <h1 class="screen-title" style="animation: fadeInUp 0.4s ease forwards;">
          Leaderboard
        </h1>

        <p class="lb-subtitle" style="
          text-align: center;
          font-family: var(--font-display);
          font-size: var(--text-xs);
          color: rgba(255,215,0,0.7);
          letter-spacing: 2px;
          margin: 0 0 var(--space-md) 0;
          animation: fadeInUp 0.4s ease 0.08s forwards; opacity: 0;
        ">ENDLESS BATTLE &nbsp;·&nbsp; WALANG KATAPUSAN</p>

        <div class="leaderboard-tabs" style="animation: fadeInUp 0.4s ease 0.1s forwards; opacity: 0;">
          <button class="leaderboard-tab active" data-control="keyboard" id="tab-keyboard">
            <span class="lb-tab-icon">🎮</span> D-Pad / Keyboard
          </button>
          <button class="leaderboard-tab" data-control="gesture" id="tab-gesture">
            <span class="lb-tab-icon">✋</span> Hand Gesture
          </button>
        </div>

        <div class="leaderboard-list scrollable" id="leaderboard-list" style="animation: fadeInUp 0.4s ease 0.18s forwards; opacity: 0;">
          <div class="lb-loading" id="lb-loading" style="text-align:center; padding: var(--space-xl); color: rgba(255,255,255,0.4); font-family: var(--font-display); font-size: var(--text-sm);">
            Loading...
          </div>
        </div>

        <div id="lb-guest-notice" style="
          margin-top: var(--space-md);
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
          padding: 0 var(--space-md);
          animation: fadeInUp 0.4s ease 0.3s forwards; opacity: 0;
        ">
          <p style="font-family: var(--font-display); font-size: var(--text-xs); color: rgba(255,255,255,0.5); margin-bottom: var(--space-sm);">
            Sign in &amp; complete all chapters to submit your score!
          </p>
          <button class="menu-btn" id="btn-lb-signin" style="font-size: var(--text-sm);">
            Sign In / Register
          </button>
        </div>
      </div>
    `;
  },

  onEnter(el) {
    el.querySelector('#btn-lb-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Check if guest — show sign-in nudge
    const isGuest = !state.get('isAuthenticated');

    const guestNotice = el.querySelector('#lb-guest-notice');
    if (isGuest && guestNotice) {
      guestNotice.style.display = 'flex';
      const signinBtn = el.querySelector('#btn-lb-signin');
      if (signinBtn) signinBtn.addEventListener('click', () => window.__screenManager.navigate('login-screen'));
    }

    // Tab switching
    const tabs = el.querySelectorAll('.leaderboard-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._loadBoard(el, tab.dataset.control);
      });
    });

    // Initial load — keyboard tab
    this._loadBoard(el, 'keyboard');
  },

  async _loadBoard(el, controlType) {
    const list = el.querySelector('#leaderboard-list');
    list.innerHTML = `<div style="text-align:center; padding: var(--space-xl); color: rgba(255,255,255,0.4); font-family: var(--font-display); font-size: var(--text-sm);">Loading...</div>`;

    try {
      const res = await fetch(`/leaderboard/endless?controlType=${controlType}`);
      if (!res.ok) throw new Error('fetch failed');
      const { entries } = await res.json();

      if (!entries || entries.length === 0) {
        list.innerHTML = `
          <div style="text-align:center; padding: var(--space-xl); color: rgba(255,255,255,0.3); font-family: var(--font-display); font-size: var(--text-sm);">
            No scores yet. Be the first!
          </div>`;
        return;
      }

      const medals = [
        '<img src="/assets/ui/gold.png" alt="1st" style="height:1.2em;vertical-align:middle;" />',
        '<img src="/assets/ui/silver.png" alt="2nd" style="height:1.2em;vertical-align:middle;" />',
        '<img src="/assets/ui/bronze.png" alt="3rd" style="height:1.2em;vertical-align:middle;" />'
      ];

      list.innerHTML = entries.map((entry, i) => {
        const rank = i + 1;
        const secs = entry.best_seconds;
        const mm = Math.floor(secs / 60).toString().padStart(2, '0');
        const ss = (secs % 60).toString().padStart(2, '0');
        const rankDisplay = rank <= 3 ? medals[rank - 1] : `#${rank}`;
        return `
          <div class="leaderboard-entry ${rank <= 3 ? 'leaderboard-entry--top' : ''}"
               style="animation: slideInLeft 0.3s ease forwards; animation-delay: ${i * 0.05}s; opacity: 0;">
            <span class="leaderboard-entry__rank ${rank <= 3 ? 'top-3' : ''}">${rankDisplay}</span>
            <span class="leaderboard-entry__name">${entry.username}</span>
            <span class="leaderboard-entry__score lb-time">${mm}:${ss}</span>
          </div>
        `;
      }).join('');

    } catch (e) {
      list.innerHTML = `
        <div style="text-align:center; padding: var(--space-xl); color: rgba(255,100,100,0.6); font-family: var(--font-display); font-size: var(--text-sm);">
          Could not load leaderboard.
        </div>`;
    }
  }
};
