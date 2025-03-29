
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
    <div className="win95-window p-2">
      <div className="flex flex-col items-center">
        <div className="mb-2">
          <PlantIcon stage={plant.stage} />
        </div>
        <div className="font-bold mb-1">
          {plant.stage.charAt(0).toUpperCase() + plant.stage.slice(1)}
        </div>
        
        {plant.stage !== GrowthStage.Harvest ? (
          <>
            <Progress 
              value={plant.progress} 
              className={`h-2 mb-2 ${getGrowthColor(plant.stage)}`} 
            />
            <div className="text-xs mb-2">
              {Math.round(plant.progress)}% Complete
            </div>
          </>
        ) : (
          <Button
            className="win95-button flex items-center mt-2"
            onClick={() => onHarvest(plant.id)}
          >
            <CircleDollarSign className="w-4 h-4 mr-1" />
            Harvest Plant
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlantCard;
