
import { ImageConfig } from './types';

export class ImageManager {
  private images: { [key: string]: HTMLImageElement } = {};
  private video: HTMLVideoElement | null = null;
  private imagesLoaded: { [key: string]: boolean } = {};
  
  private imageConfig: ImageConfig = {
    playerIdle: {
<<<<<<< HEAD
      src: '/assets/Icons/playeridle.gif',
      width: 70,
      height: 90,
      frames: 1
=======
      src: '/assets/Icons/playersprite.gif',
      width: 64,
      height: 64,
      frames: 4
>>>>>>> b938fc361d5c4feef8a16e57c68d1d00f04a981f
    },
    playerRun: {
      src: '/assets/Icons/playersprite.gif',
<<<<<<< HEAD
      width: 70,
      height: 90,
      frames: 1
=======
      width: 64,
      height: 64,
      frames: 4
>>>>>>> b938fc361d5c4feef8a16e57c68d1d00f04a981f
    },
    playerJump: {
      src: '/assets/Icons/playersprite.gif',
<<<<<<< HEAD
      width: 70,
      height: 90,
      frames: 1
=======
      width: 64,
      height: 64,
      frames: 4
>>>>>>> b938fc361d5c4feef8a16e57c68d1d00f04a981f
    },
    background: {
      src: '/assets/Icons/sidescrollerbgweed-min.png',
      width: 800,
      height: 400
    },
    enemyRun: {
      src: '/assets/Icons/barrier.gif',
      width: 60,
      height: 60,
      frames: 4
    },
    enemyJump: {
      src: '/assets/Icons/barrier.gif',
      width: 60,
      height: 60,
      frames: 4
    },
    enemyFire: {
      src: '/assets/Icons/barrier.gif',
      width: 60,
      height: 60,
      frames: 4
    },
    bullet: {
      src: '/assets/Icons/icecreamcone.png',
      width: 20,
      height: 10
    },
    enemyBullet: {
      src: '/assets/Icons/icecreamcone.png',
      width: 20,
      height: 10
    },
    floor: {
      src: '/assets/Icons/floor.png',
      width: 800,
      height: 40
    },
    introVideo: {
      src: '/assets/game/reptilianrun.mp4',
      width: 400,
      height: 200
    }
  };

  constructor(private onRender?: () => void) {
    this.loadAllImages();
  }

  private loadAllImages() {
    // Load player sprites
    this.loadImage('playerIdle', this.imageConfig.playerIdle.src);
    this.loadImage('playerRun', this.imageConfig.playerRun.src);
    this.loadImage('playerJump', this.imageConfig.playerJump.src);
    
    // Load environment
    this.loadImage('background', this.imageConfig.background.src);
    this.loadImage('floor', this.imageConfig.floor.src);
    
    // Load enemy sprites
    this.loadImage('enemyRun', this.imageConfig.enemyRun.src);
    this.loadImage('enemyJump', this.imageConfig.enemyJump.src);
    this.loadImage('enemyFire', this.imageConfig.enemyFire.src);
    
    // Load projectiles
    this.loadImage('bullet', this.imageConfig.bullet.src);
    this.loadImage('enemyBullet', this.imageConfig.enemyBullet.src);
    
    // Load video
    this.loadVideo();
  }

  private loadImage(key: string, src: string) {
    const img = new Image();
    img.onload = () => {
      this.imagesLoaded[key] = true;
      console.log(`${key} image loaded successfully`);
      this.onRender?.();
    };
    img.onerror = () => {
      console.error(`Failed to load ${key} image:`, src);
      this.imagesLoaded[key] = false;
      // Don't trigger re-render on error to prevent flashing
    };
    img.src = src;
    this.images[key] = img;
  }

  private loadVideo() {
    this.video = document.createElement('video');
    this.video.onloadeddata = () => {
      this.imagesLoaded.introVideo = true;
      console.log("Intro video loaded successfully");
      this.onRender?.();
    };
    this.video.onerror = () => {
      console.error('Failed to load intro video');
      this.imagesLoaded.introVideo = false;
    };
    this.video.src = this.imageConfig.introVideo.src;
    this.video.loop = true;
    this.video.muted = true;
  }

  getImage(key: string): HTMLImageElement | null {
    return this.images[key] || null;
  }

  getVideo(): HTMLVideoElement | null {
    return this.video;
  }

  isLoaded(key: string): boolean {
    return this.imagesLoaded[key] === true;
  }

  getConfig(): ImageConfig {
    return this.imageConfig;
  }
}
