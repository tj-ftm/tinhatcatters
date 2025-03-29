
import React from 'react';
import NFTShop from '@/components/NFTShop';
import { useWeb3 } from '@/contexts/Web3Context';

const Shop: React.FC = () => {
  const { address } = useWeb3();
  
  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="win95-window p-2 text-2xl font-bold mb-4 text-center">
          NFT Snack Shop
        </h1>
        
        <div className="win95-panel p-4 mb-8">
          <p className="text-center">
            Purchase snack NFTs to enhance your gameplay experience! Each snack provides unique boosts to help you achieve higher scores.
          </p>
        </div>
        
        <NFTShop />
      </div>
    </div>
  );
};

export default Shop;
