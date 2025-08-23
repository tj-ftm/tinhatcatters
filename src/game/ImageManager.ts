
import { ImageConfig } from './types';

export class ImageManager {
  private images: { [key: string]: HTMLImageElement } = {};
  private videos: { [key: string]: HTMLVideoElement } = {};
  private imagesLoaded: { [key: string]: boolean } = {};
  
  private imageConfig: ImageConfig = {
    playerIdle: {
      src: '/assets/Icons/playersprite.webm',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical',
      animated: true,
      isVideo: true
    },
    playerRun: {
      src: '/assets/Icons/playersprite.webm',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical',
      animated: true,
      isVideo: true
    },
    playerJump: {
      src: '/assets/Icons/player_jump.webm',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical',
      animated: true,
      isVideo: true
    },
    playerThrow: {
      src: '/assets/Icons/player_throw.webm',
      width: 64,
      height: 64,
      frames: 8,
      orientation: 'vertical',
      animated: true,
      isVideo: true
    },
    background: {
      src: '/assets/Icons/sidescrollerbgweed-min.png',
      width: 800,
      height: 400
    },
    enemyRun: {
      src: '/assets/Icons/Reptile_running.webm',
      width: 129,
      height: 150,
      frames: 8,
      animated: true,
      isVideo: true
    },
    enemyJump: {
      src: '/assets/Icons/reptile_jump.webm',
      width: 129,
      height: 150,
      frames: 8,
      animated: true,
      isVideo: true
    },
    enemyFire: {
      src: '/assets/Icons/reptile_jump.webm',
      width: 129,
      height: 150,
      frames: 8,
      animated: true,
      isVideo: true
    },
    enemyExplosion: {
      src: '/assets/Icons/reptile_explosion.webm',
      width: 129,
      height: 150,
      frames: 8,
      animated: true,
      isVideo: true
    },
    bullet: {
      src: '/assets/Icons/icecreamcone.svg',
      width: 20,
      height: 10
    },
    enemyBullet: {
      src: '/assets/Icons/icecreamcone.svg',
      width: 20,
      height: 10
    },
    floor: {
      src: '/assets/Icons/floor.png',
      width: 800,
      height: 40
    },
    grass: {
      src: '/assets/Icons/grass.png',
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
    // Load player sprites conditionally
    if (this.imageConfig.playerIdle.isVideo) {
      this.loadPlayerVideo('playerIdle', this.imageConfig.playerIdle.src);
    } else {
      this.loadImage('playerIdle', this.imageConfig.playerIdle.src);
    }
    
    if (this.imageConfig.playerRun.isVideo) {
      this.loadPlayerVideo('playerRun', this.imageConfig.playerRun.src);
    } else {
      this.loadImage('playerRun', this.imageConfig.playerRun.src);
    }
    
    if (this.imageConfig.playerJump.isVideo) {
      this.loadPlayerVideo('playerJump', this.imageConfig.playerJump.src);
    } else {
      this.loadImage('playerJump', this.imageConfig.playerJump.src);
    }
    
    if (this.imageConfig.playerThrow.isVideo) {
      this.loadPlayerVideo('playerThrow', this.imageConfig.playerThrow.src);
    } else {
      this.loadImage('playerThrow', this.imageConfig.playerThrow.src);
    }
    
    // Load environment
    this.loadImage('background', this.imageConfig.background.src);
    this.loadImage('floor', this.imageConfig.floor.src);
    this.loadImage('grass', this.imageConfig.grass.src);
    
    // Load enemy sprites conditionally
    if (this.imageConfig.enemyRun.isVideo) {
      this.loadPlayerVideo('enemyRun', this.imageConfig.enemyRun.src);
    } else {
      this.loadImage('enemyRun', this.imageConfig.enemyRun.src);
    }
    
    if (this.imageConfig.enemyJump.isVideo) {
      this.loadPlayerVideo('enemyJump', this.imageConfig.enemyJump.src);
    } else {
      this.loadImage('enemyJump', this.imageConfig.enemyJump.src);
    }
    
    if (this.imageConfig.enemyFire.isVideo) {
      this.loadPlayerVideo('enemyFire', this.imageConfig.enemyFire.src);
    } else {
      this.loadImage('enemyFire', this.imageConfig.enemyFire.src);
    }
    
    if (this.imageConfig.enemyExplosion.isVideo) {
      this.loadPlayerVideo('enemyExplosion', this.imageConfig.enemyExplosion.src);
    } else {
      this.loadImage('enemyExplosion', this.imageConfig.enemyExplosion.src);
    }
    
    // Load bullets
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
    
    // Don't set crossOrigin for GIFs as it can cause transparency issues
    // Let the browser handle GIF animation naturally
    
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

  getImage(key: string): HTMLImageElement | null {
    return this.images[key] || null;
  }

  getVideo(key: string): HTMLVideoElement | null {
    return this.videos[key] || null;
  }

  isLoaded(key: string): boolean {
    return this.imagesLoaded[key] === true;
  }

  getConfig(): ImageConfig {
    return this.imageConfig;
  }
}
