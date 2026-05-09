import { state } from '../utils/StateManager.js';
import { DialogueBox } from '../utils/DialogueBox.js';

export const ProfileScreen = {
  render() {
    return `
      <div class="settings-screen screen" id="profile-container">
        <button class="back-btn" id="btn-profile-back">Back</button>
        
        <h1 class="screen-title" style="animation: fadeInUp 0.4s ease forwards;">
          Profile
        </h1>
        
        <div class="settings-screen__content scrollable" style="text-align: center;">
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.1s; opacity: 0; padding: var(--space-lg) var(--space-md);">
            <div id="profile-avatar-container">
              <div style="width: 80px; height: 80px; background-color: var(--accent-orange); border-radius: 50%; margin: 0 auto var(--space-md); animation: pulse 1.5s infinite;"></div>
            </div>
            
            <h2 id="profile-username" style="color: var(--text-primary); margin-bottom: var(--space-xs);">Loading...</h2>
            <p id="profile-account-type" style="color: var(--text-dim); font-size: var(--text-sm); margin-bottom: var(--space-md);"></p>
            
            <div id="profile-stats-container">
              <div class="setting-row" style="justify-content: space-between;">
                <span class="setting-row__label">Member Since</span>
                <span class="slider-value" id="profile-date">-</span>
              </div>
              
              <div class="setting-row" style="justify-content: space-between;">
                <span class="setting-row__label">Games Played</span>
                <span class="slider-value" id="profile-games">-</span>
              </div>
              
              <div class="setting-row" style="justify-content: space-between;">
                <span class="setting-row__label">Total Score</span>
                <span class="slider-value" id="profile-score">-</span>
              </div>
            </div>

            <div id="profile-guest-promo" style="display: none; padding: var(--space-md); background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px dashed var(--accent-orange); margin-top: var(--space-md);">
              <h3 style="color: var(--accent-orange); font-family: 'GigaSaturn', sans-serif; font-size: 1.5rem; margin-bottom: 0.5rem; letter-spacing: 1px;">CREATE AN ACCOUNT</h3>
              <p style="color: white; font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">
                Guest progress is only saved locally. Register a full account to track your stats, appear on the leaderboard, and keep your progress safe!
              </p>
              <button id="btn-profile-register" class="login-card__join-btn" style="padding: var(--space-sm) var(--space-md); font-size: 1rem; border-radius: 4px; font-family: 'GigaSaturn', sans-serif; letter-spacing: 2px;">REGISTER NOW</button>
            </div>
          </div>
          
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.2s; opacity: 0; padding: var(--space-lg) var(--space-md); margin-top: var(--space-md);">
            <h3 style="color: var(--accent-orange); margin-bottom: var(--space-md); font-family: var(--font-display); font-size: var(--text-base); text-transform: uppercase;">Change Password</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <input type="password" id="cp-current" class="login-card__input" placeholder="CURRENT PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <input type="password" id="cp-new" class="login-card__input" placeholder="NEW PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <input type="password" id="cp-confirm" class="login-card__input" placeholder="CONFIRM NEW PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <p id="cp-msg" style="font-size: var(--text-sm); margin-top: var(--space-xs); font-weight: bold; min-height: 1.2em;"></p>
              <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-xs);">
                <button id="btn-cancel-password" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-base); flex: 1;">CANCEL</button>
                <button id="btn-save-password" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-base); flex: 1;">SAVE</button>
              </div>
              </div>
            </div>
          </div>

          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.3s; opacity: 0; padding: var(--space-lg) var(--space-md); margin-top: var(--space-md);">
            <button id="btn-admin-panel" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-base); background: var(--accent-gold); margin-bottom: var(--space-sm); display: none;">ADMIN PANEL</button>
            <button id="btn-profile-logout" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-base);">LOGOUT</button>
          </div>
        </div>
      </div>
    `;
  },

  async onEnter(el) {
    el.querySelector('#btn-profile-back').addEventListener('click', () => {
      window.__screenManager.back();
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
          // Encrypted guest blob
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
            console.error('Failed to decrypt guest session', decErr);
            fallbackUsername = 'Guest';
          }
        }
      }
    } catch (e) {}

    let username = fallbackUsername;
    let accountType = isGuest ? 'Guest' : 'Registered';
    let registeredAt = null;

    if (isRegistered) {
      try {
        const res = await fetch('/auth/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          username = data.username || fallbackUsername;
          if (data.accountType) accountType = data.accountType;
          registeredAt = data.registeredAt;
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    }

    const pAvatar = el.querySelector('#profile-avatar-container');
    if (pAvatar && username) {
      pAvatar.innerHTML = `
        <div style="width: 80px; height: 80px; background-color: var(--accent-orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #111; margin: 0 auto var(--space-md); font-weight: bold; text-transform: uppercase;">
          ${username.charAt(0)}
        </div>
      `;
    }
    
    const pUser = el.querySelector('#profile-username');
    if (pUser) pUser.textContent = username;
    
    const pType = el.querySelector('#profile-account-type');
    if (pType) pType.textContent = 'Account Type: ' + accountType;
    
    const pDate = el.querySelector('#profile-date');
    if (pDate && registeredAt) {
      const d = new Date(registeredAt);
      pDate.textContent = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } else if (pDate) {
      pDate.textContent = '-';
    }

      // Compute stats
      const progress = state.get('chapterProgress');
      let gamesPlayed = 0;
      let totalScore = 0;
      
      if (progress) {
        if (progress.chaptersCompleted) gamesPlayed = progress.chaptersCompleted.length;
        if (progress.bestScores) {
          totalScore = Object.values(progress.bestScores).reduce((sum, score) => sum + score, 0);
        }
      }
      
      const pGames = el.querySelector('#profile-games');
      if (pGames) pGames.textContent = gamesPlayed.toString();
      
      const pScore = el.querySelector('#profile-score');
      if (pScore) pScore.textContent = totalScore.toString();
      
      const statsContainer = el.querySelector('#profile-stats-container');
      const guestPromoContainer = el.querySelector('#profile-guest-promo');
      const cpGroup = el.querySelectorAll('.settings-group')[1];

      if (isGuest) {
        if (statsContainer) statsContainer.style.display = 'none';
        if (guestPromoContainer) guestPromoContainer.style.display = 'block';
        if (cpGroup) cpGroup.style.display = 'none';
      } else {
        if (statsContainer) statsContainer.style.display = 'block';
        if (guestPromoContainer) guestPromoContainer.style.display = 'none';
        if (cpGroup) cpGroup.style.display = 'block';
      }

      const btnPromoReg = el.querySelector('#btn-profile-register');
      if (btnPromoReg) {
        btnPromoReg.addEventListener('click', () => {
          state.logout();
        });
      }

      // Change Password Logic
      const cpBtn = el.querySelector('#btn-save-password');
      const cpCurrent = el.querySelector('#cp-current');
      const cpNew = el.querySelector('#cp-new');
      const cpConfirm = el.querySelector('#cp-confirm');
      const cpMsg = el.querySelector('#cp-msg');
      
      const cpCancelBtn = el.querySelector('#btn-cancel-password');
      
      if (cpCancelBtn) {
        cpCancelBtn.addEventListener('click', () => {
          cpCurrent.value = '';
          cpNew.value = '';
          cpConfirm.value = '';
          cpMsg.textContent = '';
        });
      }
      
      if (cpBtn) {
        cpBtn.addEventListener('click', async () => {
          const currentPass = cpCurrent.value;
          const newPass = cpNew.value;
          const confirmPass = cpConfirm.value;
          
          if (!currentPass || !newPass || !confirmPass) {
            cpMsg.textContent = 'All fields are required.';
            cpMsg.style.color = 'var(--accent-red)';
            return;
          }
          
          if (newPass !== confirmPass) {
            cpMsg.textContent = 'New passwords do not match.';
            cpMsg.style.color = 'var(--accent-red)';
            return;
          }
          
          if (newPass === currentPass) {
            cpMsg.textContent = 'New password must be different.';
            cpMsg.style.color = 'var(--accent-red)';
            return;
          }
          
          if (newPass.length < 8 || newPass.length > 50) {
            cpMsg.textContent = 'Password must be 8-50 chars long.';
            cpMsg.style.color = 'var(--accent-red)';
            return;
          }
          
          try {
            cpBtn.textContent = 'SAVING...';
            cpBtn.disabled = true;
            cpMsg.textContent = '';
            
            const res = await fetch('/auth/change-password', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
              cpMsg.textContent = 'Password changed successfully.';
              cpMsg.style.color = 'var(--accent-green)';
              cpCurrent.value = '';
              cpNew.value = '';
              cpConfirm.value = '';
            } else {
              cpMsg.textContent = data.error || 'Failed to change password.';
              cpMsg.style.color = 'var(--accent-red)';
            }
          } catch (err) {
            console.error('Change password error:', err);
            cpMsg.textContent = 'Network error. Try again.';
            cpMsg.style.color = 'var(--accent-red)';
          } finally {
            cpBtn.textContent = 'SAVE';
            cpBtn.disabled = false;
          }
        });
      }

    // Check admin status and show/hide admin button
    try {
      const adminRes = await fetch('/admin/check', { credentials: 'include' });
      const adminData = await adminRes.json();
      const adminBtn = el.querySelector('#btn-admin-panel');
      if (adminBtn && adminData.isAdmin) {
        adminBtn.style.display = 'block';
        adminBtn.addEventListener('click', () => {
          window.__screenManager.navigate('admin-dashboard');
        });
      }
    } catch (e) {
      // Not an admin or error, button stays hidden
    }

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
          if (action === 'logout') {
            state.logout();
          }
        });
      });
    }
  },

  onLeave() {
  }
};
