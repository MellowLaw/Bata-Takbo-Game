import { state } from '../utils/StateManager.js';

export const TermsScreen = {
  render() {
    return `
      <div class="terms-screen screen" style="background-image: url('/assets/ui/backgrounds/login_background.png'); background-size: cover; background-position: center; width: 100%; height: 100%;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7);"></div>
        
        <button class="back-btn" id="btn-terms-back">Back</button>

        <div style="position: relative; z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 5%;">
          
          <div class="panel scrollable" style="width: 80%; max-width: 800px; height: 80%; padding: 2rem; background: rgba(16, 12, 4, 0.9);">
            <h1 class="screen-title" style="font-size: 2.5rem; margin-bottom: 2rem;">LEGAL INFORMATION</h1>
            
            <h2 style="font-family: var(--font-display); color: var(--accent-orange); margin-bottom: 1rem; font-size: 1.8rem;">PRIVACY POLICY</h2>
            <p style="color: var(--text-primary); font-family: var(--font-ui); margin-bottom: 1rem; line-height: 1.6;">
              At Bata, Takbo!, we take your privacy seriously. This privacy policy explains how we collect, use, and protect your personal information.
              We only collect necessary information such as your username and password for account management and leaderboard tracking. 
              If you play as a Guest, your session data is stored locally on your device using encryption.
              We do not share, sell, or distribute your personal information to any third parties.
            </p>
            <p style="color: var(--text-primary); font-family: var(--font-ui); margin-bottom: 2rem; line-height: 1.6;">
              By using your webcam for gesture controls, you agree to allow the application to process your video feed locally. No video data is ever recorded, stored, or transmitted to our servers. All gesture recognition happens directly in your browser.
            </p>

            <h2 style="font-family: var(--font-display); color: var(--accent-orange); margin-bottom: 1rem; font-size: 1.8rem;">TERMS OF SERVICE</h2>
            <p style="color: var(--text-primary); font-family: var(--font-ui); margin-bottom: 1rem; line-height: 1.6;">
              By accessing and playing Bata, Takbo!, you agree to abide by these Terms of Service.
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p style="color: var(--text-primary); font-family: var(--font-ui); margin-bottom: 1rem; line-height: 1.6;">
              The game and all its content, including but not limited to graphics, audio, code, and gameplay mechanics, are the property of the developers. You may not modify, reverse engineer, or distribute the game without explicit permission.
            </p>
            <p style="color: var(--text-primary); font-family: var(--font-ui); margin-bottom: 1rem; line-height: 1.6;">
              We reserve the right to suspend or terminate accounts that violate these terms, including the use of cheats, exploits, or inappropriate usernames.
            </p>
            <p style="color: var(--text-primary); font-family: var(--font-ui); margin-bottom: 2rem; line-height: 1.6;">
              Enjoy the game, respect other players, and survive the night!
            </p>

          </div>
        </div>
      </div>
    `;
  },

  onEnter(el) {
    el.querySelector('#btn-terms-back').addEventListener('click', () => {
      window.__screenManager.back();
    });
  },

  onLeave() {
    // Cleanup if needed
  }
};
