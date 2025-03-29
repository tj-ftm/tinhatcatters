
import React from 'react';

const Shop: React.FC = () => {
  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="win95-window p-4">
          <h1 className="text-2xl font-bold mb-4">NFT Shop</h1>
          <div className="win95-inset p-4 mb-4">
            <p>Welcome to the NFT Shop! Here you can browse and purchase various NFTs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="win95-window">
                <div className="win95-title-bar">
                  <span>NFT Item #{item}</span>
                </div>
                <div className="p-4 flex flex-col items-center">
                  <img 
                    src={`https://cdn3d.iconscout.com/3d/premium/thumb/nft-${5679570 + item}-4730294.png`}
                    alt={`NFT ${item}`}
                    className="w-24 h-24 object-contain mb-2"
                  />
                  <h3 className="font-bold">Reptilian NFT #{item}</h3>
                  <p className="text-sm mb-2">A unique collectible item</p>
                  <button className="win95-button mt-2">
                    Buy for 10 THC
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
