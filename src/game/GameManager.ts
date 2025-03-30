
import Phaser from 'phaser';
import { GAME_CONFIG } from './config';
import BootScene from './BootScene';
import GameScene from './GameScene';

export default class GameManager {
  private game: Phaser.Game | null = null;
  private snacks: any[] = [];
  private selectedPet: any | null = null;
  
  constructor() {}
  
  initialize(containerId: string): void {
    if (this.game) {
      return;
    }
    
    // Create game configuration with the container ID
    const config = {
      ...GAME_CONFIG,
      parent: containerId
    };
    
    // Create the Phaser game instance
    this.game = new Phaser.Game(config);
    
    // Add scenes
    this.game.scene.add('BootScene', BootScene);
    this.game.scene.add('GameScene', GameScene);
    
    // Start the boot scene
    this.game.scene.start('BootScene');
  }
  
  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }
  
  pause(): void {
    if (this.game) {
      this.game.scene.pause('GameScene');
    }
  }
  
  resume(): void {
    if (this.game) {
      this.game.scene.resume('GameScene');
    }
  }
  
  restart(): void {
    if (this.game) {
      this.game.scene.start('BootScene');
    }
  }
  
  setSnacks(snacks: any[]): void {
    this.snacks = snacks;
    // Update game scene with new snacks (if it exists)
    const gameScene = this.game?.scene.getScene('GameScene') as GameScene;
    if (gameScene) {
      // Update snacks in the game
      console.log('Setting snacks in game:', snacks);
    }
  }
  
  setPet(pet: any): void {
    this.selectedPet = pet;
    // Update game scene with new pet (if it exists)
    const gameScene = this.game?.scene.getScene('GameScene') as GameScene;
    if (gameScene) {
      // Update pet in the game
      console.log('Setting pet in game:', pet);
    }
  }
  
  useSnack(snackId: string): boolean {
    const snack = this.snacks.find(s => s.id === snackId);
    if (!snack) {
      return false;
    }
    
    // Apply snack effect in the game
    const gameScene = this.game?.scene.getScene('GameScene') as GameScene;
    if (gameScene && snack.boost) {
      try {
        gameScene.applyBoost(
          snack.boost.type, 
          snack.boost.value, 
          snack.boost.duration * 1000
        );
        return true;
      } catch (error) {
        console.error('Error applying boost:', error);
        return false;
      }
    }
    
    return false;
  }
  
  // Added method to access the game instance for GameUI
  getGame(): Phaser.Game | null {
    return this.game;
  }
  
  // Helper method to preload image and check validity
  preloadImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
}
