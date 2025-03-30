
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Plant, GrowthStage, Equipment, EquipmentType } from '@/types/growRoom';
import { renderPlant, drawSelectedPlantDetails } from './PlantRenderer';
import { renderEquipment } from './EquipmentRenderer';
import { 
  calculatePlantPosition, 
  calculateGrowthRate, 
  preloadCanvasImages,
  handleCanvasInteraction
} from './CanvasUtils';

interface GrowRoomRendererProps {
  plants: Plant[];
  equipment: Record<EquipmentType, Equipment>;
  plantCapacity: number;
  thcAmount: number;
  isMobile: boolean;
  getGrowthColor: (stage: GrowthStage) => string;
  onPlantSeed: () => void;
  onHarvestPlant: (plantId: number) => void;
}

const GrowRoomRenderer: React.FC<GrowRoomRendererProps> = ({
  plants,
  equipment,
  plantCapacity,
  thcAmount,
  isMobile,
  getGrowthColor,
  onPlantSeed,
  onHarvestPlant
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPlant, setHoveredPlant] = useState<number | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const plantPositionsRef = useRef<{x: number, y: number, size: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Main render function
  const renderGrowRoom = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only proceed if images are loaded
    if (!isImagesLoaded) {
      // Draw loading message
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading grow room...', canvas.width/2, canvas.height/2);
      return;
    }
    
    // Draw background
    if (window.__plantCanvasAssets?.floorImage) {
      // Create pattern and fill background
      const pattern = ctx.createPattern(window.__plantCanvasAssets.floorImage, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      // Fallback background
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Cache plant positions for interactions
    const plantsWithPositions = [...plants];
    plantPositionsRef.current = [];
    
    // Draw equipment
    renderEquipment(ctx, equipment, plantsWithPositions);
    
    // Draw plant grid slots
    for (let i = 0; i < plantCapacity; i++) {
      const pos = calculatePlantPosition(i, canvas, plantCapacity, isMobile);
      plantPositionsRef.current[i] = pos;
      
      // Store position with plant for equipment connections
      if (i < plants.length) {
        plantsWithPositions[i] = { ...plantsWithPositions[i], position: pos };
      }
      
      // Draw grid slot
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + pos.size/2, pos.size/2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw plus sign if slot is empty
      if (i >= plants.length) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(pos.x - 10, pos.y + pos.size/2);
        ctx.lineTo(pos.x + 10, pos.y + pos.size/2);
        ctx.stroke();
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + pos.size/2 - 10);
        ctx.lineTo(pos.x, pos.y + pos.size/2 + 10);
        ctx.stroke();
      }
    }
    
    // Draw plants
    plants.forEach((plant, index) => {
      const pos = plantPositionsRef.current[index];
      if (pos) {
        renderPlant({
          ctx,
          plant,
          x: pos.x,
          y: pos.y,
          size: pos.size,
          index,
          isHovered: hoveredPlant === index,
          isSelected: selectedPlant === index,
          getGrowthColor
        });
      }
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
      const speedMultiplier = calculateGrowthRate(plants[selectedPlant], equipment);
      drawSelectedPlantDetails(ctx, plants[selectedPlant], canvas, speedMultiplier);
    }
    
    // Request next frame for animations
    animationFrameRef.current = requestAnimationFrame(renderGrowRoom);
  }, [plants, equipment, plantCapacity, selectedPlant, hoveredPlant, isImagesLoaded, isMobile, getGrowthColor]);
  
  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Get container size
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Set canvas size
    const newWidth = Math.floor(width);
    const newHeight = Math.floor(height);
    
    // Only update if size actually changed
    if (canvasSize.width !== newWidth || canvasSize.height !== newHeight) {
      setCanvasSize({
        width: newWidth,
        height: newHeight
      });
      
      // Update canvas dimensions
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
    }
  }, [canvasSize]);
  
  // Handle mouse move for hover detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const interaction = handleCanvasInteraction(
      x, y, plants, plantCapacity, thcAmount, canvas, isMobile,
      plantPositionsRef.current, selectedPlant, setHoveredPlant, setSelectedPlant,
      onPlantSeed, onHarvestPlant
    );
    
    interaction.handleMove();
  };
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const interaction = handleCanvasInteraction(
      x, y, plants, plantCapacity, thcAmount, canvas, isMobile,
      plantPositionsRef.current, selectedPlant, setHoveredPlant, setSelectedPlant,
      onPlantSeed, onHarvestPlant
    );
    
    interaction.handleClick();
  };
  
  // Initialize canvas, load images, and set up resize handler
  useEffect(() => {
    // Load images
    preloadCanvasImages(equipment, () => {
      setIsImagesLoaded(true);
    });
    
    // Set up resize handler
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(renderGrowRoom);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [equipment, handleResize, renderGrowRoom]);
  
  // Update canvas whenever size changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasSize.width;
      canvasRef.current.height = canvasSize.height;
      renderGrowRoom();
    }
  }, [canvasSize, renderGrowRoom]);
  
  // Re-render when equipment changes
  useEffect(() => {
    // Reload images when equipment changes
    preloadCanvasImages(equipment, () => {
      setIsImagesLoaded(true);
    });
  }, [equipment]);
  
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
      
      {plants.length === 0 && !isImagesLoaded && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <p className="text-gray-600 mb-2 text-center">Loading grow room...</p>
        </div>
      )}
    </div>
  );
};

export default GrowRoomRenderer;
