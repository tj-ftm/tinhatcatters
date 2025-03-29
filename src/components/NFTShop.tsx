
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { purchaseSnack } from '@/lib/web3';
import { toast } from '@/hooks/use-toast';

const AVAILABLE_SNACKS = [
  {
    id: 'donut',
    name: 'Energy Donut',
    image: '/assets/snacks/donut.png',
    price: 5,
    boost: { type: 'speed', value: 20, duration: 10 }
  },
  {
    id: 'cookie',
    name: 'Speed Cookie',
    image: '/assets/snacks/cookie.png',
    price: 8,
    boost: { type: 'speed', value: 30, duration: 5 }
  },
  {
    id: 'coffee',
    name: 'Jump Coffee',
    image: '/assets/snacks/coffee.png',
    price: 7,
    boost: { type: 'jump', value: 25, duration: 10 }
  }
];

const NFTShop: React.FC = () => {
  const { address, balance, refreshNFTs } = useWeb3();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  
  const handlePurchase = async (snackId: string) => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first.',
        variant: 'destructive'
      });
      return;
    }
    
    const snack = AVAILABLE_SNACKS.find(s => s.id === snackId);
    if (!snack) return;
    
    // Check if user has enough balance
    if (parseFloat(balance) < snack.price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${snack.price} S to purchase this item.`,
        variant: 'destructive'
      });
      return;
    }
    
    setPurchasing(snackId);
    
    try {
      const success = await purchaseSnack(Number(snackId));
      
      if (success) {
        toast({
          title: 'Purchase Successful',
          description: `You have purchased ${snack.name}!`
        });
        refreshNFTs();
      }
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to purchase snack',
        variant: 'destructive'
      });
    } finally {
      setPurchasing(null);
    }
  };
  
  return (
    <div className="win95-window w-full h-full">
      <div className="win95-title-bar mb-4">
        <span>NFT Snack Shop</span>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm mb-2">
            Purchase snack NFTs to boost your gameplay! Each snack provides temporary enhancements to help you achieve higher scores.
          </p>
          
          <div className="win95-panel">
            <p className="text-xs font-bold mb-1">Your Balance:</p>
            <p className="win95-inset p-1 text-sm">{parseFloat(balance).toFixed(4)} S</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_SNACKS.map((snack) => (
            <NFTCard
              key={snack.id}
              id={snack.id}
              name={snack.name}
              image={snack.image}
              boost={snack.boost}
              price={snack.price}
              onPurchase={() => handlePurchase(snack.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTShop;
