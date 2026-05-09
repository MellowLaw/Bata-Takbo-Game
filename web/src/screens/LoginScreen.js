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
            placeholder="USERNAME"
            autocomplete="off"
            maxlength="20"
            style="width: 90%; max-width: 500px; height: 45px; margin-bottom: 1rem; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
          />
          <div style="position: relative; width: 90%; max-width: 500px;">
            <input 
              type="password" 
              id="login-password"
              placeholder="PASSWORD"
              autocomplete="off"
              maxlength="50"
              style="width: 100%; height: 45px; background: rgba(0,0,0,0.3); border: 2px solid white; color: white; font-family: 'GigaSaturn', sans-serif; font-size: 1.2rem; text-align: center; outline: none; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"
            />
            <button type="button" id="login-toggle-pw" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; display: flex; align-items: center;">
              <img src="/assets/ui/eye_closed.png" style="width: 24px; height: 24px; opacity: 0.8;" alt="Toggle" />
            </button>
          </div>
          <p class="login-card__privacy text-red hidden" id="login-error-msg" style="margin-top: var(--space-sm); font-family: 'GigaSaturn', sans-serif; font-size: 1rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); text-align: center;"></p>
          
          <div style="display: flex; gap: 1rem; margin-top: 3rem; width: 90%; max-width: 500px; justify-content: center;">
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
            <label style="display: flex; gap: var(--space-sm); align-items: start; font-size: 0.65rem; color: white; text-align: left; cursor: pointer; margin-top: var(--space-xs); font-family: 'GigaSaturn', sans-serif;">
              <input type="checkbox" id="reg-privacy" style="accent-color: var(--accent-orange); margin-top: 2px;" />
              <span>I HAVE READ AND AGREE TO THE <a href="#" id="link-terms-register" style="color: var(--accent-orange); text-decoration: underline;">PRIVACY POLICY AND TERMS OF SERVICE</a>.</span>
            </label>
            <p class="login-card__privacy text-red hidden" id="reg-error-msg" style="margin-top: var(--space-xs); font-family: 'GigaSaturn', sans-serif; font-size: 1rem; font-weight: bold; text-align: center; margin-bottom: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);"></p>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 2rem; width: 90%; max-width: 500px; justify-content: center;">
            <button id="btn-cancel-reg" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1rem, 1.5vw, 2rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">CANCEL</button>
            <button id="btn-create-account" style="font-family: 'GigaSaturn', sans-serif; font-size: clamp(1rem, 1.5vw, 2rem); color: white; background: transparent; border: none; cursor: pointer; transition: transform 0.2s; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">CREATE ACCOUNT</button>
          </div>
        </div>
      </div>
    `;
  },

  async onEnter(el) {
    this.container = el;
    this.bindWelcomeEvents();
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

    if (!backBtn || !loginBtn || !userIn || !passIn) return;

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

  bindRegisterEvents() {
    const cancelBtn = this.container.querySelector('#btn-cancel-reg');
    const createBtn = this.container.querySelector('#btn-create-account');
    const userIn = this.container.querySelector('#reg-username');
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

    userIn.addEventListener('input', () => {
      const username = userIn.value.trim();
      
      if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
      
      const userRegex = /^[a-zA-Z0-9_-]+$/;
      if (username.length < 3 || username.length > 20 || !userRegex.test(username)) {
        usernameStatus.textContent = '';
        isUsernameTaken = false;
        return;
      }

      usernameStatus.textContent = 'Checking...';
      usernameStatus.style.color = '#a89b8c';

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
              usernameStatus.style.color = '#ef4444'; // red
              isUsernameTaken = true;
            }
          } else if (res.status === 404) {
            usernameStatus.textContent = '✓ Username available';
            usernameStatus.style.color = '#4ade80'; // green
            isUsernameTaken = false;
          } else {
            usernameStatus.textContent = '';
            isUsernameTaken = false;
          }
        } catch (err) {
          usernameStatus.textContent = '';
        }
      }, 500); // 500ms debounce
    });

    // Real-time password sanitation/requirements
    const pwReqLength = this.container.querySelector('#req-length');
    const pwReqNumber = this.container.querySelector('#req-number');
    const pwReqSpecial = this.container.querySelector('#req-special');

    passIn.addEventListener('input', () => {
      const val = passIn.value;
      
      if (val.length >= 8) {
        pwReqLength.textContent = '✓ 8 CHARACTERS MINIMUM';
        pwReqLength.style.color = '#4ade80';
      } else {
        pwReqLength.textContent = '✗ 8 CHARACTERS MINIMUM';
        pwReqLength.style.color = '#a89b8c';
      }

      if (/\d/.test(val)) {
        pwReqNumber.textContent = '✓ 1 NUMBER';
        pwReqNumber.style.color = '#4ade80';
      } else {
        pwReqNumber.textContent = '✗ 1 NUMBER';
        pwReqNumber.style.color = '#a89b8c';
      }

      if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
        pwReqSpecial.textContent = '✓ 1 SPECIAL CHARACTER';
        pwReqSpecial.style.color = '#4ade80';
      } else {
        pwReqSpecial.textContent = '✗ 1 SPECIAL CHARACTER';
        pwReqSpecial.style.color = '#a89b8c';
      }
    });

    cancelBtn.addEventListener('click', () => {
      this.container.innerHTML = this.renderWelcomeCard();
      this.bindWelcomeEvents();
    });

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
      const password = passIn.value;
      const confirm = confirmIn.value;

      const userRegex = /^[a-zA-Z0-9_-]+$/;
      if (username.length < 3 || username.length > 20 || !userRegex.test(username)) {
        errorMsg.textContent = 'Username must be 3-20 chars (A-Z, 0-9, -, _).';
        errorMsg.classList.remove('hidden');
        return;
      }

      if (isUsernameTaken) {
        errorMsg.textContent = 'That username is already taken.';
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
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        let shouldEnable = false;

        if (res.ok && data.success) {
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

    confirmIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRegister();
    });

    setTimeout(() => userIn.focus(), 50);
  },

  onLeave() {
    // Cleanup if needed
  }
};
