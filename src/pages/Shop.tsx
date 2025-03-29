
import React from 'react';
import NFTShop from '@/components/NFTShop';
import { useWeb3 } from '@/contexts/Web3Context';
import { usePoints } from '@/hooks/use-points';

const Shop: React.FC = () => {
  const { address } = useWeb3();
  const { getPoints } = usePoints();
  
  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="win95-window p-2 text-2xl font-bold mb-4 text-center">
          NFT Snack Shop
        </h1>
        
        <div className="win95-panel p-4 mb-4 flex justify-between items-center">
          {address && (
            <div className="win95-inset p-2 text-sm">
              <span className="font-bold">Your Points:</span> {getPoints(address)}
            </div>
          )}
        </div>
        
        <NFTShop />
      </div>
    </div>
  );
};

export default Shop;
