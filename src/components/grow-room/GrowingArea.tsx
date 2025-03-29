
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';
import PlantCard from './PlantCard';
import { Plant, GrowthStage } from '@/types/growRoom';

interface GrowingAreaProps {
  plants: Plant[];
  plantCapacity: number;
  isLoading: boolean;
  thcAmount: number;
  getGrowthColor: (stage: GrowthStage) => string;
  onPlantSeed: () => void;
  onHarvestPlant: (plantId: number) => void;
}

const GrowingArea: React.FC<GrowingAreaProps> = ({
  plants,
  plantCapacity,
  isLoading,
  thcAmount,
  getGrowthColor,
  onPlantSeed,
  onHarvestPlant
}) => {
  return (
    <div className="win95-window p-2 w-full h-full">
      {/* Removed the win95-title-bar with "Grow Room (0/1)" text */}
      
      <div className="win95-inset h-full overflow-auto">
        {plants.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sprout className="w-12 h-12 mb-2 text-green-600" />
            <p className="mb-4">Your grow room is empty!</p>
            <Button 
              className="win95-button flex items-center"
              onClick={onPlantSeed}
              disabled={thcAmount < 0.1 || isLoading}
            >
              <Sprout className="w-4 h-4 mr-1" />
              Plant Seed (0.1 $THC)
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
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
