
import { useState } from 'react';
import { 
  connectWallet, 
  getBalance, 
  getOwnedTinHatCatters, 
  getOwnedSnacks,
  isWeb3Available,
  getTHCBalance,
  disconnectWalletConnect,
  switchToSonicNetwork
} from '@/lib/web3';
import { toast } from '@/hooks/use-toast';

export function useWeb3Operations() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [thcBalance, setThcBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [tinHatCatters, setTinHatCatters] = useState<any[]>([]);
  const [snacks, setSnacks] = useState<any[]>([]);
  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);

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
      // Always ensure we're on Sonic network
      await switchToSonicNetwork();
      
      const userAddress = await connectWallet(walletType);
      setAddress(userAddress);
      setConnectedWalletType(walletType || 'unknown');
      
      try {
        await refreshBalance();
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
      
      try {
        await refreshNFTs();
      } catch (error) {
        console.error('Error refreshing NFTs:', error);
      }
      
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
    // If using WalletConnect, disconnect properly
    if (connectedWalletType === 'walletconnect') {
      disconnectWalletConnect();
    }
    
    setAddress(null);
    setBalance('0');
    setThcBalance(null);
    setTinHatCatters([]);
    setSnacks([]);
    setConnectedWalletType(null);
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  // Refresh balance with retry logic
  const refreshBalance = async () => {
    if (address) {
      try {
        // Ensure on Sonic network before refreshing balance
        try {
          await switchToSonicNetwork();
        } catch (error) {
          console.error('Error switching to Sonic network:', error);
          // Continue with balance check anyway
        }
        
        // Get ETH balance
        const newBalance = await getBalance(address);
        setBalance(newBalance);
        
        // Get THC token balance with retry
        let attempts = 0;
        let thcSuccess = false;
        let newThcBalance = '0';
        
        while (attempts < 3 && !thcSuccess) {
          try {
            console.log(`Attempting to get THC balance, attempt ${attempts + 1}`);
            newThcBalance = await getTHCBalance(address);
            thcSuccess = true;
          } catch (error) {
            console.warn(`THC balance attempt ${attempts + 1} failed:`, error);
            attempts++;
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log("THC balance updated:", newThcBalance);
        setThcBalance(newThcBalance);
        
      } catch (error) {
        console.error('Error in refreshBalance:', error);
        // Don't throw the error further, just log it
      }
    }
  };

  // Refresh NFTs with better error handling
  const refreshNFTs = async () => {
    if (address) {
      try {
        console.log("Refreshing NFTs for address:", address);
        const cats = await getOwnedTinHatCatters(address);
        console.log("Retrieved cats:", cats);
        setTinHatCatters(cats);
        
        try {
          const ownedSnacks = await getOwnedSnacks(address);
          setSnacks(ownedSnacks);
        } catch (snackError) {
          console.error('Error fetching snacks:', snackError);
          // Continue even if snacks fail to load
        }
      } catch (error) {
        console.error('Error in refreshNFTs:', error);
        // Don't throw the error further, just log it and return empty array
        setTinHatCatters([]);
      }
    }
  };

  return {
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
    connectedWalletType,
    setAddress
  };
}
