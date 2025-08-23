
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
    
    // Set animation state (preserve throwing state)
    if (!player.isJumping && player.animationState !== 'throwing') {
      if (spriteAnimationRunning) {
        player.animationState = 'running';
      } else {
        player.animationState = 'idle';
      }
    }
    
    return player;
  }

  static updateEnemies(
    enemies: Enemy[],
    canvas: HTMLCanvasElement,
    gameSpeed: number,
    delta: number,
    now: number,
    startTime: number
  ): { enemies: Enemy[]; score: number; thcEarned: number } {
    let scoreGained = 0;
    let thcGained = 0;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // Handle exploding enemies
      if (enemy.animationState === 'exploding') {
        // Remove enemy after explosion animation (1 second)
        if (enemy.explosionStartTime && now - enemy.explosionStartTime > 1000) {
          enemies.splice(i, 1);
          continue;
        }
        // Don't update position or other logic for exploding enemies
        continue;
      }
      
      // Calculate progressive speed with individual variation
      const gameTimeSeconds = (now - startTime) / 1000;
      const speedProgress = Math.min(gameTimeSeconds / 30, 1);
      const baseMaxSpeed = gameSpeed * 0.6;
      const individualSpeed = baseMaxSpeed * (enemy.speedMultiplier || 1);
      const currentEnemySpeed = 1 + (individualSpeed - 1) * speedProgress;
      
      // Move enemy with individual speed
      enemy.x -= currentEnemySpeed * delta;
      
      // Handle individual jumping patterns
       if (!enemy.isJumping) {
         const jumpCooldown = enemy.jumpCooldown || 3000; // Default 3 seconds
         const lastJump = enemy.lastJumpTime || 0;
         
         if (now - lastJump > jumpCooldown) {
           // Random chance to jump (30% chance per check)
           if (Math.random() < 0.3) {
             enemy.velocityY = -12 - Math.random() * 4; // Varied jump height
             enemy.isJumping = true;
             enemy.animationState = 'jumping';
             enemy.lastJumpTime = now;
           }
         }
       }
      
      // Apply gravity for jumping enemies
      if (enemy.isJumping) {
        enemy.velocityY += 0.8 * delta;
        enemy.y += enemy.velocityY * delta;
      }
      
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
    healthMultiplier: number,
    backgroundScrollX: number
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

    // Player-enemy interactions
    const now = Date.now();
    enemies.forEach(enemy => {
      if (!enemy.hit && enemy.animationState !== 'exploding' && this.isColliding(player, enemy)) {
        // Check if player is stomping on enemy (landing on top)
         if (this.isStompingEnemy(player, enemy)) {
           // Mario-style stomp: eliminate enemy and bounce player
           enemy.animationState = 'exploding';
           enemy.explosionStartTime = Date.now();
           enemy.parallaxX = enemy.x;
           enemy.pointsDisplayTime = Date.now();
           enemy.pointsValue = 200;
           enemy.hit = true;
           score += 200; // Stomping gives +200 points
           thcEarned += 0.02;
           
           // Reduced bounce effect to prevent screen clipping
           player.velocityY = -12; // Reduced from -18 to prevent clipping
           player.isJumping = true;
           player.animationState = 'jumping';
         } else {
           // Regular contact damage
           if (!player.damageEffectTime || now - player.damageEffectTime > 1000) {
             player.health -= 1; // Lose 1 heart per contact
             player.damageEffectTime = now;
             
             // Check if player should lose a life
             if (player.health <= 0) {
               player.lives -= 1;
               player.lifeDisplayTime = Date.now();
               player.explosionStartTime = Date.now();
               if (player.lives > 0) {
                 // Reset health but keep playing
                 player.health = player.maxHealth;
               }
             }
             
             // Add damage effect to enemy too
             enemy.damageEffectTime = now;
           }
         }
      }
    });

    // Bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (this.isColliding(bullet, enemy) && enemy.animationState !== 'exploding') {
          bullets.splice(i, 1);
          enemy.health--;
          
          // Add damage effect to enemy
          enemy.damageEffectTime = Date.now();
          
          if (enemy.health <= 0) {
            // Set enemy to exploding state instead of immediate removal
            enemy.animationState = 'exploding';
            enemy.explosionStartTime = Date.now();
            enemy.parallaxX = enemy.x; // Store position where enemy was eliminated
            enemy.explosionStartScrollX = backgroundScrollX; // Store background scroll position
            enemy.pointsDisplayTime = Date.now(); // Trigger floating points display
            enemy.pointsValue = 100;
            enemy.hit = true;
            score += 100; // Bullet kills give +100 points
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
        // Only damage if player hasn't been damaged recently
        if (!player.damageEffectTime || now - player.damageEffectTime > 1000) {
          player.health -= 1; // Lose 1 heart per bullet hit
          player.damageEffectTime = now;
        }
      }
    }

    // Bullet-to-bullet collisions (player bullets vs enemy bullets)
    for (let i = bullets.length - 1; i >= 0; i--) {
      const playerBullet = bullets[i];
      for (let j = enemyBullets.length - 1; j >= 0; j--) {
        const enemyBullet = enemyBullets[j];
        if (this.isColliding(playerBullet, enemyBullet)) {
          bullets.splice(i, 1);
          enemyBullets.splice(j, 1);
          break; // Exit inner loop since player bullet is destroyed
        }
      }
    }

    // Check if player is dead
    if (player.health <= 0) {
      gameOver = true;
    }

    return {
      health: player.health,
      lives: player.lives,
      score,
      thcEarned,
      gameOver: player.lives <= 0,
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

  private static isStompingEnemy(player: Player, enemy: Enemy): boolean {
    // Check if player is falling (positive velocityY) and landing on top of enemy
    const playerBottom = player.y + player.height;
    const enemyTop = enemy.y;
    const enemyBottom = enemy.y + enemy.height;
    
    // Player must be falling and the bottom of player should be close to top of enemy
    return player.velocityY > 0 && 
           player.isJumping &&
           playerBottom >= enemyTop &&
           playerBottom <= enemyTop + 10 && // Small tolerance for landing on top
           player.x < enemy.x + enemy.width &&
           player.x + player.width > enemy.x;
  }
}
