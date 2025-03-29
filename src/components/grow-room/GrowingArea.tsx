
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';
import PlantCard from './PlantCard';
import { Plant, GrowthStage } from '@/types/growRoom';
import { useIsMobile } from '@/hooks/use-mobile';

interface GrowingAreaProps {
  plants: Plant[];
  plantCapacity: number;
  isLoading: boolean;
  thcAmount: number;
  getGrowthColor: (stage: GrowthStage) => string;
  onPlantSeed: () => void;
  onHarvestPlant: (plantId: number) => void;
  isMobile?: boolean;
}

const GrowingArea: React.FC<GrowingAreaProps> = ({
  plants,
  plantCapacity,
  isLoading,
  thcAmount,
  getGrowthColor,
  onPlantSeed,
  onHarvestPlant,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="win95-window p-2 flex-1">
      <div className="win95-title-bar mb-2">
        <span>Grow Room</span>
      </div>
      
      <div className="p-2 win95-inset h-[calc(100%-40px)] overflow-auto">
        {plants.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sprout className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} mb-2 text-green-600`} />
            <p className="mb-4">Your grow room is empty!</p>
            <Button 
              className={`win95-button flex items-center ${isMobile ? 'text-sm px-2 py-1' : ''}`}
              onClick={onPlantSeed}
              disabled={thcAmount < 0.1 || isLoading}
            >
              <Sprout className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              Plant Seed (0.1 $THC)
            </Button>
          </div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4'}`}>
            {plants.map(plant => (
              <PlantCard 
                key={plant.id} 
                plant={plant}
                getGrowthColor={getGrowthColor}
                onHarvest={onHarvestPlant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowingArea;
