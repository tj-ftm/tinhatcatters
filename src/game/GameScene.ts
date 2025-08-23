import Phaser from 'phaser';
import { PLAYER_CONFIG } from './config';

export default class GameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  rings!: Phaser.Physics.Arcade.Group;
  enemies!: Phaser.Physics.Arcade.Group;
  obstacles!: Phaser.Physics.Arcade.StaticGroup;
  parallaxBG: Phaser.GameObjects.TileSprite[] = [];
  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;
  ringsCount: number = 0;
  ringsText!: Phaser.GameObjects.Text;
  pet?: Phaser.Physics.Arcade.Sprite;
  activeBoosts: { type: string; value: number; endTime: number }[] = [];
  health: number = 100;
  healthBar!: Phaser.GameObjects.Graphics;
  isInvincible: boolean = false;
  invincibilityTimer?: Phaser.Time.TimerEvent;
  livesIcons: Phaser.GameObjects.Image[] = [];

  // For boost effects
  boostEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  playerSize: { width: number; height: number } = { width: 30, height: 45 };
  lives: number = 3;
  healthText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create() {
    // Create platforms
    this.createPlatforms();
    
    // Create rings to collect
    this.createRings();
    
    // Create enemies and obstacles
    this.createEnemies();
    this.createObstacles();
    
    // Create player
    this.createPlayer();

    // Create parallax background (moved to render on top)
    this.createParallaxBackground();
    
    // Add pet if available
    this.createPet();
    
    // Create particle effects
    this.createParticles();
    
    // Create UI with lives icons and health bar
    this.createUI();
    
    // Set up controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Add colliders
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.rings, this.collectRing, undefined, this);
    this.physics.add.collider(this.player, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, undefined, this);

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(200, 0);

    // Background music (loop)
    /* if (this.sound.get('bgMusic')) {
      const music = this.sound.add('bgMusic', { 
        volume: 0.5,
        loop: true 
      });
      music.play();
    } */
  }

  update() {
    // Handle player movement
    this.handlePlayerMovement();
    
    // Update parallax background
    this.updateParallax();
    
    // Update pet position to follow player
    this.updatePet();
    
    // Update score based on distance
    this.updateScore();
    
    // Update boost effects
    this.updateBoosts();
    
    // Create more platforms as the player moves
    this.generatePlatforms();
    
    // Generate more content as player progresses
    this.generateGameContent();
    
    // Check for game over condition
    if (this.health <= 0 || this.player.y > this.cameras.main.height + 200) {
      this.gameOver();
    }
  }

  createParallaxBackground() {
    const { width, height } = this.sys.game.config;
    // Add three layers of background with different scroll speeds and pink/black theme
    this.parallaxBG = [
      this.add.tileSprite(0, 0, Number(width), Number(height), 'bg-layer-1')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0)
        .setDepth(0),
      this.add.tileSprite(0, 0, Number(width), Number(height), 'bg-layer-2')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0.1)
        .setDepth(1),
      this.add.tileSprite(0, 0, Number(width), Number(height), 'bg-layer-3')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0.2)
        .setDepth(2)
    ];
    this.parallaxBG.push(
      this.add.tileSprite(0, Number(height) - 40, Number(width), 40, 'grass')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0.3) // Adjust this speed as needed
        .setDepth(100) // Set a high depth to render on top
    );
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    const gameHeight = Number(this.sys.game.config.height);
    const groundY = gameHeight - 50; // Position ground 50px from the bottom

    // Create initial ground
    for (let i = 0; i < 20; i++) {
      const platform = this.platforms.create(i * 64, groundY, 'platform');
      platform.setTint(0xFF69B4); // Pink platforms
      platform.refreshBody();
    }
    
    // Add some floating platforms (adjust Y relative to new groundY or gameHeight)
    const floatingPlatform1 = this.platforms.create(300, groundY - 100, 'platform');
    floatingPlatform1.setTint(0xFF69B4);
    floatingPlatform1.refreshBody();
    
    const floatingPlatform2 = this.platforms.create(550, groundY - 180, 'platform');
    floatingPlatform2.setTint(0xFF69B4);
    floatingPlatform2.refreshBody();
    
    const floatingPlatform3 = this.platforms.create(750, groundY - 80, 'platform');
    floatingPlatform3.setTint(0xFF69B4);
    floatingPlatform3.refreshBody();
  }

  createRings() {
    this.rings = this.physics.add.group();
    const gameHeight = Number(this.sys.game.config.height);
    
    // Add some initial rings with yellow tint
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(200, Number(this.sys.game.config.width) - 200);
      const y = Phaser.Math.Between(gameHeight - 250, gameHeight - 150); // Adjust Y range
      const ring = this.rings.create(x, y, 'ring');
      ring.setTint(0xFFFF00); // Yellow rings
      ring.setScale(1.5); // Increase ring size
      // Add a simple rotation animation
      this.tweens.add({
        targets: ring,
        angle: 360,
        duration: 1500,
        repeat: -1
      });
    }
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    const gameHeight = Number(this.sys.game.config.height);
    
    // Add some initial enemies
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(400, Number(this.sys.game.config.width) + 400);
      const y = Phaser.Math.Between(gameHeight - 150, gameHeight - 80); // Adjust Y range
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setTint(0xFF00FF); // Magenta enemies
      enemy.setScale(1.5); // Increase enemy size
      enemy.setVelocityX(Phaser.Math.Between(-50, 50));
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(false);
    }
    
    // Add collision between enemies and platforms
    this.physics.add.collider(this.enemies, this.platforms);
  }

  createObstacles() {
    this.obstacles = this.physics.add.staticGroup();
    
    // Add some spikes and other obstacles
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(400, 1200);
      const obstacle = this.obstacles.create(x, 360, 'spikes');
      obstacle.setTint(0xFF0000); // Red obstacles
      obstacle.refreshBody();
    }
  }

  createPlayer() {
    const gameHeight = Number(this.sys.game.config.height);
    // Create player sprite and add physics
    this.player = this.physics.add.sprite(100, gameHeight - 100, 'player'); // Adjust Y position
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(false);
    this.player.setScale(1.5); // Increase player size
    
    // Set player hitbox (adjust if necessary after scaling)
    this.player.setSize(this.playerSize.width, this.playerSize.height);
    this.player.setOffset(9, 3);
    
    // Only play animations if the player texture has frames
    try {
      if (this.anims.exists('idle')) {
        this.player.anims.play('idle', true);
      }
    } catch (error) {
      console.error("Could not play animation: ", error);
    }
  }

  createPet() {
    const gameHeight = Number(this.sys.game.config.height);
    // Create pet (would be based on owned NFTs in the real app)
    this.pet = this.physics.add.sprite(50, gameHeight - 100, 'tinhat'); // Adjust Y position
    this.pet.setScale(1.5); // Increase pet size
    
    // Set pet to follow player loosely
    this.pet.setGravity(0);
    
    // Add a bobbing animation to the pet
    this.tweens.add({
      targets: this.pet,
      y: "+=10",
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createParticles() {
    // Boost effect (yellow particles)
    this.boostEmitter = this.add.particles(0, 0, 'sparkle', {
      lifespan: 600,
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      tint: 0xFFFF00, // Yellow
      emitting: false
    });
    
    // Dust effect when running
    this.dustEmitter = this.add.particles(0, 0, 'sparkle', {
      lifespan: 300,
      frequency: 100,
      quantity: 1,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: 0xFF69B4, // Pink
      emitting: false
    });
  }

  createUI() {
    // Score display (top left)
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#FFFF00' // Yellow
    }).setScrollFactor(0);
    
    // Rings counter (top right)
    this.ringsText = this.add.text(this.cameras.main.width - 150, 16, 'Rings: 0', { 
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#FFFF00' // Yellow
    }).setScrollFactor(0);
    
    // Lives display (top center) using TinHatCat icons
    this.livesIcons = [];
    const livesLabel = this.add.text(this.cameras.main.width / 2 - 60, 16, 'Lives:', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#FFFF00' // Yellow
    }).setScrollFactor(0).setOrigin(0, 0);
    
    // Add initial life icons
    for (let i = 0; i < this.lives; i++) {
      const icon = this.add.image(livesLabel.x + livesLabel.width + 25 + (i * 35), livesLabel.y + 10, 'tinhat')
        .setScrollFactor(0)
        .setScale(0.8);
      this.livesIcons.push(icon);
    }
    
    // Health bar (bottom left)
    this.healthBar = this.add.graphics().setScrollFactor(0);
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // Background
    this.healthBar.fillStyle(0x000000);
    this.healthBar.fillRect(16, this.cameras.main.height - 30, 150, 20);
    
    // Health remaining
    if (this.health > 30) {
      this.healthBar.fillStyle(0x00FF00);
    } else {
      this.healthBar.fillStyle(0xFF0000);
    }
    this.healthBar.fillRect(18, this.cameras.main.height - 28, Math.floor(146 * (this.health / 100)), 16);
    
    // Border
    this.healthBar.lineStyle(2, 0xFFFF00);
    this.healthBar.strokeRect(16, this.cameras.main.height - 30, 150, 20);
    
    // Health text
    if (!this.healthText) {
      this.healthText = this.add.text(20, this.cameras.main.height - 28, `${this.health}%`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#000000'
      }).setScrollFactor(0);
    } else {
      this.healthText.setText(`${this.health}%`);
    }
  }

  handlePlayerMovement() {
    // Calculate base speed including boosts
    let speed = PLAYER_CONFIG.speed;
    let jumpForce = PLAYER_CONFIG.jumpForce;
    
    // Apply active boosts
    this.activeBoosts.forEach(boost => {
      if (boost.type === 'speed') speed += boost.value;
      if (boost.type === 'jump') jumpForce += boost.value;
    });
    
    // Handle left/right movement
    if (this.cursors.left!.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true;
      if (this.player.body.touching.down) {
        try {
          if (this.anims.exists('run')) {
            this.player.anims.play('run', true);
          }
        } catch (error) {
          console.error("Could not play run animation: ", error);
        }
        this.dustEmitter?.emitParticleAt(this.player.x + 10, this.player.y + 24);
      }
    } else if (this.cursors.right!.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
      if (this.player.body.touching.down) {
        try {
          if (this.anims.exists('run')) {
            this.player.anims.play('run', true);
          }
        } catch (error) {
          console.error("Could not play run animation: ", error);
        }
        this.dustEmitter?.emitParticleAt(this.player.x - 10, this.player.y + 24);
      }
    } else {
      // Decelerate when no keys are pressed
      const currentVelocity = this.player.body.velocity.x;
      if (currentVelocity > 0) {
        this.player.setVelocityX(Math.max(currentVelocity - PLAYER_CONFIG.deceleration * (this.game.loop.delta / 1000), 0));
      } else if (currentVelocity < 0) {
        this.player.setVelocityX(Math.min(currentVelocity + PLAYER_CONFIG.deceleration * (this.game.loop.delta / 1000), 0));
      }
      
      if (this.player.body.touching.down) {
        try {
          if (this.anims.exists('idle')) {
            this.player.anims.play('idle', true);
          }
        } catch (error) {
          console.error("Could not play idle animation: ", error);
        }
      }
    }
    
    // Jump when up arrow is pressed
    if (this.cursors.up!.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-jumpForce);
      try {
        if (this.anims.exists('jump')) {
          this.player.anims.play('jump', true);
        }
      } catch (error) {
        console.error("Could not play jump animation: ", error);
      }
      // this.sound.play('jump');
    }
    
    // Limit max speed
    if (Math.abs(this.player.body.velocity.x) > PLAYER_CONFIG.maxSpeed) {
      const direction = this.player.body.velocity.x > 0 ? 1 : -1;
      this.player.setVelocityX(direction * PLAYER_CONFIG.maxSpeed);
    }
    
    // Show boost effects if any speed boost is active
    const hasSpeedBoost = this.activeBoosts.some(boost => boost.type === 'speed');
    if (hasSpeedBoost && Math.abs(this.player.body.velocity.x) > 0) {
      this.boostEmitter?.emitParticleAt(
        this.player.x - (this.player.flipX ? -20 : 20),
        this.player.y + 10
      );
    }
  }

  updateParallax() {
    // Move backgrounds at different speeds based on player movement
    const playerVelocityX = this.player.body.velocity.x;
    this.parallaxBG[0].tilePositionX += playerVelocityX * 0.01 * (this.game.loop.delta / 16);
    this.parallaxBG[1].tilePositionX += playerVelocityX * 0.05 * (this.game.loop.delta / 16);
    this.parallaxBG[2].tilePositionX += playerVelocityX * 0.1 * (this.game.loop.delta / 16);
  }

  updatePet() {
    if (!this.pet) return;
    
    // Target position is behind and slightly above the player
    const targetX = this.player.flipX 
      ? this.player.x + 50 
      : this.player.x - 50;
    
    const targetY = this.player.y - 30;
    
    // Smoothly move pet towards target position
    const dx = targetX - this.pet.x;
    const dy = targetY - this.pet.y;
    
    this.pet.x += dx * 0.08;
    this.pet.y += dy * 0.08;
    
    // Add a floating effect
    this.pet.y += Math.sin(this.time.now / 300) * 0.5;
  }

  updateScore() {
    // Increase score based on distance and rings
    this.score += this.player.body.velocity.x > 0 ? 1 : 0;
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Update UI position for fixed HUD
    this.scoreText.x = this.cameras.main.scrollX + 16;
    this.ringsText.x = this.cameras.main.scrollX + this.cameras.main.width - 150;
    
    // Update health bar
    this.updateHealthBar();
  }

  updateBoosts() {
    // Remove expired boosts
    const currentTime = this.time.now;
    this.activeBoosts = this.activeBoosts.filter(boost => {
      return currentTime < boost.endTime;
    });
    
    // Check invincibility
    if (this.isInvincible && currentTime >= this.invincibilityTimer?.getRemaining()) {
      this.isInvincible = false;
      this.player.alpha = 1; // Restore opacity
    }
  }

  generatePlatforms() {
    // Generate more platforms as the player moves right
    const rightmostPlatform = this.getRightmostPlatform();
    if (this.player.x > rightmostPlatform - 600) {
      // Create a new platform
      const x = rightmostPlatform + Phaser.Math.Between(100, 300);
      const y = Phaser.Math.Between(200, 350);
      
      const platform = this.platforms.create(x, y, 'platform');
      platform.setTint(0xFF69B4); // Pink
      platform.refreshBody();
      
      // Sometimes add a ring above the platform
      if (Phaser.Math.Between(0, 1) > 0.5) {
        const ring = this.rings.create(x, y - 50, 'ring');
        ring.setTint(0xFFFF00); // Yellow
        this.tweens.add({
          targets: ring,
          angle: 360,
          duration: 1500,
          repeat: -1
        });
      }
    }
  }

  generateGameContent() {
    // Generate more enemies and obstacles as player progresses
    const rightmostX = this.getRightmostX();
    
    // Add enemies occasionally
    if (this.player.x > rightmostX - 800 && Phaser.Math.Between(0, 100) < 2) {
      const x = rightmostX + Phaser.Math.Between(200, 500);
      const y = Phaser.Math.Between(100, 350);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setTint(0xFF00FF); // Magenta
      enemy.setVelocityX(Phaser.Math.Between(-50, 50));
      enemy.setBounce(1);
    }
    
    // Add obstacles occasionally
    if (this.player.x > rightmostX - 800 && Phaser.Math.Between(0, 100) < 1) {
      const x = rightmostX + Phaser.Math.Between(300, 600);
      const obstacle = this.obstacles.create(x, 360, 'spikes');
      obstacle.setTint(0xFF0000); // Red
      obstacle.refreshBody();
    }
  }

  collectRing(player: Phaser.Physics.Arcade.Sprite, ring: Phaser.Physics.Arcade.Sprite) {
    ring.disableBody(true, true);
    
    // Increment ring count
    this.ringsCount++;
    this.ringsText.setText(`Rings: ${this.ringsCount}`);
    
    // Add score
    this.score += 100;
    
    // Play sound
    // this.sound.play('collect');
    
    // Create sparkle effect
    for (let i = 0; i < 5; i++) {
      const angle = Phaser.Math.Between(0, 360);
      const speed = Phaser.Math.Between(50, 100);
      const x = ring.x + Math.cos(angle) * 10;
      const y = ring.y + Math.sin(angle) * 10;
      
      const sparkle = this.add.sprite(x, y, 'sparkle')
        .setScale(Phaser.Math.Between(5, 10) / 10)
        .setTint(0xFFFF00); // Yellow
      
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => sparkle.destroy()
      });
    }
    
    // Give special reward for every 10 rings
    if (this.ringsCount % 10 === 0) {
      this.applyBoost('speed', 20, 5000);
    }
  }

  hitEnemy(player: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    // No damage if invincible
    if (this.isInvincible) return;
    
    // Take damage
    this.takeDamage(10);
    
    // Knockback effect
    const knockbackDirection = player.x < enemy.x ? -1 : 1;
    player.setVelocity(knockbackDirection * 200, -200);
    
    // Check if health is too low and should lose a life
    if (this.health <= 0) {
      // Lose a life
      this.updateLives(this.lives - 1);
      
      // Reset health if still have lives
      if (this.lives > 0) {
        this.health = 100;
        this.updateHealthBar();
      }
    }
    
    // Briefly make invincible
    this.makeInvincible(1000);
  }

  hitObstacle(player: Phaser.Physics.Arcade.Sprite, obstacle: Phaser.Physics.Arcade.Sprite) {
    // No damage if invincible
    if (this.isInvincible) return;
    
    // Take damage
    this.takeDamage(15);
    
    // Knockback effect
    player.setVelocityY(-200);
    
    // Check if health is too low and should lose a life
    if (this.health <= 0) {
      // Lose a life
      this.updateLives(this.lives - 1);
      
      // Reset health if still have lives
      if (this.lives > 0) {
        this.health = 100;
        this.updateHealthBar();
      }
    }
    
    // Briefly make invincible
    this.makeInvincible(1000);
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    
    // Flash the player red
    this.player.setTint(0xFF0000);
    this.time.delayedCall(200, () => {
      this.player.clearTint();
    });
    
    // Camera shake
    this.cameras.main.shake(200, 0.01);
  }

  makeInvincible(duration: number) {
    this.isInvincible = true;
    
    // Visual effect - flashing
    this.player.alpha = 0.7;
    
    // Clear any existing timer
    if (this.invincibilityTimer) {
      this.invincibilityTimer.remove();
    }
    
    // Set new timer
    this.invincibilityTimer = this.time.delayedCall(duration, () => {
      this.isInvincible = false;
      this.player.alpha = 1;
    });
  }

  applyBoost(type: string, value: number, duration: number) {
    // Add boost to active boosts
    this.activeBoosts.push({
      type,
      value,
      endTime: this.time.now + duration
    });
    
    // Play boost sound
    // this.sound.play('boost');
    
    // Show boost effect
    if (type === 'speed') {
      this.boostEmitter?.start();
      this.time.delayedCall(duration, () => {
        this.boostEmitter?.stop();
      });
    }
    
    // If invincibility boost
    if (type === 'invincibility') {
      this.makeInvincible(duration);
      
      // Show special effect for invincibility
      this.player.setTint(0xFFFF00); // Yellow glow
      this.time.delayedCall(duration, () => {
        this.player.clearTint();
      });
    }
  }

  gameOver() {
    // Show game over message
    const gameOverText = this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2,
      'GAME OVER', 
      { 
        fontFamily: 'monospace',
        fontSize: '40px',
        color: '#FF0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100);
    
    // Show score
    const finalScoreText = this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2 + 60,
      `Final Score: ${this.score}`, 
      { 
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#FFFF00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100);
    
    // Restart button
    const restartButton = this.add.text(
      this.cameras.main.scrollX + this.cameras.main.width / 2,
      this.cameras.main.scrollY + this.cameras.main.height / 2 + 120,
      'Click to Restart', 
      { 
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#FF69B4',
        padding: { x: 20, y: 10 }
      }
    )
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(100)
    .setInteractive({ useHandCursor: true });
    
    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
    
    // Pause the game
    this.scene.pause();
  }

  getRightmostPlatform() {
    let rightmostX = 0;
    this.platforms.getChildren().forEach((platform: any) => {
      if (platform.x > rightmostX) {
        rightmostX = platform.x;
      }
    });
    return rightmostX;
  }

  getRightmostX() {
    let rightmostX = this.getRightmostPlatform();
    
    // Check enemies and obstacles too
    this.enemies.getChildren().forEach((enemy: any) => {
      if (enemy.x > rightmostX) {
        rightmostX = enemy.x;
      }
    });
    
    this.obstacles.getChildren().forEach((obstacle: any) => {
      if (obstacle.x > rightmostX) {
        rightmostX = obstacle.x;
      }
    });
    
    return rightmostX;
  }

  updateLives(newLives: number) {
    const oldLives = this.lives;
    this.lives = newLives;
    
    // If lives decreased, remove icons
    if (newLives < oldLives) {
      for (let i = oldLives - 1; i >= newLives; i--) {
        if (this.livesIcons[i]) {
          // Fade out and remove the icon
          this.tweens.add({
            targets: this.livesIcons[i],
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => {
              this.livesIcons[i].destroy();
            }
          });
        }
      }
      this.livesIcons.splice(newLives, oldLives - newLives);
    }
    // If lives increased, add icons
    else if (newLives > oldLives) {
      const livesLabel = this.children.getByName('livesLabel');
      const labelX = livesLabel ? (livesLabel as Phaser.GameObjects.Text).x : this.cameras.main.width / 2 - 60;
      const labelWidth = livesLabel ? (livesLabel as Phaser.GameObjects.Text).width : 60;
      
      for (let i = oldLives; i < newLives; i++) {
        const icon = this.add.image(labelX + labelWidth + 25 + (i * 35), 26, 'tinhat')
          .setScrollFactor(0)
          .setScale(0.8)
          .setAlpha(0);
        
        this.tweens.add({
          targets: icon,
          alpha: 1,
          scale: 0.8,
          duration: 300
        });
        
        this.livesIcons.push(icon);
      }
    }
  }
}
