
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { toast } from '@/hooks/use-toast';
import { useNFTs } from '@/hooks/use-nfts';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';

const NFTShop: React.FC = () => {
  const { address, thcBalance } = useWeb3();
  const { nfts, ownedNfts, loading, purchaseNFT, refreshNFTs } = useNFTs();
  const [refreshingData, setRefreshingData] = useState(false);
  
  // Filter out NFTs the user already owns
  const availableNfts = nfts.filter(nft => 
    !ownedNfts.some(owned => owned.id === nft.id)
  );
  
  const handleTriggerDataRefresh = async () => {
    if (refreshingData) return;
    
    setRefreshingData(true);
    try {
      const response = await fetch(
        `${window.location.origin}/api/fetch-nft-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ force: true }),
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'NFT Data Refreshed',
          description: result.message,
        });
        refreshNFTs();
      } else {
        throw new Error(result.error || 'Failed to refresh NFT data');
      }
    } catch (error) {
      console.error('Error refreshing NFT data:', error);
      toast({
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh NFT data',
        variant: 'destructive',
      });
    } finally {
      setRefreshingData(false);
    }
  };
  
  const handlePurchase = async (nftId: string, price: number) => {
    if (!address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase NFTs',
        variant: 'destructive',
      });
      return;
    }
    
    if (typeof thcBalance !== 'undefined' && parseFloat(thcBalance) < price) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${price} $THC to purchase this NFT`,
        variant: 'destructive',
      });
      return;
    }
    
    await purchaseNFT(nftId);
  };
  
  return (
    <div className="win95-window w-full">
      <div className="win95-title-bar flex justify-between items-center">
        <span>TinHat Catters NFT Shop</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-1 h-5 w-5 rounded-none"
          onClick={handleTriggerDataRefresh}
          disabled={refreshingData}
        >
          {refreshingData ? 
            <Loader2 className="h-3 w-3 animate-spin" /> : 
            <RefreshCcw className="h-3 w-3" />
          }
        </Button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : availableNfts.length > 0 ? (
            availableNfts.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name={nft.name}
                image={nft.image_url}
                boost={{
                  type: nft.boost_type,
                  value: nft.boost_value,
                  duration: nft.boost_duration,
                }}
                price={nft.price}
                onPurchase={() => handlePurchase(nft.id, nft.price)}
                disabled={!address}
              />
            ))
          ) : (
            <div className="col-span-full win95-panel p-4 text-center">
              <p className="mb-2">No NFTs available for purchase.</p>
              <p className="text-sm">You may already own all available NFTs or there might be an issue fetching the data.</p>
            </div>
          )}
        </div>
        
        {ownedNfts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Your NFT Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ownedNfts.map((nft) => (
                <NFTCard
                  key={nft.id}
                  id={nft.id}
                  name={nft.name}
                  image={nft.image_url}
                  boost={{
                    type: nft.boost_type,
                    value: nft.boost_value,
                    duration: nft.boost_duration,
                  }}
                  className="border-2 border-[#FFFF00]"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTShop;
