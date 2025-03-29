
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, Leaf, Sprout } from 'lucide-react';

interface StatsBarProps {
  thcAmount: number;
  plantCount: number;
  plantCapacity: number;
  isLoading: boolean;
  onPlantSeed: () => void;
}

const StatsBar: React.FC<StatsBarProps> = ({
  thcAmount,
  plantCount,
  plantCapacity,
  isLoading,
  onPlantSeed
}) => {
  return (
    <div className="win95-window p-2 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <CircleDollarSign className="w-5 h-5 mr-1 text-green-600" />
          <span className="font-bold">{thcAmount} $THC</span>
        </div>
        <div className="flex items-center">
          <Leaf className="w-5 h-5 mr-1 text-green-600" />
          <span className="font-bold">{plantCount}/{plantCapacity} Plants</span>
        </div>
        <Button 
          className="win95-button flex items-center px-2 py-1"
          onClick={onPlantSeed}
          disabled={plantCount >= plantCapacity || thcAmount < 0.1 || isLoading}
        >
          <Sprout className="w-4 h-4 mr-1" />
          <span>Plant Seed (0.1 $THC)</span>
        </Button>
      </div>
    </div>
  );
};

export default StatsBar;
