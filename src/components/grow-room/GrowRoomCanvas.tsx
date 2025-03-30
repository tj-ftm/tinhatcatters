
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';
import { GrowthStage, Equipment, EquipmentType, Plant } from '@/types/growRoom';
import { useIsMobile } from '@/hooks/use-mobile';
import GrowRoomRenderer from './canvas/GrowRoomRenderer';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full relative" style={{ height: isMobile ? '350px' : '450px' }}>
      <GrowRoomRenderer
        plants={plants}
        equipment={equipment}
        plantCapacity={plantCapacity}
        thcAmount={thcAmount}
        isMobile={isMobile}
        getGrowthColor={getGrowthColor}
        onPlantSeed={onPlantSeed}
        onHarvestPlant={onHarvestPlant}
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
