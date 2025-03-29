
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Web3ContextType } from '@/types/web3';
import { useWeb3Operations } from '@/hooks/use-web3-operations';
import { useWeb3Effects } from '@/hooks/use-web3-effects';
import { toast } from '@/hooks/use-toast';
import { isWeb3Available, switchToSonicNetwork } from '@/lib/web3';

const Web3Context = createContext<Web3ContextType>({
  address: null,
  balance: '0',
  thcBalance: null,
  connecting: false,
  tinHatCatters: [],
  snacks: [],
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
  refreshNFTs: async () => {},
  isRefreshingBalance: false
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    address,
    balance, 
    thcBalance,
    connecting,
    tinHatCatters,
    snacks,
    connect,
    disconnect,
    refreshBalance,
    refreshNFTs,
    setAddress,
    isRefreshingBalance
  } = useWeb3Operations();
  
  // Check network on initial load - safely
  useEffect(() => {
    const checkNetwork = async () => {
      if (isWeb3Available()) {
        try {
          await switchToSonicNetwork();
        } catch (error) {
          console.error('Failed to switch network on initial load:', error);
          // Don't block rendering if network switch fails
        }
      }
    };
    
    checkNetwork();
  }, []);
  
  // Setup event listeners and periodic balance refresh
  useWeb3Effects({
    address,
    refreshBalance,
    refreshNFTs,
    disconnect,
    setAddress
  });

  return (
    <Web3Context.Provider 
      value={{ 
        address, 
        balance, 
        thcBalance,
        connecting,
        tinHatCatters,
        snacks,
        connect, 
        disconnect,
        refreshBalance,
        refreshNFTs,
        isRefreshingBalance
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
