import { state } from '../utils/StateManager.js';

export const LoginScreen = {
  render() {
    return `
      <div class="login-screen screen" id="login-container" style="background-image: url('/assets/ui/backgrounds/login_background.png'); background-size: cover; background-position: center; width: 100%; height: 100%;">
        ${this.renderWelcomeCard()}
      </div>
    `;
  },

  renderWelcomeCard() {
    return `
      <div class="login-reference-layout" id="welcome-card" style="width: 100%; height: 100%; position: relative;">
        <img src="/assets/ui/main-title.png" alt="Bata, Takbo!" style="position: absolute; left: 3%; top: 5%; width: clamp(80px, 10vw, 150px); height: auto; pointer-events: none; z-index: 1;" />

        <div style="position: absolute; right: 10%; bottom: 10%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 40%; min-width: 300px; max-width: 600px;">
          
          <h1 style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(3rem, 6vw, 6rem); color: white; text-align: center; margin-bottom: 2rem; line-height: 1; letter-spacing: 2px;">
            HANDA KA NA BA?
          </h1>
          
          <div style="display: flex; flex-direction: column; gap: 1.5rem; align-items: center; width: 100%;">
            <button id="btn-goto-login" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.5rem, 2.5vw, 3rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">LOGIN</button>
            <button id="btn-goto-register" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.5rem, 2.5vw, 3rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">REGISTER</button>
            <button id="btn-guest" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.5rem, 2.5vw, 3rem); color: var(--text-dim); background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">PLAY AS GUEST</button>
          </div>

          <p style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(0.5rem, 1vw, 0.8rem); color: white; margin-top: 1rem; text-align: center; letter-spacing: 1px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
            BY JOINING, YOU AGREE TO OUR <a href="#" id="link-terms-welcome" style="color: var(--accent-orange); text-decoration: underline;">PRIVACY POLICY AND TERMS OF SERVICE</a>
          </p>
        </div>
      </div>
    `;
  },

  renderLoginCard() {
    return `
      <div class="login-reference-layout" id="login-card" style="width: 100%; height: 100%; position: relative;">
        <img src="/assets/ui/main-title.png" alt="Bata, Takbo!" style="position: absolute; left: 3%; top: 5%; width: clamp(80px, 10vw, 150px); height: auto; pointer-events: none; z-index: 1;" />

        <div style="position: absolute; right: 10%; bottom: 10%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 40%; min-width: 300px; max-width: 600px;">

          <h1 style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(2rem, 4vw, 4rem); color: white; text-align: center; margin-bottom: 2rem; line-height: 1; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
            LOGIN
          </h1>
          
          <input 
            type="text" 
            id="login-username"
            placeholder="USERNAME OR EMAIL"
            autocomplete="username"
            maxlength="255"
            style="width: 90%; max-width: 500px; height: 45px; margin-bottom: 1rem; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
          />
          <div style="position: relative; width: 90%; max-width: 500px;">
            <input 
              type="password" 
              id="login-password"
              placeholder="PASSWORD"
              autocomplete="current-password"
              maxlength="50"
              style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
            />
            <button type="button" id="login-toggle-pw" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
              <img src="/assets/ui/eye_closed.png" style="width: 24px; height: 24px; opacity: 0.8;" alt="Toggle" />
            </button>
          </div>
          <p class="login-card__privacy text-red hidden" id="login-error-msg" style="margin-top: var(--space-sm); font-family: 'GigaSaturn', sans-serif; font-size: 1rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); text-align: center;"></p>
          
          <button type="button" id="btn-forgot-pw" style="background: transparent; border: none; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 0.8rem; margin-top: 1rem; cursor: pointer; text-decoration: underline; letter-spacing: 1px;">FORGOT PASSWORD?</button>
          <button type="button" id="btn-forgot-username" style="background: transparent; border: none; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 0.75rem; margin-top: 0.3rem; cursor: pointer; text-decoration: underline; letter-spacing: 1px; opacity: 0.7;">FORGOT USERNAME?</button>
          <button type="button" id="btn-goto-register-from-login" style="background: transparent; border: none; color: var(--accent-orange); font-family: 'GigaSaturn', sans-serif; font-size: 0.75rem; margin-top: 0.4rem; cursor: pointer; letter-spacing: 1px; text-decoration: underline;">DON'T HAVE AN ACCOUNT? REGISTER</button>

          <div style="display: flex; gap: 1rem; margin-top: 2rem; width: 90%; max-width: 500px; justify-content: center;">
            <button id="btn-back-login" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.2rem, 2vw, 2.5rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">BACK</button>
            <button id="btn-submit-login" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.2rem, 2vw, 2.5rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">LOGIN</button>
          </div>
        </div>
      </div>
    `;
  },

  renderRegisterCard() {
    return `
      <div class="login-reference-layout" id="register-card" style="width: 100%; height: 100%; position: relative;">
        <img src="/assets/ui/main-title.png" alt="Bata, Takbo!" style="position: absolute; left: 3%; top: 5%; width: clamp(80px, 10vw, 150px); height: auto; pointer-events: none; z-index: 1;" />

        <div style="position: absolute; right: 10%; bottom: 10%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 40%; min-width: 300px; max-width: 600px;">

          <h1 style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(2rem, 4vw, 4rem); color: white; text-align: center; margin-bottom: 1.5rem; line-height: 1; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
            CREATE ACCOUNT
          </h1>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; width: 90%; max-width: 500px; align-items: center;">
            <input 
              type="text" 
              placeholder="USERNAME"
              autocomplete="off"
              maxlength="20"
              id="reg-username"
              style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
            />
            <div id="username-status" style="width: 100%; text-align: right; font-family: 'GigaSaturn', sans-serif; font-size: 0.65rem; margin-top: -0.4rem; height: 10px; transition: opacity 0.2s;"></div>
            <input 
              type="email" 
              placeholder="EMAIL"
              autocomplete="off"
              maxlength="255"
              id="reg-email"
              style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
            />
            <div style="position: relative; width: 100%;">
              <input 
                type="password" 
                placeholder="PASSWORD"
                maxlength="50"
                autocomplete="new-password"
                id="reg-password"
                style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
              />
              <button type="button" id="reg-toggle-pw" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
                <img src="/assets/ui/eye_closed.png" style="width: 24px; height: 24px; opacity: 0.8;" alt="Toggle" />
              </button>
            </div>
            <div id="pw-requirements" style="width: 100%; text-align: left; font-family: 'GigaSaturn', sans-serif; font-size: 0.65rem; color: #a89b8c; margin-top: 0.2rem; margin-bottom: 0.2rem; display: flex; flex-direction: column; gap: 2px;">
              <span id="req-length">✗ 8 CHARACTERS MINIMUM</span>
              <span id="req-number">✗ 1 NUMBER</span>
              <span id="req-special">✗ 1 SPECIAL CHARACTER</span>
            </div>
            <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 0.4rem; overflow: hidden;">
              <div id="pw-strength-bar" style="height: 100%; width: 0%; border-radius: 2px; transition: width 0.3s ease, background 0.3s ease;"></div>
            </div>
            <div style="position: relative; width: 100%;">
              <input 
                type="password" 
                placeholder="CONFIRM PASSWORD"
                maxlength="50"
                autocomplete="new-password"
                id="reg-confirm"
                style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
              />
              <button type="button" id="reg-toggle-confirm" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
                <img src="/assets/ui/eye_closed.png" style="width: 24px; height: 24px; opacity: 0.8;" alt="Toggle" />
              </button>
            </div>
            <div id="reg-confirm-match" style="width: 100%; text-align: right; font-family: 'GigaSaturn', sans-serif; font-size: 0.65rem; margin-top: -0.4rem; height: 10px; transition: opacity 0.2s;"></div>
            <label style="display: flex; gap: var(--space-sm); align-items: start; font-size: 0.65rem; color: white; text-align: left; cursor: pointer; margin-top: var(--space-xs); font-family: 'GigaSaturn', sans-serif;">
              <input type="checkbox" id="reg-privacy" style="accent-color: var(--accent-orange); margin-top: 2px;" />
              <span>I HAVE READ AND AGREE TO THE <a href="#" id="link-terms-register" style="color: var(--accent-orange); text-decoration: underline;">PRIVACY POLICY AND TERMS OF SERVICE</a>.</span>
            </label>
            <p class="login-card__privacy text-red hidden" id="reg-error-msg" style="margin-top: var(--space-xs); font-family: 'GigaSaturn', sans-serif; font-size: 1rem; font-weight: bold; text-align: center; margin-bottom: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);"></p>
          </div>
          
          <button type="button" id="btn-goto-login-from-reg" style="background: transparent; border: none; color: var(--accent-orange); font-family: 'GigaSaturn', sans-serif; font-size: 0.75rem; margin-top: 0.6rem; cursor: pointer; letter-spacing: 1px; text-decoration: underline;">ALREADY HAVE AN ACCOUNT? LOGIN</button>
          <div style="display: flex; gap: 1rem; margin-top: 1rem; width: 90%; max-width: 500px; justify-content: center;">
            <button id="btn-cancel-reg" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1rem, 1.5vw, 2rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">CANCEL</button>
            <button id="btn-create-account" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1rem, 1.5vw, 2rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">CREATE ACCOUNT</button>
          </div>
        </div>
      </div>
    `;
  },

  renderForgotPasswordCard() {
    return `
      <div class="login-reference-layout" id="forgot-pw-card" style="width: 100%; height: 100%; position: relative;">
        <img src="/assets/ui/main-title.png" alt="Bata, Takbo!" style="position: absolute; left: 3%; top: 5%; width: clamp(80px, 10vw, 150px); height: auto; pointer-events: none; z-index: 1;" />
        <div style="position: absolute; right: 10%; bottom: 10%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 40%; min-width: 300px; max-width: 600px;">
          <h1 style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.5rem, 3.5vw, 4rem); color: white; text-align: center; margin-bottom: 2rem; line-height: 1; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
            FORGOT PASSWORD
          </h1>
          <input type="email" id="forgot-email" placeholder="ENTER YOUR EMAIL" autocomplete="off" maxlength="255" style="width: 90%; max-width: 500px; height: 45px; margin-bottom: 1rem; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);" />
          <p class="login-card__privacy text-red hidden" id="forgot-error-msg" style="margin-top: 0.5rem; font-family: 'GigaSaturn', sans-serif; font-size: 1rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); text-align: center;"></p>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; width: 90%; max-width: 500px; justify-content: center;">
            <button id="btn-back-forgot" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.2rem, 2vw, 2.5rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">BACK</button>
            <button id="btn-submit-forgot" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.2rem, 2vw, 2.5rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">SEND LINK</button>
          </div>
        </div>
      </div>
    `;
  },

  renderResetPasswordCard() {
    return `
      <div class="login-reference-layout" id="reset-pw-card" style="width: 100%; height: 100%; position: relative;">
        <img src="/assets/ui/main-title.png" alt="Bata, Takbo!" style="position: absolute; left: 3%; top: 5%; width: clamp(80px, 10vw, 150px); height: auto; pointer-events: none; z-index: 1;" />
        <div style="position: absolute; right: 10%; bottom: 10%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; width: 40%; min-width: 300px; max-width: 600px;">
          <h1 style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.5rem, 3vw, 4rem); color: white; text-align: center; margin-bottom: 2rem; line-height: 1; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
            RESET PASSWORD
          </h1>
          <div style="position: relative; width: 90%; max-width: 500px; margin-bottom: 0.5rem;">
            <input type="password" id="reset-pw" placeholder="NEW PASSWORD" maxlength="50" autocomplete="new-password" style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);" />
            <button type="button" id="reset-toggle-pw" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
              <img src="/assets/ui/eye_closed.png" style="width: 24px; height: 24px; opacity: 0.8;" alt="Toggle" />
            </button>
          </div>
          <div id="reset-pw-requirements" style="width: 90%; max-width: 500px; text-align: left; font-family: 'GigaSaturn', sans-serif; font-size: 0.65rem; color: #a89b8c; margin-top: 0.2rem; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 2px;">
            <span id="reset-req-length">✗ 8 CHARACTERS MINIMUM</span>
            <span id="reset-req-number">✗ 1 NUMBER</span>
            <span id="reset-req-special">✗ 1 SPECIAL CHARACTER</span>
          </div>
          <div style="position: relative; width: 90%; max-width: 500px;">
            <input type="password" id="reset-confirm" placeholder="CONFIRM NEW PASSWORD" maxlength="50" autocomplete="new-password" style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);" />
            <button type="button" id="reset-toggle-confirm" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
              <img src="/assets/ui/eye_closed.png" style="width: 24px; height: 24px; opacity: 0.8;" alt="Toggle" />
            </button>
          </div>
          <p class="login-card__privacy text-red hidden" id="reset-error-msg" style="margin-top: 0.5rem; font-family: 'GigaSaturn', sans-serif; font-size: 1rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); text-align: center;"></p>
          <div style="display: flex; gap: 1rem; margin-top: 2rem; width: 90%; max-width: 500px; justify-content: center;">
            <button id="btn-back-reset" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.2rem, 2vw, 2.5rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">CANCEL</button>
            <button id="btn-submit-reset" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1.2rem, 2vw, 2.5rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">RESET</button>
          </div>
        </div>
      </div>
    `;
  },

  async onEnter(el, data) {
    this.container = el;
    if (data && data.resetToken) {
      this.container.innerHTML = this.renderResetPasswordCard();
      this.bindResetPasswordEvents(data.resetToken);
    } else {
      this.bindWelcomeEvents();
    }
  },

  bindWelcomeEvents() {
    const btnLogin = this.container.querySelector('#btn-goto-login');
    const btnRegister = this.container.querySelector('#btn-goto-register');
    const btnGuest = this.container.querySelector('#btn-guest');
    const linkTerms = this.container.querySelector('#link-terms-welcome');

    if (linkTerms) {
      linkTerms.addEventListener('click', (e) => {
        e.preventDefault();
        window.__screenManager.navigate('terms-screen');
      });
    }

    if (btnLogin) {
      btnLogin.addEventListener('click', () => {
        this.container.innerHTML = this.renderLoginCard();
        this.bindLoginEvents();
      });
    }

    if (btnRegister) {
      btnRegister.addEventListener('click', () => {
        this.container.innerHTML = this.renderRegisterCard();
        this.bindRegisterEvents();
      });
    }

    if (btnGuest) {
      btnGuest.addEventListener('click', async () => {
        btnGuest.innerHTML = 'JOINING...';
        btnGuest.disabled = true;

        const guestName = 'Guest_' + Math.floor(Math.random() * 9000 + 1000);

        setTimeout(async () => {
          const sessionData = JSON.stringify({
            username: guestName,
            is_guest: true
          });

          const secretKeyStr = "BATA_TAKBO_SECRET_KEY_256BIT_000";
          const enc = new TextEncoder();
          const keyData = enc.encode(secretKeyStr);

          try {
            const key = await window.crypto.subtle.importKey(
              "raw", keyData, { name: "AES-GCM" }, false, ["encrypt"]
            );
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encryptedBuffer = await window.crypto.subtle.encrypt(
              { name: "AES-GCM", iv: iv }, key, enc.encode(sessionData)
            );

            const encryptedArray = new Uint8Array(encryptedBuffer);
            const combined = new Uint8Array(12 + encryptedArray.length);
            combined.set(iv, 0);
            combined.set(encryptedArray, 12);

            const encryptedBase64 = btoa(String.fromCharCode.apply(null, combined));
            localStorage.setItem('guest_session', encryptedBase64);
          } catch (err) {
            console.error('Failed to encrypt session:', err);
          }

          state._resetAccountState();

          if (window.__screenManager) {
            window.__screenManager.navigate('loading-screen', { target: 'main-menu' });
          }
        }, 500);
      });
    }
  },

  bindLoginEvents() {
    const backBtn = this.container.querySelector('#btn-back-login');
    const loginBtn = this.container.querySelector('#btn-submit-login');
    const userIn = this.container.querySelector('#login-username');
    const passIn = this.container.querySelector('#login-password');
    const errorMsg = this.container.querySelector('#login-error-msg');
    const forgotBtn = this.container.querySelector('#btn-forgot-pw');

    if (!backBtn || !loginBtn || !userIn || !passIn) return;

    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => {
        this.container.innerHTML = this.renderForgotPasswordCard();
        this.bindForgotPasswordEvents();
      });
    }

    const forgotUsernameBtn = this.container.querySelector('#btn-forgot-username');
    if (forgotUsernameBtn) {
      forgotUsernameBtn.addEventListener('click', () => {
        const existing = document.getElementById('fu-modal-overlay');
        if (existing) existing.remove();
        const overlay = document.createElement('div');
        overlay.id = 'fu-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:9999;';
        overlay.innerHTML = `
          <div style="background:#1a1408;border:2px solid rgba(255,255,255,0.2);border-radius:8px;padding:2rem;min-width:280px;max-width:380px;width:90%;text-align:center;">
            <h3 style="color:white;font-family:'GigaSaturn',sans-serif;font-size:1.2rem;letter-spacing:2px;margin-bottom:1rem;">FORGOT USERNAME?</h3>
            <p style="color:#a89b8c;font-family:'GigaSaturn',sans-serif;font-size:0.7rem;margin-bottom:1rem;line-height:1.5;">Enter your email and we'll send you your username.</p>
            <input id="fu-email" type="email" placeholder="YOUR EMAIL" maxlength="255" style="width:100%;height:42px;background:rgba(0,0,0,0.4);border:2px solid white;color:white;font-family:'GigaSaturn',sans-serif;font-size:1rem;text-align:center;outline:none;box-sizing:border-box;margin-bottom:0.5rem;" />
            <p id="fu-msg" style="font-family:'GigaSaturn',sans-serif;font-size:0.75rem;font-weight:bold;min-height:1.2em;margin-bottom:1rem;"></p>
            <div style="display:flex;gap:0.5rem;">
              <button id="fu-cancel" style="flex:1;font-family:'GigaSaturn',sans-serif;font-size:1rem;color:white;background:transparent;border:none;cursor:pointer;letter-spacing:1px;">CANCEL</button>
              <button id="fu-submit" style="flex:1;font-family:'GigaSaturn',sans-serif;font-size:1rem;color:white;background:transparent;border:none;cursor:pointer;letter-spacing:1px;">SEND</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
        const emailIn = overlay.querySelector('#fu-email');
        const msg = overlay.querySelector('#fu-msg');
        const submitBtn = overlay.querySelector('#fu-submit');
        const cancelBtn = overlay.querySelector('#fu-cancel');
        setTimeout(() => emailIn.focus(), 50);
        const close = () => overlay.remove();
        cancelBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const submit = async () => {
          const email = emailIn.value.trim();
          if (!email) { msg.textContent = 'Email is required.'; msg.style.color = '#ef4444'; return; }
          submitBtn.textContent = 'SENDING...'; submitBtn.disabled = true; msg.textContent = '';
          try {
            const res = await fetch('/auth/forgot-username', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const data = await res.json();
            msg.textContent = data.message || 'Sent!';
            msg.style.color = '#4ade80';
            submitBtn.textContent = 'SENT';
          } catch (e) {
            msg.textContent = 'Network error. Try again.'; msg.style.color = '#ef4444';
            submitBtn.textContent = 'SEND'; submitBtn.disabled = false;
          }
        };
        submitBtn.addEventListener('click', submit);
        emailIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') close(); });
      });
    }

    const gotoRegBtn = this.container.querySelector('#btn-goto-register-from-login');
    if (gotoRegBtn) {
      gotoRegBtn.addEventListener('click', () => {
        this.container.innerHTML = this.renderRegisterCard();
        this.bindRegisterEvents();
      });
    }

    backBtn.addEventListener('click', () => {
      this.container.innerHTML = this.renderWelcomeCard();
      this.bindWelcomeEvents();
    });

    const toggleBtn = this.container.querySelector('#login-toggle-pw');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const type = passIn.getAttribute('type') === 'password' ? 'text' : 'password';
        passIn.setAttribute('type', type);
        const img = toggleBtn.querySelector('img');
        if (img) img.src = type === 'password' ? '/assets/ui/eye_closed.png' : '/assets/ui/eye_open.png';
      });
    }

    const handleLogin = async () => {
      const username = userIn.value.trim();
      const password = passIn.value;

      if (!username || !password) {
        errorMsg.textContent = 'Please enter both username and password.';
        errorMsg.classList.remove('hidden');
        return;
      }

      try {
        loginBtn.innerHTML = 'LOGGING IN...';
        loginBtn.disabled = true;
        errorMsg.classList.add('hidden');

        const res = await fetch('/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          localStorage.setItem('guest_session', JSON.stringify({ is_guest: false, username }));
          await state.hydrateFromServer();
          if (window.__screenManager) {
            window.__screenManager.navigate('loading-screen', { target: 'main-menu' });
          }
        } else {
          errorMsg.textContent = data.error || 'Incorrect username or password.';
          errorMsg.classList.remove('hidden');
          loginBtn.innerHTML = 'LOGIN';
          loginBtn.disabled = false;
        }
      } catch (err) {
        console.error('Login request failed:', err);
        errorMsg.textContent = 'Network error. Try again.';
        errorMsg.classList.remove('hidden');
        loginBtn.innerHTML = 'LOGIN';
        loginBtn.disabled = false;
      }
    };

    loginBtn.addEventListener('click', handleLogin);

    passIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    userIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') passIn.focus();
    });

    setTimeout(() => userIn.focus(), 50);
  },

  bindForgotPasswordEvents() {
    const backBtn = this.container.querySelector('#btn-back-forgot');
    const submitBtn = this.container.querySelector('#btn-submit-forgot');
    const emailIn = this.container.querySelector('#forgot-email');
    const msgEl = this.container.querySelector('#forgot-error-msg');

    if (!backBtn || !submitBtn || !emailIn) return;

    backBtn.addEventListener('click', () => {
      this.container.innerHTML = this.renderLoginCard();
      this.bindLoginEvents();
    });

    const handleSubmit = async () => {
      const email = emailIn.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email || !emailRegex.test(email) || email.length > 255) {
        msgEl.textContent = 'Please enter a valid email address.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        return;
      }

      submitBtn.innerHTML = 'SENDING...';
      submitBtn.disabled = true;

      try {
        const res = await fetch('/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (res.ok) {
          msgEl.textContent = data.message || 'If that email exists, a reset link has been sent.';
          msgEl.style.color = '#4ade80';
        } else {
          msgEl.textContent = data.error || 'Something went wrong. Try again.';
          msgEl.style.color = '#ef4444';
        }
        msgEl.classList.remove('hidden');
      } catch(err) {
        msgEl.textContent = 'Network error. Try again.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
      } finally {
        submitBtn.innerHTML = 'SEND LINK';
        submitBtn.disabled = false;
      }
    };

    submitBtn.addEventListener('click', handleSubmit);
    emailIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });

    setTimeout(() => emailIn.focus(), 50);
  },

  bindResetPasswordEvents(resetToken) {
    const backBtn = this.container.querySelector('#btn-back-reset');
    const submitBtn = this.container.querySelector('#btn-submit-reset');
    const pwIn = this.container.querySelector('#reset-pw');
    const confirmIn = this.container.querySelector('#reset-confirm');
    const msgEl = this.container.querySelector('#reset-error-msg');
    
    if (!backBtn || !submitBtn || !pwIn || !confirmIn) return;

    backBtn.addEventListener('click', () => {
      // Clean URL if we came from a link
      window.history.replaceState({}, document.title, window.location.pathname);
      this.container.innerHTML = this.renderLoginCard();
      this.bindLoginEvents();
    });

    const togglePw = this.container.querySelector('#reset-toggle-pw');
    if (togglePw) {
      togglePw.addEventListener('click', () => {
        const type = pwIn.getAttribute('type') === 'password' ? 'text' : 'password';
        pwIn.setAttribute('type', type);
        const img = togglePw.querySelector('img');
        if (img) img.src = type === 'password' ? '/assets/ui/eye_closed.png' : '/assets/ui/eye_open.png';
      });
    }

    const toggleConfirm = this.container.querySelector('#reset-toggle-confirm');
    if (toggleConfirm) {
      toggleConfirm.addEventListener('click', () => {
        const type = confirmIn.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmIn.setAttribute('type', type);
        const img = toggleConfirm.querySelector('img');
        if (img) img.src = type === 'password' ? '/assets/ui/eye_closed.png' : '/assets/ui/eye_open.png';
      });
    }

    const reqLength = this.container.querySelector('#reset-req-length');
    const reqNumber = this.container.querySelector('#reset-req-number');
    const reqSpecial = this.container.querySelector('#reset-req-special');

    pwIn.addEventListener('input', () => {
      const val = pwIn.value;
      if (val.length >= 8) { reqLength.textContent = '✓ 8 CHARACTERS MINIMUM'; reqLength.style.color = '#4ade80'; } 
      else { reqLength.textContent = '✗ 8 CHARACTERS MINIMUM'; reqLength.style.color = '#a89b8c'; }

      if (/\d/.test(val)) { reqNumber.textContent = '✓ 1 NUMBER'; reqNumber.style.color = '#4ade80'; } 
      else { reqNumber.textContent = '✗ 1 NUMBER'; reqNumber.style.color = '#a89b8c'; }

      if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) { reqSpecial.textContent = '✓ 1 SPECIAL CHARACTER'; reqSpecial.style.color = '#4ade80'; } 
      else { reqSpecial.textContent = '✗ 1 SPECIAL CHARACTER'; reqSpecial.style.color = '#a89b8c'; }
    });

    const handleReset = async () => {
      const newPassword = pwIn.value;
      const confirm = confirmIn.value;

      if (!newPassword || newPassword.length < 8) {
        msgEl.textContent = 'Password must be at least 8 characters long.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        return;
      }
      if (!/\d/.test(newPassword)) {
        msgEl.textContent = 'Password must contain at least one number.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        msgEl.textContent = 'Password must contain at least one special character.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        return;
      }
      if (/\s/.test(newPassword)) {
        msgEl.textContent = 'Password cannot contain spaces.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        return;
      }
      if (newPassword !== confirm) {
        msgEl.textContent = 'Passwords do not match.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        return;
      }

      submitBtn.innerHTML = 'RESETTING...';
      submitBtn.disabled = true;

      try {
        const res = await fetch('/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, newPassword })
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
          msgEl.textContent = data.message || 'Password reset successfully.';
          msgEl.style.color = '#4ade80';
          msgEl.classList.remove('hidden');
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => {
            this.container.innerHTML = this.renderLoginCard();
            this.bindLoginEvents();
          }, 2000);
        } else {
          msgEl.textContent = data.error || 'Reset failed.';
          msgEl.style.color = '#ef4444';
          msgEl.classList.remove('hidden');
          submitBtn.innerHTML = 'RESET';
          submitBtn.disabled = false;
        }
      } catch(err) {
        msgEl.textContent = 'Network error. Try again.';
        msgEl.style.color = '#ef4444';
        msgEl.classList.remove('hidden');
        submitBtn.innerHTML = 'RESET';
        submitBtn.disabled = false;
      }
    };

    submitBtn.addEventListener('click', handleReset);
    confirmIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleReset();
    });

    setTimeout(() => pwIn.focus(), 50);
  },

  bindRegisterEvents() {
    const cancelBtn = this.container.querySelector('#btn-cancel-reg');
    const createBtn = this.container.querySelector('#btn-create-account');
    const userIn = this.container.querySelector('#reg-username');
    const emailIn = this.container.querySelector('#reg-email');
    const passIn = this.container.querySelector('#reg-password');
    const confirmIn = this.container.querySelector('#reg-confirm');
    const privacyCheck = this.container.querySelector('#reg-privacy');
    const errorMsg = this.container.querySelector('#reg-error-msg');
    const linkTerms = this.container.querySelector('#link-terms-register');

    if (linkTerms) {
      linkTerms.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.__screenManager.navigate('terms-screen');
      });
    }

    if (!cancelBtn || !createBtn || !userIn || !passIn) return;

    const usernameStatus = this.container.querySelector('#username-status');
    let usernameCheckTimeout = null;
    let isUsernameTaken = false;
    let isCheckingUsername = false;

    userIn.addEventListener('input', () => {
      const username = userIn.value.trim();

      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);

      const userRegex = /^[a-zA-Z0-9_-]+$/;
      if (username.length < 3 || username.length > 20 || !userRegex.test(username)) {
        usernameStatus.textContent = '';
        isUsernameTaken = false;
        isCheckingUsername = false;
        return;
      }

      usernameStatus.textContent = 'Checking...';
      usernameStatus.style.color = '#a89b8c';
      isCheckingUsername = true;

      usernameCheckTimeout = setTimeout(async () => {
        try {
          const res = await fetch('/auth/check-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
          });

          if (res.status === 200) {
            const data = await res.json();
            if (data.exists) {
              usernameStatus.textContent = '✗ Username already taken';
              usernameStatus.style.color = '#ef4444';
              isUsernameTaken = true;
            }
          } else if (res.status === 404) {
            usernameStatus.textContent = '✓ Username available';
            usernameStatus.style.color = '#4ade80';
            isUsernameTaken = false;
          } else {
            usernameStatus.textContent = '';
            isUsernameTaken = false;
          }
        } catch (err) {
          usernameStatus.textContent = '';
        } finally {
          isCheckingUsername = false;
        }
      }, 500);
    });

    // Real-time password sanitation/requirements
    const pwReqLength = this.container.querySelector('#req-length');
    const pwReqNumber = this.container.querySelector('#req-number');
    const pwReqSpecial = this.container.querySelector('#req-special');

    const confirmMatchEl = this.container.querySelector('#reg-confirm-match');

    const updateConfirmMatch = () => {
      if (!confirmIn.value) { confirmMatchEl.textContent = ''; return; }
      if (passIn.value === confirmIn.value) {
        confirmMatchEl.textContent = '✓ Passwords match';
        confirmMatchEl.style.color = '#4ade80';
      } else {
        confirmMatchEl.textContent = '✗ Passwords do not match';
        confirmMatchEl.style.color = '#ef4444';
      }
    };

    const pwStrengthBar = this.container.querySelector('#pw-strength-bar');

    passIn.addEventListener('input', () => {
      const val = passIn.value;
      const okLength = val.length >= 8;
      const okNumber = /\d/.test(val);
      const okSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

      pwReqLength.textContent = (okLength ? '✓' : '✗') + ' 8 CHARACTERS MINIMUM';
      pwReqLength.style.color = okLength ? '#4ade80' : '#a89b8c';
      pwReqNumber.textContent = (okNumber ? '✓' : '✗') + ' 1 NUMBER';
      pwReqNumber.style.color = okNumber ? '#4ade80' : '#a89b8c';
      pwReqSpecial.textContent = (okSpecial ? '✓' : '✗') + ' 1 SPECIAL CHARACTER';
      pwReqSpecial.style.color = okSpecial ? '#4ade80' : '#a89b8c';

      const score = (okLength ? 1 : 0) + (okNumber ? 1 : 0) + (okSpecial ? 1 : 0) + (val.length >= 12 ? 1 : 0);
      const widths = ['0%', '25%', '50%', '75%', '100%'];
      const colors = ['transparent', '#e63946', '#ff9a4a', '#ffd700', '#2ecc71'];
      if (pwStrengthBar) { pwStrengthBar.style.width = widths[score]; pwStrengthBar.style.background = colors[score]; }

      updateConfirmMatch();
    });

    confirmIn.addEventListener('input', updateConfirmMatch);

    cancelBtn.addEventListener('click', () => {
      this.container.innerHTML = this.renderWelcomeCard();
      this.bindWelcomeEvents();
    });

    const gotoLoginBtn = this.container.querySelector('#btn-goto-login-from-reg');
    if (gotoLoginBtn) {
      gotoLoginBtn.addEventListener('click', () => {
        this.container.innerHTML = this.renderLoginCard();
        this.bindLoginEvents();
      });
    }

    const togglePw = this.container.querySelector('#reg-toggle-pw');
    if (togglePw) {
      togglePw.addEventListener('click', () => {
        const type = passIn.getAttribute('type') === 'password' ? 'text' : 'password';
        passIn.setAttribute('type', type);
        const img = togglePw.querySelector('img');
        if (img) img.src = type === 'password' ? '/assets/ui/eye_closed.png' : '/assets/ui/eye_open.png';
      });
    }

    const toggleConfirm = this.container.querySelector('#reg-toggle-confirm');
    if (toggleConfirm) {
      toggleConfirm.addEventListener('click', () => {
        const type = confirmIn.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmIn.setAttribute('type', type);
        const img = toggleConfirm.querySelector('img');
        if (img) img.src = type === 'password' ? '/assets/ui/eye_closed.png' : '/assets/ui/eye_open.png';
      });
    }

    const handleRegister = async () => {
      const username = userIn.value.trim();
      const email = emailIn.value.trim();
      const password = passIn.value;
      const confirm = confirmIn.value;

      const userRegex = /^[a-zA-Z0-9_-]+$/;
      if (username.length < 3 || username.length > 20 || !userRegex.test(username)) {
        errorMsg.textContent = 'Username must be 3-20 chars (A-Z, 0-9, -, _).';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (isCheckingUsername) {
        errorMsg.textContent = 'Still checking username availability. Please wait.';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (isUsernameTaken) {
        errorMsg.textContent = 'That username is already taken.';
        errorMsg.classList.remove('hidden');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email) || email.length > 255) {
        errorMsg.textContent = 'Please enter a valid email address.';
        errorMsg.classList.remove('hidden');
        return;
      }

      // Password Sanitization and Requirements
      if (!password || password.length < 8) {
        errorMsg.textContent = 'Password must be at least 8 characters long.';
        errorMsg.classList.remove('hidden');
        return;
      }

      const hasNumber = /\d/;
      if (!hasNumber.test(password)) {
        errorMsg.textContent = 'Password must contain at least one number.';
        errorMsg.classList.remove('hidden');
        return;
      }

      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;
      if (!hasSpecial.test(password)) {
        errorMsg.textContent = 'Password must contain at least one special character.';
        errorMsg.classList.remove('hidden');
        return;
      }

      const hasInvalidChars = /\s/; // Disallow spaces
      if (hasInvalidChars.test(password)) {
        errorMsg.textContent = 'Password cannot contain spaces.';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (password !== confirm) {
        errorMsg.textContent = 'Passwords do not match.';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (!privacyCheck.checked) {
        errorMsg.textContent = 'You must agree to the privacy policy.';
        errorMsg.classList.remove('hidden');
        return;
      }

      try {
        createBtn.innerHTML = 'CREATING...';
        createBtn.disabled = true;
        errorMsg.classList.add('hidden');

        const res = await fetch('/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        let shouldEnable = false;

        if (res.ok && data.success) {
          localStorage.removeItem('guest_session');
          localStorage.setItem('guest_session', JSON.stringify({ is_guest: false, username }));
          state._resetAccountState();
          await state._syncToServer();
          if (window.__screenManager) {
            window.__screenManager.navigate('loading-screen', { target: 'main-menu' });
          }
        } else {
          errorMsg.textContent = data.error || 'Registration failed.';
          errorMsg.classList.remove('hidden');
          shouldEnable = true;
        }

        if (shouldEnable) {
          createBtn.innerHTML = 'CREATE ACCOUNT';
          createBtn.disabled = false;
        }
      } catch (err) {
        console.error('Registration request failed:', err);
        errorMsg.textContent = 'Network error. Try again.';
        errorMsg.classList.remove('hidden');
        createBtn.innerHTML = 'CREATE ACCOUNT';
        createBtn.disabled = false;
      }
    };

    createBtn.addEventListener('click', handleRegister);

    emailIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') passIn.focus();
    });

    passIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmIn.focus();
    });

    confirmIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRegister();
    });

    setTimeout(() => userIn.focus(), 50);
  },

  onLeave() {
    // Cleanup if needed
  }
};
