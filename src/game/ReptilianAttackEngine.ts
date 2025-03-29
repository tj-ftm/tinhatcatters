
// This is a stub implementation for the ReptilianAttackEngine class
// In a real implementation, this would be a full-featured game engine

class ReptilianAttackEngine {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private player = {
    x: 100,
    y: 200,
    width: 30,
    height: 50,
    velocityY: 0,
    isJumping: false
  };
  private obstacles: Array<{x: number, y: number, width: number, height: number, hit: boolean}> = [];
  private enemies: Array<{x: number, y: number, width: number, height: number, health: number, hit: boolean}> = [];
  private bullets: Array<{x: number, y: number, width: number, height: number, velocityX: number}> = [];
  private enemyBullets: Array<{x: number, y: number, width: number, height: number, velocityX: number}> = [];
  private score = 0;
  private lives = 3;
  private health = 100;
  private thcEarned = 0;
  private gameOver = false;
  private gameSpeed = 5;
  private lastObstacleTime = 0;
  private lastEnemyTime = 0;
  private lastEnemyShootTime = 0;
  private lastShootTime = 0;
  private upgrades = { speed: 1, fireRate: 1, health: 1 };
  private collisionBehavior: 'immediate' | 'fade' = 'fade';
  
  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.reset();
  }
  
  setCollisionBehavior(behavior: 'immediate' | 'fade') {
    this.collisionBehavior = behavior;
  }
  
  reset(upgrades = { speed: 1, fireRate: 1, health: 1 }) {
    this.player = {
      x: 100,
      y: 200,
      width: 30,
      height: 50,
      velocityY: 0,
      isJumping: false
    };
    this.obstacles = [];
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.score = 0;
    this.lives = 3;
    this.health = 100;
    this.thcEarned = 0;
    this.gameOver = false;
    this.lastObstacleTime = 0;
    this.lastEnemyTime = 0;
    this.lastEnemyShootTime = 0;
    this.lastShootTime = 0;
    this.upgrades = upgrades;
  }
  
  update(delta: number, input: { left: boolean, right: boolean }) {
    if (!this.canvas || !this.context) return this.getGameState();
    
    // Apply upgrades
    const speedMultiplier = this.upgrades.speed;
    const fireRateMultiplier = this.upgrades.fireRate;
    const healthMultiplier = this.upgrades.health;
    
    // Update game speed based on score
    this.gameSpeed = 5 + Math.min(10, Math.floor(this.score / 1000));
    
    // Handle jumping with right mouse button
    if (input.right && !this.player.isJumping) {
      this.player.velocityY = -15;
      this.player.isJumping = true;
    }
    
    // Apply gravity
    this.player.velocityY += 0.8 * delta;
    this.player.y += this.player.velocityY * delta;
    
    // Check floor collision
    const floorY = this.canvas.height - this.player.height - 20;
    if (this.player.y > floorY) {
      this.player.y = floorY;
      this.player.velocityY = 0;
      this.player.isJumping = false;
    }
    
    // Handle shooting with left mouse button
    const now = Date.now();
    if (input.left && now - this.lastShootTime > 500 / fireRateMultiplier) {
      this.bullets.push({
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2,
        width: 10,
        height: 5,
        velocityX: 15 * speedMultiplier
      });
      this.lastShootTime = now;
    }
    
    // Generate new obstacles
    if (now - this.lastObstacleTime > 2000 / (1 + this.gameSpeed / 20)) {
      const obstacleHeight = 30 + Math.random() * 50;
      this.obstacles.push({
        x: this.canvas.width,
        y: this.canvas.height - obstacleHeight - 20,
        width: 30,
        height: obstacleHeight,
        hit: false
      });
      this.lastObstacleTime = now;
    }
    
    // Generate new enemies
    if (now - this.lastEnemyTime > 3000 / (1 + this.gameSpeed / 30)) {
      this.enemies.push({
        x: this.canvas.width,
        y: 50 + Math.random() * (this.canvas.height - 150),
        width: 40,
        height: 40,
        health: 2,
        hit: false
      });
      this.lastEnemyTime = now;
    }
    
    // Enemy shooting
    if (now - this.lastEnemyShootTime > 2000 / (1 + this.gameSpeed / 40)) {
      const shootingEnemies = this.enemies.filter(e => !e.hit);
      if (shootingEnemies.length > 0) {
        const shooter = shootingEnemies[Math.floor(Math.random() * shootingEnemies.length)];
        this.enemyBullets.push({
          x: shooter.x,
          y: shooter.y + shooter.height / 2,
          width: 10,
          height: 5,
          velocityX: -8
        });
        this.lastEnemyShootTime = now;
      }
    }
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      
      // Move obstacle
      obstacle.x -= this.gameSpeed * speedMultiplier * delta;
      
      // Remove if off screen
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        this.score += 10;
        this.thcEarned += 0.001;
      }
      
      // Check collision with player
      if (!obstacle.hit && 
          this.player.x < obstacle.x + obstacle.width &&
          this.player.x + this.player.width > obstacle.x &&
          this.player.y < obstacle.y + obstacle.height &&
          this.player.y + this.player.height > obstacle.y) {
        
        // Apply damage
        this.health -= 10 / healthMultiplier;
        
        // Mark as hit to prevent multiple collisions
        if (this.collisionBehavior === 'immediate') {
          this.obstacles.splice(i, 1);
        } else {
          obstacle.hit = true;
        }
        
        if (this.health <= 0) {
          this.lives -= 1;
          if (this.lives <= 0) {
            this.gameOver = true;
          } else {
            this.health = 100;
          }
        }
      }
    }
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Move enemy
      enemy.x -= (this.gameSpeed - 2) * delta;
      
      // Remove if off screen
      if (enemy.x + enemy.width < 0) {
        this.enemies.splice(i, 1);
      }
      
      // Check collision with player
      if (!enemy.hit && 
          this.player.x < enemy.x + enemy.width &&
          this.player.x + this.player.width > enemy.x &&
          this.player.y < enemy.y + enemy.height &&
          this.player.y + this.player.height > enemy.y) {
        
        // Apply damage
        this.health -= 15 / healthMultiplier;
        
        // Mark as hit to prevent multiple collisions
        if (this.collisionBehavior === 'immediate') {
          this.enemies.splice(i, 1);
        } else {
          enemy.hit = true;
        }
        
        if (this.health <= 0) {
          this.lives -= 1;
          if (this.lives <= 0) {
            this.gameOver = true;
          } else {
            this.health = 100;
          }
        }
      }
      
      // Check collision with bullets
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const bullet = this.bullets[j];
        if (bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          
          // Remove bullet
          this.bullets.splice(j, 1);
          
          // Damage enemy
          enemy.health--;
          
          // If enemy is dead, remove it
          if (enemy.health <= 0) {
            if (this.collisionBehavior === 'immediate') {
              this.enemies.splice(i, 1);
            } else {
              enemy.hit = true;
            }
            this.score += 50;
            this.thcEarned += 0.01;
          }
          
          break;
        }
      }
    }
    
    // Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.velocityX * delta;
      
      // Remove if off screen
      if (bullet.x > this.canvas.width) {
        this.bullets.splice(i, 1);
      }
    }
    
    // Update enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.x += bullet.velocityX * delta;
      
      // Remove if off screen
      if (bullet.x + bullet.width < 0) {
        this.enemyBullets.splice(i, 1);
      }
      
      // Check collision with player
      if (bullet.x < this.player.x + this.player.width &&
          bullet.x + bullet.width > this.player.x &&
          bullet.y < this.player.y + this.player.height &&
          bullet.y + bullet.height > this.player.y) {
        
        // Remove bullet
        this.enemyBullets.splice(i, 1);
        
        // Apply damage
        this.health -= 5 / healthMultiplier;
        if (this.health <= 0) {
          this.lives -= 1;
          if (this.lives <= 0) {
            this.gameOver = true;
          } else {
            this.health = 100;
          }
        }
      }
    }
    
    // Increment score for surviving
    this.score += Math.ceil(delta);
    
    // Increase THC earned based on score/time
    if (!this.gameOver) {
      this.thcEarned += 0.0001 * delta;
    }
    
    return this.getGameState();
  }
  
  render() {
    if (!this.canvas || !this.context) return;
    
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw floor
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, height - 20, width, 20);
    
    // Draw player
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    
    // Draw obstacles
    ctx.fillStyle = '#FF0000';
    this.obstacles.forEach(obstacle => {
      if (!obstacle.hit) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    });
    
    // Draw enemies
    ctx.fillStyle = '#FF00FF';
    this.enemies.forEach(enemy => {
      if (!enemy.hit) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });
    
    // Draw player bullets
    ctx.fillStyle = '#FFFF00';
    this.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw enemy bullets
    ctx.fillStyle = '#FF6600';
    this.enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw Game Over text
    if (this.gameOver) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', width / 2, height / 2);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${this.score}`, width / 2, height / 2 + 40);
      ctx.fillText(`THC Earned: ${this.thcEarned.toFixed(2)}`, width / 2, height / 2 + 70);
    }
  }
  
  getGameState() {
    return {
      score: this.score,
      lives: this.lives,
      health: this.health,
      thcEarned: this.thcEarned,
      gameOver: this.gameOver
    };
  }
}

export default ReptilianAttackEngine;
