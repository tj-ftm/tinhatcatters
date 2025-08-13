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
      // Draw background to fill entire canvas
      const bgImage = this.imageManager.getImage('background');
      if (bgImage && this.imageManager.isLoaded('background')) {
        ctx.drawImage(bgImage, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw player in idle state - handle GIF as video
      const playerIdleSprite = this.imageManager.getImage('playerIdle');
      if (playerIdleSprite && this.imageManager.isLoaded('playerIdle')) {
        const playerWidth = 60;
        const playerHeight = 80;

        if (playerIdleSprite instanceof HTMLVideoElement) {
          // Ensure video is ready to draw
          if (playerIdleSprite.readyState >= 2) {
            ctx.drawImage(
              playerIdleSprite,
              100, height - playerHeight - 20,
              playerWidth, playerHeight
            );
          }
        } else {
          // Handle as image (fallback, though not expected for playerIdle)
          ctx.drawImage(
            playerIdleSprite,
            100, height - playerHeight - 20,
            playerWidth, playerHeight
          );
        }
      }

      // Draw intro video or fallback text
      const video = this.imageManager.getVideo('introVideo');
      if (video && this.imageManager.isLoaded('introVideo')) {
        try {
          video.play();
          ctx.drawImage(video, width / 2 - 200, height / 2 - 100, 400, 200);
        } catch (error) {
          console.error('Error playing intro video:', error);
          this.drawFallbackTitle(ctx, width, height);
        }
      } else {
        this.drawFallbackTitle(ctx, width, height);
      }

      // Draw enemy for show - handle GIF as video
      const enemySprite = this.imageManager.getImage('enemyRun');
      if (enemySprite && this.imageManager.isLoaded('enemyRun')) {
        const config = this.imageManager.getConfig().enemyRun;

        if (enemySprite instanceof HTMLVideoElement) {
          // Ensure video is ready to draw
          if (enemySprite.readyState >= 2) {
            ctx.drawImage(
              enemySprite,
              width - 100, height / 2 - 100,
              config.width, config.height
            );
          }
        } else {
          // Handle as image (fallback, though not expected for enemyRun)
          ctx.drawImage(
            enemySprite,
            width - 100, height / 2 - 100,
            config.width, config.height
          );
        }
      }
    } catch (error) {
      console.error('Rendering error in start screen:', error);
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
      // Draw scrolling background to fill entire canvas
      this.drawScrollingBackground(width, height);

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

      // Draw background to fill entire canvas height
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

  private drawPlayer(player: Player) {
    const sprite = this.imageManager.getImage('playerRun');
    
    if (sprite && this.imageManager.isLoaded('playerRun')) {
      try {
        if (sprite instanceof HTMLVideoElement) {
          // Ensure video is ready to draw
          if (sprite.readyState >= 2) {
            this.context.drawImage(
              sprite,
              player.x, player.y, player.width, player.height
            );
          }
        } else {
          // Handle as image (fallback, though not expected for playerRun)
          this.context.drawImage(
            sprite,
            player.x, player.y, player.width, player.height
          );
        }
      } catch (error) {
        console.error('Error drawing player sprite:', error);
      }
    }
  }

  private drawEnemy(enemy: Enemy) {
    const sprite = this.imageManager.getImage('enemyRun');
    
    if (sprite && this.imageManager.isLoaded('enemyRun')) {
      try {
        if (sprite instanceof HTMLVideoElement) {
          // Ensure video is ready to draw
          if (sprite.readyState >= 2) {
            this.context.drawImage(
              sprite,
              enemy.x, enemy.y, enemy.width, enemy.height
            );
          }
        } else {
          // Handle as image (fallback, though not expected for enemyRun)
          this.context.drawImage(
            sprite,
            enemy.x, enemy.y, enemy.width, enemy.height
          );
        }
      } catch (error) {
        console.error('Error drawing enemy sprite:', error);
      }
    }
  }

  private drawBullet(bullet: Bullet, type: 'bullet' | 'enemyBullet') {
    const bulletImage = this.imageManager.getImage(type);
    if (bulletImage && this.imageManager.isLoaded(type)) {
      this.context.save();

      // Calculate rotation based on bullet position for spinning effect
      const rotation = (Date.now() * 0.01 + bullet.x * 0.1) % (Math.PI * 2);

      // Move to bullet center for rotation
      this.context.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
      this.context.rotate(rotation);

      // Draw bullet 2x bigger and centered on rotation point
      const scaledWidth = bullet.width * 2;
      const scaledHeight = bullet.height * 2;

      if (bulletImage instanceof HTMLVideoElement) {
        // Ensure video is ready to draw
        if (bulletImage.readyState >= 2) {
          this.context.drawImage(
            bulletImage,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
        }
      } else {
        // Handle as image (expected for bullets)
        this.context.drawImage(
          bulletImage,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );
      }

      this.context.restore();
    }
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