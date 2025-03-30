
import { GrowthStage } from '@/types/growRoom';

// SVG-based plant animations
export const createPlantSVGAnimation = (stage: GrowthStage, progress: number): string => {
  // Base paths for each growth stage
  const basePaths = {
    [GrowthStage.Seed]: 'M12,20 Q12,18 13,17 T14,15',
    [GrowthStage.Sprout]: 'M12,20 L12,16 Q10,15 11,14 T12,12',
    [GrowthStage.Vegetative]: 'M12,20 L12,12 Q9,10 10,8 T11,6 M12,12 Q15,10 14,8 T13,6',
    [GrowthStage.Flowering]: 'M12,20 L12,10 Q8,8 7,6 T8,4 M12,10 Q16,8 17,6 T16,4',
    [GrowthStage.Harvest]: 'M12,20 L12,8 Q6,6 5,4 T6,2 M12,8 Q18,6 19,4 T18,2',
  };
  
  // Add details based on progress within the stage
  // This is a simplified example. Real implementation would interpolate between stages
  const progressInStage = Math.min(100, Math.max(0, progress));
  
  // Return the path with additional details based on progress
  return basePaths[stage];
};

// Canvas-based growth animation
export const drawPlantGrowthAnimation = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  stage: GrowthStage,
  progress: number,
  size: number = 100
) => {
  // Clear the area
  ctx.clearRect(x - size/2, y - size, size, size * 1.5);
  
  // Set colors based on stage
  const colors = {
    [GrowthStage.Seed]: '#ca8a04',      // yellow
    [GrowthStage.Sprout]: '#86efac',    // light green
    [GrowthStage.Vegetative]: '#22c55e', // green
    [GrowthStage.Flowering]: '#a855f7',  // purple
    [GrowthStage.Harvest]: '#db2777',    // pink
  };
  
  ctx.fillStyle = colors[stage];
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  
  // Draw stem
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - size * (0.3 + progress * 0.003));
  ctx.stroke();
  
  // Draw leaves/flowers based on stage
  switch (stage) {
    case GrowthStage.Seed:
      // Small seed/sprout
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.1, size * 0.05, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
      
    case GrowthStage.Sprout:
      // Small leaves
      drawLeaf(ctx, x, y - size * 0.3, size * 0.15, -Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.3, size * 0.15, Math.PI / 4);
      break;
      
    case GrowthStage.Vegetative:
      // Multiple leaves
      drawLeaf(ctx, x, y - size * 0.4, size * 0.2, -Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.4, size * 0.2, Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.6, size * 0.15, -Math.PI / 6);
      drawLeaf(ctx, x, y - size * 0.6, size * 0.15, Math.PI / 6);
      break;
      
    case GrowthStage.Flowering:
      // Leaves and flower buds
      drawLeaf(ctx, x, y - size * 0.4, size * 0.25, -Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.4, size * 0.25, Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.6, size * 0.2, -Math.PI / 6);
      drawLeaf(ctx, x, y - size * 0.6, size * 0.2, Math.PI / 6);
      
      // Buds
      ctx.fillStyle = '#a855f7'; // Purple for flowers
      ctx.beginPath();
      ctx.arc(x, y - size * 0.7, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
      
    case GrowthStage.Harvest:
      // Full plant with large buds
      drawLeaf(ctx, x, y - size * 0.4, size * 0.3, -Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.4, size * 0.3, Math.PI / 4);
      drawLeaf(ctx, x, y - size * 0.6, size * 0.25, -Math.PI / 6);
      drawLeaf(ctx, x, y - size * 0.6, size * 0.25, Math.PI / 6);
      
      // Large buds
      ctx.fillStyle = '#db2777'; // Pink for mature flowers
      ctx.beginPath();
      ctx.arc(x, y - size * 0.7, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Add sparkle effect for harvest-ready plants
      drawSparkle(ctx, x - size * 0.1, y - size * 0.8, size * 0.05);
      drawSparkle(ctx, x + size * 0.15, y - size * 0.65, size * 0.05);
      break;
  }
};

// Helper function to draw a leaf
const drawLeaf = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Draw leaf shape
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size, -size, size * 2, 0);
  ctx.quadraticCurveTo(size, size, 0, 0);
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
};

// Helper function to draw sparkle effect
const drawSparkle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) => {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size / 2;
  
  ctx.save();
  ctx.translate(x, y);
  
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
  
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * 2) * (i / (spikes * 2));
    
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};
