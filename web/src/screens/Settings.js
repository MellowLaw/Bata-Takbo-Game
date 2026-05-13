/**
 * Settings — Camera, Audio, Gesture, and Display settings
 */
import { state } from '../utils/StateManager.js';
import { audioManager } from '../game/AudioManager.js';

export const Settings = {
  render() {
    const s = state.get('settings');

    return `
      <div class="settings-screen screen">
        <button class="back-btn" id="btn-settings-back">Back</button>
        
        <h1 class="screen-title" style="animation: fadeInUp 0.4s ease forwards;">
          Settings
        </h1>
        
        <div class="settings-screen__content scrollable">
          <!-- Camera & Privacy -->
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.1s; opacity: 0;">
            <div class="settings-group__title"> Camera & Privacy</div>
            
            <div class="setting-row">
              <span class="setting-row__label">Privacy Mode</span>
              <div class="toggle ${s.camera.privacyMode ? 'active' : ''}" 
                   id="toggle-privacy" data-key="camera.privacyMode">
                <div class="toggle__knob"></div>
              </div>
            </div>
            
            <div class="setting-row">
              <span class="setting-row__label">Show Hand Skeleton</span>
              <div class="toggle ${s.camera.showSkeleton ? 'active' : ''}" 
                   id="toggle-skeleton" data-key="camera.showSkeleton">
                <div class="toggle__knob"></div>
              </div>
            </div>
          </div>

          <!-- Audio -->
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.2s; opacity: 0;">
            <div class="settings-group__title">Audio</div>
            
            <div class="setting-row">
              <span class="setting-row__label">Master</span>
              <div class="slider-container">
                <input type="range" class="slider" id="slider-master" 
                       min="0" max="100" value="${Math.round(s.audio.master * 100)}"
                       data-key="audio.master" />
                <span class="slider-value" id="val-master">${Math.round(s.audio.master * 100)}%</span>
              </div>
            </div>
            
            <div class="setting-row">
              <span class="setting-row__label">Music</span>
              <div class="slider-container">
                <input type="range" class="slider" id="slider-music" 
                       min="0" max="100" value="${Math.round(s.audio.music * 100)}"
                       data-key="audio.music" />
                <span class="slider-value" id="val-music">${Math.round(s.audio.music * 100)}%</span>
              </div>
            </div>
            
            <div class="setting-row">
              <span class="setting-row__label">SFX</span>
              <div class="slider-container">
                <input type="range" class="slider" id="slider-sfx" 
                       min="0" max="100" value="${Math.round(s.audio.sfx * 100)}"
                       data-key="audio.sfx" />
                <span class="slider-value" id="val-sfx">${Math.round(s.audio.sfx * 100)}%</span>
              </div>
            </div>
            
            <div class="setting-row">
              <span class="setting-row__label">Mute All</span>
              <div class="toggle ${s.audio.muted ? 'active' : ''}" 
                   id="toggle-mute" data-key="audio.muted">
                <div class="toggle__knob"></div>
              </div>
            </div>
          </div>

          <!-- Gesture -->
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.3s; opacity: 0;">
            <div class="settings-group__title">Gesture Control</div>
            
            <div class="setting-row">
              <span class="setting-row__label">Sensitivity</span>
              <div class="slider-container">
                <input type="range" class="slider" id="slider-sensitivity" 
                       min="50" max="95" value="${Math.round(s.gesture.sensitivity * 100)}"
                       data-key="gesture.sensitivity" />
                <span class="slider-value" id="val-sensitivity">${Math.round(s.gesture.sensitivity * 100)}%</span>
              </div>
            </div>
            
            <div class="setting-row">
              <span class="setting-row__label">Move Debounce</span>
              <div class="slider-container">
                <input type="range" class="slider" id="slider-debounce" 
                       min="100" max="300" step="25" value="${s.gesture.debounce}"
                       data-key="gesture.debounce" />
                <span class="slider-value" id="val-debounce">${s.gesture.debounce}ms</span>
              </div>
            </div>
          </div>

          <!-- Display -->
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.4s; opacity: 0;">
            <div class="settings-group__title">Display</div>
            
            <div class="setting-row">
              <span class="setting-row__label">Screen Shake</span>
              <div class="toggle ${s.display.screenShake ? 'active' : ''}" 
                   id="toggle-shake" data-key="display.screenShake">
                <div class="toggle__knob"></div>
              </div>
            </div>
            
            <div class="setting-row">
              <span class="setting-row__label">Particle Effects</span>
              <div class="toggle ${s.display.particles ? 'active' : ''}" 
                   id="toggle-particles" data-key="display.particles">
                <div class="toggle__knob"></div>
              </div>
            </div>

            <div class="setting-row">
              <span class="setting-row__label">Show FPS</span>
              <div class="toggle ${s.display.showFps ? 'active' : ''}" 
                   id="toggle-fps" data-key="display.showFps">
                <div class="toggle__knob"></div>
              </div>
            </div>
          </div>

          <!-- Reset Tutorial -->
          <div class="settings-group" style="animation: fadeInUp 0.4s ease forwards; animation-delay: 0.5s; opacity: 0;">
            <div class="settings-group__title">Other</div>
            <div class="setting-row">
              <span class="setting-row__label">Reset Tutorial</span>
              <button class="menu-btn" id="btn-reset-tutorial" style="font-size: var(--text-sm); padding: var(--space-xs) var(--space-md);">
                 Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  onEnter(el) {
    // Back button
    el.querySelector('#btn-settings-back').addEventListener('click', () => {
      window.__screenManager.back();
    });

    // Toggle switches
    el.querySelectorAll('.toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const key = toggle.dataset.key;
        const isActive = toggle.classList.contains('active');
        this._updateSetting(key, isActive);
      });
    });

    // Sliders
    el.querySelectorAll('.slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const key = slider.dataset.key;
        const raw = parseInt(e.target.value);
        
        // Update display value
        const valEl = slider.parentElement.querySelector('.slider-value');
        if (key === 'gesture.debounce') {
          valEl.textContent = `${raw}ms`;
          this._updateSetting(key, raw);
        } else {
          valEl.textContent = `${raw}%`;
          this._updateSetting(key, raw / 100);
        }
      });
    });

    // Reset tutorial - custom in-screen modal
    el.querySelector('#btn-reset-tutorial').addEventListener('click', () => {
      this._showResetConfirmModal(el);
    });
  },

  _showResetConfirmModal(el) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'reset-tutorial-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease forwards;
    `;

    modal.innerHTML = `
      <div id="reset-modal-card" style="
        background: var(--bg-panel, #100c04);
        border: 2px solid var(--accent-orange, #ff6b1a);
        border-radius: var(--radius-lg, 12px);
        padding: clamp(1rem, 4vw, 2rem);
        max-width: min(400px, 85vw);
        width: 90%;
        text-align: center;
        animation: modalScaleIn 0.3s ease forwards;
        box-shadow: 0 0 40px rgba(255, 107, 26, 0.3);
        margin: 16px;
      ">
        <h3 style="
          font-family: 'GigaSaturn', sans-serif;
          color: var(--accent-orange, #ff6b1a);
          font-size: clamp(1rem, 4vw, 1.4rem);
          margin-bottom: clamp(0.75rem, 2vw, 1rem);
          text-transform: uppercase;
          letter-spacing: 2px;
          line-height: 1.2;
        ">Reset Tutorial?</h3>
        <p style="
          font-family: 'VCR', monospace;
          color: var(--text-primary, #f0e6d3);
          font-size: clamp(0.8rem, 3vw, 1rem);
          line-height: 1.5;
          margin-bottom: clamp(1rem, 3vw, 1.5rem);
          max-width: 100%;
        ">
          Are you sure you want to reset the tutorial? It will play again the next time you click Play. Your gesture setup will NOT be affected.
        </p>
        <div id="reset-modal-buttons" style="
          display: flex;
          gap: clamp(0.5rem, 2vw, 1rem);
          justify-content: center;
          flex-wrap: wrap;
        ">
          <button id="modal-confirm-reset" class="menu-btn" style="
            min-width: clamp(80px, 25vw, 120px);
            padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
            font-size: clamp(0.75rem, 2.5vw, 1rem);
          ">Yes, Reset</button>
          <button id="modal-cancel-reset" class="menu-btn menu-btn--subtle" style="
            min-width: clamp(80px, 25vw, 120px);
            padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px);
            font-size: clamp(0.75rem, 2.5vw, 1rem);
            opacity: 0.7;
          ">Cancel</button>
        </div>
      </div>
    `;

    el.appendChild(modal);

    // Handle confirm
    modal.querySelector('#modal-confirm-reset').addEventListener('click', async () => {
      state.set('tutorialComplete', false);
      state.set('practiceTutorialComplete', false);
      await state.saveTutorialState();
      await state.savePracticeTutorialState();
      modal.remove();
      this._showSuccessToast(el, 'Tutorial has been reset! Go back and click Play to replay it.');
    });

    // Handle cancel
    modal.querySelector('#modal-cancel-reset').addEventListener('click', () => {
      modal.remove();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  _showSuccessToast(el, message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: clamp(16px, 5vh, 40px);
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent-green-dark, #1a8a4a);
      color: white;
      padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px);
      border-radius: var(--radius-md, 8px);
      font-family: 'VCR', monospace;
      font-size: clamp(0.75rem, 2.5vw, 0.9rem);
      z-index: 10001;
      animation: slideUpFade 0.4s ease forwards;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: min(90vw, 400px);
      width: max-content;
      text-align: center;
      line-height: 1.4;
    `;
    toast.textContent = message;

    el.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  _updateSetting(keyPath, value) {
    const settings = state.get('settings');
    const keys = keyPath.split('.');
    let obj = settings;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    state.set('settings', settings);
    state.saveSettings();
    
    // Update AudioManager if audio settings changed
    if (keyPath.startsWith('audio.')) {
      audioManager.updateVolume();
    }
  },
};
