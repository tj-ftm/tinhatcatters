
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SonicNFTDisplayProps {
  className?: string;
}

const SonicNFTDisplay: React.FC<SonicNFTDisplayProps> = ({ className }) => {
  const { address, sonicNFTs, refreshNFTs } = useWeb3();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (!address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to view your NFTs.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsRefreshing(true);
    try {
      await refreshNFTs();
      toast({
        title: 'NFTs Refreshed',
        description: 'Your NFT collection has been updated.'
      });
    } catch (error) {
      console.error('Error refreshing NFTs:', error);
      toast({
        title: 'Refresh Failed',
        description: 'Unable to refresh your NFTs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className={`win95-window w-full ${className || ''}`}>
      <div className="win95-title-bar mb-4 flex justify-between items-center">
        <span>Your Sonic NFT Collection</span>
        <button 
          className="win95-button text-xs px-2 py-0.5 flex items-center"
          onClick={handleRefresh}
          disabled={isRefreshing || !address}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      
      <div className="p-4">
        {!address ? (
          <div className="win95-panel p-4 text-center">
            <p className="text-sm mb-2">Connect your wallet to view your NFTs.</p>
          </div>
        ) : sonicNFTs.length === 0 ? (
          <div className="win95-panel p-4 text-center">
            <p className="text-sm mb-2">No Sonic NFTs found in your wallet.</p>
            <p className="text-xs">You don't own any NFTs from the collection at 0x2dc1886d67001d5d6a80feaa51513f7bb5a591fd.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sonicNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name={nft.name || `NFT #${nft.id}`}
                image={nft.image || '/placeholder.svg'}
                className="h-full"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SonicNFTDisplay;
