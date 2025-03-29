
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { toast } from '@/hooks/use-toast';

interface PetSelectionProps {
  onSelectPet: (pet: any) => void;
  selectedPetId?: number | null;
}

const PetSelection: React.FC<PetSelectionProps> = ({ onSelectPet, selectedPetId }) => {
  const { tinHatCatters } = useWeb3();
  
  const handleSelectPet = (pet: any) => {
    onSelectPet(pet);
    toast({
      title: 'Pet Selected',
      description: `${pet.name} is now your active pet!`
    });
  };
  
  return (
    <div className="win95-window w-full h-full">
      <div className="win95-title-bar mb-4">
        <span>TinHatCatters Pet Selection</span>
      </div>
      
      <div className="p-4">
        {tinHatCatters.length === 0 ? (
          <div className="win95-panel p-4 text-center">
            <p className="text-sm mb-2">You don't own any TinHatCatters NFTs yet.</p>
            <p className="text-xs">Connect your wallet and buy TinHatCatters NFTs to use them as pets in the game!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tinHatCatters.map((pet) => (
              <NFTCard
                key={pet.id}
                id={pet.id}
                name={pet.name}
                image={pet.image}
                boost={pet.boost}
                onSelect={() => handleSelectPet(pet)}
                selected={selectedPetId === pet.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetSelection;
