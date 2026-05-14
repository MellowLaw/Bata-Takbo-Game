/**
 * AudioManager - Manages game sound effects using Phaser's sound system
 */
import { state } from '../utils/StateManager.js';

class AudioManager {
  constructor() {
    this.scene = null;
    this.volume = 1.0;
    this.muted = false;
    this.initialized = false;
  }

  /**
   * Initialize with a Phaser scene
   * @param {Phaser.Scene} scene 
   */
  init(scene) {
    this.scene = scene;
    this.initialized = true;
    this.updateVolume();
  }

  /**
   * Update volume from state settings
   */
  updateVolume() {
    const s = state.get('settings');
    if (s && s.audio) {
      this.volume = (s.audio.master || 0.8) * (s.audio.sfx || 0.9);
      this.muted = s.audio.muted || false;
    }
    
    // Update Phaser sound volume if scene exists
    if (this.scene && this.scene.sound) {
      this.scene.sound.volume = this.muted ? 0 : this.volume;
      if (this.currentMusic) {
        try {
          this.currentMusic.setVolume(this.muted ? 0 : this.volume * 0.4);
        } catch (e) {
          console.warn('[AudioManager] currentMusic reference was dead, clearing it.');
          this.currentMusic = null;
        }
      }
    }
  }

  /**
   * Load chapter-specific SFX based on chapter ID
   * @param {Phaser.Scene} scene - The game scene to load into
   * @param {number} chapterId - Chapter ID (1, 2, or 3)
   */
  loadChapterSFX(scene, chapterId) {
    const basePath = '/assets/audio/sd';
    const bgmPath = '/assets/audio';
    
    // Load background music
    if (scene.isInfMode || chapterId === 4) {
      scene.load.audio('bg_music', `${bgmPath}/bg-inf.mp3`);
    } else if (chapterId === 1) {
      scene.load.audio('bg_music', `${bgmPath}/chapter-1-bg.mp3`);
    } else if (chapterId === 2) {
      scene.load.audio('bg_music', `${bgmPath}/chapter-2-bg.mp3`);
    } else if (chapterId === 3) {
      scene.load.audio('bg_music', `${bgmPath}/chapter-3-bg.mp3`);
    }
    
    // Chapter 1: Blood/Gore/Dark (Manananggal) — also chapter 4 (INF mode)
    if (chapterId === 1 || chapterId === 4) {
      scene.load.audio('ch1_blood_crunch', `${basePath}/DSGNImpt_EXPLOSION-Cruncher_HY_PC-001.wav`);
      scene.load.audio('ch1_blood_splat', `${basePath}/DSGNImpt_EXPLOSION-Crunching_HY_PC-001.wav`);
      scene.load.audio('ch1_gore_pierce', `${basePath}/DSGNMisc_HIT-Gore Pierce_HY_PC-001.wav`);
      scene.load.audio('ch1_crunchy_burst', `${basePath}/DSGNMisc_SKILL IMPACT-Crunchy Burst_HY_PC-001.wav`);
      scene.load.audio('ch1_dark_hit', `${basePath}/DSGNImpt_MELEE-Hollow Punch_HY_PC-001.wav`);
      scene.load.audio('ch1_eye_spawn', `${basePath}/DSGNMisc_CAST-Slime Ball_HY_PC-001.wav`);
      scene.load.audio('ch1_hand_slam', `${basePath}/DSGNImpt_EXPLOSION-Thud_HY_PC-001.wav`);
      // Attack-specific SFX
      scene.load.audio('ch1_splatter_drop', `${basePath}/DSGNMisc_CAST-Slime Ball_HY_PC-002.wav`);
      scene.load.audio('ch1_splatter_burst', `${basePath}/DSGNMisc_SKILL IMPACT-Crunchy Burst_HY_PC-003.wav`);
      scene.load.audio('ch1_eye_whoosh', `${basePath}/DSGNMisc_MOVEMENT-Whoosh Sweep_HY_PC-001.wav`);
      scene.load.audio('ch1_eye_land', `${basePath}/DSGNImpt_EXPLOSION-Crunching_HY_PC-005.wav`);
      scene.load.audio('ch1_volley_shoot', `${basePath}/DSGNImpt_EXPLOSION-Bit Bomb_HY_PC-006.wav`);
      scene.load.audio('ch1_volley_burst', `${basePath}/DSGNImpt_EXPLOSION-Crunchy Burst_HY_PC-004.wav`);
      scene.load.audio('ch1_vortex_spawn', `${basePath}/DSGNMisc_MOVEMENT-Mecha Large Takeoff_HY_PC-001.wav`);
      scene.load.audio('ch1_vortex_pull', `${basePath}/DSGNMisc_MOVEMENT-Noise Sweeper_HY_PC-001.wav`);
    }
    
    // Chapter 2: Nature/Plant (Bungisngis)
    if (chapterId === 2) {
      scene.load.audio('ch2_bee_swarm', `${basePath}/DSGNMisc_MOVEMENT-Bats Flying_HY_PC-001.wav`);
      scene.load.audio('ch2_bubbly_shot', `${basePath}/DSGNMisc_PROJECTILE-Bubbly Wubbly_HY_PC-001.wav`);
      scene.load.audio('ch2_nature_magic', `${basePath}/MAGSpel_CAST-Birdsong_HY_PC-001.wav`);
      scene.load.audio('ch2_wind_gust', `${basePath}/MAGAngl_BUFF-Healing Gusts_HY_PC-001.wav`);
      scene.load.audio('ch2_acid_spit', `${basePath}/DSGNMisc_CAST-Slime Ball_HY_PC-001.wav`);
      scene.load.audio('ch2_plant_grow', `${basePath}/MAGSpel_CAST-Growing Strength_HY_PC-001.wav`);
      scene.load.audio('ch2_vine_swish', `${basePath}/SWSH_MOVEMENT-Bamboo Whip_HY_PC-001.wav`);
    }
    
    // Chapter 3: Water/Sea (Kataw)
    if (chapterId === 3) {
      scene.load.audio('ch3_water_splash', `${basePath}/DSGNMisc_MOVEMENT-Sparkly Water_HY_PC-001.wav`);
      scene.load.audio('ch3_water_bolt', `${basePath}/DSGNMisc_PROJECTILE-Water Bolt_HY_PC-001.wav`);
      scene.load.audio('ch3_underwater', `${basePath}/MAGSpel_CAST-Underwater_HY_PC-001.wav`);
      scene.load.audio('ch3_electric_hit', `${basePath}/DSGNImpt_EXPLOSION-Electric Hit_HY_PC-001.wav`);
      scene.load.audio('ch3_water_laser', `${basePath}/DSGNMisc_MOVEMENT-Watery Laser_HY_PC-001.wav`);
      scene.load.audio('ch3_bubble_pop', `${basePath}/DSGNMisc_PROJECTILE-Clicky Bubbly_HY_PC-001.wav`);
      scene.load.audio('ch3_fish_swish', `${basePath}/DSGNMisc_MOVEMENT-Bubbly Laser Swish_HY_PC-001.wav`);
    }
    
    // Shared SFX for all chapters
    scene.load.audio('sfx_step_1', `${basePath}/FEETMisc_STEP-Boots on Generic Ground 2_HY_PC-001.wav`);
    scene.load.audio('sfx_step_2', `${basePath}/FEETMisc_STEP-Boots on Generic Ground 2_HY_PC-002.wav`);
    scene.load.audio('sfx_step_3', `${basePath}/FEETMisc_STEP-Boots on Generic Ground 2_HY_PC-003.wav`);
    scene.load.audio('sfx_step_4', `${basePath}/FEETMisc_STEP-Boots on Generic Ground 2_HY_PC-004.wav`);
    scene.load.audio('sfx_step_5', `${basePath}/FEETMisc_STEP-Boots on Generic Ground 2_HY_PC-005.wav`);
    scene.load.audio('sfx_step_6', `${basePath}/FEETMisc_STEP-Boots on Generic Ground 2_HY_PC-006.wav`);
    scene.load.audio('sfx_melee_hit', `${basePath}/MAGSpel_CAST-Zippy Particle_HY_PC-001.wav`);
    scene.load.audio('sfx_sword_spawn', `${basePath}/DSGNTonl_SKILL RELEASE-Rising Lasers_HY_PC-001.wav`);
    scene.load.audio('sfx_sword_pickup', `${basePath}/DSGNSynth_CAST-Mecha Sword Cast_HY_PC-001.wav`);
    scene.load.audio('sfx_warning', `${basePath}/DSGNTonl_MELEE-Sword Critical_HY_PC-001.wav`);
    scene.load.audio('sfx_telegraph', `${basePath}/DSGNSynth_BUFF-Metallic Dodge Chance_HY_PC-005.wav`);
    scene.load.audio('sfx_blood_hit_1', `${basePath}/DSGNTonl_SKILL RELEASE-Ricochet 2_HY_PC-001.wav`);
    scene.load.audio('sfx_blood_hit_2', `${basePath}/DSGNTonl_SKILL RELEASE-Ricochet 2_HY_PC-002.wav`);
    scene.load.audio('sfx_blood_hit_3', `${basePath}/DSGNTonl_SKILL RELEASE-Ricochet 2_HY_PC-003.wav`);
    scene.load.audio('sfx_blood_hit_4', `${basePath}/DSGNTonl_SKILL RELEASE-Ricochet 2_HY_PC-004.wav`);
    scene.load.audio('sfx_blood_hit_5', `${basePath}/DSGNTonl_SKILL RELEASE-Ricochet 2_HY_PC-005.wav`);
    scene.load.audio('sfx_blood_hit_6', `${basePath}/DSGNTonl_SKILL RELEASE-Ricochet 2_HY_PC-006.wav`);
    scene.load.audio('sfx_explosion', `${basePath}/DSGNImpt_EXPLOSION-Bit Bomb_HY_PC-002.wav`);
    scene.load.audio('sfx_ui_click', `${basePath}/DSGNMisc_INTERFACE-Zap Select_HY_PC-001.wav`);
    scene.load.audio('sfx_dpad_click', `${basePath}/UIClick_INTERFACE-Positive Click_HY_PC-001.wav`);
    scene.load.audio('sfx_dash', `${basePath}/DSGNMisc_MOVEMENT-Jump Sparkle_HY_PC-001.wav`);
    scene.load.audio('sfx_damage', `${basePath}/DSGNMisc_HIT-Hit Noise_HY_PC-001.wav`);
    scene.load.audio('sfx_alert', `${basePath}/DSGNMisc_SKILL IMPACT-Jacobs Ladder_HY_PC-001.wav`);
  }

  /**
   * Play a sound effect using Phaser's sound system
   * @param {string} key - The sound key to play
   * @param {Object} options - Playback options
   * @param {number} options.volume - Override volume (0-1)
   * @param {boolean} options.loop - Whether to loop
   */
  play(key, options = {}) {
    if (!this.scene || !this.scene.sound) {
      return;
    }
    
    if (this.muted) return;
    
    // Ensure volume is current
    this.updateVolume();
    
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`[AudioManager] Sound not in cache: ${key}`);
      return;
    }
    
    try {
      const playVolume = (options.volume !== undefined ? options.volume : 1) * this.volume;
      // scene.sound.play() is the correct Phaser 3 API — works directly after load.audio
      this.scene.sound.play(key, { volume: playVolume, loop: options.loop || false });
    } catch (e) {
      console.warn(`[AudioManager] Failed to play ${key}:`, e);
    }
  }

  /**
   * Play background music
   * @param {string} key - The sound key for the music
   */
  playMusic(key) {
    if (!this.scene || !this.scene.sound) return;
    
    if (this.currentMusic) {
      this.currentMusic.stop();
    }
    
    if (this.scene.cache.audio.exists(key)) {
      this.currentMusic = this.scene.sound.add(key, { 
        loop: true, 
        volume: this.muted ? 0 : this.volume * 0.4 // BGM usually needs to be quieter than SFX
      });
      this.currentMusic.play();
    }
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Play a random variant from an array of keys
   * @param {string[]} keys - Array of sound keys
   * @param {Object} options - Playback options
   */
  playRandom(keys, options = {}) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    return this.play(key, options);
  }

  /**
   * Play a random blood hit variant (Ricochet 2, variants 1-6)
   */
  playBloodHit() {
    const variant = Math.floor(Math.random() * 6) + 1;
    this.play(`sfx_blood_hit_${variant}`);
  }

  /**
   * Play chapter-specific impact/hit sound
   * @param {number} chapterId - Chapter ID
   */
  playImpact(chapterId) {
    const variants = [];
    
    if (chapterId === 1) {
      variants.push('ch1_blood_crunch', 'ch1_dark_hit', 'ch1_hand_slam');
    } else if (chapterId === 2) {
      variants.push('ch2_vine_swish', 'ch2_wind_gust');
    } else if (chapterId === 3) {
      variants.push('ch3_electric_hit', 'ch3_water_splash');
    }
    
    if (variants.length > 0) {
      this.playRandom(variants);
    }
  }

  /**
   * Play chapter-specific spawn/cast sound
   * @param {number} chapterId - Chapter ID
   */
  playSpawn(chapterId) {
    const variants = [];
    
    if (chapterId === 1) {
      variants.push('ch1_eye_spawn', 'ch1_blood_splat');
    } else if (chapterId === 2) {
      variants.push('ch2_nature_magic', 'ch2_plant_grow', 'ch2_bee_swarm');
    } else if (chapterId === 3) {
      variants.push('ch3_underwater', 'ch3_bubble_pop', 'ch3_water_laser');
    }
    
    if (variants.length > 0) {
      this.playRandom(variants);
    }
  }

  /**
   * Set mute state
   * @param {boolean} muted 
   */
  setMuted(muted) {
    this.muted = muted;
    if (this.scene && this.scene.sound) {
      this.scene.sound.mute = muted;
    }
  }
}

// Export singleton
export const audioManager = new AudioManager();
