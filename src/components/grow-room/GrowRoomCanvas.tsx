
import React, { useRef, useEffect, useState } from 'react';
import { useGrowRoom } from '@/hooks/useGrowRoom';
import { GrowthStage, Equipment, EquipmentType, Plant } from '@/types/growRoom';
import { useIsMobile } from '@/hooks/use-mobile';

// SVG paths for different growth stages
const PLANT_SVG = {
  [GrowthStage.Seed]: `M12,20 Q12,18 13,17 T14,15 Q14,14 13,13 T12,12 Q13,11 15,12 T17,13`,
  [GrowthStage.Sprout]: `M12,20 L12,15 Q11,13 12,12 T13,10 Q11,11 10,12 T11,14`,
  [GrowthStage.Vegetative]: `M12,20 L12,10 Q9,8 10,7 T11,5 Q10,6 8,7 T7,9 Q6,7 7,5 T9,3 M12,10 Q15,8 14,7 T13,5 Q14,6 16,7 T17,9 Q18,7 17,5 T15,3`,
  [GrowthStage.Flowering]: `M12,20 L12,8 Q8,7 7,5 T8,2 Q9,4 10,5 T11,4 Q12,2 13,3 T14,5 Q15,4 16,2 T17,3 Q16,5 15,7 T16,9 M12,8 Q16,7 17,5 T16,2`,
  [GrowthStage.Harvest]: `M12,20 L12,6 Q8,5 6,3 T7,0 Q8,2 9,3 T11,2 Q12,0 13,1 T15,3 Q16,2 17,0 T18,1 Q17,3 16,5 T17,7 M12,6 Q16,5 18,3 T17,0`
};

interface GrowRoomCanvasProps {}

const GrowRoomCanvas: React.FC<GrowRoomCanvasProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const isMobile = useIsMobile();
  
  const { 
    plants, 
    equipment, 
    getGrowthColor,
    plantCapacity
  } = useGrowRoom();

  // Equipment images - these would be replaced with actual assets
  const equipmentImages = {
    [EquipmentType.Light]: {
      1: '/assets/Icons/illuminati.webp', // Level 1 (basic)
      2: '/assets/Icons/illuminati.webp', // Level 2 (advanced)
      3: '/assets/Icons/illuminati.webp', // Level 3 (premium)
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

  // Room background image - would be replaced with actual asset
  const roomBackgroundImage = '/assets/Icons/floor.png';
  
  // Function to render a single plant
  const renderPlant = (
    ctx: CanvasRenderingContext2D, 
    plant: Plant, 
    x: number, 
    y: number, 
    size: number = 80
  ) => {
    // Draw pot
    const potImg = new Image();
    potImg.src = equipmentImages[EquipmentType.Pot][equipment[EquipmentType.Pot].level] || '/assets/Icons/weed.png';
    potImg.onload = () => {
      ctx.drawImage(potImg, x - size/3, y + size/2, size*2/3, size/2);
    };
    
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
    const svgPath = PLANT_SVG[plant.stage] || PLANT_SVG[GrowthStage.Seed];
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
  };

  // Function to render equipment
  const renderEquipment = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Draw light at top
    const lightImg = new Image();
    lightImg.src = equipmentImages[EquipmentType.Light][equipment[EquipmentType.Light].level] || '/assets/Icons/illuminati.webp';
    lightImg.onload = () => {
      ctx.drawImage(lightImg, canvas.width/2 - 50, 20, 100, 60);
    };
    
    // Draw ventilation on the right
    const ventImg = new Image();
    ventImg.src = equipmentImages[EquipmentType.Ventilation][equipment[EquipmentType.Ventilation].level] || '/assets/Icons/illuminati.webp';
    ventImg.onload = () => {
      ctx.drawImage(ventImg, canvas.width - 80, canvas.height/2 - 40, 60, 80);
    };
    
    // Draw nutrients on the left
    const nutrientsImg = new Image();
    nutrientsImg.src = equipmentImages[EquipmentType.Nutrients][equipment[EquipmentType.Nutrients].level] || '/assets/Icons/illuminati.webp';
    nutrientsImg.onload = () => {
      ctx.drawImage(nutrientsImg, 20, canvas.height/2 - 30, 60, 60);
    };
    
    // Draw automation system at bottom
    const autoImg = new Image();
    autoImg.src = equipmentImages[EquipmentType.Automation][equipment[EquipmentType.Automation].level] || '/assets/Icons/computer.png';
    autoImg.onload = () => {
      ctx.drawImage(autoImg, canvas.width/2 - 40, canvas.height - 80, 80, 60);
    };
  };

  // Main render function
  const renderGrowRoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const bgImg = new Image();
    bgImg.src = roomBackgroundImage;
    bgImg.onload = () => {
      // Create pattern and fill background
      const pattern = ctx.createPattern(bgImg, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw equipment (on top of background)
        renderEquipment(ctx);
        
        // Draw plants (on top of equipment and background)
        const plantSize = isMobile ? 60 : 80;
        const rows = Math.ceil(plantCapacity / 3);
        const cols = Math.min(plantCapacity, 3);
        
        // Calculate grid spacing
        const gridWidth = Math.min(canvas.width - 100, cols * plantSize * 1.5);
        const gridHeight = Math.min(canvas.height - 200, rows * plantSize * 1.5);
        const xOffset = (canvas.width - gridWidth) / 2 + plantSize / 2;
        const yOffset = (canvas.height - gridHeight) / 2 + plantSize / 2 + 40; // Add some top margin
        
        // Draw grid slots for all possible plants
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            // Skip if we've reached the capacity
            const index = row * cols + col;
            if (index >= plantCapacity) break;
            
            // Calculate position
            const x = xOffset + col * (gridWidth / (cols - 1 || 1));
            const y = yOffset + row * (gridHeight / (rows - 1 || 1));
            
            // Draw grid slot
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.arc(x, y + plantSize/2, plantSize/2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw plant if exists
            if (index < plants.length) {
              renderPlant(ctx, plants[index], x, y, plantSize);
            }
          }
        }
        
        // Draw empty slot message if no plants
        if (plants.length === 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.font = isMobile ? '16px sans-serif' : '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Plant a seed to get started!', canvas.width/2, canvas.height/2);
        }
      }
    };
  };
  
  // Handle canvas resize
  const handleResize = () => {
    if (!canvasRef.current) return;
    
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    // Get container size
    const { width, height } = container.getBoundingClientRect();
    
    // Set canvas size
    setCanvasSize({
      width: Math.floor(width),
      height: Math.floor(height)
    });
  };
  
  // Initialize canvas and set up resize handler
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Re-render when plants, equipment, or canvas size changes
  useEffect(() => {
    renderGrowRoom();
  }, [plants, equipment, canvasSize, plantCapacity, isMobile]);
  
  return (
    <div className="w-full h-full win95-inset p-2 flex-1">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full"
      />
    </div>
  );
};

export default GrowRoomCanvas;
