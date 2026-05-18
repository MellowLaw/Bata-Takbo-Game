/**
 * Leaderboard — Endless Mode per-chapter leaderboard
 * Tabs: Chapter (CH1 / CH2 / CH3) × Control (Keyboard / Gesture)
 * Fetches from /leaderboard/inf (inf_scores table)
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
        ">ENDLESS MODE &nbsp;·&nbsp; WALANG KATAPUSAN</p>

        <!-- Chapter tabs -->
        <div class="leaderboard-tabs" id="lb-chapter-tabs" style="animation: fadeInUp 0.4s ease 0.1s forwards; opacity: 0;">
          <button class="leaderboard-tab active" data-chapter="1">CH1</button>
          <button class="leaderboard-tab" data-chapter="2">CH2</button>
          <button class="leaderboard-tab" data-chapter="3">CH3</button>
        </div>

        <!-- Control type tabs -->
        <div class="leaderboard-tabs" id="lb-control-tabs" style="animation: fadeInUp 0.4s ease 0.14s forwards; opacity: 0; margin-top: 0;">
          <button class="leaderboard-tab active" data-control="keyboard" id="tab-keyboard">
            <span class="lb-tab-icon">🎮</span> D-Pad / Keyboard
          </button>
          <button class="leaderboard-tab" data-control="gesture" id="tab-gesture">
            <span class="lb-tab-icon">✋</span> Hand Gesture
          </button>
        </div>

        <div class="leaderboard-list scrollable" id="leaderboard-list" style="animation: fadeInUp 0.4s ease 0.18s forwards; opacity: 0;">
          <div style="text-align:center; padding: var(--space-xl); color: rgba(255,255,255,0.4); font-family: var(--font-display); font-size: var(--text-sm);">
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
            Sign in &amp; complete a chapter to submit your score!
          </p>
          <button class="menu-btn" id="btn-lb-signin" style="font-size: var(--text-sm);">
            Sign In / Register
          </button>
        </div>
      </div>
    `;
  },

  onEnter(el) {
    this._activeChapter = 1;
    this._activeControl = 'keyboard';

    el.querySelector('#btn-lb-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Guest notice
    if (!state.get('isAuthenticated')) {
      const guestNotice = el.querySelector('#lb-guest-notice');
      if (guestNotice) {
        guestNotice.style.display = 'flex';
        const signinBtn = el.querySelector('#btn-lb-signin');
        if (signinBtn) signinBtn.addEventListener('click', () => window.__screenManager.navigate('login-screen'));
      }
    }

    // Chapter tab switching
    el.querySelectorAll('#lb-chapter-tabs .leaderboard-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('#lb-chapter-tabs .leaderboard-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._activeChapter = Number(tab.dataset.chapter);
        this._loadBoard(el);
      });
    });

    // Control tab switching
    el.querySelectorAll('#lb-control-tabs .leaderboard-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        el.querySelectorAll('#lb-control-tabs .leaderboard-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this._activeControl = tab.dataset.control;
        this._loadBoard(el);
      });
    });

    // Initial load
    this._loadBoard(el);
  },

  async _loadBoard(el) {
    const chapterId = this._activeChapter;
    const controlType = this._activeControl;
    const list = el.querySelector('#leaderboard-list');
    list.innerHTML = `<div style="text-align:center; padding: var(--space-xl); color: rgba(255,255,255,0.4); font-family: var(--font-display); font-size: var(--text-sm);">Loading...</div>`;

    try {
      const res = await fetch(`/leaderboard/inf?chapterId=${chapterId}&controlType=${controlType}`);
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

      const currentUser = state.get('user')?.username;

      list.innerHTML = entries.map((entry, i) => {
        const rank = i + 1;
        const rankDisplay = rank <= 3 ? medals[rank - 1] : `#${rank}`;
        const isMe = currentUser && entry.username === currentUser;
        const mm = Math.floor((entry.survival_seconds||0) / 60).toString().padStart(2,'0');
        const ss = ((entry.survival_seconds||0) % 60).toString().padStart(2,'0');
        return `
          <div class="leaderboard-entry ${rank <= 3 ? 'leaderboard-entry--top' : ''} ${isMe ? 'leaderboard-entry--me' : ''}"
               style="animation: slideInLeft 0.3s ease forwards; animation-delay: ${i * 0.05}s; opacity: 0;${isMe ? ' outline: 1px solid rgba(255,215,0,0.5); background: rgba(255,215,0,0.06);' : ''}">
            <span class="leaderboard-entry__rank ${rank <= 3 ? 'top-3' : ''}">${rankDisplay}</span>
            <span class="leaderboard-entry__name">${entry.username}${isMe ? ' <span style="font-size:0.75em;color:rgba(255,215,0,0.7);">(you)</span>' : ''}</span>
            <span class="leaderboard-entry__score" style="display:flex;gap:clamp(8px,2vw,24px);align-items:center;">
              <span title="Waves" style="color:#e67e22;">&#9733; ${entry.waves_survived||0} waves</span>
              <span title="Score">${Number(entry.score).toLocaleString()} pts</span>
              <span title="Time" style="opacity:0.6;font-size:0.85em;">${mm}:${ss}</span>
            </span>
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
