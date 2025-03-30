
import { EquipmentType, Equipment, Plant, GrowthStage } from '@/types/growRoom';
import { equipmentImages, roomBackgroundImage } from './EquipmentRenderer';

// Define a global asset cache for the canvas
declare global {
  interface Window {
    __plantCanvasAssets?: Record<string, HTMLImageElement>;
    __harvestButtonBounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
      plantId: number;
    };
  }
}

// Calculate the position for a plant at a given index
export const calculatePlantPosition = (
  index: number,
  canvas: HTMLCanvasElement,
  plantCapacity: number,
  isMobile: boolean
) => {
  if (!canvas) return { x: 0, y: 0, size: 0 };
  
  const plantSize = isMobile ? 60 : 80;
  const rows = Math.ceil(plantCapacity / 3);
  const cols = Math.min(plantCapacity, 3);
  
  // Calculate grid spacing
  const gridWidth = Math.min(canvas.width - 100, cols * plantSize * 1.5);
  const gridHeight = Math.min(canvas.height - 200, rows * plantSize * 1.5);
  const xOffset = (canvas.width - gridWidth) / 2 + plantSize / 2;
  const yOffset = (canvas.height - gridHeight) / 2 + plantSize / 2 + 40; // Add some top margin
  
  // Calculate row and column for this index
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // Calculate position
  const x = xOffset + col * (gridWidth / (cols - 1 || 1));
  const y = yOffset + row * (gridHeight / (rows - 1 || 1));
  
  return { x, y, size: plantSize };
};

// Calculate growth rate for display
export const calculateGrowthRate = (plant: Plant, equipment: Record<EquipmentType, Equipment>) => {
  // Calculate multipliers based on equipment
  let speedMultiplier = 1;
  
  Object.values(equipment).forEach(item => {
    speedMultiplier *= item.effect.speedBoost;
  });
  
  return speedMultiplier;
};

// Preload all images needed for the canvas
export const preloadCanvasImages = (
  equipment: Record<EquipmentType, Equipment>, 
  callback: () => void
) => {
  const imagesToLoad = [
    roomBackgroundImage,
    // Light images
    equipmentImages[EquipmentType.Light][equipment[EquipmentType.Light].level],
    // Pot images
    equipmentImages[EquipmentType.Pot][equipment[EquipmentType.Pot].level],
    // Nutrients images
    equipmentImages[EquipmentType.Nutrients][equipment[EquipmentType.Nutrients].level],
    // Ventilation images
    equipmentImages[EquipmentType.Ventilation][equipment[EquipmentType.Ventilation].level],
    // Automation images
    equipmentImages[EquipmentType.Automation][equipment[EquipmentType.Automation].level]
  ];
  
  // Initialize the asset cache if needed
  if (!window.__plantCanvasAssets) {
    window.__plantCanvasAssets = {};
  }
  
  let loadedCount = 0;
  imagesToLoad.forEach(src => {
    // Skip already loaded images
    if (window.__plantCanvasAssets?.[src]) {
      loadedCount++;
      if (loadedCount === imagesToLoad.length) {
        callback();
      }
      return;
    }
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      if (window.__plantCanvasAssets) {
        window.__plantCanvasAssets[src] = img;
      }
      
      // Cache specific equipment images with friendly names
      if (src === equipmentImages[EquipmentType.Light][equipment[EquipmentType.Light].level]) {
        window.__plantCanvasAssets!.lightImage = img;
      } else if (src === equipmentImages[EquipmentType.Pot][equipment[EquipmentType.Pot].level]) {
        window.__plantCanvasAssets!.potImage = img;
      } else if (src === equipmentImages[EquipmentType.Nutrients][equipment[EquipmentType.Nutrients].level]) {
        window.__plantCanvasAssets!.nutrientsImage = img;
      } else if (src === equipmentImages[EquipmentType.Ventilation][equipment[EquipmentType.Ventilation].level]) {
        window.__plantCanvasAssets!.ventImage = img;
      } else if (src === equipmentImages[EquipmentType.Automation][equipment[EquipmentType.Automation].level]) {
        window.__plantCanvasAssets!.autoImage = img;
      } else if (src === roomBackgroundImage) {
        window.__plantCanvasAssets!.floorImage = img;
      }
      
      loadedCount++;
      if (loadedCount === imagesToLoad.length) {
        callback();
      }
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      loadedCount++;
      if (loadedCount === imagesToLoad.length) {
        callback();
      }
    };
  });
};

// Handle mouse interactions with canvas elements
export const handleCanvasInteraction = (
  x: number, 
  y: number, 
  plants: Plant[], 
  plantCapacity: number,
  thcAmount: number,
  canvas: HTMLCanvasElement,
  isMobile: boolean,
  plantPositions: {x: number, y: number, size: number}[],
  selectedPlant: number | null,
  setHoveredPlant: (index: number | null) => void,
  setSelectedPlant: (index: number | null) => void,
  onPlantSeed: () => void,
  onHarvestPlant: (plantId: number) => void
) => {
  // Check if mouse is over any plant
  let hoveredIndex = null;
  
  for (let i = 0; i < plants.length; i++) {
    const pos = plantPositions[i];
    if (!pos) continue;
    
    const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
    
    if (distance < pos.size/2) {
      hoveredIndex = i;
      break;
    }
  }
  
  setHoveredPlant(hoveredIndex);
  
  return {
    handleMove: () => {
      // Check if mouse is over empty slot
      if (hoveredIndex === null) {
        for (let i = plants.length; i < plantCapacity; i++) {
          const pos = plantPositions[i];
          if (!pos) continue;
          
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
          
          if (distance < pos.size/2) {
            // Change cursor to pointer
            canvas.style.cursor = 'pointer';
            return;
          }
        }
      } else {
        // Change cursor to pointer when over a plant
        canvas.style.cursor = 'pointer';
        return;
      }
      
      // Check if mouse is over harvest button
      const harvestButtonBounds = window.__harvestButtonBounds;
      if (harvestButtonBounds && 
          x >= harvestButtonBounds.x && 
          x <= harvestButtonBounds.x + harvestButtonBounds.width &&
          y >= harvestButtonBounds.y && 
          y <= harvestButtonBounds.y + harvestButtonBounds.height) {
        canvas.style.cursor = 'pointer';
        return;
      }
      
      // Reset cursor
      canvas.style.cursor = 'default';
    },
    
    handleClick: () => {
      // Check if click is on any plant
      for (let i = 0; i < plants.length; i++) {
        const pos = plantPositions[i];
        if (!pos) continue;
        
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
        
        if (distance < pos.size/2) {
          // Toggle selection
          setSelectedPlant(selectedPlant === i ? null : i);
          return;
        }
      }
      
      // Check if click is on empty slot
      for (let i = plants.length; i < plantCapacity; i++) {
        const pos = plantPositions[i];
        if (!pos) continue;
        
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
        
        if (distance < pos.size/2 && thcAmount >= 0.1) {
          // Plant a seed
          onPlantSeed();
          return;
        }
      }
      
      // Check if click is on harvest button
      const harvestButtonBounds = window.__harvestButtonBounds;
      if (harvestButtonBounds && 
          x >= harvestButtonBounds.x && 
          x <= harvestButtonBounds.x + harvestButtonBounds.width &&
          y >= harvestButtonBounds.y && 
          y <= harvestButtonBounds.y + harvestButtonBounds.height) {
        // Harvest plant
        onHarvestPlant(harvestButtonBounds.plantId);
        setSelectedPlant(null);
        return;
      }
      
      // If clicked elsewhere, deselect
      setSelectedPlant(null);
    }
  };
};
