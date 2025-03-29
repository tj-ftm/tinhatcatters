import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  connectWallet, 
  getBalance, 
  getOwnedTinHatCatters, 
  getOwnedSnacks,
  isWeb3Available,
  getThcBalance,
  disconnectWalletConnect,
  switchToSonicNetwork
} from '@/lib/web3';
import { toast } from '@/hooks/use-toast';
import { fetchOwnedNFTs, NFTMetadata } from '@/lib/web3/nftImport';

interface Web3ContextType {
  address: string | null;
  balance: string;
  thcBalance: string | null;
  connecting: boolean;
  tinHatCatters: any[];
  snacks: any[];
  sonicNFTs: NFTMetadata[];
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  refreshNFTs: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  balance: '0',
  thcBalance: null,
  connecting: false,
  tinHatCatters: [],
  snacks: [],
  sonicNFTs: [],
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
  refreshNFTs: async () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [thcBalance, setThcBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [tinHatCatters, setTinHatCatters] = useState<any[]>([]);
  const [snacks, setSnacks] = useState<any[]>([]);
  const [sonicNFTs, setSonicNFTs] = useState<NFTMetadata[]>([]);
  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);

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
      await switchToSonicNetwork();
      
      const userAddress = await connectWallet(walletType);
      setAddress(userAddress);
      setConnectedWalletType(walletType || 'unknown');
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

  const disconnect = () => {
    if (connectedWalletType === 'walletconnect') {
      disconnectWalletConnect();
    }
    
    setAddress(null);
    setBalance('0');
    setThcBalance(null);
    setTinHatCatters([]);
    setSnacks([]);
    setSonicNFTs([]);
    setConnectedWalletType(null);
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  const refreshBalance = async () => {
    if (address) {
      await switchToSonicNetwork();
      
      const newBalance = await getBalance(address);
      setBalance(newBalance);
      
      const newThcBalance = await getThcBalance(address);
      setThcBalance(newThcBalance);
    }
  };

  const refreshNFTs = async () => {
    if (address) {
      const cats = await getOwnedTinHatCatters(address);
      setTinHatCatters(cats);
      
      const ownedSnacks = await getOwnedSnacks(address);
      setSnacks(ownedSnacks);
      
      try {
        const sonicNfts = await fetchOwnedNFTs(address);
        setSonicNFTs(sonicNfts);
      } catch (error) {
        console.error('Error fetching Sonic NFTs:', error);
      }
    }
  };

  useEffect(() => {
    if (isWeb3Available() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          refreshBalance();
          refreshNFTs();
        }
      };
      
      const handleChainChanged = () => {
        switchToSonicNetwork().then(() => {
          if (address) {
            refreshBalance();
          }
        });
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      switchToSonicNetwork();
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      const interval = setInterval(() => {
        refreshBalance();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [address]);

  return (
    <Web3Context.Provider 
      value={{ 
        address, 
        balance, 
        thcBalance,
        connecting,
        tinHatCatters,
        snacks,
        sonicNFTs,
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
