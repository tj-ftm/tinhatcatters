
import React, { createContext, useContext, ReactNode } from 'react';
import { Web3ContextType } from '@/types/web3';
import { useWeb3Operations } from '@/hooks/use-web3-operations';
import { useWeb3Effects } from '@/hooks/use-web3-effects';

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
    setAddress
  } = useWeb3Operations();
  
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
        refreshNFTs 
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
