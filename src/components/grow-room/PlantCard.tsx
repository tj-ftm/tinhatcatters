
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CircleDollarSign } from 'lucide-react';
import PlantIcon from './PlantIcon';
import { Plant, GrowthStage } from '@/types/growRoom';

interface PlantCardProps {
  plant: Plant;
  getGrowthColor: (stage: GrowthStage) => string;
  onHarvest: (plantId: number) => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, getGrowthColor, onHarvest }) => {
  return (
    <div className="win95-window p-1">
      <div className="flex flex-col items-center">
        <div className="mb-1">
          <PlantIcon stage={plant.stage} />
        </div>
        <div className="font-bold mb-1 text-xs">
          {plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1)}
        </div>
        
        {plant.stage !== GrowthStage.Harvest ? (
          <>
            <Progress 
              value={plant.progress} 
              className={`h-1.5 mb-1 ${getGrowthColor(plant.stage)}`} 
            />
            <div className="text-xs mb-1">
              {Math.round(plant.progress)}%
            </div>
          </>
        ) : (
          <Button
            className="win95-button flex items-center mt-1 text-xs py-1 px-2"
            onClick={() => onHarvest(plant.id)}
          >
            <CircleDollarSign className="w-3 h-3 mr-1" />
            Harvest
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlantCard;
