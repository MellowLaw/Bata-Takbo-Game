/**
 * AdminDashboard — Admin panel for user management, testing, and moderation
 * Layout matches the Profile Screen's two-panel ID Card design.
 */
import { state } from '../utils/StateManager.js';

export const AdminDashboard = {
  render() {
    return `
      <div class="settings-screen screen" id="admin-container">
        <div class="settings-screen__content" id="profile-content-wrapper" style="background: transparent; border: none; box-shadow: none;">
          
          <!-- SIDEBAR NAVIGATION -->
          <div class="profile-sidebar">
            <button class="back-btn" id="btn-admin-back" style="margin-bottom: var(--space-md);">
              <i class="fas fa-caret-left"></i> BACK TO MENU
            </button>
            <button class="profile-tab-btn active" data-target="panel-dashboard">DASHBOARD</button>
            <button class="profile-tab-btn" data-target="panel-users">USERS</button>
            <button class="profile-tab-btn" data-target="panel-leaderboard">LEADERBOARD</button>
            <button class="profile-tab-btn" data-target="panel-tests">DEBUG & TESTS</button>
          </div>

          <!-- MAIN CONTENT AREA -->
          <div class="profile-content-area scrollable">
          
            <!-- DASHBOARD PANEL -->
            <div id="panel-dashboard" class="profile-panel active">
              <h2 style="font-family:'VCR',sans-serif; color:#111; text-transform:uppercase; margin:0 0 var(--space-md) 0; font-size:var(--text-xl); border-bottom:2px solid #111; padding-bottom:8px;">Server Overview</h2>

              <!-- Stat Cards -->
              <div id="admin-stats-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin-bottom: var(--space-lg);">
                <div class="profile-stat-box">
                  <i class="fas fa-users" style="font-size:28px;color:#e67e22;width:36px;text-align:center;flex-shrink:0;"></i>
                  <div><div class="profile-stat-label">Total Users</div><div class="profile-stat-value" id="stat-users">...</div></div>
                </div>
                <div class="profile-stat-box">
                  <i class="fas fa-gamepad" style="font-size:28px;color:#3498db;width:36px;text-align:center;flex-shrink:0;"></i>
                  <div><div class="profile-stat-label">Total Games Played</div><div class="profile-stat-value" id="stat-games">...</div></div>
                </div>
                <div class="profile-stat-box">
                  <i class="fas fa-database" style="font-size:28px;color:#9b59b6;width:36px;text-align:center;flex-shrink:0;"></i>
                  <div><div class="profile-stat-label">Database Size</div><div class="profile-stat-value" id="stat-db">...</div></div>
                </div>
                <div class="profile-stat-box">
                  <i class="fas fa-server" style="font-size:28px;color:#27ae60;width:36px;text-align:center;flex-shrink:0;"></i>
                  <div><div class="profile-stat-label">Server Uptime</div><div class="profile-stat-value" id="stat-uptime">...</div></div>
                </div>
              </div>

              <!-- Charts Row -->
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-md); margin-bottom:var(--space-lg);">
                <div class="profile-stat-box" style="flex-direction:column;align-items:center;">
                  <div style="font-family:'VCR',sans-serif;font-size:var(--text-xs);color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Games by Type</div>
                  <canvas id="chart-games" width="160" height="160" style="max-width:160px;"></canvas>
                </div>
                <div class="profile-stat-box" style="flex-direction:column;align-items:stretch;">
                  <div style="font-family:'VCR',sans-serif;font-size:var(--text-xs);color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Recent Logins (last 7 days)</div>
                  <canvas id="chart-logins" height="150"></canvas>
                </div>
              </div>

              <!-- Activity Log -->
              <h3 style="font-family:'VCR',sans-serif; color:#111; text-transform:uppercase; margin:0 0 var(--space-sm) 0; border-bottom:2px solid #111; padding-bottom:4px;">Recent Activity Log</h3>
              <div class="inf-stats-container" style="max-height: 300px; overflow-y: auto;">
                <div class="inf-stats-header" style="grid-template-columns: 2fr 1.5fr 2fr 1fr;">
                  <div>USERNAME</div>
                  <div>ACTION</div>
                  <div>TIME</div>
                  <div>VALUE</div>
                </div>
                <div id="admin-activity-log">
                  <div style="padding:var(--space-sm);text-align:center;">Loading activity...</div>
                </div>
              </div>
            </div>

            <!-- USERS PANEL -->
            <div id="panel-users" class="profile-panel">
              <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:var(--space-md); border-bottom:2px solid #111; padding-bottom:4px;">
                <h2 style="font-family:'VCR',sans-serif; color:#111; text-transform:uppercase; margin:0; font-size:var(--text-xl);">User Management</h2>
                <button id="btn-refresh-users" title="Refresh" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#111;border:2px solid #111;background:transparent;cursor:pointer;flex-shrink:0;"><i class="fas fa-sync-alt"></i></button>
              </div>
              <style>#user-search::placeholder { color: rgba(0,0,0,0.6); }</style>
              <input id="user-search" type="text" placeholder="Search by username..." class="login-card__input" style="width:100%; margin-bottom:var(--space-md); background: rgba(0,0,0,0.05); color:#111; border-color:#111;" />
              
              <div class="inf-stats-container">
                <div class="inf-stats-header" style="grid-template-columns: 2fr 3fr 1fr 1fr 2.5fr;">
                  <div>USER</div>
                  <div>EMAIL</div>
                  <div>JOINED</div>
                  <div>GAMES</div>
                  <div>ACTIONS</div>
                </div>
                <div id="users-list">
                  <div style="padding:var(--space-sm);text-align:center;">Loading users...</div>
                </div>
              </div>
            </div>

            <!-- LEADERBOARD PANEL -->
            <div id="panel-leaderboard" class="profile-panel">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md); border-bottom:2px solid #111; padding-bottom:4px;">
                <h2 style="font-family:'VCR',sans-serif; color:#111; text-transform:uppercase; margin:0; font-size:var(--text-xl);">Endless Battle</h2>
                <button id="btn-refresh-lb" title="Refresh" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#111;border:2px solid #111;background:transparent;cursor:pointer;flex-shrink:0;"><i class="fas fa-sync-alt"></i></button>
              </div>

              <div style="display:flex; gap:8px; margin-bottom:var(--space-md);">
                <button id="lb-tab-keyboard" class="lb-ctrl-tab active" style="flex:1; padding:8px; font-family:'VCR',sans-serif; font-size:var(--text-sm); border:2px solid #111; background:#111; color:#f5e6cc; cursor:pointer;"><i class="fas fa-keyboard" style="margin-right:6px;"></i>D-PAD</button>
                <button id="lb-tab-gesture" class="lb-ctrl-tab" style="flex:1; padding:8px; font-family:'VCR',sans-serif; font-size:var(--text-sm); border:2px solid #111; background:transparent; color:#111; cursor:pointer;"><i class="fas fa-hand-paper" style="margin-right:6px;"></i>GESTURE</button>
              </div>

              <div class="inf-stats-container">
                <div class="inf-stats-header" style="grid-template-columns: 1fr 3fr 3fr 2fr;">
                  <div>#</div>
                  <div>USER</div>
                  <div>SURVIVAL TIME</div>
                  <div>ACTIONS</div>
                </div>
                <div id="lb-endless-list">
                  <div style="padding:var(--space-sm);text-align:center;">Loading...</div>
                </div>
              </div>
            </div>

            <!-- TESTS PANEL -->
            <div id="panel-tests" class="profile-panel">
              <h2 style="font-family:'VCR',sans-serif; color:#111; text-transform:uppercase; margin:0 0 var(--space-md) 0; font-size:var(--text-xl); border-bottom:2px solid #111; padding-bottom:4px;">Debug & Tests</h2>
              <p style="color:#555; font-size:var(--text-sm); margin-bottom:var(--space-md);">These actions affect your local browser session.</p>
              
              <h3 style="font-family:'VCR',sans-serif; color:#111; margin-bottom: var(--space-xs);">Chapter Unlocks</h3>
              <div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md);">
                <button class="admin-action-btn" data-action="unlock-all" style="border: 2px solid #111; color: #111; background: #e67e22; text-align: left; padding: var(--space-sm); font-family: 'VCR', sans-serif; cursor:pointer;">Unlock ALL Chapters</button>
                <button class="admin-action-btn" data-action="reset-chapters" style="border: 2px solid #111; color: #fff; background: #c0392b; text-align: left; padding: var(--space-sm); font-family: 'VCR', sans-serif; cursor:pointer;">Reset Chapter Progress</button>
              </div>

              <h3 style="font-family:'VCR',sans-serif; color:#111; margin-bottom: var(--space-xs);">Test Game Features</h3>
              <div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md);">
                <button class="admin-action-btn" data-action="easy-win" style="border: 2px solid #111; color: #111; background: #2ecc71; text-align: left; padding: var(--space-sm); font-family: 'VCR', sans-serif; cursor:pointer;">Easy Win Mode (Invincible + One-Hit Kill)</button>
                <button class="admin-action-btn" data-action="god-mode" style="border: 2px solid #111; color: #fff; background: #3498db; text-align: left; padding: var(--space-sm); font-family: 'VCR', sans-serif; cursor:pointer;">God Mode (Invincible Only)</button>
              </div>

              <h3 style="font-family:'VCR',sans-serif; color:#111; margin-bottom: var(--space-xs);">Debug Tools</h3>
              <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
                <button class="admin-action-btn" data-action="export-state" style="border: 2px solid #111; color: #fff; background: #7f8c8d; text-align: left; padding: var(--space-sm); font-family: 'VCR', sans-serif; cursor:pointer;">Export State to Console</button>
                <button class="admin-action-btn" data-action="clear-local" style="border: 2px solid #111; color: #fff; background: #c0392b; text-align: left; padding: var(--space-sm); font-family: 'VCR', sans-serif; cursor:pointer;">Clear Local Storage</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  },

  async onEnter(el) {
    this.container = el;
    
    // Auth Check
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

    // Back Button
    el.querySelector('#btn-admin-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Sidebar Tab Logic
    const tabBtns = el.querySelectorAll('.profile-tab-btn');
    const panels = el.querySelectorAll('.profile-panel');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        panels.forEach(p => p.classList.remove('active'));
        const target = el.querySelector('#' + btn.dataset.target);
        if (target) {
          target.classList.add('active');
          if (btn.dataset.target === 'panel-dashboard') this.loadDashboard();
          if (btn.dataset.target === 'panel-users') this.loadUsers();
          if (btn.dataset.target === 'panel-leaderboard') this.loadLeaderboard();
        }
      });
    });

    // Test Actions Binding
    el.querySelectorAll('.admin-action-btn').forEach(btn => {
      if(btn.dataset.action) {
        btn.addEventListener('click', (e) => this.handleTestAction(e.target.dataset.action));
      }
    });

    el.querySelector('#btn-refresh-users').addEventListener('click', () => this.loadUsers());
    el.querySelector('#btn-refresh-lb').addEventListener('click', () => this.loadLeaderboard(this._activeLbControl || 'keyboard'));

    // Control type tab toggles for leaderboard
    this._activeLbControl = 'keyboard';
    const tabKeyboard = el.querySelector('#lb-tab-keyboard');
    const tabGesture  = el.querySelector('#lb-tab-gesture');
    const activateTab = (active, inactive, ctrl) => {
      active.style.background = '#111';
      active.style.color = '#f5e6cc';
      inactive.style.background = 'transparent';
      inactive.style.color = '#111';
      this._activeLbControl = ctrl;
      this.loadLeaderboard(ctrl);
    };
    tabKeyboard.addEventListener('click', () => activateTab(tabKeyboard, tabGesture, 'keyboard'));
    tabGesture.addEventListener('click',  () => activateTab(tabGesture,  tabKeyboard, 'gesture'));

    // Initial Load
    this.loadDashboard();
  },

  async loadDashboard() {
    try {
      const res = await fetch('/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error();

      this.container.querySelector('#stat-users').textContent = data.stats.totalUsers;
      this.container.querySelector('#stat-games').textContent = data.stats.totalGamesPlayed;
      this.container.querySelector('#stat-db').textContent = (data.stats.dbSize / 1024 / 1024).toFixed(2) + ' MB';
      
      const uptimeH = Math.floor(data.stats.uptime / 3600);
      const uptimeM = Math.floor((data.stats.uptime % 3600) / 60);
      this.container.querySelector('#stat-uptime').textContent = `${uptimeH}h ${uptimeM}m`;

      const actHtml = data.activity.map(a => {
        const timeStr = new Date(a.time).toLocaleString(undefined, { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' });
        return `
          <div class="inf-stat-row" style="grid-template-columns: 2fr 1.5fr 2fr 1fr;">
            <div style="font-weight:bold;">${a.username}</div>
            <div>${a.action}</div>
            <div style="font-size:0.85em;">${timeStr}</div>
            <div style="font-weight:bold;">${a.value !== 0 ? a.value : '-'}</div>
          </div>
        `;
      }).join('');
      
      this.container.querySelector('#admin-activity-log').innerHTML = actHtml || '<div style="padding:8px;text-align:center;">No recent activity</div>';

      // --- Chart: Games by Type (Doughnut) ---
      const gamesCanvas = this.container.querySelector('#chart-games');
      if (gamesCanvas && window.Chart) {
        if (gamesCanvas._chartInstance) gamesCanvas._chartInstance.destroy();
        const infCount  = data.stats.totalInfGames  ?? 0;
        const endCount  = data.stats.totalEndlessGames ?? 0;
        gamesCanvas._chartInstance = new Chart(gamesCanvas, {
          type: 'doughnut',
          data: {
            labels: ['Normal Mode', 'Endless'],
            datasets: [{ data: [infCount, endCount], backgroundColor: ['#3498db','#e67e22'], borderWidth: 2, borderColor: '#111' }]
          },
          options: {
            responsive: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#111', font: { family: "'VCR', monospace", size: 10 }, boxWidth: 12, padding: 8 } }
            },
            cutout: '60%'
          }
        });
      }

      // --- Chart: Logins per day (Bar) ---
      const loginCanvas = this.container.querySelector('#chart-logins');
      if (loginCanvas && window.Chart) {
        if (loginCanvas._chartInstance) loginCanvas._chartInstance.destroy();
        // Build last-7-days buckets from activity
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        });
        const counts = new Array(7).fill(0);
        (data.activity || []).filter(a => a.action === 'Login').forEach(a => {
          const d = new Date(a.time);
          const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const idx = days.indexOf(label);
          if (idx >= 0) counts[idx]++;
        });
        loginCanvas._chartInstance = new Chart(loginCanvas, {
          type: 'bar',
          data: {
            labels: days,
            datasets: [{ label: 'Logins', data: counts, backgroundColor: 'rgba(52,152,219,0.7)', borderColor: '#111', borderWidth: 1 }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#555', font: { family: "'VCR', monospace", size: 9 } }, grid: { display: false } },
              y: { beginAtZero: true, ticks: { color: '#555', stepSize: 1, font: { family: "'VCR', monospace", size: 9 } }, grid: { color: 'rgba(0,0,0,0.07)' } }
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
      this.container.querySelector('#admin-activity-log').innerHTML = '<div style="padding:8px;text-align:center;color:red;">Error loading stats</div>';
    }
  },

  async loadUsers() {
    try {
      const res = await fetch('/admin/users', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error();

      let html = '';
      data.users.forEach(u => {
        const joinDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown';
        const bannedStyle = u.banned ? 'text-decoration:line-through;color:#e74c3c;' : '';
        html += `
          <div class="inf-stat-row admin-user-row" data-username="${u.username.toLowerCase()}" style="grid-template-columns: 2fr 3fr 1fr 1fr 2.5fr; background:${u.banned?'rgba(231,76,60,0.1)':'transparent'}">
            <div style="font-weight:bold;${bannedStyle}">${u.username} ${u.is_admin ? '<span style="color:#f39c12">*</span>' : ''}</div>
            <div style="font-size:0.85em;word-break:break-all;">${u.email || '-'}</div>
            <div style="font-size:0.85em;">${joinDate}</div>
            <div style="font-weight:bold;">${u.games_played || 0}</div>
            <div style="display:flex;gap:4px;align-items:center;">
              <button class="admin-btn ${u.banned?'unban':'ban'}" data-id="${u.id}" data-banned="${u.banned?'1':'0'}" ${u.is_admin?'disabled':''} style="font-size:14px;padding:4px 8px;background:${u.banned?'#27ae60':'#e67e22'};color:#fff;border:1px solid #111;cursor:pointer;" title="${u.banned?'Unban User':'Ban User'}"><i class="fas ${u.banned?'fa-unlock':'fa-ban'}"></i></button>
              <button class="admin-btn delete" data-id="${u.id}" ${u.is_admin?'disabled':''} style="font-size:14px;padding:4px 8px;background:#c0392b;color:#fff;border:1px solid #111;cursor:pointer;" title="Delete User"><i class="fas fa-trash"></i></button>
              <button class="admin-btn logout" data-id="${u.id}" style="font-size:14px;padding:4px 8px;background:#7f8c8d;color:#fff;border:1px solid #111;cursor:pointer;" title="Force Logout"><i class="fas fa-sign-out-alt"></i></button>
            </div>
          </div>
        `;
      });
      
      this.container.querySelector('#users-list').innerHTML = html;

      // Event listeners for user actions
      this.container.querySelectorAll('.admin-btn.ban, .admin-btn.unban').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.currentTarget.dataset.id;
          const isBanned = e.currentTarget.dataset.banned === '1';
          await fetch('/admin/ban', {
            method:'POST', credentials:'include', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId, banned: !isBanned, reason: !isBanned ? 'Admin panel ban' : null })
          });
          this.loadUsers();
        });
      });

      this.container.querySelectorAll('.admin-btn.delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.currentTarget.dataset.id;
          this._showAdminModal('DELETE USER', 'Permanently delete user? This cannot be undone.', async () => {
            await fetch('/admin/delete-user', {
              method:'DELETE', credentials:'include', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ userId })
            });
            this.loadUsers();
          });
        });
      });

      this.container.querySelectorAll('.admin-btn.logout').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = e.currentTarget.dataset.id;
          await fetch('/admin/force-logout', {
            method:'POST', credentials:'include', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId })
          });
          this._showAdminModal('SUCCESS', 'User forced to logout on next request.');
        });
      });

      // Search functionality
      const searchInput = this.container.querySelector('#user-search');
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase();
        this.container.querySelectorAll('.admin-user-row').forEach(row => {
          row.style.display = row.dataset.username.includes(q) ? '' : 'none';
        });
      });

    } catch (e) {
      this.container.querySelector('#users-list').innerHTML = '<div style="padding:8px;text-align:center;color:red;">Error loading users</div>';
    }
  },

  async loadLeaderboard(controlType = 'keyboard') {
    try {
      const res = await fetch('/admin/leaderboard', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error();

      // Filter endless scores by active control type
      const filtered = data.leaderboard.endless.filter(s => s.control_type === controlType);

      let endHtml = '';
      filtered.forEach((s, i) => {
        endHtml += `
          <div class="inf-stat-row ${s.suspicious ? 'suspicious' : ''}" style="grid-template-columns: 1fr 3fr 3fr 2fr; ${s.suspicious?'background:rgba(231,76,60,0.1);border:1px solid #e74c3c;':''}">
            <div style="font-weight:bold;color:#888;">${i+1}</div>
            <div style="font-weight:bold;">${s.username} ${s.suspicious?'<span style="color:#e74c3c;font-size:10px;">⚠️</span>':''}</div>
            <div>${Math.floor(s.survival_seconds/60)}m ${String(s.survival_seconds%60).padStart(2,'0')}s</div>
            <div><button class="admin-btn del-score" data-id="${s.id}" data-type="endless" style="font-size:14px;padding:4px 8px;background:#c0392b;color:#fff;border:1px solid #111;cursor:pointer;" title="Delete Score"><i class="fas fa-trash"></i></button></div>
          </div>
        `;
      });
      this.container.querySelector('#lb-endless-list').innerHTML = endHtml || '<div style="padding:8px;text-align:center;">No records</div>';

      this.container.querySelectorAll('.del-score').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const target = e.target.closest('button');
          this._showAdminModal('DELETE SCORE', 'Delete this score entry? This cannot be undone.', async () => {
            const id = target.dataset.id;
            const type = target.dataset.type;
            await fetch('/admin/delete-score', {
              method:'DELETE', credentials:'include', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ id, type })
            });
            this.loadLeaderboard(this._activeLbControl || 'keyboard');
          });
        });
      });
    } catch (e) {
      this.container.querySelector('#lb-endless-list').innerHTML = '<div style="padding:8px;text-align:center;color:red;">Error loading</div>';
    }
  },

  async _launchTestMode(settings) {
    try {
      const res = await fetch('/admin/test-token', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) { this._showAdminModal('ERROR', 'Failed to get test token.'); return; }
      const { token } = await res.json();
      sessionStorage.setItem('admin_test_token', token);
      window.__screenManager.navigate('game-screen');
    } catch (e) {
      this._showAdminModal('ERROR', 'Network error occurred.');
    }
  },

  _showAdminModal(title, msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'profile-modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '9999';

    const isConfirm = typeof onConfirm === 'function';

    overlay.innerHTML = `
      <div class="profile-modal-box" style="background:#130f04; border:2px solid #555; padding:var(--space-lg); max-width:400px; width:90%; font-family:'VCR',sans-serif;">
        <h3 style="color:var(--accent-orange, #e74c3c);font-size:var(--text-lg);text-transform:uppercase;margin:0 0 var(--space-sm);text-align:center;">${title}</h3>
        <p style="color:#f0e6d3;font-size:var(--text-md);text-align:center;margin:0 0 var(--space-md);">${msg}</p>
        <div style="display:flex;gap:var(--space-sm);">
          ${isConfirm ? `<button id="admin-modal-cancel" style="flex:1;background:transparent;border:2px solid #555; color:#fff; font-family:'VCR',sans-serif; padding:8px; cursor:pointer;">CANCEL</button>` : ''}
          <button id="admin-modal-confirm" style="flex:1;background:var(--accent-orange, #f39c12);border:2px solid #111; color:#111; font-family:'VCR',sans-serif; font-weight:bold; padding:8px; cursor:pointer;">${isConfirm ? 'CONFIRM' : 'OK'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    
    overlay.querySelector('#admin-modal-confirm').addEventListener('click', () => {
      close();
      if (isConfirm) onConfirm();
    });

    if (isConfirm) {
      overlay.querySelector('#admin-modal-cancel').addEventListener('click', close);
    }
  },

  handleTestAction(action) {
    switch (action) {
      case 'unlock-all': {
        const progress = state.get('chapterProgress');
        progress.chaptersUnlocked = [1, 2, 3];
        state.set('chapterProgress', progress);
        state.saveChapterProgress();
        this._showAdminModal('SUCCESS', 'All chapters unlocked!');
        break;
      }
      case 'reset-chapters': {
        this._showAdminModal('RESET PROGRESS', 'Are you sure you want to reset all chapter progress?', () => {
          state.set('chapterProgress', { chaptersUnlocked: [1], chaptersCompleted: [], bestScores: {} });
          state.saveChapterProgress();
          this._showAdminModal('SUCCESS', 'Chapter progress reset!');
        });
        break;
      }
      case 'easy-win': {
        this._launchTestMode({ mode: 'easy_win', chapterId: 1, invincible: true, oneHitKill: true });
        break;
      }
      case 'god-mode': {
        this._launchTestMode({ mode: 'god_mode', chapterId: 1, invincible: true });
        break;
      }
      case 'export-state': {
        console.log('=== GAME STATE ===');
        console.log('Settings:', state.get('settings'));
        console.log('Chapter Progress:', state.get('chapterProgress'));
        this._showAdminModal('EXPORTED', 'Game state exported to browser console (F12).');
        break;
      }
      case 'clear-local': {
        this._showAdminModal('CLEAR DATA', 'Clear all local storage? This will log you out locally.', () => {
          localStorage.clear();
          sessionStorage.clear();
          this._showAdminModal('CLEARED', 'Local storage cleared. Please refresh the page.');
        });
        break;
      }
    }
  }
};
