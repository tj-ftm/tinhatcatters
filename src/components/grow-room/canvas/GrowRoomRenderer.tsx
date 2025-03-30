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
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const plantPositionsRef = useRef<{x: number, y: number, size: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const renderGrowRoom = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isImagesLoaded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Loading grow room...', canvas.width/2, canvas.height/2);
      return;
    }
    
    if (window.__plantCanvasAssets?.floorImage) {
      const pattern = ctx.createPattern(window.__plantCanvasAssets.floorImage, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    const plantsWithPositions = plants.map((plant, index) => {
      const pos = calculatePlantPosition(index, canvas, plantCapacity, isMobile);
      plantPositionsRef.current[index] = pos;
      return { ...plant, position: pos };
    });
    
    renderEquipment(ctx, equipment, plantsWithPositions);
    
    for (let i = 0; i < plantCapacity; i++) {
      const pos = calculatePlantPosition(i, canvas, plantCapacity, isMobile);
      plantPositionsRef.current[i] = pos;
      
      if (i >= plants.length) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(pos.x - 10, pos.y + pos.size/2);
        ctx.lineTo(pos.x + 10, pos.y + pos.size/2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + pos.size/2 - 10);
        ctx.lineTo(pos.x, pos.y + pos.size/2 + 10);
        ctx.stroke();
      }
    }
    
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
    
    if (plants.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = isMobile ? '16px sans-serif' : '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Plant a seed to get started!', canvas.width/2, canvas.height/2);
    }
    
    if (selectedPlant !== null && plants[selectedPlant]) {
      const speedMultiplier = calculateGrowthRate(plants[selectedPlant], equipment);
      drawSelectedPlantDetails(ctx, plants[selectedPlant], canvas, speedMultiplier);
    }
    
    animationFrameRef.current = requestAnimationFrame(renderGrowRoom);
  }, [plants, equipment, plantCapacity, selectedPlant, hoveredPlant, isImagesLoaded, isMobile, getGrowthColor]);
  
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    const maxHeight = isMobile ? 280 : 320;
    const newWidth = Math.floor(width);
    const newHeight = Math.min(Math.floor(height), maxHeight);
    
    if (canvasSize.width !== newWidth || canvasSize.height !== newHeight) {
      setCanvasSize({
        width: newWidth,
        height: newHeight
      });
      
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
    }
  }, [canvasSize, isMobile]);
  
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
  
  useEffect(() => {
    preloadCanvasImages(equipment, () => {
      setIsImagesLoaded(true);
    });
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    animationFrameRef.current = requestAnimationFrame(renderGrowRoom);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [equipment, handleResize, renderGrowRoom]);
  
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasSize.width;
      canvasRef.current.height = canvasSize.height;
      renderGrowRoom();
    }
  }, [canvasSize, renderGrowRoom]);
  
  useEffect(() => {
    preloadCanvasImages(equipment, () => {
      setIsImagesLoaded(true);
    });
  }, [equipment]);
  
  return (
    <div className="w-full relative flex flex-col" ref={containerRef} style={{ height: isMobile ? '280px' : '320px' }}>
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
