
import { Player, Enemy, Bullet, GameUpgrades } from './types';

export class GameLogic {
  static updatePlayer(
    player: Player,
    input: { left: boolean; right: boolean },
    canvas: HTMLCanvasElement,
    delta: number,
    spriteAnimationRunning: boolean
  ): Player {
    const wasJumping = player.isJumping;
    
    // Handle jumping
    if (input.right && !player.isJumping) {
      player.velocityY = -15;
      player.isJumping = true;
      player.animationState = 'jumping';
    }
    
    // Apply gravity
    player.velocityY += 0.8 * delta;
    player.y += player.velocityY * delta;
    
    // Check floor collision
    const floorY = canvas.height - player.height - 20;
    if (player.y > floorY) {
      player.y = floorY;
      player.velocityY = 0;
      player.isJumping = false;
      
      if (wasJumping) {
        player.animationState = 'running';
      }
    }
    
    // Set animation state
    if (!player.isJumping && spriteAnimationRunning) {
      player.animationState = 'running';
    } else if (!spriteAnimationRunning) {
      player.animationState = 'idle';
    }
    
    return player;
  }

  static updateEnemies(
    enemies: Enemy[],
    canvas: HTMLCanvasElement,
    gameSpeed: number,
    delta: number,
    now: number
  ): { enemies: Enemy[]; score: number; thcEarned: number } {
    let scoreGained = 0;
    let thcGained = 0;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // Move enemy
      enemy.x -= (gameSpeed - 2) * delta;
      
      // Random jumping
      if (!enemy.isJumping && Math.random() < 0.001) {
        enemy.velocityY = -12;
        enemy.isJumping = true;
        enemy.animationState = 'jumping';
      }
      
      // Apply gravity
      enemy.velocityY += 0.8 * delta;
      enemy.y += enemy.velocityY * delta;
      
      // Floor collision
      const enemyFloorY = canvas.height - enemy.height - 20;
      if (enemy.y > enemyFloorY) {
        enemy.y = enemyFloorY;
        enemy.velocityY = 0;
        enemy.isJumping = false;
        if (enemy.animationState === 'jumping') {
          enemy.animationState = 'running';
        }
      }
      
      // Remove if off screen
      if (enemy.x + enemy.width < 0) {
        enemies.splice(i, 1);
        scoreGained += 10;
        thcGained += 0.001;
      }
    }

    return { enemies, score: scoreGained, thcEarned: thcGained };
  }

  static updateBullets(bullets: Bullet[], canvas: HTMLCanvasElement, delta: number): Bullet[] {
    return bullets.filter(bullet => {
      bullet.x += bullet.velocityX * delta;
      return bullet.x <= canvas.width && bullet.x + bullet.width >= 0;
    });
  }

  static checkCollisions(
    player: Player,
    enemies: Enemy[],
    bullets: Bullet[],
    enemyBullets: Bullet[],
    collisionBehavior: 'immediate' | 'fade',
    healthMultiplier: number
  ): {
    health: number;
    lives: number;
    score: number;
    thcEarned: number;
    gameOver: boolean;
    enemies: Enemy[];
    bullets: Bullet[];
    enemyBullets: Bullet[];
  } {
    let health = 0;
    let lives = 0;
    let score = 0;
    let thcEarned = 0;
    let gameOver = false;

    // Player-enemy collisions
    enemies.forEach(enemy => {
      if (!enemy.hit && this.isColliding(player, enemy)) {
        health -= 15 / healthMultiplier;
        if (collisionBehavior === 'immediate') {
          const index = enemies.indexOf(enemy);
          if (index > -1) enemies.splice(index, 1);
        } else {
          enemy.hit = true;
        }
      }
    });

    // Bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (this.isColliding(bullet, enemy)) {
          bullets.splice(i, 1);
          enemy.health--;
          
          if (enemy.health <= 0) {
            if (collisionBehavior === 'immediate') {
              enemies.splice(j, 1);
            } else {
              enemy.hit = true;
            }
            score += 50;
            thcEarned += 0.01;
          }
          break;
        }
      }
    }

    // Enemy bullet-player collisions
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];
      if (this.isColliding(bullet, player)) {
        enemyBullets.splice(i, 1);
        health -= 5 / healthMultiplier;
      }
    }

    return {
      health,
      lives,
      score,
      thcEarned,
      gameOver,
      enemies,
      bullets,
      enemyBullets
    };
  }

  private static isColliding(obj1: any, obj2: any): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }
}
