
import Phaser from 'phaser';
import { GAME_ASSETS, generatePlaceholderAssets } from './config';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show loading progress
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0xFF69B4, 0.8); // Pink
    progressBox.fillRect(240, 180, 320, 50);
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);
    
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 5,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);
    
    this.load.on('progress', (value: number) => {
      percentText.setText(`${parseInt(String(value * 100))}%`);
      progressBar.clear();
      progressBar.fillStyle(0xFFFF00, 1); // Yellow
      progressBar.fillRect(250, 190, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    // For development, we'll use placeholder assets
    // In a production environment, we would load the actual assets here
    try {
      // Try to load assets (when available)
      /* this.load.spritesheet('player', GAME_ASSETS.player, { frameWidth: 48, frameHeight: 48 });
      this.load.spritesheet('player-idle', GAME_ASSETS.playerIdle, { frameWidth: 48, frameHeight: 48 });
      this.load.image('platform', GAME_ASSETS.platform);
      this.load.image('bg-layer-1', GAME_ASSETS.bgLayer1);
      this.load.image('bg-layer-2', GAME_ASSETS.bgLayer2);
      this.load.image('bg-layer-3', GAME_ASSETS.bgLayer3);
      this.load.image('ring', GAME_ASSETS.ring);
      this.load.image('tinhat1', GAME_ASSETS.tinHatCat1);
      this.load.image('tinhat2', GAME_ASSETS.tinHatCat2);
      this.load.image('sparkle', GAME_ASSETS.sparkle);
      this.load.audio('jump', GAME_ASSETS.jumpSound);
      this.load.audio('collect', GAME_ASSETS.collectSound);
      this.load.audio('boost', GAME_ASSETS.boostSound);
      this.load.audio('bgMusic', GAME_ASSETS.bgMusic); */
    } catch (e) {
      console.log('Some assets could not be loaded. Using placeholders instead.');
    }
  }

  create() {
    // Generate placeholder assets
    generatePlaceholderAssets(this);
    
    // Create animations
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1
    });
    
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
    
    // Start the main game scene
    this.scene.start('GameScene');
  }
}
