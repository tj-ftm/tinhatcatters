
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
      console.log('Setting up Web3 event listeners');
      
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
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
        console.log('Chain changed event triggered');
        // When chain changes, ensure we're on Sonic network
        switchToSonicNetwork().then(() => {
          if (address) {
            refreshBalance().catch(e => console.error('Error refreshing balance after chain change:', e));
          }
        }).catch(e => console.error('Error switching to Sonic network:', e));
      };

      // Add event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Initial check for network
      switchToSonicNetwork().catch(e => console.error('Error switching to Sonic network on initial load:', e));
      
      // Cleanup function
      return () => {
        console.log('Removing Web3 event listeners');
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address, disconnect, refreshBalance, refreshNFTs, setAddress]);

  // Periodically refresh balance
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (address) {
      console.log('Setting up periodic balance refresh for address:', address);
      interval = setInterval(() => {
        console.log('Periodic balance refresh');
        refreshBalance().catch(e => console.error('Error in periodic balance refresh:', e));
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) {
        console.log('Clearing periodic balance refresh');
        clearInterval(interval);
      }
    };
  }, [address, refreshBalance]);
}
