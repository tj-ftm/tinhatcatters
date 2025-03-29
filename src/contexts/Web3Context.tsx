import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  connectWallet, 
  getBalance, 
  getOwnedTinHatCatters, 
  getOwnedSnacks,
  isWeb3Available
} from '@/lib/web3';
import { toast } from '@/hooks/use-toast';

interface Web3ContextType {
  address: string | null;
  balance: string;
  connecting: boolean;
  tinHatCatters: any[];
  snacks: any[];
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  balance: '0',
  connecting: false,
  tinHatCatters: [],
  snacks: [],
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
  refreshNFTs: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [tinHatCatters, setTinHatCatters] = useState<any[]>([]);
  const [snacks, setSnacks] = useState<any[]>([]);

  // Connect wallet
  const connect = async (walletType?: string) => {
    if (!isWeb3Available()) {
      toast({
        title: 'Web3 Not Available',
        description: 'Please install MetaMask or another Web3 wallet.',
        variant: 'destructive',
      });
      return;
    }

    setConnecting(true);
    try {
      const userAddress = await connectWallet(walletType);
      setAddress(userAddress);
      await refreshBalance();
      await refreshNFTs();
      
      const walletName = walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : 'Wallet';
      toast({
        title: `${walletName} Connected`,
        description: 'Your wallet has been connected successfully.',
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null);
    setBalance('0');
    setTinHatCatters([]);
    setSnacks([]);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (address) {
      const newBalance = await getBalance(address);
      setBalance(newBalance);
    }
  };

  // Refresh NFTs
  const refreshNFTs = async () => {
    if (address) {
      const cats = await getOwnedTinHatCatters(address);
      setTinHatCatters(cats);
      
      const ownedSnacks = await getOwnedSnacks(address);
      setSnacks(ownedSnacks);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (isWeb3Available() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
        } else if (accounts[0] !== address) {
          // Account changed
          setAddress(accounts[0]);
          refreshBalance();
          refreshNFTs();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address]);

  // Periodically refresh balance
  useEffect(() => {
    if (address) {
      const interval = setInterval(() => {
        refreshBalance();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [address]);

  return (
    <Web3Context.Provider 
      value={{ 
        address, 
        balance, 
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
