
import { ImageConfig } from './types';

export class ImageManager {
  private images: { [key: string]: HTMLImageElement } = {};
  private videos: { [key: string]: HTMLVideoElement } = {};
  private imagesLoaded: { [key: string]: boolean } = {};
  
  private imageConfig: ImageConfig = {
    playerIdle: {
      src: '/assets/Icons/playersprite.gif',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical'
    },
    playerRun: {
      src: '/assets/Icons/playersprite.gif',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical'
    },
    playerJump: {
      src: '/assets/Icons/playersprite.gif',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical'
    },
    background: {
      src: '/assets/Icons/sidescrollerbgweed-min.png',
      width: 800,
      height: 400
    },
    enemyRun: {
      src: '/assets/Icons/barrier.gif',
      width: 129,
      height: 150,
      frames: 4
    },
    enemyJump: {
      src: '/assets/Icons/barrier.gif',
      width: 129,
      height: 150,
      frames: 4
    },
    enemyFire: {
      src: '/assets/Icons/barrier.gif',
      width: 129,
      height: 150,
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
    // Load player sprites as videos to maintain animation
    this.loadPlayerVideo('playerIdle', this.imageConfig.playerIdle.src);
    this.loadPlayerVideo('playerRun', this.imageConfig.playerRun.src);
    this.loadPlayerVideo('playerJump', this.imageConfig.playerJump.src);
    
    // Load environment
    this.loadImage('background', this.imageConfig.background.src);
    this.loadImage('floor', this.imageConfig.floor.src);
    
    // Load enemy sprites as videos to maintain animation
    this.loadPlayerVideo('enemyRun', this.imageConfig.enemyRun.src);
    this.loadPlayerVideo('enemyJump', this.imageConfig.enemyJump.src);
    this.loadPlayerVideo('enemyFire', this.imageConfig.enemyFire.src);
    
    // Load projectiles
    this.loadImage('bullet', this.imageConfig.bullet.src);
    this.loadImage('enemyBullet', this.imageConfig.enemyBullet.src);
    
    // Load intro video
    this.loadIntroVideo();
  }

  private loadPlayerVideo(key: string, src: string) {
    console.log(`Loading player video: ${key} from ${src}`);
    const video = document.createElement('video');
    video.onloadeddata = () => {
      this.imagesLoaded[key] = true;
      console.log(`${key} video loaded successfully`);
      this.onRender?.();
    };
    video.onerror = (error) => {
      console.error(`Failed to load ${key} video:`, src, error);
      this.imagesLoaded[key] = false;
    };
    video.src = src;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.play().catch(console.error);
    this.videos[key] = video;
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

  private loadIntroVideo() {
    const video = document.createElement('video');
    video.onloadeddata = () => {
      this.imagesLoaded.introVideo = true;
      console.log("Intro video loaded successfully");
      this.onRender?.();
    };
    video.onerror = () => {
      console.error('Failed to load intro video');
      this.imagesLoaded.introVideo = false;
    };
    video.src = this.imageConfig.introVideo.src;
    video.loop = true;
    video.muted = true;
    this.videos.introVideo = video;
  }

  getImage(key: string): HTMLImageElement | HTMLVideoElement | null {
    return this.images[key] || this.videos[key] || null;
  }

  getVideo(key: string = 'introVideo'): HTMLVideoElement | null {
    return this.videos[key] || null;
  }

  isLoaded(key: string): boolean {
    return this.imagesLoaded[key] === true;
  }

  getConfig(): ImageConfig {
    return this.imageConfig;
  }
}
