/**
 * main.js — Application entry point
 * Initializes the screen manager and navigates to the main menu
 */
import './index.css';
import { ScreenManager } from './utils/ScreenManager.js';
import { state } from './utils/StateManager.js';
import { orientationManager } from './utils/OrientationManager.js';
import { MainMenu } from './screens/MainMenu.js';
import { ChapterSelect } from './screens/ChapterSelect.js';
import { CharacterSelect } from './screens/CharacterSelect.js';
import { Settings } from './screens/Settings.js';
import { GestureTraining } from './screens/GestureTraining.js';
import { Spellbook } from './screens/Spellbook.js';
import { Leaderboard } from './screens/Leaderboard.js';
import { About } from './screens/About.js';
import { GameScreen } from './screens/GameScreen.js';
import { ResultsScreen } from './screens/ResultsScreen.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { TutorialScreen } from './screens/TutorialScreen.js';
import { ProfileScreen } from './screens/ProfileScreen.js';
import { AdminDashboard } from './screens/AdminDashboard.js';
import { TermsScreen } from './screens/TermsScreen.js';
import { LoadingScreen } from './screens/LoadingScreen.js';
import { gestureController } from './gesture/GestureController.js';
import { installBeforeUnloadGuard } from './utils/GuestGuard.js';

// Initialize screen manager
const screenManager = new ScreenManager('screen-container');

// Expose globally for screen button handlers
window.__screenManager = screenManager;
window.__gestureController = gestureController;

// Register all screens
screenManager.register('main-menu', MainMenu);
screenManager.register('chapter-select', ChapterSelect);
screenManager.register('character-select', CharacterSelect);
screenManager.register('settings', Settings);
screenManager.register('gesture-training', GestureTraining);
screenManager.register('spellbook', Spellbook);
screenManager.register('leaderboard', Leaderboard);
screenManager.register('about', About);
screenManager.register('game-screen', GameScreen);
screenManager.register('results-screen', ResultsScreen);
screenManager.register('login-screen', LoginScreen);
screenManager.register('tutorial-screen', TutorialScreen);
screenManager.register('profile-screen', ProfileScreen);
screenManager.register('admin-dashboard', AdminDashboard);
screenManager.register('terms-screen', TermsScreen);
screenManager.register('loading-screen', LoadingScreen);

async function init() {
  // Small delay for font loading
  await document.fonts.ready;
  
  // Proactively load the gesture model from IndexedDB into memory
  try {
    await gestureController.initialize(null, null);
  } catch (e) {
    console.warn('Gesture controller background initialization error:', e);
  }

  // Check for reset_token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('reset_token');
  
  if (resetToken) {
    // Clear session and go to login/reset screen
    localStorage.removeItem('guest_session');
    window.history.replaceState({}, document.title, window.location.pathname);
    await screenManager.navigate('login-screen', { resetToken }, false);
  } else {
    // Check if session exists
    const sessionData = localStorage.getItem('guest_session');
    if (sessionData) {
      let isValid = true;
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed && parsed.is_guest === false) {
          // Registered user: attempt to hydrate. If it fails (e.g. 401), we should clear session and login.
          const hydrated = await state.hydrateFromServer();
          if (hydrated === false) {
            isValid = false;
          }
        }
      } catch(e) {
        // It's an encrypted guest session string, which is always valid locally
      }

      if (isValid) {
        await screenManager.navigate('main-menu', {}, false);
      } else {
        localStorage.removeItem('guest_session');
        await screenManager.navigate('login-screen', {}, false);
      }
    } else {
      // Navigate to login screen
      await screenManager.navigate('login-screen', {}, false);
    }
  }
  
  // Hide loading overlay
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
    setTimeout(() => loadingOverlay.remove(), 600);
  }

  console.log('🎮 Bata, Takbo! initialized');
  console.log('📋 Settings:', state.get('settings'));
  console.log('📖 Tutorial state:', state.get('tutorialComplete'));
}

// Prevent default mobile behaviors
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());

// Global click sound
const clickAudio = new Audio('/assets/audio/click_sound.mp3');
clickAudio.volume = 0.5; // Optional: set a reasonable volume
document.addEventListener('click', (e) => {
  const target = e.target.closest('button, .menu-btn, .back-btn, .ch-flip-wrapper');
  if (target) {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }
});

// Global mobile tap fix — forward touchend to click for all interactive elements
// This eliminates the 300ms delay and tap-cancellation on mobile browsers
(function mobileTapFix() {
  const SELECTORS = 'button, .menu-btn, .back-btn, .gesture-dir-btn, .ch-flip-wrapper, .cs-item, .leaderboard-tab, .spellbook-entry, .char-option, #icon-profile, .main-menu__logout-btn';
  let touchMoved = false;

  document.addEventListener('touchstart', () => { touchMoved = false; }, { passive: true });
  document.addEventListener('touchmove',  () => { touchMoved = true;  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (touchMoved) return;
    const target = e.target.closest(SELECTORS);
    if (!target) return;
    // Only preventDefault on the matched target to avoid swallowing unrelated clicks
    e.preventDefault();
    target.click();
  }, { passive: false });
})();

// Global hover sound
const hoverAudio = new Audio('/assets/audio/hovering_sound.mp3');
hoverAudio.volume = 0.5;
document.addEventListener('mouseover', (e) => {
  const target = e.target.closest('button, .menu-btn, .back-btn, .ch-flip-wrapper');
  if (target) {
    if (!e.relatedTarget || !target.contains(e.relatedTarget)) {
      hoverAudio.currentTime = 0;
      hoverAudio.play().catch(() => {});
    }
  }
});

// Handle back button / escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && screenManager.canGoBack()) {
    screenManager.back();
  }
});

// Double-tap anywhere to toggle fullscreen
(function doubleTapFullscreen() {
  if (!document.fullscreenEnabled) return;

  // Show a one-time hint overlay when the app first opens (mobile only)
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
  const hintShown = sessionStorage.getItem('fs_hint_shown');
  if (!hintShown && isTouchDevice()) {
    sessionStorage.setItem('fs_hint_shown', '1');
    const hint = document.createElement('div');
    hint.id = 'fs-hint';
    hint.innerHTML = `
      <div style="
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(0,0,0,0.72);
        backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 0.75rem;
        animation: fsFadeIn 0.5s ease forwards;
        pointer-events: none;
      ">
        <span style="font-size: clamp(2rem,6vw,3rem);">👆👆</span>
        <p style="
          font-family: 'GigaSaturn', sans-serif;
          font-size: clamp(1rem, 3vw, 1.4rem);
          color: white; letter-spacing: 3px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
          text-align: center; margin: 0; line-height: 1.5;
        ">DOUBLE-TAP<br>FOR FULLSCREEN</p>
      </div>
    `;
    // Inject keyframe if not already present
    if (!document.getElementById('fs-hint-style')) {
      const s = document.createElement('style');
      s.id = 'fs-hint-style';
      s.textContent = `
        @keyframes fsFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes fsFadeOut { from { opacity:1; } to { opacity:0; } }
      `;
      document.head.appendChild(s);
    }
    document.body.appendChild(hint);
    // Fade out and remove after 2.5s
    setTimeout(() => {
      const inner = hint.querySelector('div');
      if (inner) inner.style.animation = 'fsFadeOut 0.6s ease forwards';
      setTimeout(() => hint.remove(), 650);
    }, 2500);
  }

  // Double-tap anywhere that isn't an interactive element to toggle fullscreen
  const BLOCK_FS = [
    'button', 'a', 'input', 'select', 'textarea',
    '[role="button"]',
    '.menu-btn', '.back-btn', '.gesture-dir-btn', '.dpad-btn',
    '.cs-item', '.ch-flip-wrapper',
    '.leaderboard-tab', '.spellbook-entry',
    '.dialogue-box', '.dialogue-box__buttons',
    '.tutorial-overlay',
    '#icon-profile', '#btn-logout',
    '#webcam-canvas',
    '#gesture-recording-hint', '#fs-hint', '#fs-lost-toast',
    // UI images that aren't backgrounds
    '.main-menu__title', '.cs-portrait', '.cs-ctrl-icon',
    '.dpad-arrow-icon',
  ].join(', ');

  let lastTap = 0;
  const DOUBLE_TAP_MS = 300;

  // Called when fullscreen is lost (camera popup, etc.) — re-enable double-tap recovery
  // This does NOT add a single-tap handler; it just clears the flag so normal double-tap works.
  const markFullscreenNeedsRestore = () => {
    // No-op placeholder — normal onTap double-tap logic handles restoration
    // This function exists so callers have a hook to know restore was attempted
  };

  // Expose globally so GestureTraining and GameScreen can call it after startCamera()
  window.__scheduleRestoreFullscreen = markFullscreenNeedsRestore;

  const requestFS = () => {
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {
      // Blocked after popup — show hint again so user can double-tap to retry
      sessionStorage.removeItem('fs_hint_shown');
    });
  };

  const onTap = (e) => {
    // If mobileTapFix already handled this touch (a button was tapped), skip
    if (e.defaultPrevented) return;
    // Block if tapped on or inside any interactive / UI element
    if (e.target.closest(BLOCK_FS)) return;

    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_MS) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        requestFS();
      }
      lastTap = 0;
    } else {
      lastTap = now;
    }
  };

  // When fullscreen exits unexpectedly (system popup, back gesture, etc.)
  // show a small persistent toast so user knows they can double-tap to restore
  let _fsToast = null;
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      // Fullscreen was lost — user can double-tap anywhere (except buttons) to restore
      // Also show a non-intrusive reminder
      if (_fsToast) return; // already showing
      _fsToast = document.createElement('div');
      _fsToast.id = 'fs-lost-toast';
      _fsToast.textContent = '👆👆 Double-tap to go fullscreen';
      _fsToast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.82); color: white;
        padding: 9px 18px; border-radius: 20px;
        font-family: 'GigaSaturn', sans-serif;
        font-size: clamp(0.6rem, 2vw, 0.8rem);
        letter-spacing: 2px; z-index: 99998;
        pointer-events: none; white-space: nowrap;
        animation: fsFadeIn 0.3s ease forwards;
      `;
      document.body.appendChild(_fsToast);
      // Auto-dismiss after 4s
      setTimeout(() => {
        if (_fsToast) {
          _fsToast.style.animation = 'fsFadeOut 0.4s ease forwards';
          setTimeout(() => { if (_fsToast) { _fsToast.remove(); _fsToast = null; } }, 420);
        }
      }, 4000);
    } else {
      // Fullscreen restored — remove toast if visible
      if (_fsToast) { _fsToast.remove(); _fsToast = null; }
    }
  });

  document.addEventListener('touchend', onTap, { passive: true });
})();

// PWA: Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}

// Warn guests about losing progress on tab close / refresh
installBeforeUnloadGuard();

// Start the app
init();
