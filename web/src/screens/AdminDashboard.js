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

  _renderUserRow(u) {
    const lastLoginStr = u.last_login
      ? new Date(u.last_login).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Never';
    return `
      <div class="admin-user-row" data-username="${u.username.toLowerCase()}" data-banned="${u.banned ? '1' : '0'}" style="
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
            ID: ${u.id} | ${u.email || '<i>no email</i>'}
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-dim);">
            Last Login: ${lastLoginStr} | Cheat: ${u.cheat_score}
            ${u.ban_reason ? '| Reason: ' + u.ban_reason : ''}
          </div>
        </div>
        <div style="font-size: var(--text-xs); color: var(--text-dim);">
          ${u.has_game_data ? 'Has Data' : 'No Data'}
        </div>
        <button class="admin-btn ${u.banned ? 'unban' : 'ban'}"
                data-userid="${u.id}"
                data-banned="${u.banned ? '1' : '0'}"
                data-username="${u.username}"
                ${u.is_admin ? 'disabled title="Cannot ban admin"' : ''}
                style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm); ${u.is_admin ? 'opacity:0.3;cursor:not-allowed;' : ''}">
          ${u.banned ? 'Unban' : 'Ban'}
        </button>
        <button class="admin-btn reset"
                data-userid="${u.id}"
                data-username="${u.username}"
                style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
          Reset
        </button>
        <button class="admin-btn delete"
                data-userid="${u.id}"
                data-username="${u.username}"
                ${u.is_admin ? 'disabled title="Cannot delete admin"' : ''}
                style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm); ${u.is_admin ? 'opacity:0.3;cursor:not-allowed;' : ''}">
          Delete
        </button>
      </div>
    `;
  },

  async loadUsersTab(content) {
    try {
      const res = await fetch('/admin/users', { credentials: 'include' });
      const data = await res.json();

      if (!data.users) {
        content.innerHTML = '<div class="text-red">Failed to load users</div>';
        return;
      }

      const activeUsers = data.users.filter(u => !u.banned);
      const bannedUsers = data.users.filter(u => u.banned);

      const renderGroup = (users) => users.map(u => this._renderUserRow(u)).join('');

      content.innerHTML = `
        <div class="settings-group" style="animation: fadeInUp 0.3s ease forwards;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-md);">
            <h3 style="color: var(--accent-orange); margin:0;">User Management (${data.users.length} total)</h3>
            <button id="btn-refresh-users" class="admin-btn" style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-xs);">↺ Refresh</button>
          </div>
          <input id="user-search" type="text" placeholder="Search by username..." style="width:100%; padding: var(--space-sm); background:var(--bg-panel); border:1px solid var(--accent-orange); color:var(--text-primary); font-family:var(--font-display); font-size:var(--text-sm); border-radius:4px; margin-bottom:var(--space-md); box-sizing:border-box;" />
          <div style="display:flex; gap:var(--space-sm); margin-bottom:var(--space-sm);">
            <button class="admin-filter-btn active" data-filter="all" style="font-size:var(--text-xs); padding:2px var(--space-sm);">All (${data.users.length})</button>
            <button class="admin-filter-btn" data-filter="active" style="font-size:var(--text-xs); padding:2px var(--space-sm);">Active (${activeUsers.length})</button>
            <button class="admin-filter-btn" data-filter="banned" style="font-size:var(--text-xs); padding:2px var(--space-sm); color:var(--accent-red);">Banned (${bannedUsers.length})</button>
          </div>
          <div id="users-list">
            ${renderGroup(activeUsers)}
            ${bannedUsers.length ? `<div style="font-size:var(--text-xs);color:var(--accent-red);margin: var(--space-sm) 0 var(--space-xs);">— BANNED —</div>${renderGroup(bannedUsers)}` : ''}
          </div>
        </div>
      `;

      // Refresh button
      content.querySelector('#btn-refresh-users').addEventListener('click', () => this.loadUsersTab(content));

      // Search
      const searchInput = content.querySelector('#user-search');
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        content.querySelectorAll('.admin-user-row').forEach(row => {
          row.style.display = row.dataset.username.includes(q) ? '' : 'none';
        });
      });

      // Filter tabs
      content.querySelectorAll('.admin-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          content.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.filter;
          content.querySelectorAll('.admin-user-row').forEach(row => {
            if (filter === 'all') row.style.display = '';
            else if (filter === 'active') row.style.display = row.dataset.banned === '0' ? '' : 'none';
            else if (filter === 'banned') row.style.display = row.dataset.banned === '1' ? '' : 'none';
          });
        });
      });

      // Ban/unban buttons
      content.querySelectorAll('.admin-btn.ban, .admin-btn.unban').forEach(btn => {
        if (btn.disabled) return;
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          const currentlyBanned = e.target.dataset.banned === '1';

          if (currentlyBanned) {
            this.showConfirmModal(`Unban <b>${username}</b>?`, 'UNBAN', async () => {
              try {
                const res = await fetch('/admin/ban', {
                  method: 'POST', credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, banned: false })
                });
                const d = await res.json();
                if (res.ok) { this.showToast(`${username} unbanned`); this.loadUsersTab(content); }
                else this.showToast(d.error || 'Failed to unban', true);
              } catch (e) { this.showToast('Failed to unban user', true); }
            });
          } else {
            this.showInputModal(`Ban <b>${username}</b>`, 'Enter reason (optional):', 'BAN', async (reason) => {
              try {
                const res = await fetch('/admin/ban', {
                  method: 'POST', credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, banned: true, reason })
                });
                const d = await res.json();
                if (res.ok) { this.showToast(`${username} banned`); this.loadUsersTab(content); }
                else this.showToast(d.error || 'Failed to ban', true);
              } catch (e) { this.showToast('Failed to ban user', true); }
            });
          }
        });
      });

      // Reset buttons
      content.querySelectorAll('.admin-btn.reset').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          this.showConfirmModal(`Reset ALL progress for <b>${username}</b>?<br><span style="color:var(--accent-red);font-size:var(--text-xs);">This cannot be undone.</span>`, 'RESET', async () => {
            try {
              const res = await fetch('/admin/reset-progress', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
              });
              const d = await res.json();
              if (res.ok) { this.showToast(`Progress reset for ${username}`); this.loadUsersTab(content); }
              else this.showToast(d.error || 'Failed to reset', true);
            } catch (e) { this.showToast('Failed to reset progress', true); }
          });
        });
      });

      // Delete buttons
      content.querySelectorAll('.admin-btn.delete').forEach(btn => {
        if (btn.disabled) return;
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          this.showConfirmModal(
            `Permanently delete <b>${username}</b>?<br><span style="color:var(--accent-red);font-size:var(--text-xs);">This cannot be undone. All their data will be erased.</span>`,
            'DELETE',
            async () => {
              try {
                const res = await fetch('/admin/delete-user', {
                  method: 'DELETE', credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId })
                });
                const d = await res.json();
                if (res.ok) { this.showToast(`${username} deleted`); this.loadUsersTab(content); }
                else this.showToast(d.error || 'Failed to delete', true);
              } catch (e) { this.showToast('Failed to delete user', true); }
            }
          );
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
        <h3 style="color: var(--accent-orange); margin-bottom: var(--space-xs);">Chapter Unlocks</h3>
        <p style="color:var(--text-dim);font-size:var(--text-xs);margin-bottom:var(--space-md);">Affects your own session only.</p>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-action-btn" data-action="unlock-ch1">Unlock Chapter 1</button>
          <button class="admin-action-btn" data-action="unlock-ch2">Unlock Chapter 2</button>
          <button class="admin-action-btn" data-action="unlock-ch3">Unlock Chapter 3</button>
          <button class="admin-action-btn" data-action="unlock-all" style="border-color: var(--accent-gold); color: var(--accent-gold);">Unlock ALL Chapters</button>
          <button class="admin-action-btn" data-action="reset-chapters" style="border-color: rgba(230,57,70,0.5); color: var(--accent-red);">Reset Chapter Progress</button>
        </div>
      </div>

      <div class="settings-group" style="animation: fadeInUp 0.3s ease 0.1s forwards; margin-top: var(--space-md); opacity: 0;">
        <h3 style="color: var(--accent-orange); margin-bottom: var(--space-xs);">Test Game Features</h3>
        <p style="color:var(--text-dim);font-size:var(--text-xs);margin-bottom:var(--space-md);">Launches game in test mode for your account only.</p>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-action-btn" data-action="test-attack">Launch Test Attack Mode</button>
          <button class="admin-action-btn" data-action="easy-win" style="border-color: rgba(46,204,113,0.5); color: var(--accent-green);">Easy Win Mode (Invincible + One-Hit Kill)</button>
          <button class="admin-action-btn" data-action="god-mode">God Mode (Invincible Only)</button>
        </div>
      </div>

      <div class="settings-group" style="animation: fadeInUp 0.3s ease 0.2s forwards; margin-top: var(--space-md); opacity: 0;">
        <h3 style="color: var(--accent-orange); margin-bottom: var(--space-xs);">Debug Tools</h3>
        <p style="color:var(--text-dim);font-size:var(--text-xs);margin-bottom:var(--space-md);">Affects your local browser storage only.</p>
        <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
          <button class="admin-action-btn" data-action="export-state">Export Game State to Console</button>
          <button class="admin-action-btn" data-action="clear-local" style="border-color: rgba(230,57,70,0.5); color: var(--accent-red);">Clear Local Storage</button>
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

      const suspiciousCount = data.leaderboard.filter(e => e.suspicious).length;
      const bannedCount = data.leaderboard.filter(e => e.banned).length;

      const entriesHtml = data.leaderboard.map((entry, i) => `
        <div class="leaderboard-admin-row" style="
          display: grid;
          grid-template-columns: auto 1fr auto auto auto auto;
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
              ${entry.email || '<i>no email</i>'} | Cheat: ${entry.cheatScore} | Total: ${entry.totalScore.toLocaleString()}
              ${entry.banReason ? '| ' + entry.banReason : ''}
            </div>
            <div style="font-size: var(--text-xs); color: var(--text-dim);">
              ${entry.scores.map(s => `Ch${s.chapter}: ${s.score.toLocaleString()}`).join(' | ')}
            </div>
          </div>
          <button class="admin-btn mark-cheat"
                  data-userid="${entry.id}" data-username="${entry.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
            +Cheat
          </button>
          <button class="admin-btn clear-cheat"
                  data-userid="${entry.id}" data-username="${entry.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm); ${entry.cheatScore === 0 ? 'opacity:0.3;cursor:not-allowed;' : ''}">
            Clear
          </button>
          <button class="admin-btn ${entry.banned ? 'unban' : 'ban'}"
                  data-userid="${entry.id}" data-banned="${entry.banned ? '1' : '0'}" data-username="${entry.username}"
                  style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-sm);">
            ${entry.banned ? 'Unban' : 'Ban'}
          </button>
        </div>
      `).join('');

      content.innerHTML = `
        <div class="settings-group" style="animation: fadeInUp 0.3s ease forwards;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-sm);">
            <h3 style="color: var(--accent-orange); margin:0;">Leaderboard Monitoring</h3>
            <button id="btn-refresh-lb" class="admin-btn" style="padding: var(--space-xs) var(--space-sm); font-size: var(--text-xs);">↺ Refresh</button>
          </div>
          <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-md); font-size: var(--text-sm);">
            <span style="color: var(--text-dim);">Total: ${data.leaderboard.length}</span>
            <span style="color: var(--accent-red);">Suspicious: ${suspiciousCount}</span>
            <span style="color: var(--accent-red);">Banned: ${bannedCount}</span>
          </div>
          <div id="leaderboard-list">${entriesHtml}</div>
        </div>
      `;

      content.querySelector('#btn-refresh-lb').addEventListener('click', () => this.loadLeaderboardTab(content));

      // Mark cheat buttons
      content.querySelectorAll('.admin-btn.mark-cheat').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          this.showInputModal(`Mark <b>${username}</b> as cheater`, 'Enter reason:', '+CHEAT', async (reason) => {
            try {
              const res = await fetch('/admin/mark-cheat', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cheatScore: 100, reason })
              });
              if (res.ok) { this.showToast(`${username} marked as cheater`); this.loadLeaderboardTab(content); }
            } catch (e) { this.showToast('Failed to mark user', true); }
          });
        });
      });

      // Clear cheat buttons
      content.querySelectorAll('.admin-btn.clear-cheat').forEach(btn => {
        if (btn.style.cursor === 'not-allowed') return;
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          this.showConfirmModal(`Clear cheat score for <b>${username}</b>?`, 'CLEAR', async () => {
            try {
              const res = await fetch('/admin/reset-cheat', {
                method: 'POST', credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
              });
              if (res.ok) { this.showToast(`Cheat score cleared for ${username}`); this.loadLeaderboardTab(content); }
            } catch (e) { this.showToast('Failed to clear cheat score', true); }
          });
        });
      });

      // Ban/unban buttons
      content.querySelectorAll('.admin-btn.ban, .admin-btn.unban').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.target.dataset.userid;
          const username = e.target.dataset.username;
          const currentlyBanned = e.target.dataset.banned === '1';

          if (currentlyBanned) {
            this.showConfirmModal(`Unban <b>${username}</b>?`, 'UNBAN', async () => {
              try {
                const res = await fetch('/admin/ban', {
                  method: 'POST', credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, banned: false })
                });
                const d = await res.json();
                if (res.ok) { this.showToast(`${username} unbanned`); this.loadLeaderboardTab(content); }
                else this.showToast(d.error || 'Failed to unban', true);
              } catch (e) { this.showToast('Failed to unban user', true); }
            });
          } else {
            this.showInputModal(`Ban <b>${username}</b>`, 'Enter reason (optional):', 'BAN', async (reason) => {
              try {
                const res = await fetch('/admin/ban', {
                  method: 'POST', credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, banned: true, reason })
                });
                const d = await res.json();
                if (res.ok) { this.showToast(`${username} banned`); this.loadLeaderboardTab(content); }
                else this.showToast(d.error || 'Failed to ban', true);
              } catch (e) { this.showToast('Failed to ban user', true); }
            });
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
        this.showToast('All chapters unlocked!');
        break;
      case 'reset-chapters':
        this.showConfirmModal('Reset chapter progress?<br><span style="color:var(--accent-red);font-size:var(--text-xs);">This cannot be undone.</span>', 'RESET', () => {
          state.set('chapterProgress', { chaptersUnlocked: [1], chaptersCompleted: [], bestScores: {} });
          state.saveChapterProgress();
          this.showToast('Chapter progress reset!');
        });
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
        this.showToast('Game state exported to console (F12)');
        break;
      case 'clear-local':
        this.showConfirmModal('Clear all local storage?<br><span style="color:var(--accent-red);font-size:var(--text-xs);">This will reset local progress.</span>', 'CLEAR', () => {
          localStorage.clear();
          sessionStorage.removeItem('guest_session');
          this.showToast('Local storage cleared. Refresh the page.');
        });
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

  showConfirmModal(message, confirmLabel, onConfirm) {
    this._removeModal();
    const overlay = document.createElement('div');
    overlay.id = 'admin-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--accent-orange);border-radius:8px;padding:var(--space-lg);min-width:280px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.8);animation:fadeInUp 0.2s ease forwards;">
        <p style="color:var(--text-primary);font-size:var(--text-sm);margin-bottom:var(--space-lg);line-height:1.5;text-align:center;">${message}</p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="admin-modal-cancel" class="login-card__join-btn" style="flex:1;padding:var(--space-sm);font-size:var(--text-sm);">CANCEL</button>
          <button id="admin-modal-confirm" class="login-card__join-btn" style="flex:1;padding:var(--space-sm);font-size:var(--text-sm);background:var(--accent-orange);">${confirmLabel}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#admin-modal-cancel').addEventListener('click', () => this._removeModal());
    overlay.querySelector('#admin-modal-confirm').addEventListener('click', () => { this._removeModal(); onConfirm(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this._removeModal(); });
  },

  showInputModal(title, placeholder, confirmLabel, onConfirm) {
    this._removeModal();
    const overlay = document.createElement('div');
    overlay.id = 'admin-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--accent-orange);border-radius:8px;padding:var(--space-lg);min-width:280px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.8);animation:fadeInUp 0.2s ease forwards;">
        <h3 style="color:var(--accent-orange);font-family:var(--font-display);font-size:var(--text-base);text-transform:uppercase;margin-bottom:var(--space-md);text-align:center;">${title}</h3>
        <input id="admin-modal-input" class="login-card__input" type="text" placeholder="${placeholder}" style="width:100%;font-size:var(--text-sm);padding:var(--space-sm);margin-bottom:var(--space-md);box-sizing:border-box;" />
        <div style="display:flex;gap:var(--space-sm);">
          <button id="admin-modal-cancel" class="login-card__join-btn" style="flex:1;padding:var(--space-sm);font-size:var(--text-sm);">CANCEL</button>
          <button id="admin-modal-confirm" class="login-card__join-btn" style="flex:1;padding:var(--space-sm);font-size:var(--text-sm);background:var(--accent-orange);">${confirmLabel}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#admin-modal-input');
    setTimeout(() => input.focus(), 50);
    const submit = () => { this._removeModal(); onConfirm(input.value.trim()); };
    overlay.querySelector('#admin-modal-cancel').addEventListener('click', () => this._removeModal());
    overlay.querySelector('#admin-modal-confirm').addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') this._removeModal(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) this._removeModal(); });
  },

  showToast(message, isError = false) {
    const existing = document.getElementById('admin-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:var(--space-lg);left:50%;transform:translateX(-50%);background:${isError ? 'var(--accent-red)' : 'var(--accent-green)'};color:#111;padding:var(--space-sm) var(--space-md);border-radius:6px;font-family:var(--font-display);font-size:var(--text-sm);font-weight:bold;z-index:10000;animation:fadeInUp 0.2s ease forwards;pointer-events:none;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  _removeModal() {
    const el = document.getElementById('admin-modal-overlay');
    if (el) el.remove();
  },

  onLeave() {
    this._removeModal();
  }
};
