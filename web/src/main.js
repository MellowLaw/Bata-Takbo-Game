/**
 * main.js — Application entry point
 * Initializes the screen manager and navigates to the main menu
 */
import './index.css';
import { ScreenManager } from './utils/ScreenManager.js';
import { state } from './utils/StateManager.js';
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
