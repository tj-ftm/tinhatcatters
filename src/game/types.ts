
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
  animationState: 'idle' | 'running' | 'jumping' | 'throwing';
  health: number;
  maxHealth: number;
  lives: number;
  damageEffectTime?: number;
  lifeDisplayTime?: number;
  explosionStartTime?: number;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  hit: boolean;
  velocityY: number;
  isJumping: boolean;
  isFiring: boolean;
  animationState: 'running' | 'jumping' | 'firing' | 'exploding';
  lastFireTime: number;
  explosionStartTime?: number;
  damageEffectTime?: number;
  parallaxX?: number;
  explosionStartScrollX?: number;
  pointsDisplayTime?: number;
  pointsValue?: number;
  speedMultiplier?: number;
  jumpCooldown?: number;
  lastJumpTime?: number;
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
  playerIdle: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical'; animated?: boolean; isVideo?: boolean };
  playerRun: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical'; animated?: boolean; isVideo?: boolean };
  playerJump: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical'; animated?: boolean; isVideo?: boolean };
  playerThrow: { src: string; width: number; height: number; frames: number; orientation?: 'horizontal' | 'vertical'; animated?: boolean; isVideo?: boolean };
  background: { src: string; width: number; height: number };
  enemyRun: { src: string; width: number; height: number; frames: number; animated?: boolean; isVideo?: boolean };
  enemyJump: { src: string; width: number; height: number; frames: number; animated?: boolean; isVideo?: boolean };
  enemyFire: { src: string; width: number; height: number; frames: number; animated?: boolean; isVideo?: boolean };
  enemyExplosion: { src: string; width: number; height: number; frames: number; animated?: boolean; isVideo?: boolean };
  bullet: { src: string; width: number; height: number };
  enemyBullet: { src: string; width: number; height: number };
  floor: { src: string; width: number; height: number };
  introVideo: { src: string; width: number; height: number };
}
