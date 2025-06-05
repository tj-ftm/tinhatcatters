
// This is a modified implementation for the ReptilianAttackEngine class
// Now using images for rendering instead of drawing primitives

import { Player, Enemy, Bullet, GameState, GameUpgrades } from './types';
import { ImageManager } from './ImageManager';
import { AnimationManager } from './AnimationManager';
import { GameRenderer } from './GameRenderer';
import { GameLogic } from './GameLogic';

class ReptilianAttackEngine {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  
  // Game entities
  private player: Player = {
    x: 100,
    y: 200,
    width: 50,
    height: 70,
    velocityY: 0,
    isJumping: false,
    animationState: 'idle'
  };
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  
  // Game state
  private score = 0;
  private lives = 3;
  private health = 100;
  private pointsEarned = 0;
  private gameOver = false;
  private gameSpeed = 5;
  private startTime: number = 0;
  private gameTime: number = 0;
  
  // Timing
  private lastEnemyTime = 0;
  private lastEnemyShootTime = 0;
  private lastShootTime = 0;
  
  // Settings
  private upgrades: GameUpgrades = { speed: 1, fireRate: 1, health: 1 };
  private collisionBehavior: 'immediate' | 'fade' = 'fade';
  
  // Managers
  private imageManager: ImageManager;
  private animationManager: AnimationManager;
  private gameRenderer: GameRenderer;

  constructor() {
    this.animationManager = new AnimationManager();
    this.imageManager = new ImageManager(() => this.render());
  }

  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    
    if (this.context) {
      this.gameRenderer = new GameRenderer(
        this.canvas,
        this.context,
        this.imageManager,
        this.animationManager
      );
    }
    
    this.reset();
    this.startTime = Date.now();
    
    if (this.canvas && this.context) {
      this.render();
    }
  }

  setCollisionBehavior(behavior: 'immediate' | 'fade') {
    this.collisionBehavior = behavior;
  }

  setAnimationRunning(running: boolean) {
    this.animationManager.setRunning(running);
  }

  reset(upgrades: GameUpgrades = { speed: 1, fireRate: 1, health: 1 }) {
    const config = this.imageManager.getConfig();
    
    this.player = {
      x: 100,
      y: 200,
      width: 50,
      height: 70,
      velocityY: 0,
      isJumping: false,
      animationState: 'idle'
    };
    
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.score = 0;
    this.lives = 3;
    this.health = 100;
    this.pointsEarned = 0;
    this.gameOver = false;
    this.lastEnemyTime = 0;
    this.lastEnemyShootTime = 0;
    this.lastShootTime = 0;
    this.upgrades = upgrades;
    this.startTime = Date.now();
    
    this.animationManager.reset();
  }

  update(delta: number, input: { left: boolean, right: boolean }): GameState {
    if (!this.canvas || !this.context) return this.getGameState();

    // Calculate game time
    if (!this.gameOver) {
      this.gameTime = Date.now() - this.startTime;
    }

    // Update animation
    this.animationManager.update();

    // Apply upgrades
    const speedMultiplier = this.upgrades.speed;
    const fireRateMultiplier = this.upgrades.fireRate;
    const healthMultiplier = this.upgrades.health;

    // Update game speed
    this.gameSpeed = 5 + Math.min(10, Math.floor(this.score / 1000));

    // Update background scroll
    this.gameRenderer.updateBackgroundScroll(this.gameSpeed * speedMultiplier, delta);

    // Update player
    this.player = GameLogic.updatePlayer(
      this.player,
      input,
      this.canvas,
      delta,
      this.animationManager.getCurrentFrame() > 0
    );

    // Handle shooting
    const now = Date.now();
    if (input.left && now - this.lastShootTime > 500 / fireRateMultiplier) {
      const config = this.imageManager.getConfig();
      this.bullets.push({
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2 - config.bullet.height / 2,
        width: config.bullet.width,
        height: config.bullet.height,
        velocityX: 15 * speedMultiplier
      });
      this.lastShootTime = now;
    }

    // Generate enemies
    if (now - this.lastEnemyTime > 2000 / (1 + this.gameSpeed / 20)) {
      const config = this.imageManager.getConfig();
      this.enemies.push({
        x: this.canvas.width,
        y: this.canvas.height - 60 - 20, // Use barrier size
        width: 60,
        height: 60,
        health: 2,
        hit: false,
        velocityY: 0,
        isJumping: false,
        isFiring: false,
        animationState: 'running',
        lastFireTime: 0
      });
      this.lastEnemyTime = now;
    }

    // Enemy shooting
    if (now - this.lastEnemyShootTime > 2000 / (1 + this.gameSpeed / 40)) {
      const shootingEnemies = this.enemies.filter(e => !e.hit);
      if (shootingEnemies.length > 0) {
        const shooter = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
        shooter.isFiring = true;
        shooter.animationState = 'firing';
        shooter.lastFireTime = now;

        const config = this.imageManager.getConfig();
        this.enemyBullets.push({
          x: shooter.x,
          y: shooter.y + shooter.height / 2 - config.enemyBullet.height / 2,
          width: config.enemyBullet.width,
          height: config.enemyBullet.height,
          velocityX: -8
        });
        this.lastEnemyShootTime = now;

        setTimeout(() => {
          shooter.isFiring = false;
          shooter.animationState = 'running';
        }, 300);
      }
    }

    // Update game entities
    const enemyUpdate = GameLogic.updateEnemies(this.enemies, this.canvas, this.gameSpeed, delta, now);
    this.enemies = enemyUpdate.enemies;
    this.score += enemyUpdate.score;
    
    // Only add points if game is not over
    if (!this.gameOver) {
      this.pointsEarned += enemyUpdate.score * 0.05; // Reduced from 0.1 to 0.05
    }

    this.bullets = GameLogic.updateBullets(this.bullets, this.canvas, delta);
    this.enemyBullets = GameLogic.updateBullets(this.enemyBullets, this.canvas, delta);

    // Handle collisions
    const collisionResult = GameLogic.checkCollisions(
      this.player,
      this.enemies,
      this.bullets,
      this.enemyBullets,
      this.collisionBehavior,
      healthMultiplier
    );

    this.health += collisionResult.health;
    this.score += collisionResult.score;
    
    // Only add points if game is not over
    if (!this.gameOver) {
      this.pointsEarned += collisionResult.score * 0.05; // Reduced from 0.1 to 0.05
    }
    
    this.enemies = collisionResult.enemies;
    this.bullets = collisionResult.bullets;
    this.enemyBullets = collisionResult.enemyBullets;

    // Check health and lives
    if (this.health <= 0) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.gameOver = true;
      } else {
        this.health = 100;
      }
    }

    // Increment score for surviving - only if game is not over
    if (!this.gameOver) {
      this.score += Math.ceil(delta);
      // Reduced survival points to aim for ~100 points per minute
      this.pointsEarned += 0.03 * delta; // Reduced from 0.01 to 0.03
    }

    // Save results if game over
    if (this.gameOver) {
      this.saveGameResults();
    }

    return this.getGameState();
  }

  renderStartScreen() {
    if (this.gameRenderer) {
      this.gameRenderer.renderStartScreen();
    }
  }

  render() {
    if (this.gameRenderer) {
      this.gameRenderer.render(
        this.player,
        this.enemies,
        this.bullets,
        this.enemyBullets,
        this.gameOver,
        this.score,
        this.pointsEarned
      );
    }
  }

  getGameState(): GameState {
    return {
      score: this.score,
      lives: this.lives,
      health: this.health,
      pointsEarned: this.pointsEarned,
      thcEarned: 0,
      gameOver: this.gameOver,
      gameStarted: true,
      paused: false,
      gameTime: this.gameTime
    };
  }

  getUpgradePrices() {
    return {
      speed: {
        name: "Speed Upgrade",
        description: "Increases movement and attack speed",
        price: 50 * this.upgrades.speed
      },
      fireRate: {
        name: "Fire Rate Upgrade",
        description: "Shoot faster and more bullets",
        price: 50 * this.upgrades.fireRate
      },
      health: {
        name: "Health Upgrade",
        description: "Reduces damage taken from enemies",
        price: 50 * this.upgrades.health
      }
    };
  }

  private saveGameResults() {
    // Save high score to localStorage if it's better than the previous one
    const currentHighScore = parseInt(localStorage.getItem('reptilian-high-score') || '0', 10);
    if (this.score > currentHighScore) {
      localStorage.setItem('reptilian-high-score', this.score.toString());
    }
    
    // Save game time (formatted as mm:ss)
    const minutes = Math.floor(this.gameTime / 60000);
    const seconds = Math.floor((this.gameTime % 60000) / 1000);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Get best time
    const currentBestTime = localStorage.getItem('reptilian-best-time') || '0:00';
    const [currentMinutes, currentSeconds] = currentBestTime.split(':').map(n => parseInt(n, 10));
    const currentBestTimeSeconds = (currentMinutes * 60) + currentSeconds;
    const newTimeSeconds = (minutes * 60) + seconds;
    
    // Only save if we have a time and it's better (higher) than current best
    if (newTimeSeconds > 0 && (currentBestTimeSeconds === 0 || newTimeSeconds > currentBestTimeSeconds)) {
      localStorage.setItem('reptilian-best-time', formattedTime);
    }
    
    // Save points earned this game
    const totalPointsEarned = parseFloat(localStorage.getItem('reptilian-total-points') || '0');
    localStorage.setItem('reptilian-total-points', (totalPointsEarned + this.pointsEarned).toString());
    
    // Save total games played
    const gamesPlayed = parseInt(localStorage.getItem('reptilian-games-played') || '0', 10);
    localStorage.setItem('reptilian-games-played', (gamesPlayed + 1).toString());
  }
}

export default ReptilianAttackEngine;
