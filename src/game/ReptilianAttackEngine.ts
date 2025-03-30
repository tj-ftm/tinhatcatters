// This is a modified implementation for the ReptilianAttackEngine class
// Now using images for rendering instead of drawing primitives

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
  private startTime: number = 0;
  private gameTime: number = 0;
  private animationFrame: number = 0;
  private lastAnimationFrameTime: number = 0;
  
  // Scrolling background properties
  private backgroundScrollX: number = 0;
  private backgroundScrollSpeed: number = 1;
  
  // Image assets
  private playerImage: HTMLImageElement | null = null;
  private playerSpriteSheet: HTMLImageElement | null = null;
  private backgroundImage: HTMLImageElement | null = null;
  private obstacleImage: HTMLImageElement | null = null;
  private enemyImage: HTMLImageElement | null = null;
  private bulletImage: HTMLImageElement | null = null;
  private enemyBulletImage: HTMLImageElement | null = null;
  private floorImage: HTMLImageElement | null = null;
  
  // Sprite animation
  private spriteAnimationRunning: boolean = false;
  private spriteTotalFrames: number = 4; // Default, will be determined when sprite loads
  private spriteFrameWidth: number = 50; // Default, will be determined when sprite loads
  private spriteFrameHeight: number = 70; // Default, will be determined when sprite loads
  
  // Track image loading status
  private imagesLoaded: {[key: string]: boolean} = {
    player: false,
    playerSprite: false,
    background: false,
    obstacle: false,
    enemy: false,
    bullet: false,
    enemyBullet: false,
    floor: false
  };
  
  // Image configurations
  private imageConfig = {
    player: {
      src: '/assets/Icons/tinhatcat.webp',
      width: 50,
      height: 70
    },
    playerSprite: {
      src: '/playersprite.gif',
      width: 50,
      height: 70,
      frames: 4,
      frameWidth: 50
    },
    background: {
      src: '/assets/Icons/sidescrollerbg.webp',
      width: 800,
      height: 400
    },
    obstacle: {
      src: '/assets/Icons/illuminati.webp',
      width: 40,
      height: 60
    },
    enemy: {
      src: '/assets/Icons/illuminati.webp',
      width: 60,
      height: 60
    },
    bullet: {
      src: '/assets/Icons/illuminati.webp',
      width: 20,
      height: 10
    },
    enemyBullet: {
      src: '/assets/Icons/illuminati.webp',
      width: 20,
      height: 10
    },
    floor: {
      src: '/assets/Icons/illuminati.webp',
      width: 800,
      height: 20
    }
  };
  
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.loadImages();
    this.reset();
    this.startTime = Date.now();
    
    // Initial render to show images before game starts
    if (this.canvas && this.context) {
      this.render();
    }
  }
  
  setCollisionBehavior(behavior: 'immediate' | 'fade') {
    this.collisionBehavior = behavior;
  }
  
<<<<<<< HEAD
  // Load all game images with error handling
  private loadImages() {
    // Player image
    this.playerImage = new Image();
    this.playerImage.onload = () => {
      this.imagesLoaded.player = true;
      console.log("Player image loaded successfully");
      this.render(); // Re-render once image is loaded
    };
    this.playerImage.onerror = () => {
      console.error('Failed to load player image:', this.imageConfig.player.src);
      // Force a render with fallback shapes
      this.imagesLoaded.player = false;
      
      // Try with fallback
      this.playerImage = new Image();
      this.playerImage.src = '/assets/Icons/tinhatcat.webp';
      this.playerImage.onload = () => {
        this.imagesLoaded.player = true;
        console.log("Player fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.playerImage.src = this.imageConfig.player.src;
    
    // Background image
    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.imagesLoaded.background = true;
      console.log("Background image loaded successfully");
      this.render(); // Re-render once image is loaded
    };
    this.backgroundImage.onerror = () => {
      console.error('Failed to load background image:', this.imageConfig.background.src);
      this.imagesLoaded.background = false;
      
      // Try with fallback
      this.backgroundImage = new Image();
      this.backgroundImage.src = '/assets/Icons/sidescrollerbg.webp';
      this.backgroundImage.onload = () => {
        this.imagesLoaded.background = true;
        console.log("Background fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.backgroundImage.src = this.imageConfig.background.src;
    
    // Obstacle image
    this.obstacleImage = new Image();
    this.obstacleImage.onload = () => {
      this.imagesLoaded.obstacle = true;
      this.render(); // Re-render once image is loaded
    };
    this.obstacleImage.onerror = () => {
      console.error('Failed to load obstacle image');
      this.imagesLoaded.obstacle = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.obstacleImage = fallbackImage;
        this.imagesLoaded.obstacle = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.obstacleImage.src = this.imageConfig.obstacle.src;
    
    // Enemy image
    this.enemyImage = new Image();
    this.enemyImage.onload = () => {
      this.imagesLoaded.enemy = true;
      this.render(); // Re-render once image is loaded
    };
    this.enemyImage.onerror = () => {
      console.error('Failed to load enemy image');
      this.imagesLoaded.enemy = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.enemyImage = fallbackImage;
        this.imagesLoaded.enemy = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.enemyImage.src = this.imageConfig.enemy.src;
    
    // Bullet image
    this.bulletImage = new Image();
    this.bulletImage.onload = () => {
      this.imagesLoaded.bullet = true;
      this.render(); // Re-render once image is loaded
    };
    this.bulletImage.onerror = () => {
      console.error('Failed to load bullet image');
      this.imagesLoaded.bullet = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.bulletImage = fallbackImage;
        this.imagesLoaded.bullet = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.bulletImage.src = this.imageConfig.bullet.src;
    
    // Enemy bullet image
    this.enemyBulletImage = new Image();
    this.enemyBulletImage.onload = () => {
      this.imagesLoaded.enemyBullet = true;
      this.render(); // Re-render once image is loaded
    };
    this.enemyBulletImage.onerror = () => {
      console.error('Failed to load enemy bullet image');
      this.imagesLoaded.enemyBullet = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.enemyBulletImage = fallbackImage;
        this.imagesLoaded.enemyBullet = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.enemyBulletImage.src = this.imageConfig.enemyBullet.src;
    
    // Floor image
    this.floorImage = new Image();
    this.floorImage.onload = () => {
      this.imagesLoaded.floor = true;
      this.render(); // Re-render once image is loaded
    };
    this.floorImage.onerror = () => {
      console.error('Failed to load floor image');
      this.imagesLoaded.floor = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.floorImage = fallbackImage;
        this.imagesLoaded.floor = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.floorImage.src = this.imageConfig.floor.src;
  }
  
  // Set player sprite image
  setPlayerSprite(imageSrc: string, width?: number, height?: number) {
    console.log("Setting player sprite:", imageSrc);
    this.imageConfig.player.src = imageSrc;
    if (width) this.imageConfig.player.width = width;
    if (height) this.imageConfig.player.height = height;
    
    // Reset loaded state
    this.imagesLoaded.player = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.playerImage = newImage;
      this.imagesLoaded.player = true;
      console.log("Player sprite loaded successfully");
      this.render(); // Re-render with new sprite
    };
    newImage.onerror = () => {
      console.error('Failed to load custom player image:', imageSrc);
      this.imagesLoaded.player = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/tinhatcat.webp';
      fallbackImage.onload = () => {
        this.playerImage = fallbackImage;
        this.imagesLoaded.player = true;
        console.log("Player fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    newImage.src = imageSrc;
  }
  
  // Set background image
  setBackgroundImage(imageSrc: string, width?: number, height?: number) {
    console.log("Setting background image:", imageSrc);
    this.imageConfig.background.src = imageSrc;
    if (width) this.imageConfig.background.width = width;
    if (height) this.imageConfig.background.height = height;
    
    // Reset loaded state
    this.imagesLoaded.background = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.backgroundImage = newImage;
      this.imagesLoaded.background = true;
      console.log("Background image loaded successfully");
      this.render(); // Re-render with new background
    };
    newImage.onerror = () => {
      console.error('Failed to load custom background image:', imageSrc);
      this.imagesLoaded.background = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/sidescrollerbg.webp';
      fallbackImage.onload = () => {
        this.backgroundImage = fallbackImage;
        this.imagesLoaded.background = true;
        console.log("Background fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    newImage.src = imageSrc;
  }
  
  // Set obstacle image
  setObstacleImage(imageSrc: string, width?: number, height?: number) {
    this.imageConfig.obstacle.src = imageSrc;
    if (width) this.imageConfig.obstacle.width = width;
    if (height) this.imageConfig.obstacle.height = height;
    
    // Reset loaded state
    this.imagesLoaded.obstacle = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.obstacleImage = newImage;
      this.imagesLoaded.obstacle = true;
    };
    newImage.onerror = () => {
      console.error('Failed to load custom obstacle image:', imageSrc);
      this.imagesLoaded.obstacle = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.obstacleImage = fallbackImage;
        this.imagesLoaded.obstacle = true;
      };
    };
    newImage.src = imageSrc;
  }
  
  // Set enemy image
  setEnemyImage(imageSrc: string, width?: number, height?: number) {
    this.imageConfig.enemy.src = imageSrc;
    if (width) this.imageConfig.enemy.width = width;
    if (height) this.imageConfig.enemy.height = height;
    
    // Reset loaded state
    this.imagesLoaded.enemy = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.enemyImage = newImage;
      this.imagesLoaded.enemy = true;
    };
    newImage.onerror = () => {
      console.error('Failed to load custom enemy image:', imageSrc);
      this.imagesLoaded.enemy = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.enemyImage = fallbackImage;
        this.imagesLoaded.enemy = true;
      };
    };
    newImage.src = imageSrc;
  }
  
=======
  // Set animation state
  setAnimationRunning(running: boolean) {
    this.spriteAnimationRunning = running;
    // Reset animation frame when we start or stop
    this.animationFrame = 0;
    this.lastAnimationFrameTime = 0;
  }
  
  // Load all game images with error handling
  private loadImages() {
    // Player image (static fallback)
    this.playerImage = new Image();
    this.playerImage.onload = () => {
      this.imagesLoaded.player = true;
      console.log("Player image loaded successfully");
      this.render(); // Re-render once image is loaded
    };
    this.playerImage.onerror = () => {
      console.error('Failed to load player image:', this.imageConfig.player.src);
      // Force a render with fallback shapes
      this.imagesLoaded.player = false;
      
      // Try with fallback
      this.playerImage = new Image();
      this.playerImage.src = '/assets/Icons/tinhatcat.webp';
      this.playerImage.onload = () => {
        this.imagesLoaded.player = true;
        console.log("Player fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.playerImage.src = this.imageConfig.player.src;
    
    // Player sprite sheet (animated)
    this.playerSpriteSheet = new Image();
    this.playerSpriteSheet.onload = () => {
      this.imagesLoaded.playerSprite = true;
      console.log("Player sprite sheet loaded successfully");
      
      // Try to detect frame count based on image dimensions
      if (this.playerSpriteSheet) {
        // If it's a proper sprite sheet, update frame information
        const aspectRatio = this.playerSpriteSheet.width / this.playerSpriteSheet.height;
        if (aspectRatio > 1) { // Horizontal sprite sheet
          this.spriteTotalFrames = Math.round(aspectRatio);
          this.spriteFrameWidth = this.playerSpriteSheet.width / this.spriteTotalFrames;
          this.spriteFrameHeight = this.playerSpriteSheet.height;
          
          this.imageConfig.playerSprite.frames = this.spriteTotalFrames;
          this.imageConfig.playerSprite.frameWidth = this.spriteFrameWidth;
          
          console.log(`Detected ${this.spriteTotalFrames} frames in sprite sheet`);
        } else {
          // Use defaults if it appears to be a single image
          this.spriteTotalFrames = 1;
          this.spriteFrameWidth = this.playerSpriteSheet.width;
          this.spriteFrameHeight = this.playerSpriteSheet.height;
        }
      }
      
      this.render(); // Re-render once image is loaded
    };
    this.playerSpriteSheet.onerror = () => {
      console.error('Failed to load player sprite sheet:', this.imageConfig.playerSprite.src);
      this.imagesLoaded.playerSprite = false;
      
      // Use static player image as fallback
      console.log("Using static player image as fallback");
    };
    this.playerSpriteSheet.src = this.imageConfig.playerSprite.src;
    
    // Background image
    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.imagesLoaded.background = true;
      console.log("Background image loaded successfully");
      this.render(); // Re-render once image is loaded
    };
    this.backgroundImage.onerror = () => {
      console.error('Failed to load background image:', this.imageConfig.background.src);
      this.imagesLoaded.background = false;
      
      // Try with fallback
      this.backgroundImage = new Image();
      this.backgroundImage.src = '/assets/Icons/sidescrollerbg.webp';
      this.backgroundImage.onload = () => {
        this.imagesLoaded.background = true;
        console.log("Background fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.backgroundImage.src = this.imageConfig.background.src;
    
    // Obstacle image
    this.obstacleImage = new Image();
    this.obstacleImage.onload = () => {
      this.imagesLoaded.obstacle = true;
      this.render(); // Re-render once image is loaded
    };
    this.obstacleImage.onerror = () => {
      console.error('Failed to load obstacle image');
      this.imagesLoaded.obstacle = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.obstacleImage = fallbackImage;
        this.imagesLoaded.obstacle = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.obstacleImage.src = this.imageConfig.obstacle.src;
    
    // Enemy image
    this.enemyImage = new Image();
    this.enemyImage.onload = () => {
      this.imagesLoaded.enemy = true;
      this.render(); // Re-render once image is loaded
    };
    this.enemyImage.onerror = () => {
      console.error('Failed to load enemy image');
      this.imagesLoaded.enemy = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.enemyImage = fallbackImage;
        this.imagesLoaded.enemy = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.enemyImage.src = this.imageConfig.enemy.src;
    
    // Bullet image
    this.bulletImage = new Image();
    this.bulletImage.onload = () => {
      this.imagesLoaded.bullet = true;
      this.render(); // Re-render once image is loaded
    };
    this.bulletImage.onerror = () => {
      console.error('Failed to load bullet image');
      this.imagesLoaded.bullet = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.bulletImage = fallbackImage;
        this.imagesLoaded.bullet = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.bulletImage.src = this.imageConfig.bullet.src;
    
    // Enemy bullet image
    this.enemyBulletImage = new Image();
    this.enemyBulletImage.onload = () => {
      this.imagesLoaded.enemyBullet = true;
      this.render(); // Re-render once image is loaded
    };
    this.enemyBulletImage.onerror = () => {
      console.error('Failed to load enemy bullet image');
      this.imagesLoaded.enemyBullet = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.enemyBulletImage = fallbackImage;
        this.imagesLoaded.enemyBullet = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.enemyBulletImage.src = this.imageConfig.enemyBullet.src;
    
    // Floor image
    this.floorImage = new Image();
    this.floorImage.onload = () => {
      this.imagesLoaded.floor = true;
      this.render(); // Re-render once image is loaded
    };
    this.floorImage.onerror = () => {
      console.error('Failed to load floor image');
      this.imagesLoaded.floor = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.floorImage = fallbackImage;
        this.imagesLoaded.floor = true;
        this.render(); // Re-render once fallback is loaded
      };
    };
    this.floorImage.src = this.imageConfig.floor.src;
  }
  
  // Set player sprite image
  setPlayerSprite(imageSrc: string, width?: number, height?: number) {
    console.log("Setting player sprite:", imageSrc);
    this.imageConfig.player.src = imageSrc;
    if (width) this.imageConfig.player.width = width;
    if (height) this.imageConfig.player.height = height;
    
    // Reset loaded state
    this.imagesLoaded.player = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.playerImage = newImage;
      this.imagesLoaded.player = true;
      console.log("Player sprite loaded successfully");
      this.render(); // Re-render with new sprite
    };
    newImage.onerror = () => {
      console.error('Failed to load custom player image:', imageSrc);
      this.imagesLoaded.player = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/tinhatcat.webp';
      fallbackImage.onload = () => {
        this.playerImage = fallbackImage;
        this.imagesLoaded.player = true;
        console.log("Player fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    newImage.src = imageSrc;
  }
  
  // Set player animated sprite
  setPlayerAnimatedSprite(imageSrc: string, frames: number = 4, width?: number, height?: number) {
    console.log("Setting player animated sprite:", imageSrc);
    this.imageConfig.playerSprite.src = imageSrc;
    this.imageConfig.playerSprite.frames = frames;
    if (width) this.imageConfig.playerSprite.width = width;
    if (height) this.imageConfig.playerSprite.height = height;
    
    // Reset loaded state
    this.imagesLoaded.playerSprite = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.playerSpriteSheet = newImage;
      this.imagesLoaded.playerSprite = true;
      
      // Update frame information
      this.spriteTotalFrames = frames;
      this.spriteFrameWidth = newImage.width / frames;
      this.spriteFrameHeight = newImage.height;
      this.imageConfig.playerSprite.frameWidth = this.spriteFrameWidth;
      
      console.log("Player animated sprite loaded successfully");
      this.render(); // Re-render with new sprite
    };
    newImage.onerror = () => {
      console.error('Failed to load custom player animated sprite:', imageSrc);
      this.imagesLoaded.playerSprite = false;
      
      // Fallback to static image
      console.log("Falling back to static player image");
    };
    newImage.src = imageSrc;
  }
  
  // Set background image
  setBackgroundImage(imageSrc: string, width?: number, height?: number) {
    console.log("Setting background image:", imageSrc);
    this.imageConfig.background.src = imageSrc;
    if (width) this.imageConfig.background.width = width;
    if (height) this.imageConfig.background.height = height;
    
    // Reset loaded state
    this.imagesLoaded.background = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.backgroundImage = newImage;
      this.imagesLoaded.background = true;
      console.log("Background image loaded successfully");
      this.render(); // Re-render with new background
    };
    newImage.onerror = () => {
      console.error('Failed to load custom background image:', imageSrc);
      this.imagesLoaded.background = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/sidescrollerbg.webp';
      fallbackImage.onload = () => {
        this.backgroundImage = fallbackImage;
        this.imagesLoaded.background = true;
        console.log("Background fallback image loaded");
        this.render(); // Re-render once fallback is loaded
      };
    };
    newImage.src = imageSrc;
  }
  
  // Set obstacle image
  setObstacleImage(imageSrc: string, width?: number, height?: number) {
    this.imageConfig.obstacle.src = imageSrc;
    if (width) this.imageConfig.obstacle.width = width;
    if (height) this.imageConfig.obstacle.height = height;
    
    // Reset loaded state
    this.imagesLoaded.obstacle = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.obstacleImage = newImage;
      this.imagesLoaded.obstacle = true;
    };
    newImage.onerror = () => {
      console.error('Failed to load custom obstacle image:', imageSrc);
      this.imagesLoaded.obstacle = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.obstacleImage = fallbackImage;
        this.imagesLoaded.obstacle = true;
      };
    };
    newImage.src = imageSrc;
  }
  
  // Set enemy image
  setEnemyImage(imageSrc: string, width?: number, height?: number) {
    this.imageConfig.enemy.src = imageSrc;
    if (width) this.imageConfig.enemy.width = width;
    if (height) this.imageConfig.enemy.height = height;
    
    // Reset loaded state
    this.imagesLoaded.enemy = false;
    
    // Create new image with error handling
    const newImage = new Image();
    newImage.onload = () => {
      this.enemyImage = newImage;
      this.imagesLoaded.enemy = true;
    };
    newImage.onerror = () => {
      console.error('Failed to load custom enemy image:', imageSrc);
      this.imagesLoaded.enemy = false;
      
      // Try to load fallback image
      const fallbackImage = new Image();
      fallbackImage.src = '/assets/Icons/illuminati.webp';
      fallbackImage.onload = () => {
        this.enemyImage = fallbackImage;
        this.imagesLoaded.enemy = true;
      };
    };
    newImage.src = imageSrc;
  }
  
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
  reset(upgrades = { speed: 1, fireRate: 1, health: 1 }) {
    this.player = {
      x: 100,
      y: 200,
      width: this.imageConfig.player.width,
      height: this.imageConfig.player.height,
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
    this.startTime = Date.now();
<<<<<<< HEAD
    
    // Reset background scroll position
    this.backgroundScrollX = 0;
=======
    
    // Reset animation
    this.animationFrame = 0;
    this.lastAnimationFrameTime = 0;
    
    // Reset background scroll position
    this.backgroundScrollX = 0;
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
  }
  
  update(delta: number, input: { left: boolean, right: boolean }) {
    if (!this.canvas || !this.context) return this.getGameState();
    
    // Calculate game time if game is not over
    if (!this.gameOver) {
      this.gameTime = Date.now() - this.startTime;
    }
    
    // Update animation frame
    const now = Date.now();
    if (this.spriteAnimationRunning && now - this.lastAnimationFrameTime > 100) { // Frame duration in ms
      this.animationFrame = (this.animationFrame + 1) % this.spriteTotalFrames;
      this.lastAnimationFrameTime = now;
    }
    
    // Apply upgrades
    const speedMultiplier = this.upgrades.speed;
    const fireRateMultiplier = this.upgrades.fireRate;
    const healthMultiplier = this.upgrades.health;
    
    // Update game speed based on score
    this.gameSpeed = 5 + Math.min(10, Math.floor(this.score / 1000));
    
    // Update background scroll position
    this.backgroundScrollX -= this.backgroundScrollSpeed * this.gameSpeed * speedMultiplier * delta * 0.1;
    
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
    if (input.left && now - this.lastShootTime > 500 / fireRateMultiplier) {
      this.bullets.push({
        x: this.player.x + this.player.width,
        y: this.player.y + this.player.height / 2 - this.imageConfig.bullet.height / 2,
        width: this.imageConfig.bullet.width,
        height: this.imageConfig.bullet.height,
        velocityX: 15 * speedMultiplier
      });
      this.lastShootTime = now;
    }
    
    // Generate new obstacles
    if (now - this.lastObstacleTime > 2000 / (1 + this.gameSpeed / 20)) {
      const obstacleHeight = this.imageConfig.obstacle.height;
      this.obstacles.push({
        x: this.canvas.width,
        y: this.canvas.height - obstacleHeight - 20,
        width: this.imageConfig.obstacle.width,
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
        width: this.imageConfig.enemy.width,
        height: this.imageConfig.enemy.height,
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
          y: shooter.y + shooter.height / 2 - this.imageConfig.enemyBullet.height / 2,
          width: this.imageConfig.enemyBullet.width,
          height: this.imageConfig.enemyBullet.height,
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
    
    // Check if game over, save high score
    if (this.gameOver) {
      this.saveGameResults();
    }
    
    return this.getGameState();
  }
  
  renderStartScreen() {
    if (!this.canvas || !this.context) return;
    
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
<<<<<<< HEAD
    try {
      // Draw static background
      if (this.backgroundImage && this.imagesLoaded.background) {
        try {
          // Draw background to fit canvas
          ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        } catch (error) {
          console.error('Error drawing background:', error);
          // Fallback
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        // Fallback if image is not loaded
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }
      
      // Draw floor
      if (this.floorImage && this.imagesLoaded.floor) {
        try {
          ctx.drawImage(this.floorImage, 0, height - 20, width, 20);
        } catch (error) {
          console.error('Error drawing floor:', error);
          // Fallback
          ctx.fillStyle = '#444444';
          ctx.fillRect(0, height - 20, width, 20);
        }
      } else {
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, height - 20, width, 20);
      }
      
      // Draw the player in a static position
      if (this.playerImage && this.imagesLoaded.player) {
        try {
          ctx.drawImage(
            this.playerImage, 
            100, // Fixed x position 
            height - this.player.height - 20, // On the ground
            this.player.width, 
            this.player.height
          );
        } catch (error) {
          console.error('Error drawing player:', error);
          // Fallback
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(100, height - this.player.height - 20, this.player.width, this.player.height);
        }
      }
      
      // Draw start game text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('REPTILIAN ATTACK', width / 2, height / 2 - 30);
      
      // Shadow for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(width / 2 - 200, height / 2 + 10, 400, 60);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText('Connect wallet & click START GAME', width / 2, height / 2 + 50);
      
      // Add illuminati enemy for show
      if (this.enemyImage && this.imagesLoaded.enemy) {
        try {
          ctx.drawImage(
            this.enemyImage, 
            width - 100, 
            height / 2 - 100, 
            this.imageConfig.enemy.width, 
            this.imageConfig.enemy.height
          );
        } catch (error) {
          console.error('Error drawing enemy:', error);
        }
      }
    } catch (error) {
      console.error('General rendering error:', error);
      // If all else fails, at least show something
      ctx.fillStyle = '#FF0000';
      ctx.font = '24px Arial';
      ctx.fillText('Rendering Error - Check Console', width / 2 - 150, height / 2);
=======
    try {
      // Draw static background
      if (this.backgroundImage && this.imagesLoaded.background) {
        try {
          // Draw background to fit canvas
          ctx.drawImage(this.backgroundImage, 0, 0, width, height);
        } catch (error) {
          console.error('Error drawing background:', error);
          // Fallback
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        // Fallback if image is not loaded
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }
      
      // Draw floor
      if (this.floorImage && this.imagesLoaded.floor) {
        try {
          ctx.drawImage(this.floorImage, 0, height - 20, width, 20);
        } catch (error) {
          console.error('Error drawing floor:', error);
          // Fallback
          ctx.fillStyle = '#444444';
          ctx.fillRect(0, height - 20, width, 20);
        }
      } else {
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, height - 20, width, 20);
      }
      
      // Draw the player in a static position - use sprite sheet but with a single frame
      if (this.playerSpriteSheet && this.imagesLoaded.playerSprite) {
        try {
          // Use first frame of the sprite (paused state)
          ctx.drawImage(
            this.playerSpriteSheet, 
            0, // First frame x
            0, // First frame y
            this.spriteFrameWidth, 
            this.spriteFrameHeight,
            100, // Position on canvas x
            height - this.spriteFrameHeight - 20, // Position on canvas y
            this.imageConfig.playerSprite.width, 
            this.imageConfig.playerSprite.height
          );
        } catch (error) {
          console.error('Error drawing player sprite:', error);
          // Fallback to static image
          if (this.playerImage && this.imagesLoaded.player) {
            ctx.drawImage(
              this.playerImage, 
              100, 
              height - this.imageConfig.player.height - 20, 
              this.imageConfig.player.width, 
              this.imageConfig.player.height
            );
          } else {
            // Last resort fallback
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(100, height - 70 - 20, 50, 70);
          }
        }
      } else if (this.playerImage && this.imagesLoaded.player) {
        // Fallback to static image
        ctx.drawImage(
          this.playerImage, 
          100, 
          height - this.imageConfig.player.height - 20, 
          this.imageConfig.player.width, 
          this.imageConfig.player.height
        );
      } else {
        // Last resort fallback
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(100, height - 70 - 20, 50, 70);
      }
      
      // Draw start game text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('REPTILIAN ATTACK', width / 2, height / 2 - 30);
      
      // Shadow for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(width / 2 - 200, height / 2 + 10, 400, 60);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText('Connect wallet & click START GAME', width / 2, height / 2 + 50);
      
      // Add illuminati enemy for show
      if (this.enemyImage && this.imagesLoaded.enemy) {
        try {
          ctx.drawImage(
            this.enemyImage, 
            width - 100, 
            height / 2 - 100, 
            this.imageConfig.enemy.width, 
            this.imageConfig.enemy.height
          );
        } catch (error) {
          console.error('Error drawing enemy:', error);
        }
      }
    } catch (error) {
      console.error('General rendering error:', error);
      // If all else fails, at least show something
      ctx.fillStyle = '#FF0000';
      ctx.font = '24px Arial';
      ctx.fillText('Rendering Error - Check Console', width / 2 - 150, height / 2);
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
    }
  }
  
  render() {
    if (!this.canvas || !this.context) return;
    
    const ctx = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    try {
      // Draw scrolling background
      if (this.backgroundImage && this.imagesLoaded.background) {
        try {
          // Calculate the size needed to cover the canvas
          const bgWidth = Math.max(width, this.backgroundImage.width);
          
          // Draw two copies of the background side by side
          const x1 = Math.floor(this.backgroundScrollX % bgWidth);
          ctx.drawImage(this.backgroundImage, x1, 0, bgWidth, height);
          
          // Draw second copy to cover the gap when the first one moves out
          if (x1 < 0) {
            ctx.drawImage(this.backgroundImage, x1 + bgWidth, 0, bgWidth, height);
          } else if (x1 + bgWidth < width) {
            ctx.drawImage(this.backgroundImage, x1 - bgWidth, 0, bgWidth, height);
          }
        } catch (error) {
          console.error('Error drawing background:', error);
          // Fallback
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        // Fallback if image is not loaded
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
      }
      
      // Draw floor
      if (this.floorImage && this.imagesLoaded.floor) {
        try {
          ctx.drawImage(this.floorImage, 0, height - 20, width, 20);
        } catch (error) {
          console.error('Error drawing floor:', error);
          // Fallback
          ctx.fillStyle = '#444444';
          ctx.fillRect(0, height - 20, width, 20);
        }
      } else {
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, height - 20, width, 20);
      }
      
<<<<<<< HEAD
      // Draw player
      if (this.playerImage && this.imagesLoaded.player) {
        try {
          ctx.drawImage(this.playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
        } catch (error) {
          console.error('Error drawing player:', error);
          // Fallback
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        }
      } else {
        // Fallback if image is not loaded
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }
      
      // Draw obstacles
      this.obstacles.forEach(obstacle => {
        if (!obstacle.hit) {
          if (this.obstacleImage && this.imagesLoaded.obstacle) {
            try {
              ctx.drawImage(this.obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } catch (error) {
              console.error('Error drawing obstacle:', error);
              // Fallback
              ctx.fillStyle = '#FF0000';
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
          } else {
            // Fallback if image is not loaded
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          }
        }
      });
      
      // Draw enemies
      this.enemies.forEach(enemy => {
        if (!enemy.hit) {
          if (this.enemyImage && this.imagesLoaded.enemy) {
            try {
              ctx.drawImage(this.enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
            } catch (error) {
              console.error('Error drawing enemy:', error);
              // Fallback
              ctx.fillStyle = '#FF00FF';
              ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
          } else {
            // Fallback if image is not loaded
            ctx.fillStyle = '#FF00FF';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
          }
        }
      });
      
      // Draw player bullets
      this.bullets.forEach(bullet => {
        if (this.bulletImage && this.imagesLoaded.bullet) {
          try {
            ctx.drawImage(this.bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
          } catch (error) {
            console.error('Error drawing bullet:', error);
            // Fallback
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
          }
        } else {
          // Fallback if image is not loaded
          ctx.fillStyle = '#FFFF00';
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
      });
      
      // Draw enemy bullets
      this.enemyBullets.forEach(bullet => {
        if (this.enemyBulletImage && this.imagesLoaded.enemyBullet) {
          try {
            ctx.drawImage(this.enemyBulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
          } catch (error) {
            console.error('Error drawing enemy bullet:', error);
            // Fallback
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
          }
        } else {
          // Fallback if image is not loaded
          ctx.fillStyle = '#FF6600';
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
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
    } catch (error) {
      console.error('General rendering error:', error);
      // If all else fails, at least show something
      ctx.fillStyle = '#FF0000';
=======
      // Draw player - use sprite sheet if available and animated, otherwise use static image
      if (this.playerSpriteSheet && this.imagesLoaded.playerSprite) {
        try {
          // If animation is running, use the current frame from the sprite sheet
          // Otherwise, use the first frame (static pose)
          const frameX = this.spriteAnimationRunning ? this.animationFrame * this.spriteFrameWidth : 0;
          
          ctx.drawImage(
            this.playerSpriteSheet, 
            frameX, // Current frame x
            0, // Current frame y (vertical sprite sheets would need to adjust this)
            this.spriteFrameWidth, 
            this.spriteFrameHeight,
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
          );
        } catch (error) {
          console.error('Error drawing player sprite:', error);
          // Fallback to static image
          if (this.playerImage && this.imagesLoaded.player) {
            ctx.drawImage(this.playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
          } else {
            // Last resort fallback
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
          }
        }
      } else if (this.playerImage && this.imagesLoaded.player) {
        // Fallback to static image
        ctx.drawImage(this.playerImage, this.player.x, this.player.y, this.player.width, this.player.height);
      } else {
        // Last resort fallback
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }
      
      // Draw obstacles
      this.obstacles.forEach(obstacle => {
        if (!obstacle.hit) {
          if (this.obstacleImage && this.imagesLoaded.obstacle) {
            try {
              ctx.drawImage(this.obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } catch (error) {
              console.error('Error drawing obstacle:', error);
              // Fallback
              ctx.fillStyle = '#FF0000';
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
          } else {
            // Fallback if image is not loaded
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          }
        }
      });
      
      // Draw enemies
      this.enemies.forEach(enemy => {
        if (!enemy.hit) {
          if (this.enemyImage && this.imagesLoaded.enemy) {
            try {
              ctx.drawImage(this.enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
            } catch (error) {
              console.error('Error drawing enemy:', error);
              // Fallback
              ctx.fillStyle = '#FF00FF';
              ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
          } else {
            // Fallback if image is not loaded
            ctx.fillStyle = '#FF00FF';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
          }
        }
      });
      
      // Draw player bullets
      this.bullets.forEach(bullet => {
        if (this.bulletImage && this.imagesLoaded.bullet) {
          try {
            ctx.drawImage(this.bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
          } catch (error) {
            console.error('Error drawing bullet:', error);
            // Fallback
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
          }
        } else {
          // Fallback if image is not loaded
          ctx.fillStyle = '#FFFF00';
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
      });
      
      // Draw enemy bullets
      this.enemyBullets.forEach(bullet => {
        if (this.enemyBulletImage && this.imagesLoaded.enemyBullet) {
          try {
            ctx.drawImage(this.enemyBulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
          } catch (error) {
            console.error('Error drawing enemy bullet:', error);
            // Fallback
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
          }
        } else {
          // Fallback if image is not loaded
          ctx.fillStyle = '#FF6600';
          ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
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
    } catch (error) {
      console.error('General rendering error:', error);
      // If all else fails, at least show something
      ctx.fillStyle = '#FF0000';
>>>>>>> c380a87dc1e5bdb2ea6cac5411046f076c0c9968
      ctx.font = '24px Arial';
      ctx.fillText('Rendering Error - Check Console', width / 2 - 150, height / 2);
    }
  }
  
  getGameState() {
    return {
      score: this.score,
      lives: this.lives,
      health: this.health,
      thcEarned: this.thcEarned,
      gameOver: this.gameOver,
      gameTime: this.gameTime
    };
  }
  
  getUpgradePrices() {
    return {
      speed: {
        name: "Speed Upgrade",
        description: "Increases movement and attack speed",
        price: 20 * this.upgrades.speed
      },
      fireRate: {
        name: "Fire Rate Upgrade",
        description: "Shoot faster and more bullets",
        price: 15 * this.upgrades.fireRate
      },
      health: {
        name: "Health Upgrade",
        description: "Reduces damage taken from enemies",
        price: 25 * this.upgrades.health
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
    
    // Only save if we have a time and it's better (lower) than current best
    if (newTimeSeconds > 0 && (currentBestTimeSeconds === 0 || newTimeSeconds > currentBestTimeSeconds)) {
      localStorage.setItem('reptilian-best-time', formattedTime);
    }
    
    // Save THC earned this game
    const totalTHCEarned = parseFloat(localStorage.getItem('reptilian-total-thc') || '0');
    localStorage.setItem('reptilian-total-thc', (totalTHCEarned + this.thcEarned).toString());
    
    // Save total games played
    const gamesPlayed = parseInt(localStorage.getItem('reptilian-games-played') || '0', 10);
    localStorage.setItem('reptilian-games-played', (gamesPlayed + 1).toString());
  }
}

export default ReptilianAttackEngine;
