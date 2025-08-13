
export interface GameUpgrades {
  speed: number;
  fireRate: number;
  health: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  animationState: 'idle' | 'running' | 'jumping';
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  hit: boolean;
  velocityY: number;
  isJumping: boolean;
  isFiring: boolean;
  animationState: 'running' | 'jumping' | 'firing';
  lastFireTime: number;
}

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
}

export interface GameState {
  score: number;
  lives: number;
  health: number;
  pointsEarned: number;
  thcEarned: number;
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
  gameTime: number;
}

export interface ImageConfig {
  playerIdle: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical' };
  playerRun: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical' };
  playerJump: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical' };
  background: { src: string; width: number; height: number };
  enemyRun: { src: string; width: number; height: number; frames: number };
  enemyJump: { src: string; width: number; height: number; frames: number };
  enemyFire: { src: string; width: number; height: number; frames: number };
  bullet: { src: string; width: number; height: number };
  enemyBullet: { src: string; width: number; height: number };
  floor: { src: string; width: number; height: number };
  introVideo: { src: string; width: number; height: number };
}
