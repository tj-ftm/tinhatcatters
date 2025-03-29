
import React from 'react';
import NFTShop from '@/components/NFTShop';
import SonicNFTDisplay from '@/components/SonicNFTDisplay';

const Shop: React.FC = () => {
  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <NFTShop />
        <SonicNFTDisplay />
      </div>
    </div>
  );
};

export default Shop;
