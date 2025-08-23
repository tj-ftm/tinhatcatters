
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

  // Control video playback based on game state
  setVideoPlayback(playing: boolean) {
    const config = this.imageManager.getConfig();
    
    // Control player videos
    ['playerIdle', 'playerRun', 'playerJump', 'playerThrow'].forEach(key => {
      if (config[key]?.isVideo) {
        const video = this.imageManager.getVideo(key);
        if (video) {
          if (playing && video.paused) {
            video.play().catch(console.error);
          } else if (!playing && !video.paused) {
            video.pause();
          }
        }
      }
    });
    
    // Control enemy videos
    ['enemyRun', 'enemyJump', 'enemyFire', 'enemyExplosion'].forEach(key => {
      if (config[key]?.isVideo) {
        const video = this.imageManager.getVideo(key);
        if (video) {
          if (playing && video.paused) {
            video.play().catch(console.error);
          } else if (!playing && !video.paused) {
            video.pause();
          }
        }
      }
    });
  }

  updateBackgroundScroll(speed: number, delta: number) {
    this.backgroundScrollX -= speed * delta * 0.1;
  }

  getBackgroundScrollX(): number {
    return this.backgroundScrollX;
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

      // Draw player in idle state - animated GIF handles its own frames
      const playerIdleSprite = this.imageManager.getImage('playerIdle');
      if (playerIdleSprite && this.imageManager.isLoaded('playerIdle')) {
        // Use proper scaling for player size
        const playerWidth = 60;
        const playerHeight = 80;

        // Draw the player sprite without clearing the area first to preserve transparency
        ctx.drawImage(
          playerIdleSprite,
          100, height - playerHeight - 20,
          playerWidth, playerHeight
        );
      }

      // Draw intro video or fallback text
      const video = this.imageManager.getVideo('introVideo');
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

      // Add enemy for show - animated GIF handles its own frames
      const enemySprite = this.imageManager.getImage('enemyRun');
      if (enemySprite && this.imageManager.isLoaded('enemyRun')) {
        const config = this.imageManager.getConfig().enemyRun;

        // Draw the enemy sprite without clearing the area first to preserve transparency
        ctx.drawImage(
          enemySprite,
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

    try {
      // Clear the entire canvas to ensure clean frame
      ctx.clearRect(0, 0, width, height);
      
      // Draw scrolling background first
      this.drawScrollingBackground(width, height);
      
      // Draw game entities
      this.drawPlayer(player);
      this.drawPlayerHealthBar(player);
      this.drawPlayerLifeLoss(player);
      this.drawPlayerExplosion(player);
      enemies.forEach(enemy => this.drawEnemy(enemy)); // Show all enemies including exploding ones
      bullets.forEach(bullet => this.drawBullet(bullet, 'bullet'));
      enemyBullets.forEach(bullet => this.drawBullet(bullet, 'enemyBullet'));
      
      // Draw health hearts
      this.drawHealthHearts(player);
      
      // Draw score in top-right corner
      this.drawScore(score, width);
      
      // Draw floating point indicators
      this.drawFloatingPoints(enemies);
      
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
      // Stretch background to fill entire canvas without maintaining aspect ratio
      const bgWidth = width;
      const x1 = Math.floor(this.backgroundScrollX % bgWidth);
      
      // Draw background stretched to fill entire canvas
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
    // For animated sprites, handle animation state properly
    let spriteKey = 'playerRun';
    if (player.animationState === 'idle') {
      spriteKey = 'playerIdle';
    } else if (player.animationState === 'jumping') {
      spriteKey = 'playerJump';
    } else if (player.animationState === 'throwing') {
      spriteKey = 'playerThrow';
    }
    
    const config = this.imageManager.getConfig()[spriteKey];
    
    // Remove damage effect - no longer needed
    
    // Check if this is a video sprite
    if (config.isVideo) {
      const video = this.imageManager.getVideo(spriteKey);
      if (video && this.imageManager.isLoaded(spriteKey)) {
        try {
          // Ensure video is playing and looping properly
          if (video.paused || video.ended) {
            video.currentTime = 0; // Reset to beginning
            video.play().catch(console.error);
          }
          
          // Ensure loop is enabled
          video.loop = true;
          
          // Make sprites 20% bigger
          const scaledWidth = player.width * 1.2;
          const scaledHeight = player.height * 1.2;
          const offsetX = (scaledWidth - player.width) / 2;
          const offsetY = (scaledHeight - player.height) / 2;
          
          // Draw the video element
          this.context.drawImage(
            video,
            player.x - offsetX, player.y - offsetY, scaledWidth, scaledHeight
          );
          

        } catch (error) {
          console.error('Error drawing player video:', error);
        }
      }
    } else {
      // Handle regular image sprites
      const sprite = this.imageManager.getImage(spriteKey);
      
      // Only draw if sprite is fully loaded
      if (sprite && this.imageManager.isLoaded(spriteKey)) {
        try {
          // Make sprites 20% bigger
          const scaledWidth = player.width * 1.2;
          const scaledHeight = player.height * 1.2;
          const offsetX = (scaledWidth - player.width) / 2;
          const offsetY = (scaledHeight - player.height) / 2;
          
          // For animated GIFs, draw the entire image to let browser handle animation
          // The browser will automatically cycle through all frames
          if (config.animated) {
            this.context.drawImage(
              sprite,
              player.x - offsetX, player.y - offsetY, scaledWidth, scaledHeight
            );
          } else {
            // For static images or sprite sheets, use frame-based rendering
            this.context.drawImage(
              sprite,
              player.x - offsetX, player.y - offsetY, scaledWidth, scaledHeight
            );
          }
          

        } catch (error) {
          console.error('Error drawing player sprite:', error);
        }
      }
    }
    

  }

  private drawHealthHearts(player: Player) {
    const heartSize = 20;
    const heartSpacing = 25;
    const startX = 15;
    const startY = 15;
    
    for (let i = 0; i < 3; i++) {
      const x = startX + i * heartSpacing;
      const y = startY;
      
      // Determine heart color based on remaining lives
      const isActive = i < player.lives;
      const centerX = x + heartSize / 2;
      const centerY = y + heartSize / 2;
      
      // Draw heart outline (black stroke)
      this.context.strokeStyle = '#000000';
      this.context.lineWidth = 2;
      
      // Top circles outline
      this.context.beginPath();
      this.context.arc(centerX - heartSize * 0.2, centerY - heartSize * 0.1, heartSize * 0.25, 0, Math.PI * 2);
      this.context.stroke();
      
      this.context.beginPath();
      this.context.arc(centerX + heartSize * 0.2, centerY - heartSize * 0.1, heartSize * 0.25, 0, Math.PI * 2);
      this.context.stroke();
      
      // Bottom triangle outline
      this.context.beginPath();
      this.context.moveTo(centerX - heartSize * 0.35, centerY + heartSize * 0.05);
      this.context.lineTo(centerX + heartSize * 0.35, centerY + heartSize * 0.05);
      this.context.lineTo(centerX, centerY + heartSize * 0.4);
      this.context.closePath();
      this.context.stroke();
      
      // Draw heart fill
      this.context.fillStyle = isActive ? '#ff0000' : '#666666';
      
      // Top circles fill
      this.context.beginPath();
      this.context.arc(centerX - heartSize * 0.2, centerY - heartSize * 0.1, heartSize * 0.25, 0, Math.PI * 2);
      this.context.arc(centerX + heartSize * 0.2, centerY - heartSize * 0.1, heartSize * 0.25, 0, Math.PI * 2);
      this.context.fill();
      
      // Bottom triangle fill
      this.context.beginPath();
      this.context.moveTo(centerX - heartSize * 0.35, centerY + heartSize * 0.05);
      this.context.lineTo(centerX + heartSize * 0.35, centerY + heartSize * 0.05);
      this.context.lineTo(centerX, centerY + heartSize * 0.4);
      this.context.closePath();
      this.context.fill();
    }
  }

  private drawPlayerHealthBar(player: Player) {
    const barWidth = 30;
    const barHeight = 4;
    const barX = player.x + (player.width - barWidth) / 2;
    const barY = player.y - 15;
    
    // Background (red)
    this.context.fillStyle = '#ff0000';
    this.context.fillRect(barX, barY, barWidth, barHeight);
    
    // Health (green)
    const healthPercentage = player.health / player.maxHealth;
    this.context.fillStyle = '#00ff00';
    this.context.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    
    // Border
    this.context.strokeStyle = '#000000';
    this.context.lineWidth = 1;
    this.context.strokeRect(barX, barY, barWidth, barHeight);
  }

  private drawEnemy(enemy: Enemy) {
    // For animated sprites, handle animation state properly
    let spriteKey = 'enemyRun';
    if (enemy.animationState === 'jumping') {
      spriteKey = 'enemyJump';
    } else if (enemy.animationState === 'firing') {
      spriteKey = 'enemyFire';
    } else if (enemy.animationState === 'exploding') {
      spriteKey = 'enemyExplosion'; // Use explosion video
    }
    
    // Remove damage effect - no longer needed
    
    // For exploding enemies, use the position where they were eliminated but apply parallax movement
    let drawX = enemy.x;
    if (enemy.animationState === 'exploding' && enemy.parallaxX !== undefined && enemy.explosionStartScrollX !== undefined) {
      // Calculate how much the background has scrolled since explosion started
      const scrollDifference = this.backgroundScrollX - enemy.explosionStartScrollX;
      
      // Apply parallax movement to explosion position
      // The explosion moves with the background at the same rate (0.1 multiplier)
      drawX = enemy.parallaxX + (scrollDifference * 0.1);
    }
    
    const config = this.imageManager.getConfig()[spriteKey];
    
    // Check if this is a video sprite
    if (config.isVideo) {
      const video = this.imageManager.getVideo(spriteKey);
      if (video && this.imageManager.isLoaded(spriteKey)) {
        try {
          // Ensure video is playing and looping
          if (video.paused) {
            video.play().catch(console.error);
          }
          
          // Make sprites 20% bigger, explosion 40% bigger (20% + 20% more)
          let scaleMultiplier = 1.2;
          if (enemy.animationState === 'exploding') {
            scaleMultiplier = 1.44; // 20% bigger than the already 20% bigger sprites
          }
          
          const scaledWidth = enemy.width * scaleMultiplier;
          const scaledHeight = enemy.height * scaleMultiplier;
          const offsetX = (scaledWidth - enemy.width) / 2;
          const offsetY = (scaledHeight - enemy.height) / 2;
          
          // Draw the video element
          this.context.drawImage(
            video,
            drawX - offsetX, enemy.y - offsetY, scaledWidth, scaledHeight
          );
          

        } catch (error) {
          console.error('Error drawing enemy video:', error);
        }
      }
    } else {
      // Handle regular image sprites
      const sprite = this.imageManager.getImage(spriteKey);
      
      // Only draw if sprite is fully loaded
      if (sprite && this.imageManager.isLoaded(spriteKey)) {
        try {
          // Make sprites 20% bigger, explosion 40% bigger
          let scaleMultiplier = 1.2;
          if (enemy.animationState === 'exploding') {
            scaleMultiplier = 1.44;
          }
          
          const scaledWidth = enemy.width * scaleMultiplier;
          const scaledHeight = enemy.height * scaleMultiplier;
          const offsetX = (scaledWidth - enemy.width) / 2;
          const offsetY = (scaledHeight - enemy.height) / 2;
          
          // For animated GIFs, draw the entire image to let browser handle animation
          // The browser will automatically cycle through all frames
          if (config.animated) {
            this.context.drawImage(
              sprite,
              drawX - offsetX, enemy.y - offsetY, scaledWidth, scaledHeight
            );
          } else {
            // For static images or sprite sheets, use frame-based rendering
            this.context.drawImage(
              sprite,
              drawX - offsetX, enemy.y - offsetY, scaledWidth, scaledHeight
            );
          }
          

        } catch (error) {
          console.error('Error drawing enemy sprite:', error);
        }
      }
    }
    

    
    // Draw health bar for enemies that are not exploding and have taken damage
    if (enemy.animationState !== 'exploding' && enemy.health < enemy.maxHealth) {
      this.drawEnemyHealthBar(enemy);
    }
  }
  
  private drawEnemyHealthBar(enemy: Enemy) {
    const barWidth = 40;
    const barHeight = 4;
    const barX = enemy.x + (enemy.width - barWidth) / 2;
    const barY = enemy.y - 10;
    
    // Background (red)
    this.context.fillStyle = '#ff0000';
    this.context.fillRect(barX, barY, barWidth, barHeight);
    
    // Health (green)
    const healthPercentage = enemy.health / enemy.maxHealth;
    this.context.fillStyle = '#00ff00';
    this.context.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    
    // Border
    this.context.strokeStyle = '#000000';
    this.context.lineWidth = 1;
    this.context.strokeRect(barX, barY, barWidth, barHeight);
  }

  private drawScore(score: number, canvasWidth: number) {
    this.context.save();
    this.context.fillStyle = '#ffffff';
    this.context.font = 'bold 16px Arial';
    this.context.textAlign = 'right';
    this.context.strokeStyle = '#000000';
    this.context.lineWidth = 2;
    
    const text = `Score: ${score}`;
    const x = canvasWidth - 20;
    const y = 35;
    
    // Draw text outline
    this.context.strokeText(text, x, y);
    // Draw text fill
    this.context.fillText(text, x, y);
    this.context.restore();
  }

  private drawFloatingPoints(enemies: Enemy[]) {
    const now = Date.now();
    enemies.forEach(enemy => {
      if (enemy.pointsDisplayTime && (now - enemy.pointsDisplayTime) < 1000) {
        const elapsed = now - enemy.pointsDisplayTime;
        const progress = elapsed / 1000;
        const alpha = 1 - progress;
        const yOffset = progress * 30; // Float upward
        
        this.context.save();
        this.context.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        this.context.font = 'bold 16px Arial';
        this.context.textAlign = 'center';
        this.context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context.lineWidth = 1;
        
        const text = `+${enemy.pointsValue || 100}`;
        const x = enemy.x + enemy.width / 2;
        const y = enemy.y - 20 - yOffset;
        
        // Draw text outline
        this.context.strokeText(text, x, y);
        // Draw text fill
        this.context.fillText(text, x, y);
        this.context.restore();
      }
    });
  }

  private drawPlayerLifeLoss(player: Player) {
    if (player.lifeDisplayTime) {
      const now = Date.now();
      const elapsed = now - player.lifeDisplayTime;
      if (elapsed < 1000) {
        const progress = elapsed / 1000;
        const alpha = 1 - progress;
        const yOffset = progress * 30; // Float upward
        
        this.context.save();
        this.context.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        this.context.font = 'bold 16px Arial';
        this.context.textAlign = 'center';
        this.context.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context.lineWidth = 1;
        
        const text = '-1 Life';
        const x = player.x + player.width / 2;
        const y = player.y - 20 - yOffset;
        
        // Draw text outline
        this.context.strokeText(text, x, y);
        // Draw text fill
        this.context.fillText(text, x, y);
        this.context.restore();
      }
    }
  }

  private drawPlayerExplosion(player: Player) {
    if (player.explosionStartTime) {
      const now = Date.now();
      const elapsed = now - player.explosionStartTime;
      if (elapsed < 500) { // Show explosion for 500ms
        const progress = elapsed / 500;
        const alpha = 1 - progress;
        const size = 20 + progress * 40; // Expand explosion
        
        this.context.save();
        this.context.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        this.context.beginPath();
        this.context.arc(
          player.x + player.width / 2,
          player.y + player.height / 2,
          size,
          0,
          Math.PI * 2
        );
        this.context.fill();
        
        // Add some sparkle effects
        this.context.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const sparkleX = player.x + player.width / 2 + Math.cos(angle) * size * 0.7;
          const sparkleY = player.y + player.height / 2 + Math.sin(angle) * size * 0.7;
          this.context.beginPath();
          this.context.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
          this.context.fill();
        }
        
        this.context.restore();
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
      
      this.context.drawImage(
        bulletImage, 
        -scaledWidth / 2, 
        -scaledHeight / 2, 
        scaledWidth, 
        scaledHeight
      );
      
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
    this.context.save();
    
    // Draw semi-transparent overlay
    this.context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.context.fillRect(0, 0, width, height);
    
    // Draw game over panel
    const panelWidth = 400;
    const panelHeight = 250;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;
    
    // Panel background
    this.context.fillStyle = 'rgba(40, 40, 40, 0.95)';
    this.context.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border
    this.context.strokeStyle = '#ff0000';
    this.context.lineWidth = 3;
    this.context.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Game Over title
    this.context.fillStyle = '#ff0000';
    this.context.font = 'bold 48px Arial';
    this.context.textAlign = 'center';
    this.context.strokeStyle = '#000000';
    this.context.lineWidth = 2;
    this.context.strokeText('GAME OVER', width / 2, panelY + 70);
    this.context.fillText('GAME OVER', width / 2, panelY + 70);
    
    // Score text
    this.context.fillStyle = '#ffffff';
    this.context.font = 'bold 24px Arial';
    this.context.strokeText(`Final Score: ${score}`, width / 2, panelY + 120);
    this.context.fillText(`Final Score: ${score}`, width / 2, panelY + 120);
    
    // THC earned text
    this.context.fillStyle = '#00ff00';
    this.context.strokeText(`THC Earned: ${thcEarned.toFixed(2)}`, width / 2, panelY + 155);
    this.context.fillText(`THC Earned: ${thcEarned.toFixed(2)}`, width / 2, panelY + 155);
    
    // Restart instruction
    this.context.fillStyle = '#cccccc';
    this.context.font = '18px Arial';
    this.context.strokeText('Press R to restart', width / 2, panelY + 200);
    this.context.fillText('Press R to restart', width / 2, panelY + 200);
    
    this.context.restore();
  }
}
