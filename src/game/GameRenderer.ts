
import { Player, Enemy, Bullet } from './types';
import { ImageManager } from './ImageManager';
import { AnimationManager } from './AnimationManager';

export class GameRenderer {
  private backgroundScrollX: number = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private context: CanvasRenderingContext2D,
    private imageManager: ImageManager,
    private animationManager: AnimationManager
  ) {}

  updateBackgroundScroll(speed: number, delta: number) {
    this.backgroundScrollX -= speed * delta * 0.1;
  }

  renderStartScreen() {
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    try {
      // Draw background
      const bgImage = this.imageManager.getImage('background');
      if (bgImage && this.imageManager.isLoaded('background')) {
        ctx.drawImage(bgImage, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw floor
      const floorImage = this.imageManager.getImage('floor');
      if (floorImage && this.imageManager.isLoaded('floor')) {
        ctx.drawImage(floorImage, 0, height - 20, width, 20);
      } else {
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, height - 20, width, 20);
      }

      // Draw player in idle state - only if sprite is loaded
      const playerIdleSprite = this.imageManager.getImage('playerIdle');
      if (playerIdleSprite && this.imageManager.isLoaded('playerIdle')) {
        const config = this.imageManager.getConfig().playerIdle;
        const frameWidth = playerIdleSprite.width / config.frames;
        const frameHeight = playerIdleSprite.height;

        ctx.drawImage(
          playerIdleSprite,
          0, 0, frameWidth, frameHeight,
          100, height - config.height - 20,
          config.width, config.height
        );
      }

      // Draw intro video or fallback text
      const video = this.imageManager.getVideo();
      if (video && this.imageManager.isLoaded('introVideo')) {
        try {
          video.play();
          ctx.drawImage(video, width / 2 - 200, height / 2 - 100, 400, 200);
        } catch (error) {
          this.drawFallbackTitle(ctx, width, height);
        }
      } else {
        this.drawFallbackTitle(ctx, width, height);
      }

      // Add enemy for show - only if sprite is loaded
      const enemySprite = this.imageManager.getImage('enemyRun');
      if (enemySprite && this.imageManager.isLoaded('enemyRun')) {
        const config = this.imageManager.getConfig().enemyRun;
        const frameWidth = enemySprite.width / config.frames;
        const frameHeight = enemySprite.height;

        ctx.drawImage(
          enemySprite,
          0, 0, frameWidth, frameHeight,
          width - 100, height / 2 - 100,
          config.width, config.height
        );
      }
    } catch (error) {
      console.error('Rendering error:', error);
    }
  }

  render(
    player: Player,
    enemies: Enemy[],
    bullets: Bullet[],
    enemyBullets: Bullet[],
    gameOver: boolean,
    score: number,
    thcEarned: number
  ) {
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    try {
      // Draw scrolling background
      this.drawScrollingBackground(width, height);
      
      // Draw floor
      this.drawFloor(width, height);
      
      // Draw game entities
      this.drawPlayer(player);
      enemies.forEach(enemy => !enemy.hit && this.drawEnemy(enemy));
      bullets.forEach(bullet => this.drawBullet(bullet, 'bullet'));
      enemyBullets.forEach(bullet => this.drawBullet(bullet, 'enemyBullet'));
      
      // Draw game over screen
      if (gameOver) {
        this.drawGameOver(width, height, score, thcEarned);
      }
    } catch (error) {
      console.error('Rendering error:', error);
    }
  }

  private drawScrollingBackground(width: number, height: number) {
    const bgImage = this.imageManager.getImage('background');
    if (bgImage && this.imageManager.isLoaded('background')) {
      const bgWidth = Math.max(width, bgImage.width);
      const x1 = Math.floor(this.backgroundScrollX % bgWidth);
      
      this.context.drawImage(bgImage, x1, 0, bgWidth, height);
      
      if (x1 < 0) {
        this.context.drawImage(bgImage, x1 + bgWidth, 0, bgWidth, height);
      } else if (x1 + bgWidth < width) {
        this.context.drawImage(bgImage, x1 - bgWidth, 0, bgWidth, height);
      }
    } else {
      this.context.fillStyle = '#000000';
      this.context.fillRect(0, 0, width, height);
    }
  }

  private drawFloor(width: number, height: number) {
    const floorImage = this.imageManager.getImage('floor');
    if (floorImage && this.imageManager.isLoaded('floor')) {
      this.context.drawImage(floorImage, 0, height - 20, width, 20);
    } else {
      this.context.fillStyle = '#444444';
      this.context.fillRect(0, height - 20, width, 20);
    }
  }

  private drawPlayer(player: Player) {
    // Always use playersprite.gif for all animations
    const sprite = this.imageManager.getImage('playerRun');
    const config = this.imageManager.getConfig().playerRun;
    
    // Only draw if sprite is fully loaded, otherwise don't draw anything to prevent flashing
    if (sprite && this.imageManager.isLoaded('playerRun') && config && 'frames' in config) {
      try {
        const frameWidth = sprite.width / config.frames;
        const frameHeight = sprite.height;
        const currentFrame = this.animationManager.getCurrentFrame() % config.frames;

        this.context.drawImage(
          sprite,
          currentFrame * frameWidth, 0, frameWidth, frameHeight,
          player.x, player.y, player.width, player.height
        );
      } catch (error) {
        // Don't draw fallback to prevent flashing
        console.error('Error drawing player sprite:', error);
      }
    }
  }

  private drawEnemy(enemy: Enemy) {
    // Always use barrier.gif for all enemy animations
    const sprite = this.imageManager.getImage('enemyRun');
    const config = this.imageManager.getConfig().enemyRun;
    
    // Only draw if sprite is fully loaded, otherwise don't draw anything to prevent flashing
    if (sprite && this.imageManager.isLoaded('enemyRun') && config && 'frames' in config) {
      try {
        const frameWidth = sprite.width / config.frames;
        const frameHeight = sprite.height;
        const currentFrame = this.animationManager.getCurrentFrame() % config.frames;

        this.context.drawImage(
          sprite,
          currentFrame * frameWidth, 0, frameWidth, frameHeight,
          enemy.x, enemy.y, enemy.width, enemy.height
        );
      } catch (error) {
        // Don't draw fallback to prevent flashing
        console.error('Error drawing enemy sprite:', error);
      }
    }
  }

  private drawBullet(bullet: Bullet, type: 'bullet' | 'enemyBullet') {
    const bulletImage = this.imageManager.getImage(type);
    if (bulletImage && this.imageManager.isLoaded(type)) {
      this.context.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  private drawFallbackRect(x: number, y: number, width: number, height: number, color: string) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width, height);
  }

  private drawFallbackTitle(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 200, height / 2 - 100, 400, 200);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('REPTILIAN ATTACK', width / 2, height / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText('Connect wallet & click START GAME', width / 2, height / 2 + 50);
  }

  private drawGameOver(width: number, height: number, score: number, thcEarned: number) {
    this.context.fillStyle = '#FFFFFF';
    this.context.font = '48px Arial';
    this.context.textAlign = 'center';
    this.context.fillText('GAME OVER', width / 2, height / 2);
    
    this.context.font = '24px Arial';
    this.context.fillText(`Score: ${score}`, width / 2, height / 2 + 40);
    this.context.fillText(`THC Earned: ${thcEarned.toFixed(2)}`, width / 2, height / 2 + 70);
  }
}
