
import Phaser from 'phaser';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800, x: 0 }, // Added x:0 to satisfy the Vector2Like type
      debug: false
    }
  },
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: '#000000'
};

export const PLAYER_CONFIG = {
  speed: 200,
  jumpForce: 450,
  acceleration: 1500,
  deceleration: 1000,
  maxSpeed: 400
};

export const GAME_ASSETS = {
  // Player
  player: '/assets/game/player-sprite.png',
  playerIdle: '/assets/game/player-idle.png',
  
  // Backgrounds
  bgLayer1: '/assets/game/bg-layer-1.png',
  bgLayer2: '/assets/game/bg-layer-2.png',
  bgLayer3: '/assets/game/bg-layer-3.png',
  
  // Level elements
  platform: '/assets/game/platform.png',
  spikes: '/assets/game/spikes.png',
  ring: '/assets/game/ring.png',
  
  // Pets/NFTs
  tinHatCat1: '/assets/tinhats/tinhat1.png',
  tinHatCat2: '/assets/tinhats/tinhat2.png',
  
  // Snacks
  energyDonut: '/assets/snacks/donut.png',
  speedCookie: '/assets/snacks/cookie.png',
  
  // Effects
  sparkle: '/assets/game/sparkle.png',
  dust: '/assets/game/dust.png',
  boost: '/assets/game/boost.png',
  
  // Sounds
  jumpSound: '/assets/sounds/jump.mp3',
  collectSound: '/assets/sounds/collect.mp3',
  boostSound: '/assets/sounds/boost.mp3',
  bgMusic: '/assets/sounds/background-music.mp3'
};

// Preload placeholder function until we have the actual assets
export function getPlaceholderSpriteSheet(scene: Phaser.Scene, key: string, frameWidth: number, frameHeight: number): void {
  // Fixed the scene.make.graphics by removing the 'add' property
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(0xFF69B4); // Pink
  graphics.fillRect(0, 0, frameWidth, frameHeight);
  graphics.lineStyle(2, 0xFFFF00); // Yellow border
  graphics.strokeRect(0, 0, frameWidth, frameHeight);
  
  graphics.generateTexture(key, frameWidth * 8, frameHeight);
  graphics.destroy();
}

// Generate placeholder assets for development
export function generatePlaceholderAssets(scene: Phaser.Scene): void {
  // Player
  getPlaceholderSpriteSheet(scene, 'player', 48, 48);
  getPlaceholderSpriteSheet(scene, 'player-idle', 48, 48);
  
  // Platform
  const platformGraphics = scene.make.graphics({ x: 0, y: 0 });
  platformGraphics.fillStyle(0xFF69B4); // Pink
  platformGraphics.fillRect(0, 0, 64, 16);
  platformGraphics.lineStyle(2, 0xFFFF00); // Yellow border
  platformGraphics.strokeRect(0, 0, 64, 16);
  platformGraphics.generateTexture('platform', 64, 16);
  platformGraphics.destroy();
  
  // Ring
  const ringGraphics = scene.make.graphics({ x: 0, y: 0 });
  ringGraphics.fillStyle(0xFFFF00); // Yellow
  ringGraphics.fillCircle(12, 12, 10);
  ringGraphics.generateTexture('ring', 24, 24);
  ringGraphics.destroy();
  
  // Sparkle - replacing fillStar with a simple diamond shape
  const sparkleGraphics = scene.make.graphics({ x: 0, y: 0 });
  sparkleGraphics.fillStyle(0xFFFF00); // Yellow
  // Draw a diamond shape instead of using fillStar
  sparkleGraphics.beginPath();
  sparkleGraphics.moveTo(12, 2);  // Top
  sparkleGraphics.lineTo(22, 12); // Right
  sparkleGraphics.lineTo(12, 22); // Bottom
  sparkleGraphics.lineTo(2, 12);  // Left
  sparkleGraphics.closePath();
  sparkleGraphics.fillPath();
  sparkleGraphics.generateTexture('sparkle', 24, 24);
  sparkleGraphics.destroy();
  
  // Background layers
  const bgLayer1Graphics = scene.make.graphics({ x: 0, y: 0 });
  bgLayer1Graphics.fillStyle(0x000000); // Black
  bgLayer1Graphics.fillRect(0, 0, 800, 400);
  bgLayer1Graphics.generateTexture('bg-layer-1', 800, 400);
  bgLayer1Graphics.destroy();
  
  const bgLayer2Graphics = scene.make.graphics({ x: 0, y: 0 });
  bgLayer2Graphics.fillStyle(0x330033); // Dark purple
  bgLayer2Graphics.fillRect(0, 0, 800, 400);
  bgLayer2Graphics.generateTexture('bg-layer-2', 800, 400);
  bgLayer2Graphics.destroy();
  
  const bgLayer3Graphics = scene.make.graphics({ x: 0, y: 0 });
  bgLayer3Graphics.fillStyle(0x660066); // Purple
  bgLayer3Graphics.fillRect(0, 0, 800, 400);
  bgLayer3Graphics.generateTexture('bg-layer-3', 800, 400);
  bgLayer3Graphics.destroy();
  
  // TinHatCatter
  const tinHatGraphics = scene.make.graphics({ x: 0, y: 0 });
  tinHatGraphics.fillStyle(0xFF69B4); // Pink
  tinHatGraphics.fillCircle(16, 16, 14);
  tinHatGraphics.fillStyle(0xFFFF00); // Yellow
  tinHatGraphics.fillTriangle(6, 16, 16, 2, 26, 16);
  tinHatGraphics.generateTexture('tinhat', 32, 32);
  tinHatGraphics.destroy();
}
