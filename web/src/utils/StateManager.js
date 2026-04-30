/**
 * StateManager — Global state & event bus
 * Centralized state management with pub/sub events
 */
class StateManager {
  constructor() {
    this._state = {
      currentScreen: null,
      gestureModel: null,
      gestureModelTrained: false,
      settings: this._loadSettings(),
      user: null,
      isAuthenticated: false,
      tutorialComplete: this._loadTutorialState(),
      bestiary: this._loadBestiary(),
      chapterProgress: this._loadChapterProgress(),
    };
    this._listeners = new Map();
  }

  /**
   * Get a state value by key
   */
  get(key) {
    return this._state[key];
  }

  /**
   * Set a state value and emit change event
   */
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;
    this.emit(`${key}:changed`, { key, value, oldValue });
    this.emit('state:changed', { key, value, oldValue });
  }

  /**
   * Subscribe to an event
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event with data
   */
  emit(event, data = null) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for "${event}":`, err);
        }
      });
    }
  }

  /**
   * Save settings to localStorage
   */
  async saveSettings(sync = true) {
    try {
      localStorage.setItem('bata_takbo_settings', JSON.stringify(this._state.settings));
      if (sync) await this._syncToServer();
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  /**
   * Load settings with defaults
   */
  _loadSettings() {
    const defaults = {
      camera: {
        privacyMode: false,
        position: 'bottom-left',
        showSkeleton: true,
      },
      audio: {
        master: 0.8,
        music: 0.7,
        sfx: 0.9,
        muted: false,
      },
      gesture: {
        sensitivity: 0.60,
        debounce: 100,
        preferredHand: 'any',
      },
      display: {
        screenShake: true,
        particles: true,
        showFps: false,
      },
    };

    try {
      const saved = localStorage.getItem('bata_takbo_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with defaults
        return this._deepMerge(defaults, parsed);
      }
    } catch (e) {
      console.warn('Failed to load settings, using defaults:', e);
    }
    return defaults;
  }

  _loadTutorialState() {
    try {
      const saved = localStorage.getItem('bata_takbo_tutorial');
      if (saved) {
        const parsed = JSON.parse(saved);
        const val = typeof parsed === 'boolean' ? parsed
          : (typeof parsed === 'object' && parsed !== null ? parsed.gameplayComplete || false : false);
        console.log('[TUTORIAL-DEBUG] _loadTutorialState from localStorage:', val);
        return val;
      }
    } catch (e) { /* ignore */ }
    console.log('[TUTORIAL-DEBUG] _loadTutorialState: no localStorage value, defaulting false');
    return false;
  }

  _loadBestiary() {
    try {
      const saved = localStorage.getItem('bata_takbo_bestiary');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return {};
  }

  _loadChapterProgress() {
    try {
      const saved = localStorage.getItem('bata_takbo_progress');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return { chaptersUnlocked: [1], chaptersCompleted: [], bestScores: {} };
  }

  async saveTutorialState(sync = true) {
    console.log('[TUTORIAL-DEBUG] saveTutorialState() called. tutorialComplete =', this._state.tutorialComplete);
    try {
      localStorage.setItem('bata_takbo_tutorial', JSON.stringify(this._state.tutorialComplete));
      if (sync) await this._syncToServer();
    } catch (e) { /* ignore */ }
  }



  saveBestiary() {
    try {
      localStorage.setItem('bata_takbo_bestiary', JSON.stringify(this._state.bestiary));
    } catch (e) { /* ignore */ }
  }

  async saveChapterProgress(sync = true) {
    try {
      localStorage.setItem('bata_takbo_progress', JSON.stringify(this._state.chapterProgress));
      if (sync) await this._syncToServer();
    } catch (e) { /* ignore */ }
  }

  async logout() {
    // ── Step 1: Persist state BEFORE invalidating the JWT ─────────────────
    // _syncToServer() uses the JWT cookie. If we call /auth/logout first,
    // the token is blacklisted and the subsequent save will fail with 401.
    let isRegistered = false;
    try {
      const stored = sessionStorage.getItem('guest_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.is_guest === false) isRegistered = true;
      }
    } catch (e) {}

    if (isRegistered) {
      console.log('[TUTORIAL-DEBUG] logout(): saving state to server BEFORE invalidating JWT. tutorialComplete =', this._state.tutorialComplete);
      await this._syncToServer(); // await so save completes before JWT is blacklisted
    } else {
      try {
        await fetch('/auth/guest-scores', { method: 'DELETE' });
      } catch (e) {}
    }

    // ── Step 2: Invalidate JWT ─────────────────────────────────────────────
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Logout request failed:', e);
    }

    // ── Step 3: Clear local state ──────────────────────────────────────────
    sessionStorage.removeItem('guest_session');
    try {
      localStorage.removeItem('bata_takbo_settings');
      localStorage.removeItem('bata_takbo_tutorial');
      localStorage.removeItem('bata_takbo_bestiary');
      localStorage.removeItem('bata_takbo_progress');
    } catch(e) {}

    // Reset in-memory state so it doesn't bleed to the next user
    this._state.settings = this._loadSettings();
    this._state.tutorialComplete = false;
    this._state.bestiary = {};
    this._state.chapterProgress = { chaptersUnlocked: [1], chaptersCompleted: [], bestScores: {} };



    this.set('isAuthenticated', false);
    this.set('user', null);

    if (window.__screenManager) {
      window.__screenManager.navigate('login-screen');
    }
  }

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  _isGuest() {
    try {
      const stored = sessionStorage.getItem('guest_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.is_guest === false) return false;
      }
    } catch(e) {}
    return true;
  }

  async _syncToServer() {
    if (this._isGuest()) {
      console.log('[TUTORIAL-DEBUG] _syncToServer(): skipping — user is guest');
      return;
    }

    let gestureModel = null;
    if (window.__gestureController && window.__gestureController.classifier) {
      gestureModel = window.__gestureController.classifier.exportData();
    }

    const payload = {
      settings: this._state.settings,
      tutorialComplete: this._state.tutorialComplete,
      chapterProgress: this._state.chapterProgress,
      gestureModel
    };

    console.log('[TUTORIAL-DEBUG] _syncToServer(): sending tutorialComplete =', payload.tutorialComplete);

    try {
      const res = await fetch('/auth/save-data', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('[TUTORIAL-DEBUG] _syncToServer(): server responded', res.status, err);
      } else {
        console.log('[TUTORIAL-DEBUG] _syncToServer(): save confirmed by server ✓');
      }
    } catch (e) {
      console.warn('[TUTORIAL-DEBUG] _syncToServer(): fetch failed —', e.message);
    }
  }
}

// Singleton
export const state = new StateManager();
