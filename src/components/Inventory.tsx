
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { toast } from '@/hooks/use-toast';

interface InventoryProps {
  onUseSnack: (snack: any) => void;
}

const Inventory: React.FC<InventoryProps> = ({ onUseSnack }) => {
  const { snacks } = useWeb3();
  
  const handleUseSnack = (snack: any) => {
    onUseSnack(snack);
    toast({
      title: 'Snack Used',
      description: `${snack.name} has been used. Enjoy your boost!`
    });
  };
  
  return (
    <div className="win95-window w-full h-full">
      <div className="win95-title-bar mb-4">
        <span>Snack Inventory</span>
      </div>
      
      <div className="p-4">
        {snacks.length === 0 ? (
          <div className="win95-panel p-4 text-center">
            <p className="text-sm mb-2">Your inventory is empty.</p>
            <p className="text-xs">Visit the shop to purchase snack NFTs with $THC for gameplay boosts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snacks.map((snack) => (
              <NFTCard
                key={snack.id}
                id={snack.id}
                name={snack.name}
                image={snack.image}
                boost={snack.boost}
                onUse={() => handleUseSnack(snack)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
