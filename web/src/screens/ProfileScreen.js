import { state } from '../utils/StateManager.js';
import { DialogueBox } from '../utils/DialogueBox.js';

export const ProfileScreen = {
  render() {
    return `
      <div class="settings-screen screen" id="profile-container">
        <button class="back-btn" id="btn-profile-back">Back</button>

        <div class="settings-screen__content scrollable" style="padding: var(--space-xl) var(--space-md) var(--space-2xl);">

          <!-- HERO CARD -->
          <div style="animation: fadeInUp 0.4s ease forwards; opacity: 0; text-align: center; padding: var(--space-xl) var(--space-md) var(--space-lg); border-bottom: 1px solid rgba(228,207,192,0.1); margin-bottom: var(--space-lg);">
            <div id="profile-avatar-container">
              <div style="width: 72px; height: 72px; background: var(--accent-orange); border-radius: 50%; margin: 0 auto var(--space-sm); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: #111; animation: pulse 1.5s infinite;"></div>
            </div>
            <h2 id="profile-username" style="color: var(--text-primary); font-family: var(--font-display); font-size: var(--text-xl); margin: 0 0 var(--space-xs);">Loading...</h2>
            <p id="profile-account-type" style="color: var(--text-secondary); font-family: 'VCR', sans-serif; font-size: var(--text-sm); letter-spacing: 2px; text-transform: uppercase; margin: 0 0 var(--space-lg);"></p>

            <!-- STATS GRID -->
            <div id="profile-stats-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); text-align: left;">
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(228,207,192,0.2); border-radius: var(--radius-sm); padding: var(--space-sm) var(--space-md);">
                <div style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; margin-bottom: 4px; text-transform: uppercase;">Email</div>
                <div id="profile-email" style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-primary); word-break: break-all;">-</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(228,207,192,0.2); border-radius: var(--radius-sm); padding: var(--space-sm) var(--space-md);">
                <div style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; margin-bottom: 4px; text-transform: uppercase;">Member Since</div>
                <div id="profile-date" style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-primary);">-</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(228,207,192,0.2); border-radius: var(--radius-sm); padding: var(--space-sm) var(--space-md);">
                <div style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; margin-bottom: 4px; text-transform: uppercase;">Games Played</div>
                <div id="profile-games" style="font-family: 'VCR', sans-serif; font-size: var(--text-xl); color: var(--accent-orange);">-</div>
              </div>
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(228,207,192,0.2); border-radius: var(--radius-sm); padding: var(--space-sm) var(--space-md);">
                <div style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; margin-bottom: 4px; text-transform: uppercase;">Total Score</div>
                <div id="profile-score" style="font-family: 'VCR', sans-serif; font-size: var(--text-xl); color: var(--accent-orange);">-</div>
              </div>
            </div>

            <!-- GUEST PROMO -->
            <div id="profile-guest-promo" style="display: none; padding: var(--space-md); background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px dashed var(--accent-orange); margin-top: var(--space-md);">
              <h3 style="color: var(--accent-orange); font-family: var(--font-display); font-size: var(--text-lg); margin-bottom: var(--space-sm); letter-spacing: 1px;">CREATE AN ACCOUNT</h3>
              <p style="color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.5; margin-bottom: var(--space-md);">Guest progress is only saved locally. Register a full account to track your stats, appear on the leaderboard, and keep your progress safe!</p>
              <button id="btn-profile-register" class="login-card__join-btn" style="padding: var(--space-sm) var(--space-md); font-size: var(--text-sm);">REGISTER NOW</button>
            </div>
          </div>

          <!-- ACCOUNT SETTINGS -->
          <div id="cu-group" style="animation: fadeInUp 0.4s ease 0.15s forwards; opacity: 0; margin-bottom: var(--space-lg);">
            <p style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; text-transform: uppercase; margin-bottom: var(--space-sm); padding: 0 var(--space-xs);">Change Username</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <input type="text" id="cu-new" class="login-card__input" placeholder="NEW USERNAME" maxlength="20" autocomplete="off" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <p id="cu-msg" style="font-size: var(--text-sm); font-weight: bold; min-height: 1.2em; text-align: center;"></p>
              <div style="display: flex; gap: var(--space-sm);">
                <button id="btn-cancel-username" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); flex: 1;">CANCEL</button>
                <button id="btn-save-username" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); flex: 1;">SAVE</button>
              </div>
            </div>
          </div>

          <div id="ce-group" style="animation: fadeInUp 0.4s ease 0.2s forwards; opacity: 0; margin-bottom: var(--space-lg);">
            <p style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; text-transform: uppercase; margin-bottom: var(--space-sm); padding: 0 var(--space-xs);">Change Email</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <input type="email" id="ce-new" class="login-card__input" placeholder="NEW EMAIL ADDRESS" maxlength="255" autocomplete="off" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <input type="password" id="ce-password" class="login-card__input" placeholder="CONFIRM WITH PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <p id="ce-msg" style="font-size: var(--text-sm); font-weight: bold; min-height: 1.2em; text-align: center;"></p>
              <div style="display: flex; gap: var(--space-sm);">
                <button id="btn-cancel-email" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); flex: 1;">CANCEL</button>
                <button id="btn-save-email" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); flex: 1;">SAVE</button>
              </div>
            </div>
          </div>

          <div style="animation: fadeInUp 0.4s ease 0.25s forwards; opacity: 0; margin-bottom: var(--space-lg);">
            <p style="font-family: 'VCR', sans-serif; font-size: var(--text-sm); color: var(--text-secondary); letter-spacing: 2px; text-transform: uppercase; margin-bottom: var(--space-sm); padding: 0 var(--space-xs);">Change Password</p>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm);">
              <input type="password" id="cp-current" class="login-card__input" placeholder="CURRENT PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <input type="password" id="cp-new" class="login-card__input" placeholder="NEW PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <div id="cp-requirements" style="width: 100%; text-align: left; font-family: 'VCR', sans-serif; font-size: 0.85rem; color: #a89b8c; margin-top: 0.2rem; margin-bottom: 0.1rem; display: flex; flex-direction: column; gap: 2px;">
                <span id="cp-req-length">✗ 8 CHARACTERS MINIMUM</span>
                <span id="cp-req-number">✗ 1 NUMBER</span>
                <span id="cp-req-special">✗ 1 SPECIAL CHARACTER</span>
              </div>
              <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 0.3rem; overflow: hidden;">
                <div id="cp-strength-bar" style="height: 100%; width: 0%; border-radius: 2px; transition: width 0.3s ease, background 0.3s ease;"></div>
              </div>
              <input type="password" id="cp-confirm" class="login-card__input" placeholder="CONFIRM NEW PASSWORD" style="font-size: var(--text-sm); padding: var(--space-sm);" />
              <p id="cp-msg" style="font-size: var(--text-sm); font-weight: bold; min-height: 1.2em; text-align: center;"></p>
              <div style="display: flex; gap: var(--space-sm);">
                <button id="btn-cancel-password" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); flex: 1;">CANCEL</button>
                <button id="btn-save-password" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); flex: 1;">SAVE</button>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div style="animation: fadeInUp 0.4s ease 0.35s forwards; opacity: 0; border-top: 1px solid rgba(228,207,192,0.1); padding-top: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-sm);">
            <button id="btn-admin-panel" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); background: var(--accent-gold); display: none;">ADMIN PANEL</button>
            <button id="btn-profile-logout" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm);">LOGOUT</button>
            <button id="btn-logout-all" class="login-card__join-btn" style="padding: var(--space-sm); font-size: var(--text-sm); background: transparent; border: 1px solid rgba(228,207,192,0.3); color: var(--text-secondary); display: none;">LOG OUT ALL DEVICES</button>
          </div>

          <!-- DELETE ACCOUNT (danger zone, below the fold) -->
          <div id="da-group" style="display: none; text-align: center; padding: var(--space-xl) 0 var(--space-md);">
            <button id="btn-delete-account" style="background: rgba(230, 57, 70, 0.15); border: 2px solid var(--accent-red); border-radius: var(--radius-md); color: var(--accent-red); font-family: 'VCR', sans-serif; font-size: var(--text-sm); cursor: pointer; letter-spacing: 2px; text-transform: uppercase; padding: var(--space-sm) var(--space-md); transition: all 0.2s ease;">Delete Account</button>
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
    let profileEmail = null;

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
          profileEmail = data.email || null;
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
    
    const pEmail = el.querySelector('#profile-email');
    if (pEmail) pEmail.textContent = profileEmail || '-';

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
      const cuGroup = el.querySelector('#cu-group');

      if (isGuest) {
        if (statsContainer) statsContainer.style.display = 'none';
        if (guestPromoContainer) guestPromoContainer.style.display = 'block';
        if (cuGroup) cuGroup.style.display = 'none';
      } else {
        if (statsContainer) statsContainer.style.display = 'block';
        if (guestPromoContainer) guestPromoContainer.style.display = 'none';
        if (cuGroup) cuGroup.style.display = 'block';
      }

      const btnPromoReg = el.querySelector('#btn-profile-register');
      if (btnPromoReg) {
        btnPromoReg.addEventListener('click', () => {
          state.logout();
        });
      }

      // Hide change email for guests
      const ceGroup = el.querySelector('#ce-group');
      if (isGuest && ceGroup) ceGroup.style.display = 'none';

      // Change Username Logic
      const cuBtn = el.querySelector('#btn-save-username');
      const cuCancelBtn = el.querySelector('#btn-cancel-username');
      const cuNew = el.querySelector('#cu-new');
      const cuMsg = el.querySelector('#cu-msg');

      if (cuCancelBtn) {
        cuCancelBtn.addEventListener('click', () => {
          cuNew.value = '';
          cuMsg.textContent = '';
        });
      }

      if (cuBtn) {
        cuBtn.addEventListener('click', async () => {
          const newUsername = cuNew.value.trim();
          const usernameRegex = /^[a-zA-Z0-9_-]+$/;

          if (!newUsername) {
            cuMsg.textContent = 'Please enter a new username.';
            cuMsg.style.color = 'var(--accent-red)';
            return;
          }
          if (newUsername.length < 3 || newUsername.length > 20) {
            cuMsg.textContent = 'Username must be 3-20 characters.';
            cuMsg.style.color = 'var(--accent-red)';
            return;
          }
          if (!usernameRegex.test(newUsername)) {
            cuMsg.textContent = 'Letters, numbers, underscores, hyphens only.';
            cuMsg.style.color = 'var(--accent-red)';
            return;
          }

          try {
            cuBtn.textContent = 'SAVING...';
            cuBtn.disabled = true;
            cuMsg.textContent = '';

            const res = await fetch('/auth/change-username', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newUsername })
            });

            const data = await res.json();

            if (res.ok && data.success) {
              cuMsg.textContent = 'Username changed successfully.';
              cuMsg.style.color = 'var(--accent-green)';
              cuNew.value = '';
              const pUser = el.querySelector('#profile-username');
              if (pUser) pUser.textContent = data.username;
              const pAvatar = el.querySelector('#profile-avatar-container');
              if (pAvatar) {
                pAvatar.innerHTML = `<div style="width: 80px; height: 80px; background-color: var(--accent-orange); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #111; margin: 0 auto var(--space-md); font-weight: bold; text-transform: uppercase;">${data.username.charAt(0)}</div>`;
              }
              try {
                const stored = localStorage.getItem('guest_session');
                if (stored) {
                  const session = JSON.parse(stored);
                  session.username = data.username;
                  localStorage.setItem('guest_session', JSON.stringify(session));
                }
              } catch(e) {}
            } else {
              cuMsg.textContent = data.error || 'Failed to change username.';
              cuMsg.style.color = 'var(--accent-red)';
            }
          } catch (err) {
            console.error('Change username error:', err);
            cuMsg.textContent = 'Network error. Try again.';
            cuMsg.style.color = 'var(--accent-red)';
          } finally {
            cuBtn.textContent = 'SAVE';
            cuBtn.disabled = false;
          }
        });

        cuNew.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') cuBtn.click();
        });
      }

      // Change Email Logic
      const ceBtn = el.querySelector('#btn-save-email');
      const ceCancelBtn = el.querySelector('#btn-cancel-email');
      const ceNew = el.querySelector('#ce-new');
      const cePass = el.querySelector('#ce-password');
      const ceMsg = el.querySelector('#ce-msg');

      if (ceCancelBtn) {
        ceCancelBtn.addEventListener('click', () => {
          ceNew.value = '';
          cePass.value = '';
          ceMsg.textContent = '';
        });
      }

      if (ceBtn && !isGuest && isRegistered) {
        ceBtn.addEventListener('click', async () => {
          const newEmail = ceNew.value.trim();
          const password = cePass.value;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!newEmail || !emailRegex.test(newEmail)) {
            ceMsg.textContent = 'Please enter a valid email address.';
            ceMsg.style.color = 'var(--accent-red)';
            return;
          }
          if (!password) {
            ceMsg.textContent = 'Please enter your current password.';
            ceMsg.style.color = 'var(--accent-red)';
            return;
          }

          ceBtn.textContent = 'SAVING...';
          ceBtn.disabled = true;

          try {
            const res = await fetch('/auth/change-email', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newEmail, password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              ceMsg.textContent = 'Email updated successfully.';
              ceMsg.style.color = 'var(--accent-green)';
              ceNew.value = '';
              cePass.value = '';
              const pEmail = el.querySelector('#profile-email');
              if (pEmail) pEmail.textContent = newEmail.toLowerCase();
            } else {
              ceMsg.textContent = data.error || 'Failed to update email.';
              ceMsg.style.color = 'var(--accent-red)';
            }
          } catch (err) {
            ceMsg.textContent = 'Network error. Try again.';
            ceMsg.style.color = 'var(--accent-red)';
          } finally {
            ceBtn.textContent = 'SAVE';
            ceBtn.disabled = false;
          }
        });

        ceNew.addEventListener('keydown', (e) => { if (e.key === 'Enter') cePass.focus(); });
        cePass.addEventListener('keydown', (e) => { if (e.key === 'Enter') ceBtn.click(); });
      }

      // Change Password Logic
      const cpBtn = el.querySelector('#btn-save-password');
      const cpCurrent = el.querySelector('#cp-current');
      const cpNew = el.querySelector('#cp-new');
      const cpConfirm = el.querySelector('#cp-confirm');
      const cpMsg = el.querySelector('#cp-msg');
      const cpReqLength = el.querySelector('#cp-req-length');
      const cpReqNumber = el.querySelector('#cp-req-number');
      const cpReqSpecial = el.querySelector('#cp-req-special');

      const cpStrengthBar = el.querySelector('#cp-strength-bar');
      if (cpNew && cpReqLength && cpReqNumber && cpReqSpecial) {
        cpNew.addEventListener('input', () => {
          const v = cpNew.value;
          const okLength = v.length >= 8;
          const okNumber = /\d/.test(v);
          const okSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(v);
          cpReqLength.textContent = (okLength ? '✓' : '✗') + ' 8 CHARACTERS MINIMUM';
          cpReqLength.style.color = okLength ? '#4ade80' : '#a89b8c';
          cpReqNumber.textContent = (okNumber ? '✓' : '✗') + ' 1 NUMBER';
          cpReqNumber.style.color = okNumber ? '#4ade80' : '#a89b8c';
          cpReqSpecial.textContent = (okSpecial ? '✓' : '✗') + ' 1 SPECIAL CHARACTER';
          cpReqSpecial.style.color = okSpecial ? '#4ade80' : '#a89b8c';
          const score = (okLength ? 1 : 0) + (okNumber ? 1 : 0) + (okSpecial ? 1 : 0) + (v.length >= 12 ? 1 : 0);
          const widths = ['0%', '25%', '50%', '75%', '100%'];
          const colors = ['transparent', '#e63946', '#ff9a4a', '#ffd700', '#2ecc71'];
          if (cpStrengthBar) { cpStrengthBar.style.width = widths[score]; cpStrengthBar.style.background = colors[score]; }
        });
      }

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

    // Log Out All Devices
    const logoutAllBtn = el.querySelector('#btn-logout-all');
    if (!isGuest && isRegistered && logoutAllBtn) {
      logoutAllBtn.style.display = 'block';
      logoutAllBtn.addEventListener('click', async () => {
        try {
          const res = await fetch('/auth/logout-all', { method: 'POST', credentials: 'include' });
          if (res.ok) state.logout();
        } catch (e) { console.error('Logout all error:', e); }
      });
    }

    // Delete Account Logic (registered users only)
    const daGroup = el.querySelector('#da-group');
    if (!isGuest && isRegistered && daGroup) {
      daGroup.style.display = 'block';
      el.querySelector('#btn-delete-account').addEventListener('click', () => {
        this._showDeleteAccountModal();
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

  _showDeleteAccountModal() {
    const existing = document.getElementById('da-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'da-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
      <div style="background:var(--bg-panel);border:1px solid var(--accent-red);border-radius:8px;padding:var(--space-lg);min-width:280px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.8);animation:fadeInUp 0.2s ease forwards;">
        <h3 style="color:var(--accent-red);font-family:'VCR',sans-serif;font-size:var(--text-lg);text-transform:uppercase;margin-bottom:var(--space-xs);text-align:center;letter-spacing:2px;">Delete Account</h3>
        <p style="color:var(--text-secondary);font-family:'VCR',sans-serif;font-size:var(--text-sm);text-align:center;margin-bottom:var(--space-md);line-height:1.5;">This is <b style="color:var(--text-primary);">PERMANENT</b>. All your data and progress will be erased and cannot be recovered.</p>
        <input id="da-modal-password" type="password" placeholder="ENTER YOUR PASSWORD" style="width:100%;padding:var(--space-sm);background:var(--bg-secondary);border:2px solid rgba(230,57,70,0.5);border-radius:4px;color:var(--text-primary);font-family:'VCR',sans-serif;font-size:var(--text-sm);text-align:center;outline:none;box-sizing:border-box;margin-bottom:var(--space-xs);" />
        <p id="da-modal-msg" style="font-family:'VCR',sans-serif;font-size:var(--text-sm);font-weight:bold;min-height:1.2em;text-align:center;margin-bottom:var(--space-md);color:var(--accent-red);"></p>
        <div style="display:flex;gap:var(--space-sm);">
          <button id="da-modal-cancel" class="login-card__join-btn" style="flex:1;padding:var(--space-sm);font-size:var(--text-sm);">CANCEL</button>
          <button id="da-modal-confirm" class="login-card__join-btn" style="flex:1;padding:var(--space-sm);font-size:var(--text-sm);background:var(--accent-red);color:#fff;">DELETE</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const pwInput = overlay.querySelector('#da-modal-password');
    const msg = overlay.querySelector('#da-modal-msg');
    const confirmBtn = overlay.querySelector('#da-modal-confirm');
    const cancelBtn = overlay.querySelector('#da-modal-cancel');

    setTimeout(() => pwInput.focus(), 50);

    const closeModal = () => overlay.remove();

    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const submit = async () => {
      const password = pwInput.value;
      if (!password) {
        msg.textContent = 'Password is required.';
        return;
      }
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
        msg.textContent = 'Network error. Try again.';
        confirmBtn.textContent = 'DELETE';
        confirmBtn.disabled = false;
      }
    };

    confirmBtn.addEventListener('click', submit);
    pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') closeModal(); });
  },

  onLeave() {
  }
};
