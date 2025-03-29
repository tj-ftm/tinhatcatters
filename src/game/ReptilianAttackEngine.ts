
export interface GameState {
  score: number;
  lives: number;
  health: number;
  thcEarned: number;
  gameOver: boolean;
  paused: boolean;
  position: {
    x: number;
    y: number;
  };
  jumping: boolean;
  firing: boolean;
  upgrades: {
    speed: number;
    fireRate: number;
    health: number;
  };
  enemies: Enemy[];
  obstacles: Obstacle[];
  projectiles: Projectile[];
  effects: Effect[];
}

export interface Enemy {
  id: string;
  type: 'lizard' | 'reptilian' | 'snake';
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  speed: number;
  lastShot: number;
  shotInterval: number;
}

export interface Obstacle {
  id: string;
  type: 'rock' | 'pit' | 'spikes';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Projectile {
  id: string;
  fromPlayer: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  damage: number;
}

export interface Effect {
  id: string;
  type: 'explosion' | 'hit' | 'powerup';
  x: number;
  y: number;
  duration: number;
  elapsed: number;
}

export default class ReptilianAttackEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private state: GameState;
  private lastFrameTime: number = 0;
  private enemySpawnInterval: number = 2000;
  private obstacleSpawnInterval: number = 3000;
  private lastEnemySpawn: number = 0;
  private lastObstacleSpawn: number = 0;
  private groundHeight: number = 40;
  private playerWidth: number = 32;
  private playerHeight: number = 48;
  private gravity: number = 0.6;
  private jumpForce: number = 10;
  private baseSpeed: number = 4;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      score: 0,
      lives: 3,
      health: 100,
      thcEarned: 0,
      gameOver: false,
      paused: false,
      position: {
        x: 100,
        y: 0, // Will be set correctly when canvas is initialized
      },
      jumping: false,
      firing: false,
      upgrades: {
        speed: 1,
        fireRate: 1,
        health: 1,
      },
      enemies: [],
      obstacles: [],
      projectiles: [],
      effects: []
    };
  }

  public initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = this.getInitialState();
    this.state.position.y = canvas.height - this.groundHeight - this.playerHeight;
  }

  public reset(upgrades?: GameState['upgrades']): void {
    this.state = this.getInitialState();
    if (upgrades) {
      this.state.upgrades = upgrades;
    }
    if (this.canvas) {
      this.state.position.y = this.canvas.height - this.groundHeight - this.playerHeight;
    }
  }

  public update(delta: number, mouseState: { left: boolean, right: boolean }): GameState {
    if (!this.canvas || !this.ctx) return this.state;

    // Update player
    if (mouseState.right && !this.state.jumping) {
      this.state.jumping = true;
      this.state.position.y -= this.jumpForce * this.state.upgrades.speed;
    }

    if (this.state.jumping) {
      this.state.position.y += this.gravity * delta;
      if (this.state.position.y >= this.canvas.height - this.groundHeight - this.playerHeight) {
        this.state.position.y = this.canvas.height - this.groundHeight - this.playerHeight;
        this.state.jumping = false;
      }
    }

    // Handle firing
    if (mouseState.left && !this.state.firing) {
      this.state.firing = true;
      this.fireProjectile();
    } else if (!mouseState.left) {
      this.state.firing = false;
    }

    // Spawn enemies
    const now = Date.now();
    if (now - this.lastEnemySpawn > this.enemySpawnInterval / this.state.upgrades.speed) {
      this.spawnEnemy();
      this.lastEnemySpawn = now;
    }

    // Spawn obstacles
    if (now - this.lastObstacleSpawn > this.obstacleSpawnInterval / this.state.upgrades.speed) {
      this.spawnObstacle();
      this.lastObstacleSpawn = now;
    }

    // Update enemies
    this.state.enemies.forEach((enemy, index) => {
      enemy.x -= enemy.speed * delta * this.baseSpeed;
      
      // Enemy shooting
      if (now - enemy.lastShot > enemy.shotInterval) {
        this.enemyFire(enemy);
        enemy.lastShot = now;
      }
      
      // Remove enemies that leave the screen
      if (enemy.x < -enemy.width) {
        this.state.enemies.splice(index, 1);
      }
    });

    // Update obstacles
    this.state.obstacles.forEach((obstacle, index) => {
      obstacle.x -= this.baseSpeed * delta * this.state.upgrades.speed;
      
      // Remove obstacles that leave the screen
      if (obstacle.x < -obstacle.width) {
        this.state.obstacles.splice(index, 1);
      }
    });

    // Update projectiles
    this.state.projectiles.forEach((projectile, index) => {
      if (projectile.fromPlayer) {
        projectile.x += projectile.speed * delta;
      } else {
        projectile.x -= projectile.speed * delta;
      }
      
      // Remove projectiles that leave the screen
      if (projectile.x < 0 || projectile.x > this.canvas.width) {
        this.state.projectiles.splice(index, 1);
      }
    });

    // Update effects
    this.state.effects.forEach((effect, index) => {
      effect.elapsed += delta;
      if (effect.elapsed >= effect.duration) {
        this.state.effects.splice(index, 1);
      }
    });

    // Check collisions
    this.checkCollisions();

    // Increment score
    this.state.score += 0.1 * delta;
    
    // Award THC every 100 points
    if (Math.floor((this.state.score - 0.1 * delta) / 100) < Math.floor(this.state.score / 100)) {
      this.state.thcEarned += 0.01;
    }

    // Check game over
    if (this.state.lives <= 0 || this.state.health <= 0) {
      this.state.gameOver = true;
    }

    return { ...this.state };
  }

  public render(): void {
    if (!this.canvas || !this.ctx) return;
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, this.canvas.height - this.groundHeight, this.canvas.width, this.groundHeight);
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(0, this.canvas.height - this.groundHeight, this.canvas.width, 5);
    
    // Draw obstacles
    this.state.obstacles.forEach(obstacle => {
      switch (obstacle.type) {
        case 'rock':
          ctx.fillStyle = '#777777';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
        case 'pit':
          ctx.fillStyle = '#000000';
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
        case 'spikes':
          ctx.fillStyle = '#696969';
          const spikeWidth = 10;
          const spikes = Math.floor(obstacle.width / spikeWidth);
          for (let i = 0; i < spikes; i++) {
            ctx.beginPath();
            ctx.moveTo(obstacle.x + (i * spikeWidth), obstacle.y + obstacle.height);
            ctx.lineTo(obstacle.x + (i * spikeWidth) + (spikeWidth / 2), obstacle.y);
            ctx.lineTo(obstacle.x + (i * spikeWidth) + spikeWidth, obstacle.y + obstacle.height);
            ctx.closePath();
            ctx.fill();
          }
          break;
      }
    });
    
    // Draw enemies
    this.state.enemies.forEach(enemy => {
      switch (enemy.type) {
        case 'lizard':
          ctx.fillStyle = '#008000';
          break;
        case 'reptilian':
          ctx.fillStyle = '#006400';
          break;
        case 'snake':
          ctx.fillStyle = '#800080';
          break;
      }
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // Draw projectiles
    this.state.projectiles.forEach(projectile => {
      if (projectile.fromPlayer) {
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(projectile.x, projectile.y);
        ctx.lineTo(projectile.x + projectile.width, projectile.y + projectile.height / 2);
        ctx.lineTo(projectile.x, projectile.y + projectile.height);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
      }
    });
    
    // Draw effects
    this.state.effects.forEach(effect => {
      switch (effect.type) {
        case 'explosion':
          ctx.fillStyle = 'rgba(255, 0, 0, ' + (1 - effect.elapsed / effect.duration) + ')';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 20 * (effect.elapsed / effect.duration), 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'hit':
          ctx.fillStyle = 'rgba(255, 255, 0, ' + (1 - effect.elapsed / effect.duration) + ')';
          ctx.beginPath();
          ctx.arc(effect.x, effect.y, 10, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    });
    
    // Draw player
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(
      this.state.position.x,
      this.state.position.y,
      this.playerWidth,
      this.playerHeight
    );
    
    // Draw HUD
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText(`Score: ${Math.floor(this.state.score)}`, 20, 30);
    ctx.fillText(`Health: ${this.state.health}%`, 20, 60);
    ctx.fillText(`Lives: ${this.state.lives}`, 20, 90);
    ctx.fillText(`$THC: ${this.state.thcEarned.toFixed(2)}`, 20, 120);
    
    if (this.state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '30px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
      
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillText(`Final Score: ${Math.floor(this.state.score)}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
      ctx.fillText(`$THC Earned: ${this.state.thcEarned.toFixed(2)}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
      
      ctx.textAlign = 'start';
    }
  }

  private fireProjectile(): void {
    const projectile: Projectile = {
      id: `proj-${Date.now()}-${Math.random()}`,
      fromPlayer: true,
      x: this.state.position.x + this.playerWidth,
      y: this.state.position.y + this.playerHeight / 2,
      width: 16,
      height: 6,
      speed: 10 * this.state.upgrades.fireRate,
      damage: 1
    };
    
    this.state.projectiles.push(projectile);
  }

  private enemyFire(enemy: Enemy): void {
    const projectile: Projectile = {
      id: `enemy-proj-${Date.now()}-${Math.random()}`,
      fromPlayer: false,
      x: enemy.x,
      y: enemy.y + enemy.height / 2,
      width: 12,
      height: 4,
      speed: 6,
      damage: 10
    };
    
    this.state.projectiles.push(projectile);
  }

  private spawnEnemy(): void {
    const enemyTypes = ['lizard', 'reptilian', 'snake'] as const;
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    const enemy: Enemy = {
      id: `enemy-${Date.now()}`,
      type,
      x: this.canvas?.width || 800,
      y: (this.canvas?.height || 400) - this.groundHeight - 48,
      width: 32,
      height: 48,
      health: type === 'snake' ? 1 : type === 'reptilian' ? 3 : 2,
      speed: 1 + Math.random(),
      lastShot: 0,
      shotInterval: 2000 + Math.random() * 3000
    };
    
    this.state.enemies.push(enemy);
  }

  private spawnObstacle(): void {
    if (!this.canvas) return;
    
    const obstacleTypes = ['rock', 'pit', 'spikes'] as const;
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let width, height, y;
    
    switch (type) {
      case 'rock':
        width = 30 + Math.random() * 20;
        height = 20 + Math.random() * 30;
        y = this.canvas.height - this.groundHeight - height;
        break;
      case 'pit':
        width = 60 + Math.random() * 40;
        height = this.groundHeight;
        y = this.canvas.height - height;
        break;
      case 'spikes':
        width = 50 + Math.random() * 50;
        height = 30;
        y = this.canvas.height - this.groundHeight - height;
        break;
      default:
        width = 40;
        height = 40;
        y = this.canvas.height - this.groundHeight - height;
    }
    
    const obstacle: Obstacle = {
      id: `obs-${Date.now()}`,
      type,
      x: this.canvas.width,
      y,
      width,
      height
    };
    
    this.state.obstacles.push(obstacle);
  }

  private checkCollisions(): void {
    if (!this.canvas) return;
    
    // Player vs Enemies
    this.state.enemies.forEach((enemy, enemyIndex) => {
      if (this.isColliding(
        this.state.position.x, this.state.position.y, this.playerWidth, this.playerHeight,
        enemy.x, enemy.y, enemy.width, enemy.height
      )) {
        // Player hit enemy
        this.state.health -= 20 / this.state.upgrades.health;
        this.state.enemies.splice(enemyIndex, 1);
        
        this.state.effects.push({
          id: `effect-${Date.now()}`,
          type: 'hit',
          x: enemy.x,
          y: enemy.y,
          duration: 500,
          elapsed: 0
        });
      }
    });
    
    // Player vs Obstacles
    this.state.obstacles.forEach((obstacle, obstacleIndex) => {
      if (this.isColliding(
        this.state.position.x, this.state.position.y, this.playerWidth, this.playerHeight,
        obstacle.x, obstacle.y, obstacle.width, obstacle.height
      )) {
        // Player hit obstacle
        if (obstacle.type === 'pit') {
          // Instant death for pits
          this.state.lives -= 1;
          this.state.obstacles.splice(obstacleIndex, 1);
          // Reset player position
          this.state.position.y = this.canvas.height - this.groundHeight - this.playerHeight;
        } else {
          this.state.health -= 15 / this.state.upgrades.health;
          this.state.obstacles.splice(obstacleIndex, 1);
        }
        
        this.state.effects.push({
          id: `effect-${Date.now()}`,
          type: 'hit',
          x: obstacle.x,
          y: obstacle.y,
          duration: 500,
          elapsed: 0
        });
      }
    });
    
    // Player Projectiles vs Enemies
    this.state.projectiles.forEach((projectile, projectileIndex) => {
      if (projectile.fromPlayer) {
        this.state.enemies.forEach((enemy, enemyIndex) => {
          if (this.isColliding(
            projectile.x, projectile.y, projectile.width, projectile.height,
            enemy.x, enemy.y, enemy.width, enemy.height
          )) {
            // Projectile hit enemy
            enemy.health -= projectile.damage;
            this.state.projectiles.splice(projectileIndex, 1);
            
            if (enemy.health <= 0) {
              // Enemy died
              this.state.score += 25;
              this.state.thcEarned += 0.005;
              this.state.enemies.splice(enemyIndex, 1);
              
              this.state.effects.push({
                id: `effect-${Date.now()}`,
                type: 'explosion',
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                duration: 800,
                elapsed: 0
              });
            } else {
              this.state.effects.push({
                id: `effect-${Date.now()}`,
                type: 'hit',
                x: projectile.x,
                y: projectile.y,
                duration: 300,
                elapsed: 0
              });
            }
          }
        });
      } else {
        // Enemy projectiles vs Player
        if (this.isColliding(
          projectile.x, projectile.y, projectile.width, projectile.height,
          this.state.position.x, this.state.position.y, this.playerWidth, this.playerHeight
        )) {
          // Enemy projectile hit player
          this.state.health -= projectile.damage / this.state.upgrades.health;
          this.state.projectiles.splice(projectileIndex, 1);
          
          this.state.effects.push({
            id: `effect-${Date.now()}`,
            type: 'hit',
            x: projectile.x,
            y: projectile.y,
            duration: 300,
            elapsed: 0
          });
        }
      }
    });
    
    // Check if player has no health left
    if (this.state.health <= 0) {
      this.state.health = 0;
      this.state.lives -= 1;
      
      if (this.state.lives > 0) {
        // Reset for next life
        this.state.health = 100;
        this.state.position.y = this.canvas.height - this.groundHeight - this.playerHeight;
      }
    }
  }

  private isColliding(
    x1: number, y1: number, width1: number, height1: number,
    x2: number, y2: number, width2: number, height2: number
  ): boolean {
    return (
      x1 < x2 + width2 &&
      x1 + width1 > x2 &&
      y1 < y2 + height2 &&
      y1 + height1 > y2
    );
  }
}
