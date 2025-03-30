
import React, { useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import NFTCard from './NFTCard';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface SonicNFTDisplayProps {
  className?: string;
  iconUrl?: string; // Added this prop to fix the error
}

const SonicNFTDisplay: React.FC<SonicNFTDisplayProps> = ({ className, iconUrl }) => {
  const { address, sonicNFTs, refreshNFTs } = useWeb3();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
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
      <div className="win95-title-bar mb-2 md:mb-4 flex justify-between items-center">
        <span className={isMobile ? 'text-sm' : ''}>Your NFT Collection</span>
        <button 
          className={`win95-button ${isMobile ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-0.5'} flex items-center`}
          onClick={handleRefresh}
          disabled={isRefreshing || !address}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {isMobile ? 'Refresh' : 'Refreshing...'}
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      
      <div className="p-2 md:p-4">
        {!address ? (
          <div className="win95-panel p-2 md:p-4 text-center">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} mb-2`}>Connect your wallet to view your NFTs.</p>
          </div>
        ) : sonicNFTs.length === 0 ? (
          <div className="win95-panel p-2 md:p-4 text-center">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} mb-2`}>No Sonic NFTs found in your wallet.</p>
            <p className={`${isMobile ? 'text-[10px]' : 'text-xs'}`}>You don't own any NFTs from the collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
