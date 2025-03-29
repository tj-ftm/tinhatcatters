
import React from 'react';
import NFTShop from '@/components/NFTShop';
import SonicNFTDisplay from '@/components/SonicNFTDisplay';
import PlayerCard from '@/components/player/PlayerCard';
import { useIsMobile } from '@/hooks/use-mobile';

const Shop: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full min-h-screen p-2 md:p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* In mobile view, have PlayerCard at the top */}
        {isMobile && <PlayerCard />}
        
        {/* On desktop, show a row with NFT display and player card */}
        {!isMobile && (
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <SonicNFTDisplay />
            </div>
            <div className="col-span-1">
              <PlayerCard />
            </div>
          </div>
        )}
        
        {/* NFT Shop */}
        <NFTShop />
        
        {/* In mobile view, place NFT display at the bottom */}
        {isMobile && <SonicNFTDisplay />}
      </div>
    </div>
  );
};

export default Shop;
