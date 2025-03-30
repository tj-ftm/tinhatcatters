
import React, { useRef, useEffect, useState } from 'react';
import { GrowthStage, Equipment, EquipmentType, Plant } from '@/types/growRoom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { createPlantSVGAnimation } from '@/utils/plantAnimations';

interface GrowRoomCanvasProps {
  plants: Plant[];
  equipment: Record<EquipmentType, Equipment>;
  plantCapacity: number;
  onPlantSeed: () => void;
  onHarvestPlant: (plantId: number) => void;
  getGrowthColor: (stage: GrowthStage) => string;
  thcAmount: number;
}

const GrowRoomCanvas: React.FC<GrowRoomCanvasProps> = ({
  plants,
  equipment,
  plantCapacity,
  onPlantSeed,
  onHarvestPlant,
  getGrowthColor,
  thcAmount
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [hoveredPlant, setHoveredPlant] = useState<number | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
  // Equipment images
  const equipmentImages = {
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
  const roomBackgroundImage = '/assets/Icons/floor.png';
  
  // Get plant name based on stage
  const getPlantStageName = (stage: GrowthStage): string => {
    switch (stage) {
      case GrowthStage.Seed: return 'Seed';
      case GrowthStage.Sprout: return 'Sprout';
      case GrowthStage.Vegetative: return 'Vegetative';
      case GrowthStage.Flowering: return 'Flowering';
      case GrowthStage.Harvest: return 'Ready to Harvest!';
      default: return 'Plant';
    }
  };
  
  // Function to render a single plant
  const renderPlant = (
    ctx: CanvasRenderingContext2D, 
    plant: Plant, 
    x: number, 
    y: number, 
    size: number = 80,
    index: number
  ) => {
    const isHovered = hoveredPlant === index;
    const isSelected = selectedPlant === index;
    
    // Draw highlight for hovered/selected plant
    if (isHovered || isSelected) {
      ctx.fillStyle = isSelected ? 'rgba(255, 255, 100, 0.3)' : 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(x, y + size/2, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    
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

  // Function to render equipment
  const renderEquipment = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Draw light at top
    const lightImg = new Image();
    lightImg.src = equipmentImages[EquipmentType.Light][equipment[EquipmentType.Light].level] || '/assets/Icons/illuminati.webp';
    lightImg.onload = () => {
      ctx.drawImage(lightImg, canvas.width/2 - 50, 20, 100, 60);
      
      // Draw light rays effect based on light level
      const lightLevel = equipment[EquipmentType.Light].level;
      ctx.fillStyle = `rgba(255, 255, 100, ${0.1 * lightLevel})`;
      
      ctx.beginPath();
      ctx.moveTo(canvas.width/2, 80);
      ctx.lineTo(canvas.width/2 - 150, canvas.height/2);
      ctx.lineTo(canvas.width/2 + 150, canvas.height/2);
      ctx.closePath();
      ctx.fill();
    };
    
    // Draw ventilation on the right
    const ventImg = new Image();
    ventImg.src = equipmentImages[EquipmentType.Ventilation][equipment[EquipmentType.Ventilation].level] || '/assets/Icons/illuminati.webp';
    ventImg.onload = () => {
      ctx.drawImage(ventImg, canvas.width - 80, canvas.height/2 - 40, 60, 80);
      
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
    };
    
    // Draw nutrients on the left
    const nutrientsImg = new Image();
    nutrientsImg.src = equipmentImages[EquipmentType.Nutrients][equipment[EquipmentType.Nutrients].level] || '/assets/Icons/illuminati.webp';
    nutrientsImg.onload = () => {
      ctx.drawImage(nutrientsImg, 20, canvas.height/2 - 30, 60, 60);
      
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
    };
    
    // Draw automation system at bottom
    const autoImg = new Image();
    autoImg.src = equipmentImages[EquipmentType.Automation][equipment[EquipmentType.Automation].level] || '/assets/Icons/computer.png';
    autoImg.onload = () => {
      ctx.drawImage(autoImg, canvas.width/2 - 40, canvas.height - 80, 80, 60);
      
      // Show automation effect based on level
      const autoLevel = equipment[EquipmentType.Automation].level;
      if (autoLevel > 1) {
        // Draw connecting lines to plants
        ctx.strokeStyle = `rgba(100, 100, 255, ${0.3 * autoLevel})`;
        ctx.lineWidth = 1;
        
        plants.forEach((plant, i) => {
          const gridInfo = calculatePlantPosition(i);
          
          ctx.beginPath();
          ctx.moveTo(canvas.width/2, canvas.height - 50);
          ctx.lineTo(gridInfo.x, gridInfo.y + 30);
          ctx.stroke();
          
          // Data points
          ctx.fillStyle = `rgba(100, 200, 255, ${0.5 * autoLevel})`;
          const pulseSize = 2 + Math.sin(Date.now() / 300) * 1;
          
          ctx.beginPath();
          ctx.arc(canvas.width/2, canvas.height - 50, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(gridInfo.x, gridInfo.y + 30, pulseSize, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };
  };

  // Calculate the position for a plant at a given index
  const calculatePlantPosition = (index: number) => {
    const canvas = canvasRef.current;
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
        
        // Draw plant grid slots
        for (let i = 0; i < plantCapacity; i++) {
          const { x, y, size } = calculatePlantPosition(i);
          
          // Draw grid slot
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.beginPath();
          ctx.arc(x, y + size/2, size/2.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw plus sign if slot is empty
          if (i >= plants.length) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            
            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(x - 10, y + size/2);
            ctx.lineTo(x + 10, y + size/2);
            ctx.stroke();
            
            // Vertical line
            ctx.beginPath();
            ctx.moveTo(x, y + size/2 - 10);
            ctx.lineTo(x, y + size/2 + 10);
            ctx.stroke();
          }
        }
        
        // Draw plants (on top of equipment and background)
        plants.forEach((plant, index) => {
          const { x, y, size } = calculatePlantPosition(index);
          renderPlant(ctx, plant, x, y, size, index);
        });
        
        // Draw empty slot message if no plants
        if (plants.length === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = isMobile ? '16px sans-serif' : '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Plant a seed to get started!', canvas.width/2, canvas.height/2);
        }
        
        // Draw selected plant details
        if (selectedPlant !== null && plants[selectedPlant]) {
          drawSelectedPlantDetails(ctx, plants[selectedPlant]);
        }
      }
    };
  };
  
  // Draw selected plant details
  const drawSelectedPlantDetails = (ctx: CanvasRenderingContext2D, plant: Plant) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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
    ctx.fillText(`Growth Speed: ${calculateGrowthRate(plant)}x`, 20, panelY + 60);
    
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
  
  // Calculate growth rate for display
  const calculateGrowthRate = (plant: Plant) => {
    const { speedMultiplier } = calculateMultipliers();
    return speedMultiplier.toFixed(1);
  };
  
  // Handle canvas resize
  const handleResize = () => {
    if (!canvasRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Get container size
    const { width, height } = container.getBoundingClientRect();
    
    // Set canvas size
    setCanvasSize({
      width: Math.floor(width),
      height: Math.floor(height)
    });
  };
  
  // Handle mouse move for hover detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over any plant
    let hoveredIndex = null;
    
    for (let i = 0; i < plants.length; i++) {
      const pos = calculatePlantPosition(i);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
      
      if (distance < pos.size/2) {
        hoveredIndex = i;
        break;
      }
    }
    
    setHoveredPlant(hoveredIndex);
    
    // Check if mouse is over empty slot
    if (hoveredIndex === null) {
      for (let i = plants.length; i < plantCapacity; i++) {
        const pos = calculatePlantPosition(i);
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
    const harvestButtonBounds = (window as any).__harvestButtonBounds;
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
  };
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on any plant
    for (let i = 0; i < plants.length; i++) {
      const pos = calculatePlantPosition(i);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
      
      if (distance < pos.size/2) {
        // Toggle selection
        setSelectedPlant(selectedPlant === i ? null : i);
        return;
      }
    }
    
    // Check if click is on empty slot
    for (let i = plants.length; i < plantCapacity; i++) {
      const pos = calculatePlantPosition(i);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - (pos.y + pos.size/2), 2));
      
      if (distance < pos.size/2 && thcAmount >= 0.1) {
        // Plant a seed
        onPlantSeed();
        return;
      }
    }
    
    // Check if click is on harvest button
    const harvestButtonBounds = (window as any).__harvestButtonBounds;
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
  };

  // Calculate multipliers for the speed display
  const calculateMultipliers = () => {
    let speedMultiplier = 1;
    let qualityMultiplier = 1;

    Object.values(equipment).forEach(item => {
      speedMultiplier *= item.effect.speedBoost;
      qualityMultiplier *= item.effect.qualityBoost;
    });

    return { speedMultiplier, qualityMultiplier };
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
  }, [plants, equipment, canvasSize, plantCapacity, isMobile, hoveredPlant, selectedPlant]);
  
  return (
    <div className="w-full h-full relative flex flex-col" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full"
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
      />
      
      {plants.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Button 
            className={`win95-button flex items-center ${isMobile ? 'text-sm px-2 py-1' : ''}`}
            onClick={onPlantSeed}
            disabled={thcAmount < 0.1}
          >
            <Sprout className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            Plant Seed (0.1 $THC)
          </Button>
        </div>
      )}
    </div>
  );
};

export default GrowRoomCanvas;
