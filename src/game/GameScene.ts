
import Phaser from 'phaser';
import { PLAYER_CONFIG } from './config';

export default class GameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  rings!: Phaser.Physics.Arcade.Group;
  parallaxBG: Phaser.GameObjects.TileSprite[] = [];
  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;
  ringsCount: number = 0;
  ringsText!: Phaser.GameObjects.Text;
  pet?: Phaser.Physics.Arcade.Sprite;
  activeBoosts: { type: string; value: number; endTime: number }[] = [];

  // For boost effects
  boostEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('GameScene');
  }

  create() {
    // Create parallax background
    this.createParallaxBackground();
    
    // Create platforms
    this.createPlatforms();
    
    // Create rings to collect
    this.createRings();
    
    // Create player
    this.createPlayer();
    
    // Add pet if available
    this.createPet();
    
    // Create particle effects
    this.createParticles();
    
    // Create score display
    this.createUI();
    
    // Set up controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Add colliders
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.rings, this.collectRing, undefined, this);

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
  }

  createParallaxBackground() {
    // Add three layers of background with different scroll speeds
    this.parallaxBG = [
      this.add.tileSprite(0, 0, 800, 400, 'bg-layer-1')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0),
      this.add.tileSprite(0, 0, 800, 400, 'bg-layer-2')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0),
      this.add.tileSprite(0, 0, 800, 400, 'bg-layer-3')
        .setOrigin(0, 0)
        .setScrollFactor(0, 0)
    ];
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    
    // Create initial ground
    for (let i = 0; i < 20; i++) {
      this.platforms.create(i * 64, 380, 'platform');
    }
    
    // Add some floating platforms
    this.platforms.create(300, 280, 'platform');
    this.platforms.create(550, 200, 'platform');
    this.platforms.create(750, 300, 'platform');
  }

  createRings() {
    this.rings = this.physics.add.group();
    
    // Add some initial rings
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(200, 800);
      const y = Phaser.Math.Between(100, 300);
      this.rings.create(x, y, 'ring');
    }
  }

  createPlayer() {
    // Create player sprite and add physics
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(false);
    
    // Set player hitbox
    this.player.setSize(30, 45);
    this.player.setOffset(9, 3);
    
    // Start with idle animation
    this.player.anims.play('idle', true);
  }

  createPet() {
    // Create pet (would be based on owned NFTs in the real app)
    this.pet = this.physics.add.sprite(50, 300, 'tinhat');
    
    // Set pet to follow player loosely
    this.pet.setGravity(0);
  }

  createParticles() {
    // Boost effect (yellow particles)
    this.boostEmitter = this.add.particles(0, 0, 'sparkle', {
      lifespan: 600,
      speed: { min: 50, max: 100 },
      scale: { start: 0.8, end: 0 },
      blendMode: 'ADD',
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
        this.player.anims.play('run', true);
        this.dustEmitter?.emitParticleAt(this.player.x + 10, this.player.y + 24);
      }
    } else if (this.cursors.right!.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
      if (this.player.body.touching.down) {
        this.player.anims.play('run', true);
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
        this.player.anims.play('idle', true);
      }
    }
    
    // Jump when up arrow is pressed
    if (this.cursors.up!.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-jumpForce);
      this.player.anims.play('jump', true);
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
  }

  updateBoosts() {
    // Remove expired boosts
    const currentTime = this.time.now;
    this.activeBoosts = this.activeBoosts.filter(boost => {
      return currentTime < boost.endTime;
    });
  }

  generatePlatforms() {
    // Generate more platforms as the player moves right
    const rightmostPlatform = this.getRightmostPlatform();
    if (this.player.x > rightmostPlatform - 600) {
      // Create a new platform
      const x = rightmostPlatform + Phaser.Math.Between(100, 300);
      const y = Phaser.Math.Between(200, 350);
      
      this.platforms.create(x, y, 'platform');
      
      // Sometimes add a ring above the platform
      if (Phaser.Math.Between(0, 1) > 0.5) {
        this.rings.create(x, y - 50, 'ring');
      }
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
        .setScale(Phaser.Math.Between(5, 10) / 10);
      
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
}
