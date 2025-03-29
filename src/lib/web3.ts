
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

// Function to switch to Sonic Network
export const switchToSonicNetwork = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Sonic Network Chain ID (this is an example, replace with actual Sonic chain ID)
      const chainId = '0x22'; // Chain ID for Sonic Network (decimal: 34)
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x22', // Chain ID for Sonic Network (decimal: 34)
                chainName: 'Sonic Network',
                nativeCurrency: {
                  name: 'Sonic',
                  symbol: 'S',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sonic.network'],
                blockExplorerUrls: ['https://sonicscan.io/'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Sonic network:', addError);
          toast({
            title: "Network Error",
            description: "Failed to add Sonic network to your wallet",
            variant: "destructive",
          });
          return false;
        }
      }
      console.error('Error switching to Sonic network:', switchError);
      return false;
    }
  }
  return false;
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

// Function to get the THC balance (assuming it's a ERC-20 token)
export const getTHCBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getTHCBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Updated THC token address for Sonic network
      const tokenAddress = '0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5';
      
      if (!tokenAddress) {
        console.error('THC token address not set!');
        return '0';
      }
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function balanceOf(address) view returns (uint)",
          "function decimals() view returns (uint8)"
        ],
        provider
      );
      
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(address);
      return ethers.formatUnits(balance, decimals);
    } else {
      console.error('MetaMask or compatible wallet not detected!');
      return '0';
    }
  } catch (error: any) {
    console.error('Error getting THC balance:', error);
    return '0';
  }
};

// Function to get owned Tin Hat Catters NFTs
export const getOwnedTinHatCatters = async (address: string): Promise<any[]> => {
  try {
    // For now, returning sample data as a placeholder
    // In a real implementation, you would query the blockchain or an API
    return [
      {
        id: '42',
        image: 'https://sonicscan.io/nft/tinhats/42.png',
        name: 'Tin Hat Catter #42',
      },
      {
        id: '777',
        image: 'https://sonicscan.io/nft/tinhats/777.png',
        name: 'Tin Hat Catter #777',
      }
    ];
  } catch (error) {
    console.error('Error fetching Tin Hat Catters:', error);
    return [];
  }
};

// Function to get owned Snacks NFTs
export const getOwnedSnacks = async (address: string): Promise<any[]> => {
  try {
    // For now, returning sample data as a placeholder
    return [
      {
        id: '1',
        image: 'https://sonicscan.io/nft/snacks/1.png',
        name: 'Snack #1',
      }
    ];
  } catch (error) {
    console.error('Error fetching Snacks:', error);
    return [];
  }
};

// Etherscan API key
const ETHERSCAN_API_KEY = '5YNXI6EBCV3E1IZANWBC13V1ABXEVG9YFK';
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

export const fetchTinHatCattersFromSonicscan = async (address: string) => {
  try {
    // Use Etherscan API to fetch NFT data
    const response = await fetch(
      `${ETHERSCAN_API_URL}?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      // Process and return the NFT data
      return data.result
        .filter((tx: any) => 
          // Filter for Tin Hat Catters NFTs (you may need to adjust the contract address)
          tx.tokenName === 'TinHatCatter' || 
          tx.contractAddress.toLowerCase() === '0xYourTinHatCatterContractAddress'.toLowerCase()
        )
        .map((tx: any) => ({
          id: tx.tokenID,
          // Construct image URL based on token ID
          image: `https://sonicscan.io/nft/tinhats/${tx.tokenID}.png`,
          // Additional metadata if available
          name: `Tin Hat Catter #${tx.tokenID}`,
          contractAddress: tx.contractAddress
        }));
    }
    
    // If no results or error
    return [];
  } catch (error) {
    console.error('Error fetching NFT data from Etherscan:', error);
    throw new Error('Failed to fetch NFT data');
  }
};

// Function to get THC token balance (alternative implementation with hard-coded values)
export const getThcBalance = getTHCBalance;

// Function to purchase a snack NFT
export const purchaseSnack = async (snackId: number): Promise<boolean> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "No Wallet Detected",
        description: "Please install MetaMask or another compatible wallet to purchase snacks.",
        variant: "destructive",
      });
      return false;
    }
    
    // In a real implementation, this would interact with a smart contract
    // Here we're just simulating a purchase with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Purchase Successful",
      description: `You have purchased snack #${snackId}!`,
    });
    
    return true;
  } catch (error: any) {
    console.error('Error purchasing snack:', error);
    toast({
      title: "Purchase Failed",
      description: error.message || "Failed to purchase snack. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
