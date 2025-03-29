
import { useEffect } from 'react';
import { isWeb3Available, switchToSonicNetwork } from '@/lib/web3';

interface UseWeb3EffectsProps {
  address: string | null;
  refreshBalance: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
  disconnect: () => void;
  setAddress: (address: string | null) => void;
}

export function useWeb3Effects({
  address,
  refreshBalance,
  refreshNFTs,
  disconnect,
  setAddress
}: UseWeb3EffectsProps) {
  // Listen for account changes and network changes
  useEffect(() => {
    if (isWeb3Available() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
        } else if (accounts[0] !== address) {
          // Account changed
          setAddress(accounts[0]);
          refreshBalance().catch(e => console.error('Error refreshing balance after account change:', e));
          refreshNFTs().catch(e => console.error('Error refreshing NFTs after account change:', e));
        }
      };
      
      const handleChainChanged = () => {
        // When chain changes, ensure we're on Sonic network
        switchToSonicNetwork().then(() => {
          if (address) {
            refreshBalance().catch(e => console.error('Error refreshing balance after chain change:', e));
          }
        }).catch(e => console.error('Error switching to Sonic network:', e));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Check network on initial load
      switchToSonicNetwork().catch(e => console.error('Error switching to Sonic network on initial load:', e));
      
      // Cleanup
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, disconnect, refreshBalance, refreshNFTs, setAddress]);

  // Periodically refresh balance
  useEffect(() => {
    if (address) {
      const interval = setInterval(() => {
        refreshBalance().catch(e => console.error('Error in periodic balance refresh:', e));
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [address, refreshBalance]);
}
