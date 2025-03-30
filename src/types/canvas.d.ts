
import { Plant } from './growRoom';

// Plant position type
export interface PlantPosition {
  x: number;
  y: number;
  size: number;
}

// Plant with position information
export interface PlantWithPosition extends Plant {
  position: PlantPosition;
}

// Canvas assets loaded in the global scope
declare global {
  interface Window {
    __plantCanvasAssets?: {
      [key: string]: HTMLImageElement;
      lightImage?: HTMLImageElement;
      potImage?: HTMLImageElement;
      nutrientsImage?: HTMLImageElement;
      ventImage?: HTMLImageElement;
      autoImage?: HTMLImageElement;
      floorImage?: HTMLImageElement;
    };
    __harvestButtonBounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
      plantId: number;
    };
  }
}
