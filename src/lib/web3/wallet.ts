
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// Function to request access to the user's wallet
export const requestAccount = async () => {
  try {
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } else {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another compatible wallet to use this feature.",
        variant: "destructive",
      });
      console.error('MetaMask or compatible wallet not detected!');
      return null;
    }
  } catch (error: any) {
    toast({
      title: "Wallet Access Denied",
      description: error.message || "Failed to connect to wallet. Please try again.",
      variant: "destructive",
    });
    console.error('Error requesting account:', error);
    return null;
  }
};

// Function to connect wallet and return user address
export const connectWallet = async (walletType?: string) => {
  try {
    // If using regular browser wallet like MetaMask
    if (!walletType || walletType === 'browser') {
      return await requestAccount();
    }
    
    // For WalletConnect or other wallet types
    if (walletType === 'walletconnect') {
      // Basic implementation for WalletConnect
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          return accounts[0];
        } catch (error: any) {
          console.error('WalletConnect error:', error);
          toast({
            title: "WalletConnect Failed",
            description: error.message || "Failed to connect with WalletConnect",
            variant: "destructive",
          });
          throw error;
        }
      } else {
        toast({
          title: "WalletConnect Not Supported",
          description: "Your browser doesn't support WalletConnect",
          variant: "destructive",
        });
        throw new Error("WalletConnect not supported");
      }
    }
    
    return null;
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    toast({
      title: "Connection Failed",
      description: error.message || "Failed to connect wallet",
      variant: "destructive",
    });
    throw error;
  }
};

// Function to disconnect WalletConnect provider
export const disconnectWalletConnect = async () => {
  // Simple implementation - in a real app you'd use the WalletConnect SDK
  if (typeof window.ethereum !== 'undefined' && window.ethereum.hasOwnProperty('isWalletConnect')) {
    try {
      // Safely check if the disconnect method exists before calling it
      if (typeof (window.ethereum as any).disconnect === 'function') {
        await (window.ethereum as any).disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
    }
  }
};

// Function to check if Web3 is available
export const isWeb3Available = () => {
  return typeof window.ethereum !== 'undefined';
};

// Function to get the current account balance
export const getBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } else {
      console.error('MetaMask or compatible wallet not detected!');
      return '0';
    }
  } catch (error: any) {
    console.error('Error getting balance:', error);
    return '0';
  }
};
