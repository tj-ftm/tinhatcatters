
export class AnimationManager {
  private animationFrame: number = 0;
  private lastAnimationFrameTime: number = 0;
  private isRunning: boolean = false;

  update() {
    const now = Date.now();
    if (this.isRunning && now - this.lastAnimationFrameTime > 125) {
      this.animationFrame = (this.animationFrame + 1) % 8;
      this.lastAnimationFrameTime = now;
    }
  }

  setRunning(running: boolean) {
    this.isRunning = running;
    if (!running) {
      this.animationFrame = 0;
      this.lastAnimationFrameTime = 0;
    }
  }

  getCurrentFrame(): number {
    return this.isRunning ? this.animationFrame : 0;
  }

  reset() {
    this.animationFrame = 0;
    this.lastAnimationFrameTime = 0;
  }
}
