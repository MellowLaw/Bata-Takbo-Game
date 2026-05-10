import * as Phaser from 'phaser';

export class Grid {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} cols 
   * @param {number} rows 
   */
  constructor(scene, cols = 7, rows = 9) {
    this.scene = scene;
    this.cols = cols;
    this.rows = rows;
    
    // Will hold graphic backgrounds or tile sprites
    this.cells = [];
    this.tileSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.calculateGrid();
    this.drawBackground();
  }

  calculateGrid() {
    const { width, height } = this.scene.scale;
    const leftWidth = Math.max(width < 768 ? 160 : 250, Math.min(450, width * 0.28));
    const rightWidth = width - leftWidth;
    const rightHeight = height;

    this.panelRect = {
      x: leftWidth,
      y: 0,
      w: rightWidth,
      h: rightHeight
    };

    // Calculate maximum STRICTLY SQUARE tileSize to fit within the right panel with significant padding
    const paddingX = rightWidth * 0.12; 
    const paddingY = rightHeight * 0.12;
    const availableWidth = rightWidth - paddingX * 2;
    const availableHeight = rightHeight - paddingY * 2;

    const rawWidth = availableWidth / this.cols;
    const rawHeight = availableHeight / this.rows;
    
    // STRICT SQUARE preserves projectile/highlight integrity
    this.tileSize = Math.floor(Math.min(rawWidth, rawHeight));
    
    // The exact size of the grid itself inside the panel
    const gridWidth = this.tileSize * this.cols;
    const gridHeight = this.tileSize * this.rows;

    // Expose board dimensions for external layout
    this.boardWidth = gridWidth;
    this.boardHeight = gridHeight;

    // Perfectly center the grid INSIDE the right panel avoiding any bleed.
    this.offsetX = leftWidth + Math.floor((rightWidth - gridWidth) / 2);
    this.offsetY = Math.floor((rightHeight - gridHeight) / 2);
  }

  drawBackground() {
    // Add full panel background
    const panelImg = this.scene.add.image(this.panelRect.x + this.panelRect.w / 2, this.panelRect.y + this.panelRect.h / 2, 'grid_panel_bg');
    panelImg.displayHeight = this.panelRect.h;
    panelImg.scaleX = panelImg.scaleY;

    this.bgGraphics = this.scene.add.graphics();
    
    // Add grid background image spanning the identical gameplay space
    const gridW = this.tileSize * this.cols;
    const gridH = this.tileSize * this.rows;
    this.bgImage = this.scene.add.image(this.offsetX + gridW / 2, this.offsetY + gridH / 2, 'grid_bg');
    this.bgImage.setDisplaySize(gridW, gridH);

    this.graphics = this.scene.add.graphics();

    this.render();
  }

  render() {
    this.bgGraphics.clear();
    this.graphics.clear();

    const lineStyle = { width: 2, color: 0x4a4e69, alpha: 0 };
    const fillLight = 0x22223b;
    const fillDark = 0x1a1a2e;

    // Drop Shadow for the gameplay grid
    const gridW = this.tileSize * this.cols;
    const gridH = this.tileSize * this.rows;
    this.bgGraphics.fillStyle(0x000000, 0.4);
    this.bgGraphics.fillRect(this.offsetX + 8, this.offsetY + 12, gridW, gridH);
    this.bgGraphics.fillStyle(0x000000, 0.2);
    this.bgGraphics.fillRect(this.offsetX - 2, this.offsetY + 4, gridW + 16, gridH + 20);

    // 1. Fill the ENTIRE right panel explicitly (Disabled to show image)
    // this.bgGraphics.fillStyle(panelBg, 1);
    // this.bgGraphics.fillRect(this.panelRect.x, this.panelRect.y, this.panelRect.w, this.panelRect.h);
    
    // 2. Thick Outer frame shadow around the complete right panel edges (Disabled entirely to make transparent)
    // this.bgGraphics.lineStyle(20, 0x000000, 0.5);
    // this.bgGraphics.strokeRect(this.panelRect.x + 10, this.panelRect.y + 10, this.panelRect.w - 20, this.panelRect.h - 20);

    // 3. Crisp frame directly outlining the centered inner game grid (Disabled)
    // this.graphics.lineStyle(6, 0x4a4e69, 1);
    // this.graphics.strokeRect(this.offsetX - 3, this.offsetY - 3, gridW + 6, gridH + 6);

    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetX + c * this.tileSize;
        const y = this.offsetY + r * this.tileSize;

        // Checkerboard pattern (now transparent to see bg)
        const isDark = (r + c) % 2 === 0;
        this.graphics.fillStyle(isDark ? fillDark : fillLight, 0);
        this.graphics.fillRect(x, y, this.tileSize, this.tileSize);

        // Grid border
        this.graphics.lineStyle(lineStyle.width, lineStyle.color, lineStyle.alpha);
        this.graphics.strokeRect(x, y, this.tileSize, this.tileSize);

        this.cells[r][c] = { x, y, cx: x + this.tileSize / 2, cy: y + this.tileSize / 2, status: 'safe' };
      }
    }
  }

  // Gets the exact screen pixel coordinate (center of the tile) for an entity
  getPixelPosition(col, row) {
    if(row < 0) row = 0;
    if(row >= this.rows) row = this.rows - 1;
    if(col < 0) col = 0;
    if(col >= this.cols) col = this.cols - 1;

    return { 
      x: this.cells[row][col].cx, 
      y: this.cells[row][col].cy 
    };
  }

  /**
   * Draw a permanently highlighted tile (used for golden damage tiles or hazards).
   * For temporary highlights, use telegraph() instead.
   */
  highlightTile(col, row, colorHex = 0xff0000, alpha = 0.5) {
    const x = this.offsetX + col * this.tileSize;
    const y = this.offsetY + row * this.tileSize;
    this.graphics.fillStyle(colorHex, alpha);
    this.graphics.fillRect(x, y, this.tileSize, this.tileSize);
  }

  /**
   * Modify the physical state of a cell for hazards (Ch 2+)
   */
  setCellStatus(col, row, status, colorHex = 0x000000) {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.cells[row][col].status = status;
      if (status !== 'safe') {
        this.highlightTile(col, row, colorHex, 0.4);
      } else {
        this.render(); // Clear overlay
      }
    }
  }

  hasChestAt() { return false; }
  removeChestAt() { return null; }

  /**
   * Ruby Logistics
   */
  spawnRuby(col, row) {
     if (!this.rubies) this.rubies = {};
     const key = `${col}_${row}`;
     if (this.rubies[key] || this.hasChestAt(col, row)) return;

     const pos = this.getPixelPosition(col, row);

     const rubySpr = this.scene.add.sprite(pos.x, pos.y, 'ruby_loot')
       .setScale(0).setDepth(20);

     const shadow = this.scene.add.ellipse(pos.x, pos.y + 16, 26, 12, 0x000000).setDepth(19).setAlpha(0);

     // Pop in
     this.scene.tweens.add({
         targets: rubySpr,
         scale: 2.0,
         duration: 300,
         ease: 'Back.easeOut',
         onComplete: () => {
             if (!rubySpr.active) return;
             const floatTween = this.scene.tweens.add({
                 targets: rubySpr,
                 y: rubySpr.y - 15,
                 duration: 800,
                 ease: 'Sine.easeInOut',
                 yoyo: true,
                 repeat: -1
             });
             const shadowTween = this.scene.tweens.add({
                 targets: shadow,
                 scaleX: 0.6, scaleY: 0.6, alpha: 0.15,
                 duration: 800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
             });
             if (this.rubies && this.rubies[key]) {
                 this.rubies[key].floatTween = floatTween;
                 this.rubies[key].shadowTween = shadowTween;
             }
         }
     });
     this.scene.tweens.add({ targets: shadow, alpha: 0.35, duration: 300 });

     this.rubies[key] = { sprite: rubySpr, shadow: shadow };

     // Despawn after 4 seconds
     this.scene.time.delayedCall(4000, () => {
         if (this.rubies && this.rubies[key]) {
             const data = this.rubies[key];
             delete this.rubies[key];
             if (data.floatTween) data.floatTween.stop();
             if (data.shadowTween) data.shadowTween.stop();
             data.sprite.scene.tweens.add({
                 targets: [data.sprite, data.shadow],
                 alpha: 0, scale: 0, duration: 300,
                 onComplete: () => { data.sprite.destroy(); data.shadow.destroy(); }
             });
         }
     });
  }

  hasRubyAt(col, row) {
      if (!this.rubies) return false;
      return !!this.rubies[`${col}_${row}`];
  }

  removeRubyAt(col, row) {
      const key = `${col}_${row}`;
      if (this.rubies && this.rubies[key]) {
          const data = this.rubies[key];
          delete this.rubies[key];
          if (data.floatTween) data.floatTween.stop();
          if (data.shadowTween) data.shadowTween.stop();
          data.shadow.destroy();
          
          // Flash effect
          data.sprite.scene.tweens.add({
              targets: data.sprite,
              alpha: 0,
              scale: 3,
              duration: 200,
              onComplete: () => data.sprite.destroy()
          });
          return true;
      }
      return false;
  }

  /**
   * Diamond Logistics (Trap)
   */
  spawnDiamond(col, row) {
     if (!this.diamonds) this.diamonds = {};
     const key = `${col}_${row}`;
     if (this.diamonds[key] || this.hasChestAt(col, row) || this.hasRubyAt(col, row)) return;

     const pos = this.getPixelPosition(col, row);

     const diamondSpr = this.scene.add.sprite(pos.x, pos.y, 'diamond_loot')
       .setScale(0).setDepth(20);

     const shadow = this.scene.add.ellipse(pos.x, pos.y + 16, 26, 12, 0x000000).setDepth(19).setAlpha(0);

     this.scene.tweens.add({
         targets: diamondSpr,
         scale: 2.0,
         duration: 300,
         ease: 'Back.easeOut',
         onComplete: () => {
             if (!diamondSpr.active) return;
             const floatTween = this.scene.tweens.add({
                 targets: diamondSpr,
                 y: diamondSpr.y - 15,
                 duration: 800,
                 ease: 'Sine.easeInOut',
                 yoyo: true,
                 repeat: -1
             });
             const shadowTween = this.scene.tweens.add({
                 targets: shadow,
                 scaleX: 0.6, scaleY: 0.6, alpha: 0.15,
                 duration: 800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
             });
             if (this.diamonds && this.diamonds[key]) {
                 this.diamonds[key].floatTween = floatTween;
                 this.diamonds[key].shadowTween = shadowTween;
             }
         }
     });
     this.scene.tweens.add({ targets: shadow, alpha: 0.35, duration: 300 });

     this.diamonds[key] = { sprite: diamondSpr, shadow: shadow };

     // Despawn after 4 seconds
     this.scene.time.delayedCall(4000, () => {
         if (this.diamonds && this.diamonds[key]) {
             const data = this.diamonds[key];
             delete this.diamonds[key];
             if (data.floatTween) data.floatTween.stop();
             if (data.shadowTween) data.shadowTween.stop();
             data.sprite.scene.tweens.add({
                 targets: [data.sprite, data.shadow],
                 alpha: 0, scale: 0, duration: 300,
                 onComplete: () => { data.sprite.destroy(); data.shadow.destroy(); }
             });
         }
     });
  }

  hasDiamondAt(col, row) {
      if (!this.diamonds) return false;
      return !!this.diamonds[`${col}_${row}`];
  }

  removeDiamondAt(col, row) {
      const key = `${col}_${row}`;
      if (this.diamonds && this.diamonds[key]) {
          const data = this.diamonds[key];
          delete this.diamonds[key];
          if (data.floatTween) data.floatTween.stop();
          if (data.shadowTween) data.shadowTween.stop();
          data.shadow.destroy();
          
          data.sprite.scene.tweens.add({
              targets: data.sprite,
              alpha: 0,
              scale: 3,
              duration: 200,
              onComplete: () => data.sprite.destroy()
          });
          return true;
      }
      return false;
  }

  /**
   * Show a temporary red warning tile that auto-disappears after durationMs.
   * Uses a separate graphics object so it doesn't pollute the base grid.
   */
  telegraph(col, row, durationMs = 1500) {
    const x = this.offsetX + col * this.tileSize;
    const y = this.offsetY + row * this.tileSize;

    const tempTile = this.scene.add.image(x + this.tileSize / 2, y + this.tileSize / 2, 'red_tile');
    tempTile.setDisplaySize(this.tileSize, this.tileSize);
    tempTile.setDepth(5); // Render behind player (depth 10) but above grid background (depth 0)
    // Set initial alpha (mostly solid)
    tempTile.setAlpha(0.85);

    // Stay solid for most of the duration, then fade out quickly at the end
    this.scene.tweens.add({
      targets: tempTile,
      alpha: 0,
      delay: durationMs * 0.75,
      duration: durationMs * 0.25,
      ease: 'Linear',
      onComplete: () => {
        if (tempTile && tempTile.active) tempTile.destroy();
      }
    });
  }

  telegraphRow(row, durationMs = 1500) {
    for (let c = 0; c < this.cols; c++) {
      this.telegraph(c, row, durationMs);
    }
  }

  telegraphCol(col, durationMs = 1500) {
    for (let r = 0; r < this.rows; r++) {
      this.telegraph(col, r, durationMs);
    }
  }

}
