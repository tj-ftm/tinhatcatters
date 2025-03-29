
import React, { useState } from 'react';
import GameUI from '@/components/GameUI';
import PetSelection from '@/components/PetSelection';
import Inventory from '@/components/Inventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeb3 } from '@/contexts/Web3Context';

const Game: React.FC = () => {
  const { address } = useWeb3();
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [gameKey, setGameKey] = useState(0); // Used to force game component re-render
  
  const handleUseSnack = (snack: any) => {
    // Handle using a snack (would trigger the game to apply the boost)
    console.log('Using snack:', snack);
  };
  
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Game container */}
        <div className="w-full lg:w-2/3 h-[500px] lg:h-auto">
          <GameUI 
            key={gameKey} 
            selectedPet={selectedPet} 
          />
        </div>
        
        {/* Side panel with tabs */}
        <div className="w-full lg:w-1/3 h-[400px] lg:h-auto">
          {address ? (
            <Tabs defaultValue="pets" className="w-full h-full">
              <TabsList className="win95-window p-0 flex w-full">
                <TabsTrigger 
                  value="pets" 
                  className="flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black"
                >
                  Pets
                </TabsTrigger>
                <TabsTrigger 
                  value="inventory" 
                  className="flex-1 bg-[#c0c0c0] data-[state=active]:bg-[#FF69B4] data-[state=active]:text-black"
                >
                  Inventory
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pets" className="mt-4 h-[calc(100%-48px)]">
                <PetSelection 
                  onSelectPet={setSelectedPet} 
                  selectedPetId={selectedPet?.id}
                />
              </TabsContent>
              <TabsContent value="inventory" className="mt-4 h-[calc(100%-48px)]">
                <Inventory onUseSnack={handleUseSnack} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="win95-window h-full flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-lg mb-4">Connect your wallet to access your pets and inventory!</p>
                <div className="win95-inset p-4 text-xs">
                  Your TinHatCatters NFTs and snacks will appear here after connecting your wallet.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
