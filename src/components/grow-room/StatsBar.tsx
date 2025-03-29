
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
  // Format the THC amount to display only 2 decimal places
  const formattedThcAmount = thcAmount.toFixed(2);
  const seedCost = 0.1; // Constant for seed cost
  
  return (
    <div className="win95-window p-2">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center">
          <CircleDollarSign className="w-5 h-5 mr-1 text-green-600" />
          <span className="font-bold">{formattedThcAmount} $THC</span>
        </div>
        <div className="flex items-center">
          <Leaf className="w-5 h-5 mr-1 text-green-600" />
          <span className="font-bold">{plantCount}/{plantCapacity} Plants</span>
        </div>
        <Button 
          className="win95-button flex items-center px-4 py-2 w-full md:w-auto"
          onClick={onPlantSeed}
          disabled={plantCount >= plantCapacity || thcAmount < seedCost || isLoading}
        >
          <Sprout className="w-4 h-4 mr-1" />
          <span>Plant Seed ({seedCost} $THC)</span>
        </Button>
      </div>
    </div>
  );
};

export default StatsBar;
