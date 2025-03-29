
import React from 'react';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, Leaf, Sprout } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="win95-window p-2 mb-4">
      <div className={`flex ${isMobile ? 'flex-col space-y-1.5' : 'justify-between items-center'}`}>
        <div className="flex items-center">
          <CircleDollarSign className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 text-green-600`} />
          <span className={`font-bold ${isMobile ? 'text-sm' : ''}`}>{formattedThcAmount} $THC</span>
        </div>
        <div className="flex items-center">
          <Leaf className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} mr-1 text-green-600`} />
          <span className={`font-bold ${isMobile ? 'text-sm' : ''}`}>{plantCount}/{plantCapacity} Plants</span>
        </div>
        <Button 
          className={`win95-button flex items-center ${isMobile ? 'px-1.5 py-0.5 text-xs h-7' : 'px-2 py-1'}`}
          onClick={onPlantSeed}
          disabled={plantCount >= plantCapacity || thcAmount < seedCost || isLoading}
        >
          <Sprout className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
          <span>Plant Seed ({seedCost} $THC)</span>
        </Button>
      </div>
    </div>
  );
};

export default StatsBar;
