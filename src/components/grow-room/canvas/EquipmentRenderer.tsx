
import React from 'react';
import { EquipmentType, Equipment } from '@/types/growRoom';

// Equipment images mapping (moved from GrowRoomCanvas)
export const equipmentImages = {
  [EquipmentType.Light]: {
    1: '/assets/Icons/illuminati.webp',
    2: '/assets/Icons/illuminati.webp',
    3: '/assets/Icons/illuminati.webp',
  },
  [EquipmentType.Pot]: {
    1: '/assets/Icons/weed.png', 
    2: '/assets/Icons/weed.png',
    3: '/assets/Icons/weed.png',
  },
  [EquipmentType.Nutrients]: {
    1: '/assets/Icons/illuminati.webp',
    2: '/assets/Icons/illuminati.webp',
    3: '/assets/Icons/illuminati.webp',
  },
  [EquipmentType.Ventilation]: {
    1: '/assets/Icons/illuminati.webp',
    2: '/assets/Icons/illuminati.webp',
    3: '/assets/Icons/illuminati.webp',
  },
  [EquipmentType.Automation]: {
    1: '/assets/Icons/computer.png',
    2: '/assets/Icons/computer.png',
    3: '/assets/Icons/computer.png',
  },
};

// Room background image
export const roomBackgroundImage = '/assets/Icons/floor.png';

// Function to render equipment
export const renderEquipment = (
  ctx: CanvasRenderingContext2D,
  equipment: Record<EquipmentType, Equipment>,
  plants: any[]
) => {
  const canvas = ctx.canvas;
  if (!canvas) return;
  
  // Draw light at top
  if (window.__plantCanvasAssets?.lightImage) {
    ctx.drawImage(window.__plantCanvasAssets.lightImage, canvas.width/2 - 50, 20, 100, 60);
    
    // Draw light rays effect based on light level
    const lightLevel = equipment[EquipmentType.Light].level;
    ctx.fillStyle = `rgba(255, 255, 100, ${0.1 * lightLevel})`;
    
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 80);
    ctx.lineTo(canvas.width/2 - 150, canvas.height/2);
    ctx.lineTo(canvas.width/2 + 150, canvas.height/2);
    ctx.closePath();
    ctx.fill();
  }
  
  // Draw ventilation on the right
  if (window.__plantCanvasAssets?.ventImage) {
    ctx.drawImage(window.__plantCanvasAssets.ventImage, canvas.width - 80, canvas.height/2 - 40, 60, 80);
    
    // Animation effect for ventilation
    const now = Date.now();
    const ventLevel = equipment[EquipmentType.Ventilation].level;
    
    // Draw air flow based on ventilation level
    ctx.strokeStyle = `rgba(200, 200, 255, ${0.5 * ventLevel})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < ventLevel * 2; i++) {
      const offset = (now / 500 + i) % 3;
      
      ctx.beginPath();
      ctx.moveTo(canvas.width - 90 - offset * 20, canvas.height/2);
      ctx.lineTo(canvas.width - 110 - offset * 20, canvas.height/2 - 10);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(canvas.width - 90 - offset * 20, canvas.height/2 + 10);
      ctx.lineTo(canvas.width - 110 - offset * 20, canvas.height/2);
      ctx.stroke();
    }
  }
  
  // Draw nutrients on the left
  if (window.__plantCanvasAssets?.nutrientsImage) {
    ctx.drawImage(window.__plantCanvasAssets.nutrientsImage, 20, canvas.height/2 - 30, 60, 60);
    
    // Show nutrient effect based on level
    const nutrientLevel = equipment[EquipmentType.Nutrients].level;
    
    // Draw nutrient particles
    ctx.fillStyle = `rgba(100, 200, 100, ${0.4 * nutrientLevel})`;
    for (let i = 0; i < nutrientLevel * 3; i++) {
      const angle = (Date.now() / 1000 + i) % (Math.PI * 2);
      const x = 50 + Math.cos(angle) * 40;
      const y = canvas.height/2 + Math.sin(angle) * 40;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Draw automation system at bottom
  if (window.__plantCanvasAssets?.autoImage) {
    ctx.drawImage(window.__plantCanvasAssets.autoImage, canvas.width/2 - 40, canvas.height - 80, 80, 60);
    
    // Show automation effect based on level
    const autoLevel = equipment[EquipmentType.Automation].level;
    if (autoLevel > 1 && plants.length > 0) {
      // Draw connecting lines to plants - this requires calculatePlantPosition,
      // so we'll need to pass plant positions as params
      ctx.strokeStyle = `rgba(100, 100, 255, ${0.3 * autoLevel})`;
      ctx.lineWidth = 1;
      
      plants.forEach((plant) => {
        if (plant.position) {
          ctx.beginPath();
          ctx.moveTo(canvas.width/2, canvas.height - 50);
          ctx.lineTo(plant.position.x, plant.position.y + 30);
          ctx.stroke();
          
          // Data points
          ctx.fillStyle = `rgba(100, 200, 255, ${0.5 * autoLevel})`;
          const pulseSize = 2 + Math.sin(Date.now() / 300) * 1;
          
          ctx.beginPath();
          ctx.arc(canvas.width/2, canvas.height - 50, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(plant.position.x, plant.position.y + 30, pulseSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }
};
