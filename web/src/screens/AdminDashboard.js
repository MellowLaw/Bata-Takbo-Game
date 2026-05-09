/**
 * AdminDashboard — Admin panel for user management, testing, and moderation
 */
import { state } from '../utils/StateManager.js';

export const AdminDashboard = {
  render() {
    return `
      <div class="settings-screen screen" id="admin-container">
        <button class="back-btn" id="btn-admin-back">Back</button>
        
        <h1 class="screen-title" style="animation: fadeInUp 0.4s ease forwards;">
          ADMIN PANEL
        </h1>

        <div class="admin-tabs" style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-md); padding: 0 var(--space-md);">
          <button class="admin-tab active" data-tab="users" id="tab-users">Users</button>
          <button class="admin-tab" data-tab="test" id="tab-test">Test Features</button>
          <button class="admin-tab" data-tab="leaderboard" id="tab-leaderboard">Leaderboard</button>
        </div>
        
        <div class="settings-screen__content scrollable" id="admin-content" style="padding: 0 var(--space-md);">
          <!-- Content loaded dynamically -->
        </div>
      </div>
    `;
  },

  async onEnter(el) {
    this.container = el;
    this.currentTab = 'users';
    
    // Check admin status
    try {
      const res = await fetch('/admin/check', { credentials: 'include' });
      const data = await res.json();
      if (!data.isAdmin) {
        window.__screenManager.back();
        return;
      }
    } catch (e) {
      window.__screenManager.back();
      return;
    }

    // Back button
    el.querySelector('#btn-admin-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Tab switching
    const tabs = el.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.dataset.tab;
        this.loadTabContent();
      });
    });

    // Initial load
    this.loadTabContent();
  },

  async loadTabContent() {
    const content = this.container.querySelector('#admin-content');
    content.innerHTML = '<div style="text-align: center; padding: var(--space-lg);">Loading...</div>';
    
    switch (this.currentTab) {
      case 'users':
        await this.loadUsersTab(content);
        break;
      case 'test':
        this.loadTestTab(content);
        break;
      case 'leaderboard':
        await this.loadLeaderboardTab(content);
        break;
    }
  },

  async loadUsersTab(content) {
    try {
      const res = await fetch('/admin/users', { credentials: 'include' });
      const data = await res.json();
      
      if (!data.users) {
        content.innerHTML = '<div class="text-red">Failed to load users</div>';
        return;
      }

      const usersHtml = data.users.map(u => `
        <div class="admin-user-row" style="
          display: grid; 
          grid-template-columns: 1fr auto auto auto; 
          gap: var(--space-sm);
          align-items: center;
          padding: var(--space-sm);
          background: var(--bg-panel);
          border-radius: 4px;
          margin-bottom: var(--space-xs);
          ${u.banned ? 'border: 1px solid var(--accent-red);' : ''}
        ">
          <div>
            <div style="font-weight: bold; ${u.banned ? 'text-decoration: line-through; color: var(--accent-red);' : ''}">
              ${u.username}
              ${u.is_admin ? '<span style="color: var(--accent-gold); margin-left: var(--space-xs);">[ADMIN]</span>' : ''}
            </div>
            <div style="font-size: var(--text-xs); color: var(--text-dim);">
              ID: ${u.id} | Cheat Score: ${u.cheat_score}
              ${u.ban_reason ? '| Reason: ' + u.ban_reason : ''}
            </div>
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-dim);">
            ${u.has_game_data ? 'Has Data' : 'No Data'}
          </div>
          <button class="admin-btn ${u.banned ? 'unban' : 'ban'}" 
                  data-userid="${u.id}" 
                  data-banned="${u.banned}"
                  data-username="${u.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
            ${u.banned ? 'Unban' : 'Ban'}
          </button>
          <button class="admin-btn reset" 
                  data-userid="${u.id}"
                  data-username="${u.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
            Reset
          </button>
        </div>
      `).join('');

      content.innerHTML = `
        <div class="settings-group" style="animation: fadeInUp 0.3s ease forwards;">
          <h3 style="color: var(--accent-orange); margin-bottom: var(--space-md);">User Management (${data.users.length} total)</h3>
          <div id="users-list">${usersHtml}</div>
        </div>
      `;

      // Bind ban/unban buttons
      content.querySelectorAll('.admin-btn.ban, .admin-btn.unban').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          const currentlyBanned = e.target.dataset.banned === '1';
          
          if (currentlyBanned) {
            // Unban
            if (!confirm(`Unban user ${username}?`)) return;
            try {
              const res = await fetch('/admin/ban', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, banned: false })
              });
              if (res.ok) {
                this.loadUsersTab(content);
              }
            } catch (e) {
              alert('Failed to unban user');
            }
          } else {
            // Ban - ask for reason
            const reason = prompt(`Ban user ${username}? Enter reason:`);
            if (reason === null) return;
            try {
              const res = await fetch('/admin/ban', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, banned: true, reason })
              });
              if (res.ok) {
                this.loadUsersTab(content);
              }
            } catch (e) {
              alert('Failed to ban user');
            }
          }
        });
      });

      // Bind reset buttons
      content.querySelectorAll('.admin-btn.reset').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          
          if (!confirm(`Reset ALL progress for ${username}? This cannot be undone!`)) return;
          
          try {
            const res = await fetch('/admin/reset-progress', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            });
            if (res.ok) {
              alert(`Progress reset for ${username}`);
              this.loadUsersTab(content);
            }
          } catch (e) {
            alert('Failed to reset progress');
          }
        });
      });

    } catch (e) {
      console.error('Load users error:', e);
      content.innerHTML = '<div class="text-red">Error loading users</div>';
    }
  },

  loadTestTab(content) {
    content.innerHTML = `
      <div class="settings-group" style="animation: fadeInUp 0.3s ease forwards;">
        <h3 style="color: var(--accent-orange); margin-bottom: var(--space-md);">Chapter Unlocks</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-action-btn" data-action="unlock-ch1" style="padding: var(--space-sm); text-align: left;">
            Unlock Chapter 1
          </button>
          <button class="admin-action-btn" data-action="unlock-ch2" style="padding: var(--space-sm); text-align: left;">
            Unlock Chapter 2
          </button>
          <button class="admin-action-btn" data-action="unlock-ch3" style="padding: var(--space-sm); text-align: left;">
            Unlock Chapter 3
          </button>
          <button class="admin-action-btn" data-action="unlock-all" style="padding: var(--space-sm); text-align: left; background: var(--accent-gold);">
            Unlock ALL Chapters
          </button>
          <button class="admin-action-btn" data-action="reset-chapters" style="padding: var(--space-sm); text-align: left; color: var(--accent-red);">
            Reset Chapter Progress
          </button>
        </div>
      </div>

      <div class="settings-group" style="animation: fadeInUp 0.3s ease 0.1s forwards; margin-top: var(--space-md); opacity: 0;">
        <h3 style="color: var(--accent-orange); margin-bottom: var(--space-md);">Test Game Features</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-action-btn" data-action="test-attack" style="padding: var(--space-sm); text-align: left;">
            Launch Test Attack Mode
          </button>
          <button class="admin-action-btn" data-action="easy-win" style="padding: var(--space-sm); text-align: left; background: var(--accent-green);">
            Easy Win Mode (Invincible + One-Hit Kill)
          </button>
          <button class="admin-action-btn" data-action="god-mode" style="padding: var(--space-sm); text-align: left;">
            God Mode (Invincible Only)
          </button>
        </div>
      </div>

      <div class="settings-group" style="animation: fadeInUp 0.3s ease 0.2s forwards; margin-top: var(--space-md); opacity: 0;">
        <h3 style="color: var(--accent-orange); margin-bottom: var(--space-md);">Debug Tools</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-action-btn" data-action="export-state" style="padding: var(--space-sm); text-align: left;">
            Export Game State to Console
          </button>
          <button class="admin-action-btn" data-action="clear-local" style="padding: var(--space-sm); text-align: left; color: var(--accent-red);">
            Clear Local Storage
          </button>
        </div>
      </div>
    `;

    // Bind action buttons
    content.querySelectorAll('.admin-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTestAction(e.target.dataset.action));
    });
  },

  async loadLeaderboardTab(content) {
    try {
      const res = await fetch('/admin/leaderboard', { credentials: 'include' });
      const data = await res.json();
      
      if (!data.leaderboard) {
        content.innerHTML = '<div class="text-red">Failed to load leaderboard</div>';
        return;
      }

      const entriesHtml = data.leaderboard.map((entry, i) => `
        <div class="leaderboard-admin-row" style="
          display: grid;
          grid-template-columns: auto 1fr auto auto auto;
          gap: var(--space-sm);
          align-items: center;
          padding: var(--space-sm);
          background: ${entry.suspicious ? 'rgba(255,0,0,0.1)' : 'var(--bg-panel)'};
          border: ${entry.suspicious ? '1px solid var(--accent-red)' : 'none'};
          border-radius: 4px;
          margin-bottom: var(--space-xs);
        ">
          <span style="font-weight: bold; color: var(--text-dim);">#${i + 1}</span>
          <div>
            <div style="font-weight: bold; ${entry.banned ? 'text-decoration: line-through; color: var(--accent-red);' : ''}">
              ${entry.username}
              ${entry.suspicious ? '<span style="color: var(--accent-red); margin-left: var(--space-xs);">⚠️ SUSPICIOUS</span>' : ''}
            </div>
            <div style="font-size: var(--text-xs); color: var(--text-dim);">
              Cheat Score: ${entry.cheatScore}
              ${entry.banReason ? '| ' + entry.banReason : ''}
            </div>
            <div style="font-size: var(--text-xs); color: var(--text-dim);">
              ${entry.scores.map(s => `Ch${s.chapter}: ${s.score.toLocaleString()}`).join(' | ')}
            </div>
          </div>
          <button class="admin-btn mark-cheat" 
                  data-userid="${entry.id}"
                  data-username="${entry.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
            +Cheat
          </button>
          <button class="admin-btn ${entry.banned ? 'unban' : 'ban'}" 
                  data-userid="${entry.id}" 
                  data-banned="${entry.banned}"
                  data-username="${entry.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
            ${entry.banned ? 'Unban' : 'Ban'}
          </button>
        </div>
      `).join('');

      const suspiciousCount = data.leaderboard.filter(e => e.suspicious).length;
      const bannedCount = data.leaderboard.filter(e => e.banned).length;

      content.innerHTML = `
        <div class="settings-group" style="animation: fadeInUp 0.3s ease forwards;">
          <h3 style="color: var(--accent-orange); margin-bottom: var(--space-sm);">
            Leaderboard Monitoring
          </h3>
          <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md); font-size: var(--text-sm);">
            <span style="color: var(--text-dim);">Total: ${data.leaderboard.length}</span>
            <span style="color: var(--accent-red);">Suspicious: ${suspiciousCount}</span>
            <span style="color: var(--accent-red);">Banned: ${bannedCount}</span>
          </div>
          <div id="leaderboard-list">${entriesHtml}</div>
        </div>
      `;

      // Bind mark cheat buttons
      content.querySelectorAll('.admin-btn.mark-cheat').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          const reason = prompt(`Mark ${username} as cheater? Enter reason:`);
          if (reason === null) return;
          
          try {
            const res = await fetch('/admin/mark-cheat', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, cheatScore: 100, reason })
            });
            if (res.ok) {
              this.loadLeaderboardTab(content);
            }
          } catch (e) {
            alert('Failed to mark user');
          }
        });
      });

      // Bind ban/unban buttons
      content.querySelectorAll('.admin-btn.ban, .admin-btn.unban').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          const currentlyBanned = e.target.dataset.banned === '1';
          
          if (currentlyBanned) {
            if (!confirm(`Unban user ${username}?`)) return;
            try {
              const res = await fetch('/admin/ban', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, banned: false })
              });
              if (res.ok) this.loadLeaderboardTab(content);
            } catch (e) {
              alert('Failed to unban user');
            }
          } else {
            const reason = prompt(`Ban user ${username}? Enter reason:`);
            if (reason === null) return;
            try {
              const res = await fetch('/admin/ban', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, banned: true, reason })
              });
              if (res.ok) this.loadLeaderboardTab(content);
            } catch (e) {
              alert('Failed to ban user');
            }
          }
        });
      });

    } catch (e) {
      console.error('Load leaderboard error:', e);
      content.innerHTML = '<div class="text-red">Error loading leaderboard</div>';
    }
  },

  handleTestAction(action) {
    switch (action) {
      case 'unlock-ch1':
        this.unlockChapter(1);
        break;
      case 'unlock-ch2':
        this.unlockChapter(2);
        break;
      case 'unlock-ch3':
        this.unlockChapter(3);
        break;
      case 'unlock-all':
        [1, 2, 3].forEach(ch => this.unlockChapter(ch));
        alert('All chapters unlocked!');
        break;
      case 'reset-chapters':
        state.set('chapterProgress', { chaptersUnlocked: [1], chaptersCompleted: [], bestScores: {} });
        state.saveChapterProgress();
        alert('Chapter progress reset!');
        break;
      case 'test-attack':
        sessionStorage.setItem('admin_test_mode', JSON.stringify({ 
          mode: 'test_attack',
          chapterId: 1,
          invincible: false
        }));
        window.__screenManager.navigate('game-screen');
        break;
      case 'easy-win':
        sessionStorage.setItem('admin_test_mode', JSON.stringify({ 
          mode: 'easy_win',
          chapterId: 1,
          invincible: true,
          oneHitKill: true
        }));
        window.__screenManager.navigate('game-screen');
        break;
      case 'god-mode':
        sessionStorage.setItem('admin_test_mode', JSON.stringify({ 
          mode: 'god_mode',
          chapterId: 1,
          invincible: true
        }));
        window.__screenManager.navigate('game-screen');
        break;
      case 'export-state':
        console.log('=== GAME STATE ===');
        console.log('Settings:', state.get('settings'));
        console.log('Chapter Progress:', state.get('chapterProgress'));
        console.log('Tutorial Complete:', state.get('tutorialComplete'));
        console.log('Bestiary:', state.get('bestiary'));
        console.log('==================');
        alert('Game state exported to console (F12)');
        break;
      case 'clear-local':
        if (confirm('Clear all local storage? This will reset local progress.')) {
          localStorage.clear();
          sessionStorage.removeItem('guest_session');
          alert('Local storage cleared. Refresh the page.');
        }
        break;
    }
  },

  unlockChapter(chapterNum) {
    const progress = state.get('chapterProgress');
    if (!progress.chaptersUnlocked.includes(chapterNum)) {
      progress.chaptersUnlocked.push(chapterNum);
      state.set('chapterProgress', progress);
      state.saveChapterProgress();
    }
  },

  onLeave() {}
};
