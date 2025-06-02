
import React from 'react';
import NFTShop from '@/components/NFTShop';
import SonicNFTDisplay from '@/components/SonicNFTDisplay';
import WalletBar from '@/components/WalletBar';
import PlayerCard from '@/components/player/PlayerCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWeb3 } from '@/contexts/Web3Context';

// Configurable shop icon images
const SHOP_ICON_IMAGES = {
  nftDisplay: "/assets/Icons/illuminati.webp",
  playerCard: "/assets/Icons/illuminati.webp",
  nftShop: "/assets/Icons/illuminati.webp",
  sonic: "/assets/Icons/illuminati.webp",
  featured: "/assets/Icons/illuminati.webp"
};

const Shop: React.FC = () => {
  const isMobile = useIsMobile();
  const { address } = useWeb3();
  
  return (
    <div className="w-full min-h-screen p-2 md:p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Wallet Bar - only show when wallet is connected */}
        {address && <WalletBar />}
        
        {/* In mobile view, have PlayerCard at the top */}
        {isMobile && <PlayerCard iconUrl={SHOP_ICON_IMAGES.playerCard} />}
        
        {/* On desktop, show a row with NFT display and player card */}
        {!isMobile && (
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <SonicNFTDisplay iconUrl={SHOP_ICON_IMAGES.nftDisplay} />
            </div>
            <div className="col-span-1">
              <PlayerCard iconUrl={SHOP_ICON_IMAGES.playerCard} />
            </div>
          </div>
        )}
        
        {/* NFT Shop */}
        <NFTShop />
        
        {/* In mobile view, place NFT display at the bottom */}
        {isMobile && <SonicNFTDisplay iconUrl={SHOP_ICON_IMAGES.nftDisplay} />}
      </div>
    </div>
  );
};

export default Shop;
