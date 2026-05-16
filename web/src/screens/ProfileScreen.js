import { state } from '../utils/StateManager.js';
import { DialogueBox } from '../utils/DialogueBox.js';

export const ProfileScreen = {
  render() {
    return `
      <div class="settings-screen screen" id="profile-container">
        <div class="settings-screen__content" id="profile-content-wrapper" style="background: transparent; border: none; box-shadow: none;">
          <!-- SIDEBAR NAVIGATION -->
          <div class="profile-sidebar">
            <button class="back-btn" id="btn-profile-back">
              <i class="fas fa-caret-left"></i> BACK TO MENU
            </button>
            <button class="profile-tab-btn active" data-target="panel-stats">ID CARD / STATS</button>
            <button class="profile-tab-btn" data-target="panel-account" id="tab-btn-account">ACCOUNT SETTINGS</button>
            <button class="profile-tab-btn" data-target="panel-danger" id="tab-btn-danger">THE VOID</button>
            <button class="profile-tab-btn" id="btn-admin-panel" style="display: none; color: #e74c3c;">ADMIN PANEL</button>
          </div>

          <!-- MAIN CONTENT AREA -->
          <div class="profile-content-area scrollable">
          
          <!-- STATS / ID CARD PANEL -->
          <div id="panel-stats" class="profile-panel active">
            
            <div class="id-card-header">
              <div class="id-card-avatar" id="id-card-avatar">?</div>
              <div class="id-card-info">
                <h2 id="profile-username">Loading...</h2>
                <div class="id-card-badge" id="profile-account-type">GUEST</div>
              </div>
            </div>

            <div id="profile-stats-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); margin-bottom: var(--space-md);">
              <div class="profile-stat-box">
                <div class="profile-stat-label">Email</div>
                <div class="profile-stat-value" id="profile-email">-</div>
              </div>
              <div class="profile-stat-box">
                <div class="profile-stat-label">Member Since</div>
                <div class="profile-stat-value" id="profile-date">-</div>
              </div>
              <div class="profile-stat-box" style="grid-column: span 2;">
                <div class="profile-stat-label">Total Games Played</div>
                <div class="profile-stat-value" id="profile-games">-</div>
              </div>
            </div>

            <!-- NORMAL MODE STATS -->
            <h3 style="font-family:'VCR',sans-serif; color:#111; text-transform:uppercase; margin:var(--space-md) 0 0 0; letter-spacing:1px; border-bottom:2px solid #111; padding-bottom:4px;">Normal Mode Records</h3>
            <div class="inf-stats-container">
              <div class="inf-stats-header">
                <div>CHAPTER</div>
                <div>BEST TIME</div>
                <div>RANK</div>
              </div>
              <div class="inf-stat-row">
                <div class="inf-stat-chapter">1: Suburbs</div>
                <div class="inf-stat-time" id="inf-ch1-time">Loading...</div>
                <div class="inf-stat-rank" id="inf-ch1-rank">-</div>
              </div>
              <div class="inf-stat-row">
                <div class="inf-stat-chapter">2: Old Manila</div>
                <div class="inf-stat-time" id="inf-ch2-time">Loading...</div>
                <div class="inf-stat-rank" id="inf-ch2-rank">-</div>
              </div>
              <div class="inf-stat-row">
                <div class="inf-stat-chapter">3: Underworld</div>
                <div class="inf-stat-time" id="inf-ch3-time">Loading...</div>
                <div class="inf-stat-rank" id="inf-ch3-rank">-</div>
              </div>
            </div>

            <!-- GUEST PROMO -->
            <div id="profile-guest-promo" style="display: none; margin-top: var(--space-md); flex-direction: column; align-items: stretch;" class="profile-card">
              <h3 style="color: var(--accent-orange); font-family: var(--font-display); font-size: var(--text-md); margin-bottom: var(--space-sm); letter-spacing: 1px;">CREATE AN ACCOUNT</h3>
              <p style="font-size: var(--text-sm); line-height: 1.5; margin-bottom: var(--space-md);">Guest progress is only saved locally. Register a full account to track your stats, appear on the leaderboard, and keep your progress safe!</p>
              <button id="btn-profile-register" style="padding: var(--space-sm) var(--space-md); font-size: var(--text-sm); width: 100%;">REGISTER NOW</button>
            </div>

          </div>

          <!-- ACCOUNT PANEL -->
          <div id="panel-account" class="profile-panel">
            <h2 style="font-family:var(--font-display); color:#111; margin-bottom:var(--space-md); border-bottom:3px solid #111; padding-bottom:8px;">Account Settings</h2>
            
            <div id="cu-group" class="profile-card">
              <div>
                <h3>Username</h3>
                <p style="font-family:'VCR',sans-serif;font-size:12px;margin-top:4px;">How you appear to others</p>
              </div>
              <button id="btn-modal-username" style="padding: var(--space-sm) var(--space-md); font-family:'VCR',sans-serif; font-size: var(--text-sm);">CHANGE</button>
            </div>

            <div id="ce-group" class="profile-card">
              <div>
                <h3>Email Address</h3>
                <p style="font-family:'VCR',sans-serif;font-size:12px;margin-top:4px;">For account recovery</p>
              </div>
              <button id="btn-modal-email" style="padding: var(--space-sm) var(--space-md); font-family:'VCR',sans-serif; font-size: var(--text-sm);">CHANGE</button>
            </div>

            <div class="profile-card" id="cp-group">
              <div>
                <h3>Password</h3>
                <p style="font-family:'VCR',sans-serif;font-size:12px;margin-top:4px;">Keep your account secure</p>
              </div>
              <button id="btn-modal-password" style="padding: var(--space-sm) var(--space-md); font-family:'VCR',sans-serif; font-size: var(--text-sm);">CHANGE</button>
            </div>

            <div class="profile-card" id="ca-group">
              <div>
                <h3>Profile Picture</h3>
                <p style="font-family:'VCR',sans-serif;font-size:12px;margin-top:4px;">Customize your ID Card</p>
              </div>
              <button id="btn-modal-avatar" style="padding: var(--space-sm) var(--space-md); font-family:'VCR',sans-serif; font-size: var(--text-sm);">CHANGE</button>
            </div>
          </div>

          <!-- DANGER PANEL -->
          <div id="panel-danger" class="profile-panel" style="background: #cfb9b9; border-color: #8b0000;">
            <h2 style="font-family:var(--font-display); color:#8b0000; margin-bottom:var(--space-md); border-bottom:3px solid #8b0000; padding-bottom:8px;">System Access</h2>
            
            <div class="profile-card" style="border-color: #8b0000; background:rgba(255,255,255,0.6); flex-direction: column; align-items: stretch; gap: var(--space-md);">
              <h3 style="color: #8b0000;">Session Management</h3>
              <button id="btn-profile-logout" style="padding: var(--space-sm); font-family:'VCR',sans-serif; font-size: var(--text-sm);">LOGOUT CURRENT DEVICE</button>
              <button id="btn-logout-all" style="padding: var(--space-sm); font-family:'VCR',sans-serif; font-size: var(--text-sm); display: none;">LOG OUT ALL DEVICES</button>
            </div>

            <div id="da-group" class="profile-card" style="display: none; border-color: #8b0000; background: rgba(139, 0, 0, 0.1); flex-direction: column; align-items: stretch; gap: var(--space-sm);">
              <h3 style="color: #8b0000; margin: 0;">Danger Zone</h3>
              <p style="font-family:'VCR',sans-serif; font-size: var(--text-sm); margin-bottom: var(--space-xs); color:#111;">Once you delete your account, there is no going back. Please be certain.</p>
              <button id="btn-modal-delete" style="width: 100%; background: #8b0000; border: 2px solid #111; color: #fff; cursor: pointer; letter-spacing: 2px; text-transform: uppercase; padding: var(--space-sm) var(--space-md); transition: all 0.2s ease;">Delete Account</button>
            </div>
          </div>

        </div> <!-- End profile-content-area -->
        </div> <!-- End settings-screen__content -->
      </div>
    `;
  },

  async onEnter(el) {
    el.querySelector('#btn-profile-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Tab Logic
    const tabBtns = el.querySelectorAll('.profile-tab-btn');
    const panels = el.querySelectorAll('.profile-panel');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetPanel = el.querySelector('#' + targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    let isRegistered = false;
    let fallbackUsername = '';
    let isGuest = false;

    try {
      const stored = localStorage.getItem('guest_session') || sessionStorage.getItem('guest_session');
      if (stored) {
        try {
          const session = JSON.parse(stored);
          if (session && session.is_guest === false) {
            isRegistered = true;
            fallbackUsername = session.username || '';
          }
        } catch(e) {
          isGuest = true;
          try {
            const secretKeyStr = "BATA_TAKBO_SECRET_KEY_256BIT_000";
            const enc = new TextEncoder();
            const keyData = enc.encode(secretKeyStr);
            const key = await window.crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["decrypt"]);
            
            const encryptedBase64 = stored;
            const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);
            
            const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
            const dec = new TextDecoder();
            const session = JSON.parse(dec.decode(decryptedBuffer));
            if (session && session.is_guest) {
              fallbackUsername = session.username || 'Guest';
            }
          } catch(decErr) {
            fallbackUsername = 'Guest';
          }
        }
      }
    } catch (e) {}

    let username = fallbackUsername;
    let accountType = isGuest ? 'Guest' : 'Registered';
    let registeredAt = null;
    let profileEmail = null;
    let avatarUrl = null;

    if (isRegistered) {
      try {
        const res = await fetch('/auth/profile', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          username = data.username || fallbackUsername;
          if (data.accountType) accountType = data.accountType;
          registeredAt = data.registeredAt;
          profileEmail = data.email || null;
          avatarUrl = data.avatar_url || null;
        }
      } catch (err) {}
    }

    const pAvatar = el.querySelector('#id-card-avatar');
    if (pAvatar && username) {
      if (avatarUrl) {
        pAvatar.innerHTML = `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:2px;" alt="avatar" />`;
      } else {
        pAvatar.textContent = username.charAt(0).toUpperCase();
      }
    }
    
    const pUser = el.querySelector('#profile-username');
    if (pUser) pUser.textContent = username;
    
    const pType = el.querySelector('#profile-account-type');
    if (pType) {
      pType.textContent = accountType;
      if (isGuest) {
        pType.style.background = '#555';
      }
    }
    
    const pEmail = el.querySelector('#profile-email');
    if (pEmail) pEmail.textContent = profileEmail || '-';

    const pDate = el.querySelector('#profile-date');
    if (pDate && registeredAt) {
      const d = new Date(registeredAt);
      pDate.textContent = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    const progress = state.get('chapterProgress');
    let gamesPlayed = 0;
    
    if (progress) {
      if (progress.chaptersCompleted) gamesPlayed = progress.chaptersCompleted.length;
    }
    
    const pGames = el.querySelector('#profile-games');
    if (pGames) pGames.textContent = gamesPlayed.toString();
    
    const guestPromoContainer = el.querySelector('#profile-guest-promo');
    const cuGroup = el.querySelector('#cu-group');
    const cpGroup = el.querySelector('#cp-group');
    const ceGroup = el.querySelector('#ce-group');
    const tabAccountBtn = el.querySelector('#tab-btn-account');

    if (isGuest) {
      if (guestPromoContainer) guestPromoContainer.style.display = 'flex';
      if (cuGroup) cuGroup.style.display = 'none';
      if (cpGroup) cpGroup.style.display = 'none';
      if (ceGroup) ceGroup.style.display = 'none';
      if (tabAccountBtn) tabAccountBtn.style.display = 'none';
    } else {
      if (guestPromoContainer) guestPromoContainer.style.display = 'none';
      this._loadInfiniteRanks(username, el);
    }

    const btnPromoReg = el.querySelector('#btn-profile-register');
    if (btnPromoReg) {
      btnPromoReg.addEventListener('click', () => state.logout());
    }

    // Modal Triggers
    const btnModalUsername = el.querySelector('#btn-modal-username');
    if (btnModalUsername) btnModalUsername.addEventListener('click', () => this._showUsernameModal());

    const btnModalEmail = el.querySelector('#btn-modal-email');
    if (btnModalEmail) btnModalEmail.addEventListener('click', () => this._showEmailModal());

    const btnModalPassword = el.querySelector('#btn-modal-password');
    if (btnModalPassword) btnModalPassword.addEventListener('click', () => this._showPasswordModal());

    const btnModalDelete = el.querySelector('#btn-modal-delete');
    if (btnModalDelete) btnModalDelete.addEventListener('click', () => this._showDeleteAccountModal());

    const btnAvatar = el.querySelector('#btn-modal-avatar');
    if (btnAvatar) {
      btnAvatar.addEventListener('click', () => this._showAvatarModal());
    }// System Access
    const logoutAllBtn = el.querySelector('#btn-logout-all');
    if (!isGuest && isRegistered && logoutAllBtn) {
      logoutAllBtn.style.display = 'block';
      logoutAllBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/auth/logout-all', { method: 'POST', credentials: 'include' });
          if (res.ok) state.logout();
        } catch (e) { console.error(e); }
      });
    }

    const daGroup = el.querySelector('#da-group');
    if (!isGuest && isRegistered && daGroup) {
      daGroup.style.display = 'flex';
    }

    try {
      const adminRes = await fetch('/admin/check', { credentials: 'include' });
      const adminData = await adminRes.json();
      const adminBtn = el.querySelector('#btn-admin-panel');
      if (adminBtn && adminData.isAdmin) {
        adminBtn.style.display = 'block';
        adminBtn.addEventListener('click', () => window.__screenManager.navigate('admin-dashboard'));
      }
    } catch (e) {}

    const pLogoutBtn = el.querySelector('#btn-profile-logout');
    if (pLogoutBtn) {
      pLogoutBtn.addEventListener('click', () => {
        const dialogue = new DialogueBox('screen-container');
        dialogue.show({
          text: "Are you sure you want to log out?",
          subtext: 'You will need to log back in to play.',
          portrait: '/assets/entity/character-icon/character.png',
          portraitFrames: 5,
          position: 'center',
          overlay: true,
          typewriter: true,
          buttons: [
            { label: 'Yes, Log Out', action: 'logout' },
            { label: 'Cancel', action: 'cancel', style: 'subtle' }
          ]
        }, (action) => {
          dialogue.hide();
          if (action === 'logout') state.logout();
        });
      });
    }
  },

  async _loadInfiniteRanks(username, el) {
    const formatSeconds = (totalSeconds) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    for (let ch = 1; ch <= 3; ch++) {
      const timeEl = el.querySelector(`#inf-ch${ch}-time`);
      const rankEl = el.querySelector(`#inf-ch${ch}-rank`);
      
      try {
        // Fetch keyboard leaderboard as standard
        const res = await fetch(`/leaderboard/inf?chapterId=${ch}&controlType=keyboard`);
        const data = await res.json();
        
        let found = false;
        if (data.entries) {
          const rankIndex = data.entries.findIndex(e => e.username === username);
          if (rankIndex !== -1) {
            const entry = data.entries[rankIndex];
            timeEl.textContent = entry.survival_seconds ? formatSeconds(entry.survival_seconds) : `Score: ${entry.best_score}`;
            rankEl.textContent = `#${rankIndex + 1}`;
            rankEl.style.fontWeight = 'bold';
            if (rankIndex === 0) rankEl.style.color = '#d4af37'; // Gold
            else if (rankIndex === 1) rankEl.style.color = '#71706e'; // Silver
            else if (rankIndex === 2) rankEl.style.color = '#cd7f32'; // Bronze
            else rankEl.style.color = '#111';
            found = true;
          }
        }
        
        if (!found) {
          timeEl.textContent = 'Unranked';
          rankEl.textContent = '> 20';
        }
      } catch (err) {
        if (timeEl) timeEl.textContent = 'Error';
        if (rankEl) rankEl.textContent = '-';
      }
    }
  },

  _createModalOverlay() {
    const existing = document.getElementById('profile-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'profile-modal-overlay';
    overlay.className = 'profile-modal-overlay';
    document.body.appendChild(overlay);
    return overlay;
  },

  _showUsernameModal() {
    const overlay = this._createModalOverlay();
    overlay.innerHTML = `
      <div class="profile-modal-box">
        <h3 style="color:var(--accent-orange);font-family:'VCR',sans-serif;font-size:var(--text-lg);text-transform:uppercase;margin:0 0 var(--space-sm);text-align:center;">Change Username</h3>
        <input id="modal-username-new" type="text" placeholder="NEW USERNAME" class="login-card__input" maxlength="20" autocomplete="off" style="margin-bottom:var(--space-xs); background: rgba(255,255,255,0.1); border-color: #555;" />
        <p id="modal-username-msg" style="font-family:'VCR',sans-serif;font-size:var(--text-sm);font-weight:bold;min-height:1.2em;text-align:center;margin:0 0 var(--space-sm);color:var(--accent-red);"></p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="modal-username-cancel" style="flex:1;background:transparent;border:2px solid #555; color:#fff; font-family:'VCR',sans-serif; padding:8px; cursor:pointer;">CANCEL</button>
          <button id="modal-username-confirm" style="flex:1;background:var(--accent-orange);border:2px solid #111; color:#111; font-family:'VCR',sans-serif; font-weight:bold; padding:8px; cursor:pointer;">SAVE</button>
        </div>
      </div>
    `;

    const input = overlay.querySelector('#modal-username-new');
    const msg = overlay.querySelector('#modal-username-msg');
    const confirmBtn = overlay.querySelector('#modal-username-confirm');
    const cancelBtn = overlay.querySelector('#modal-username-cancel');

    setTimeout(() => input.focus(), 50);

    const closeModal = () => overlay.remove();
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const submit = async () => {
      const newUsername = input.value.trim();
      if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
        msg.textContent = 'Username must be 3-20 chars.';
        return;
      }
      const regex = /^[a-zA-Z0-9_-]+$/;
      if (!regex.test(newUsername)) {
        msg.textContent = 'Only letters, numbers, _, and - allowed.';
        return;
      }
      confirmBtn.textContent = 'SAVING...';
      confirmBtn.disabled = true;

      try {
        const res = await fetch('/auth/change-username', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newUsername })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const pUser = document.querySelector('#profile-username');
          if (pUser) pUser.textContent = data.username;
          const pAvatar = document.querySelector('#id-card-avatar');
          if (pAvatar) pAvatar.textContent = data.username.charAt(0);
          closeModal();
        } else {
          msg.textContent = data.error || 'Failed to change username.';
          confirmBtn.textContent = 'SAVE';
          confirmBtn.disabled = false;
        }
      } catch (err) {
        msg.textContent = 'Network error.';
        confirmBtn.textContent = 'SAVE';
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') closeModal(); });
  },

  _showEmailModal() {
    const overlay = this._createModalOverlay();
    overlay.innerHTML = `
      <div class="profile-modal-box">
        <h3 style="color:var(--accent-orange);font-family:'VCR',sans-serif;font-size:var(--text-lg);text-transform:uppercase;margin:0 0 var(--space-sm);text-align:center;">Change Email</h3>
        <input id="modal-email-new" type="email" placeholder="NEW EMAIL" class="login-card__input" maxlength="255" autocomplete="off" style="margin-bottom:8px; background: rgba(255,255,255,0.1); border-color: #555;" />
        <input id="modal-email-pass" type="password" placeholder="CURRENT PASSWORD" class="login-card__input" style="margin-bottom:var(--space-xs); background: rgba(255,255,255,0.1); border-color: #555;" />
        <p id="modal-email-msg" style="font-family:'VCR',sans-serif;font-size:var(--text-sm);font-weight:bold;min-height:1.2em;text-align:center;margin:0 0 var(--space-sm);color:var(--accent-red);"></p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="modal-email-cancel" style="flex:1;background:transparent;border:2px solid #555; color:#fff; font-family:'VCR',sans-serif; padding:8px; cursor:pointer;">CANCEL</button>
          <button id="modal-email-confirm" style="flex:1;background:var(--accent-orange);border:2px solid #111; color:#111; font-family:'VCR',sans-serif; font-weight:bold; padding:8px; cursor:pointer;">SAVE</button>
        </div>
      </div>
    `;

    const inputNew = overlay.querySelector('#modal-email-new');
    const inputPass = overlay.querySelector('#modal-email-pass');
    const msg = overlay.querySelector('#modal-email-msg');
    const confirmBtn = overlay.querySelector('#modal-email-confirm');
    const cancelBtn = overlay.querySelector('#modal-email-cancel');

    setTimeout(() => inputNew.focus(), 50);
    const closeModal = () => overlay.remove();
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const submit = async () => {
      const newEmail = inputNew.value.trim();
      const password = inputPass.value;
      if (!newEmail || !password) {
        msg.textContent = 'Both fields are required.';
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        msg.textContent = 'Invalid email address.';
        return;
      }
      confirmBtn.textContent = 'SAVING...';
      confirmBtn.disabled = true;

      try {
        const res = await fetch('/auth/change-email', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const pEmail = document.querySelector('#profile-email');
          if (pEmail) pEmail.textContent = newEmail.toLowerCase();
          closeModal();
        } else {
          msg.textContent = data.error || 'Failed to update email.';
          confirmBtn.textContent = 'SAVE';
          confirmBtn.disabled = false;
        }
      } catch (err) {
        msg.textContent = 'Network error.';
        confirmBtn.textContent = 'SAVE';
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submit);
    inputNew.addEventListener('keydown', (e) => { if (e.key === 'Enter') inputPass.focus(); if (e.key === 'Escape') closeModal(); });
    inputPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') closeModal(); });
  },

  _showPasswordModal() {
    const overlay = this._createModalOverlay();
    overlay.innerHTML = `
      <div class="profile-modal-box">
        <h3 style="color:var(--accent-orange);font-family:'VCR',sans-serif;font-size:var(--text-lg);text-transform:uppercase;margin:0 0 var(--space-sm);text-align:center;">Change Password</h3>
        <input id="modal-pass-current" type="password" placeholder="CURRENT PASSWORD" class="login-card__input" style="margin-bottom:8px; background: rgba(255,255,255,0.1); border-color: #555;" />
        <input id="modal-pass-new" type="password" placeholder="NEW PASSWORD" class="login-card__input" style="margin-bottom:8px; background: rgba(255,255,255,0.1); border-color: #555;" />
        <input id="modal-pass-confirm" type="password" placeholder="CONFIRM NEW PASSWORD" class="login-card__input" style="margin-bottom:var(--space-xs); background: rgba(255,255,255,0.1); border-color: #555;" />
        <p id="modal-pass-msg" style="font-family:'VCR',sans-serif;font-size:var(--text-sm);font-weight:bold;min-height:1.2em;text-align:center;margin:0 0 var(--space-sm);color:var(--accent-red);"></p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="modal-pass-cancel" style="flex:1;background:transparent;border:2px solid #555; color:#fff; font-family:'VCR',sans-serif; padding:8px; cursor:pointer;">CANCEL</button>
          <button id="modal-pass-confirm-btn" style="flex:1;background:var(--accent-orange);border:2px solid #111; color:#111; font-family:'VCR',sans-serif; font-weight:bold; padding:8px; cursor:pointer;">SAVE</button>
        </div>
      </div>
    `;

    const current = overlay.querySelector('#modal-pass-current');
    const inputNew = overlay.querySelector('#modal-pass-new');
    const confirm = overlay.querySelector('#modal-pass-confirm');
    const msg = overlay.querySelector('#modal-pass-msg');
    const confirmBtn = overlay.querySelector('#modal-pass-confirm-btn');
    const cancelBtn = overlay.querySelector('#modal-pass-cancel');

    setTimeout(() => current.focus(), 50);
    const closeModal = () => overlay.remove();
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const submit = async () => {
      const curr = current.value;
      const nw = inputNew.value;
      const cnf = confirm.value;
      if (!curr || !nw || !cnf) { msg.textContent = 'All fields required.'; return; }
      if (nw !== cnf) { msg.textContent = 'Passwords do not match.'; return; }
      if (nw.length < 8 || nw.length > 50) { msg.textContent = 'Password must be 8-50 chars.'; return; }
      if (!/\d/.test(nw) || !/[^a-zA-Z0-9]/.test(nw) || !/[A-Z]/.test(nw)) {
        msg.textContent = 'Needs number, uppercase, & special char.';
        return;
      }
      
      confirmBtn.textContent = 'SAVING...';
      confirmBtn.disabled = true;

      try {
        const res = await fetch('/auth/change-password', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: curr, newPassword: nw })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeModal();
        } else {
          msg.textContent = data.error || 'Failed to change password.';
          confirmBtn.textContent = 'SAVE';
          confirmBtn.disabled = false;
        }
      } catch (err) {
        msg.textContent = 'Network error.';
        confirmBtn.textContent = 'SAVE';
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submit);
    current.addEventListener('keydown', (e) => { if (e.key === 'Enter') inputNew.focus(); if (e.key === 'Escape') closeModal(); });
    inputNew.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirm.focus(); if (e.key === 'Escape') closeModal(); });
    confirm.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') closeModal(); });
  },

  _showDeleteAccountModal() {
    const overlay = this._createModalOverlay();
    overlay.innerHTML = `
      <div class="profile-modal-box" style="border-color: var(--accent-red);">
        <h3 style="color:var(--accent-red);font-family:'VCR',sans-serif;font-size:var(--text-lg);text-transform:uppercase;margin:0 0 var(--space-xs);text-align:center;letter-spacing:2px;text-shadow:var(--glow-red);">Delete Account</h3>
        <p style="color:var(--text-secondary);font-family:'VCR',sans-serif;font-size:var(--text-sm);text-align:center;margin-bottom:var(--space-md);line-height:1.5;">This is <b style="color:var(--text-primary);">PERMANENT</b>. All your data and progress will be erased.</p>
        <p style="color:#fff;font-family:'VCR',sans-serif;font-size:var(--text-xs);text-align:center;margin-bottom:4px;letter-spacing:1px;">Type <b style="color:var(--accent-red);">DELETE</b> to confirm:</p>
        <input id="da-modal-confirm-text" type="text" placeholder="DELETE" class="login-card__input" autocomplete="off" style="text-align:center; border-color: rgba(230,57,70,0.5); background: rgba(255,255,255,0.1); color:#fff; margin-bottom:8px;" />
        <input id="da-modal-password" type="password" placeholder="ACCOUNT PASSWORD" class="login-card__input" style="text-align:center; margin-bottom:var(--space-xs); background: rgba(255,255,255,0.1); color:#fff; border-color:#555;" />
        <p id="da-modal-msg" style="font-family:'VCR',sans-serif;font-size:var(--text-sm);font-weight:bold;min-height:1.2em;text-align:center;margin:0 0 var(--space-sm);color:var(--accent-red);"></p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="da-modal-cancel" style="flex:1;background:transparent;border:2px solid #555; color:#fff; font-family:'VCR',sans-serif; padding:8px; cursor:pointer;">CANCEL</button>
          <button id="da-modal-confirm" style="flex:1;background:var(--accent-red);border:2px solid #111; color:#fff; font-family:'VCR',sans-serif; font-weight:bold; padding:8px; cursor:pointer;" disabled>DELETE</button>
        </div>
      </div>
    `;

    const confirmText = overlay.querySelector('#da-modal-confirm-text');
    const pwInput = overlay.querySelector('#da-modal-password');
    const msg = overlay.querySelector('#da-modal-msg');
    const confirmBtn = overlay.querySelector('#da-modal-confirm');
    const cancelBtn = overlay.querySelector('#da-modal-cancel');

    setTimeout(() => confirmText.focus(), 50);

    const validateDelete = () => {
      if (confirmText.value === 'DELETE') {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
      } else {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
      }
    };

    confirmText.addEventListener('input', validateDelete);

    const closeModal = () => overlay.remove();
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const submit = async () => {
      if (confirmText.value !== 'DELETE') return;
      const password = pwInput.value;
      if (!password) { msg.textContent = 'Password is required.'; return; }
      
      confirmBtn.textContent = 'DELETING...';
      confirmBtn.disabled = true;
      msg.textContent = '';

      try {
        const res = await fetch('/auth/delete-account', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeModal();
          state.logout();
        } else {
          msg.textContent = data.error || 'Failed to delete account.';
          confirmBtn.textContent = 'DELETE';
          confirmBtn.disabled = false;
        }
      } catch (err) {
        msg.textContent = 'Network error.';
        confirmBtn.textContent = 'DELETE';
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submit);
    confirmText.addEventListener('keydown', (e) => { if (e.key === 'Enter') pwInput.focus(); if (e.key === 'Escape') closeModal(); });
    pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') closeModal(); });
  },

  _showAvatarModal() {
    const overlay = this._createModalOverlay();
    overlay.innerHTML = `
      <div class="profile-modal-box">
        <h3 style="color:var(--accent-orange);font-family:'VCR',sans-serif;font-size:var(--text-lg);text-transform:uppercase;margin:0 0 var(--space-sm);text-align:center;">Profile Picture</h3>
        <p style="color:var(--text-secondary);font-family:'VCR',sans-serif;font-size:var(--text-sm);text-align:center;margin-bottom:var(--space-sm);line-height:1.5;">Paste an image URL below. Leave blank to remove your current picture.</p>
        <input id="modal-avatar-url" type="url" placeholder="https://example.com/image.png" class="login-card__input" style="margin-bottom:var(--space-xs); background: rgba(255,255,255,0.1); border-color: #555;" />
        <p id="modal-avatar-msg" style="font-family:'VCR',sans-serif;font-size:var(--text-sm);font-weight:bold;min-height:1.2em;text-align:center;margin:0 0 var(--space-sm);color:var(--accent-red);"></p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="modal-avatar-cancel" style="flex:1;background:transparent;border:2px solid #555; color:#fff; font-family:'VCR',sans-serif; padding:8px; cursor:pointer;">CANCEL</button>
          <button id="modal-avatar-confirm" style="flex:1;background:var(--accent-orange);border:2px solid #111; color:#111; font-family:'VCR',sans-serif; font-weight:bold; padding:8px; cursor:pointer;">SAVE</button>
        </div>
      </div>
    `;

    const input = overlay.querySelector('#modal-avatar-url');
    const msg = overlay.querySelector('#modal-avatar-msg');
    const confirmBtn = overlay.querySelector('#modal-avatar-confirm');
    const cancelBtn = overlay.querySelector('#modal-avatar-cancel');

    setTimeout(() => input.focus(), 50);
    const closeModal = () => overlay.remove();
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const submit = async () => {
      const url = input.value.trim();
      if (url) {
        try { new URL(url); } catch(e) {
          msg.textContent = 'Please enter a valid URL.';
          return;
        }
      }
      confirmBtn.textContent = 'SAVING...';
      confirmBtn.disabled = true;
      try {
        const res = await fetch('/auth/change-avatar', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: url || null })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const pAvatar = document.querySelector('#id-card-avatar');
          if (pAvatar) {
            if (url) {
              pAvatar.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:2px;" alt="avatar" />`;
            } else {
              const name = document.querySelector('#profile-username');
              pAvatar.textContent = (name?.textContent || '?').charAt(0).toUpperCase();
            }
          }
          closeModal();
        } else {
          msg.textContent = data.error || 'Failed to update picture.';
          confirmBtn.textContent = 'SAVE';
          confirmBtn.disabled = false;
        }
      } catch (err) {
        msg.textContent = 'Network error. Try again.';
        confirmBtn.textContent = 'SAVE';
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') closeModal(); });
  },

  onLeave() {
  }
};
