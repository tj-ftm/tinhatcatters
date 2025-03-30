
import React from 'react';
import { GrowthStage, Plant } from '@/types/growRoom';
import { createPlantSVGAnimation } from '@/utils/plantAnimations';

interface PlantRenderProps {
  ctx: CanvasRenderingContext2D;
  plant: Plant;
  x: number;
  y: number;
  size: number;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  getGrowthColor: (stage: GrowthStage) => string;
}

export const renderPlant = ({
  ctx,
  plant,
  x,
  y,
  size,
  index,
  isHovered,
  isSelected,
  getGrowthColor
}: PlantRenderProps) => {
  // Draw highlight for hovered/selected plant
  if (isHovered || isSelected) {
    ctx.fillStyle = isSelected ? 'rgba(255, 255, 100, 0.3)' : 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y + size/2, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw pot
  if (ctx.canvas && window.__plantCanvasAssets?.potImage) {
    ctx.drawImage(window.__plantCanvasAssets.potImage, x - size/3, y + size/2, size*2/3, size/2);
  }
  
  // Get color based on growth stage
  const color = getGrowthColor(plant.stage).replace('bg-', '');
  const stageColors = {
    'yellow-600': '#ca8a04',
    'green-300': '#86efac',
    'green-500': '#22c55e',
    'purple-500': '#a855f7',
    'pink-600': '#db2777',
    'gray-400': '#9ca3af'
  };
  
  // Set fill color based on stage
  ctx.fillStyle = stageColors[color as keyof typeof stageColors] || '#22c55e';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  
  // Draw plant SVG path
  const svgPath = createPlantSVGAnimation(plant.stage, plant.progress);
  const path = new Path2D(svgPath);
  
  // Scale and position the path
  ctx.save();
  ctx.translate(x, y - size/2);
  ctx.scale(size/20, size/20);
  
  ctx.fill(path);
  ctx.stroke(path);
  ctx.restore();
  
  // Draw progress indicator
  const progressWidth = 40;
  const progressHeight = 6;
  const progressX = x - progressWidth/2;
  const progressY = y + size - 10;
  
  // Draw progress background
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
  
  // Draw progress bar
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(progressX, progressY, progressWidth * (plant.progress / 100), progressHeight);
  
  // Draw border
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.strokeRect(progressX, progressY, progressWidth, progressHeight);
  
  // For harvest-ready plants, add a visual indicator
  if (plant.stage === GrowthStage.Harvest) {
    // Add sparkle effect
    const now = Date.now();
    const sparkleSize = 5 + Math.sin(now / 200) * 2;
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    // Draw a star shape
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const innerAngle = angle + Math.PI / 5;
      
      if (i === 0) {
        ctx.moveTo(x + Math.cos(angle) * sparkleSize * 2, y - size/2 + Math.sin(angle) * sparkleSize * 2);
      } else {
        ctx.lineTo(x + Math.cos(angle) * sparkleSize * 2, y - size/2 + Math.sin(angle) * sparkleSize * 2);
      }
      
      ctx.lineTo(
        x + Math.cos(innerAngle) * sparkleSize, 
        y - size/2 + Math.sin(innerAngle) * sparkleSize
      );
    }
    
    ctx.closePath();
    ctx.fill();
  }
};

// Get plant name based on stage
export const getPlantStageName = (stage: GrowthStage): string => {
  switch (stage) {
    case GrowthStage.Seed: return 'Seed';
    case GrowthStage.Sprout: return 'Sprout';
    case GrowthStage.Vegetative: return 'Vegetative';
    case GrowthStage.Flowering: return 'Flowering';
    case GrowthStage.Harvest: return 'Ready to Harvest!';
    default: return 'Plant';
  }
};

// Draw selected plant details panel
export const drawSelectedPlantDetails = (
  ctx: CanvasRenderingContext2D, 
  plant: Plant,
  canvas: HTMLCanvasElement,
  speedMultiplier: number
) => {
  // Draw details panel at the bottom
  const panelHeight = 80;
  const panelY = canvas.height - panelHeight;
  
  // Draw panel background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, panelY, canvas.width, panelHeight);
  
  // Draw border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, panelY, canvas.width, panelHeight);
  
  // Draw plant details
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  
  const stageName = getPlantStageName(plant.stage);
  ctx.fillText(`Stage: ${stageName}`, 20, panelY + 20);
  ctx.fillText(`Progress: ${Math.floor(plant.progress)}%`, 20, panelY + 40);
  ctx.fillText(`Growth Speed: ${speedMultiplier.toFixed(1)}x`, 20, panelY + 60);
  
  // Draw harvest button if ready
  if (plant.stage === GrowthStage.Harvest) {
    const buttonWidth = 100;
    const buttonHeight = 30;
    const buttonX = canvas.width - buttonWidth - 20;
    const buttonY = panelY + panelHeight/2 - buttonHeight/2;
    
    // Draw button background
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button border
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Draw button text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HARVEST', buttonX + buttonWidth/2, buttonY + buttonHeight/2 + 5);
    
    // Store button position for click handling
    (window as any).__harvestButtonBounds = {
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      plantId: plant.id
    };
  } else {
    // Clear harvest button bounds
    delete (window as any).__harvestButtonBounds;
  }
};
