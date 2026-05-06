/**
 * TutorialManager
 * Handles tutorial sequence state for both Gesture and Gameplay phases.
 */
import { state } from './StateManager.js';
import { DialogueBox } from './DialogueBox.js';

export class TutorialManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.dialogue = new DialogueBox(containerId);
    this.steps = [];
    this.currentStep = 0;
    this.isActive = false;
    this.onComplete = null;
    this.onSkip = null;
  }

  /**
   * Start a tutorial sequence
   * @param {Array} steps - The tutorial steps
   * @param {Object} options - onComplete, onSkip callbacks
   */
  start(steps, options = {}) {
    this.steps = steps;
    this.currentStep = 0;
    this.isActive = true;
    this.onComplete = options.onComplete;
    this.onSkip = options.onSkip;
    
    this._showStep();
  }

  next() {
    if (!this.isActive) return;
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    } else {
      this._showStep();
    }
  }

  skip() {
    if (!this.isActive) return;
    this.isActive = false;
    this.dialogue.hide();
    if (this.onSkip) this.onSkip();
  }

  complete() {
    this.isActive = false;
    this.dialogue.hide();
    if (this.onComplete) this.onComplete();
  }

  update(triggerType, data) {
    if (!this.isActive || this.currentStep >= this.steps.length) return;
    const step = this.steps[this.currentStep];

    if (step.autoAdvance && step.autoAdvance.type === triggerType) {
      // If there's a check fn, run it; otherwise matching the type is enough
      const conditionMet = step.autoAdvance.check ? step.autoAdvance.check(data) : true;
      if (conditionMet) {
        this.next();
      }
    }
  }

  _showStep() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    if (step.onEnter) {
      step.onEnter();
    }

    const config = {
      text: step.text,
      subtext: step.subtext || `Step ${this.currentStep + 1} / ${this.steps.length}`,
      portrait: step.portrait || '/assets/entity/character-icon/character.png',
      portraitFrames: step.portraitFrames != null ? step.portraitFrames : 5,
      position: step.position || 'bottom',
      highlight: step.highlight,
      hideDialogue: step.hideDialogue || false,
      overlay: step.overlay || false,
      buttons: step.buttons || []
    };

    // If it requires a manual button click to advance
    if (!step.autoAdvance && !config.buttons.some(b => b.action === 'next')) {
      config.buttons.unshift({ label: 'Next', action: 'next' });
    }

    // Always have a skip button
    if (!config.buttons.some(b => b.action === 'skip')) {
      config.buttons.push({ label: 'Skip Tutorial', action: 'skip', style: 'subtle' });
    }

    this.dialogue.show(config, (action) => {
      if (action === 'next') {
        this.next();
      } else if (action === 'skip') {
        this.skip();
      } else if (step.onAction) {
        step.onAction(action, this);
      }
    });
  }
}
