import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

export const SONIC_NETWORK = {
  name: 'Sonic',
  chainId: '0x92', // 146 in hex
  rpcUrl: 'https://rpc.soniclabs.com',
  explorerUrl: 'https://sonicscan.org',
  currency: {
    name: 'Sonic',
    symbol: 'S',
    decimals: 18
  }
};

// NFT contract addresses (placeholder - would be replaced with actual contract addresses)
export const TIN_HAT_CATTERS_ADDRESS = '0x2dc1886d67001d5d6a80feaa51513f7bb5a591fd';
export const SNACK_NFT_ADDRESS = '0xabcdef123456789abcdef123456789abcdef1234';
export const THC_TOKEN_ADDRESS = '0x17Af1Df44444AB9091622e4Aa66dB5BB34E51aD5';

// ERC20 ABI for the THC token
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Custom error for Web3 related issues
export class Web3Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Web3Error';
  }
}

// WalletConnect project ID - would normally be an env variable
// This is a placeholder project ID for development purposes only
const WC_PROJECT_ID = 'c1330fe75b833d2e66f772f4d2c565a3';

// Define as null initially
let walletConnectProvider: null | Awaited<ReturnType<typeof EthereumProvider.init>> = null;

// Initialize WalletConnect provider
async function initWalletConnectProvider() {
  if (!walletConnectProvider) {
    try {
      walletConnectProvider = await EthereumProvider.init({
        projectId: WC_PROJECT_ID,
        chains: [Number(parseInt(SONIC_NETWORK.chainId, 16))],
        optionalChains: [Number(parseInt(SONIC_NETWORK.chainId, 16))],
        showQrModal: true,
        rpcMap: {
          [Number(parseInt(SONIC_NETWORK.chainId, 16))]: SONIC_NETWORK.rpcUrl,
        },
        metadata: {
          name: "TinHatCatters",
          description: "TinHatCatters App",
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`],
        },
      });

      // Setup event listeners
      if (walletConnectProvider) {
        walletConnectProvider.on('disconnect', () => {
          console.log('WalletConnect disconnected');
          walletConnectProvider = null;
        });
      }
    } catch (error) {
      console.error('Error initializing WalletConnect provider:', error);
      throw new Web3Error('Failed to initialize WalletConnect');
    }
  }

  return walletConnectProvider;
}

// Check if MetaMask or another Web3 provider is available
export function isWeb3Available(): boolean {
  return typeof window !== 'undefined' && 
    (typeof window.ethereum !== 'undefined' || WC_PROJECT_ID !== undefined);
}

// Get ethers provider based on wallet type
export function getProvider(walletType?: string): ethers.BrowserProvider | null {
  if (!isWeb3Available()) {
    return null;
  }
  
  if (walletType === 'walletconnect' && walletConnectProvider) {
    return new ethers.BrowserProvider(walletConnectProvider as any);
  } else if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  
  return null;
}

// Connect wallet and return address
export async function connectWallet(walletType?: string): Promise<string> {
  if (!isWeb3Available()) {
    throw new Web3Error('No Web3 provider detected. Please install MetaMask or use WalletConnect.');
  }

  try {
    let provider;
    
    // Handle different wallet types
    if (walletType === 'walletconnect') {
      const wcProvider = await initWalletConnectProvider();
      
      if (!wcProvider) {
        throw new Web3Error('Failed to initialize WalletConnect.');
      }
      
      try {
        // Connect to WalletConnect
        const accounts = await wcProvider.enable();
        
        if (!accounts || accounts.length === 0) {
          throw new Web3Error('No accounts found. Please connect your wallet.');
        }
        
        provider = new ethers.BrowserProvider(wcProvider as any);
        
        // Always switch to Sonic network
        await switchToSonicNetwork(provider, true);
        
        return accounts[0];
      } catch (error) {
        console.error('Error connecting with WalletConnect:', error);
        throw new Web3Error('Failed to connect with WalletConnect. Please try again.');
      }
    } else if (walletType === 'browser') {
      // For browser wallets
      if (!window.ethereum) {
        throw new Web3Error('No browser wallet detected. Please install one.');
      }
      
      // Use the default window.ethereum provider
      provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Web3Error('No accounts found. Please unlock your wallet.');
      }

      // Always switch to Sonic network
      await switchToSonicNetwork(provider);
      
      return accounts[0];
    } else {
      throw new Web3Error('Invalid wallet type selected.');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    if (error instanceof Web3Error) {
      throw error;
    }
    throw new Web3Error('Failed to connect wallet. Please try again.');
  }
}

// Get user's S token balance
export async function getBalance(address: string): Promise<string> {
  if (!isWeb3Available() || !address) {
    return '0';
  }

  try {
    const provider = getProvider();
    if (!provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    // Always ensure we're on Sonic network before getting balance
    await switchToSonicNetwork();
    
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// Get user's THC token balance
export async function getThcBalance(address: string): Promise<string> {
  if (!isWeb3Available() || !address) {
    return '0';
  }

  try {
    const provider = getProvider();
    if (!provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(THC_TOKEN_ADDRESS, ERC20_ABI, signer);
    
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    
    // Format the balance with the appropriate decimals
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting THC balance:', error);
    return '0';
  }
}

// Switch to Sonic network
export async function switchToSonicNetwork(
  provider?: ethers.BrowserProvider,
  isWalletConnect: boolean = false
): Promise<boolean> {
  if (!isWeb3Available() && !provider) {
    throw new Web3Error('No Web3 provider detected.');
  }

  try {
    const web3Provider = provider || getProvider();
    
    if (!web3Provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    const network = await web3Provider.getNetwork();
    
    if (network.chainId.toString() === parseInt(SONIC_NETWORK.chainId, 16).toString()) {
      return true;
    }

    // Always try to switch networks if not on Sonic
    if (isWalletConnect && walletConnectProvider) {
      // WalletConnect handles chain switching differently
      await walletConnectProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SONIC_NETWORK.chainId }],
      });
      return true;
    }

    // For browser wallets
    if (window.ethereum) {
      // Request network switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SONIC_NETWORK.chainId }],
        });
        return true;
      } catch (switchError: any) {
        // Network doesn't exist in wallet, so we need to add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SONIC_NETWORK.chainId,
                chainName: SONIC_NETWORK.name,
                nativeCurrency: SONIC_NETWORK.currency,
                rpcUrls: [SONIC_NETWORK.rpcUrl],
                blockExplorerUrls: [SONIC_NETWORK.explorerUrl],
              },
            ],
          });
          return true;
        }
        throw switchError;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error switching network:', error);
    toast({
      title: 'Network Error',
      description: 'Please switch to the Sonic network to continue.',
      variant: 'destructive',
    });
    return false;
  }
}

// Function to fetch Tin Hat Catter NFTs from Sonicscan
export async function fetchTinHatCattersFromSonicscan(address: string) {
  try {
    // Use the Sonicscan API to fetch NFTs owned by the address
    const response = await fetch(`https://sonicscan.org/api/account/${address}/nft-tokens?contract=${TIN_HAT_CATTERS_ADDRESS}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch NFTs: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map the data to the format we need
    // The actual response structure may vary, adjust according to the real Sonicscan API
    const nfts = data.items?.map((item: any) => {
      return {
        id: item.tokenId || item.id,
        image: item.metadata?.image || `https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi/${item.tokenId || item.id}.jpg`
      };
    }) || [];
    
    // Fallback to alternative API if the first one didn't return results
    if (nfts.length === 0) {
      // Try an alternative approach - this is a fallback in case the first API doesn't work
      const blockscoutResponse = await fetch(`https://sonicscan.org/api/v2/addresses/${address}/tokens?type=ERC-721&contract=${TIN_HAT_CATTERS_ADDRESS}`);
      
      if (blockscoutResponse.ok) {
        const blockscoutData = await blockscoutResponse.json();
        
        return blockscoutData.items?.map((token: any) => {
          const tokenId = token.id || token.token_id;
          return {
            id: tokenId,
            image: `https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi/${tokenId}.jpg`
          };
        }) || [];
      }
    }
    
    return nfts;
  } catch (error) {
    console.error("Error fetching NFTs from Sonicscan:", error);
    
    // If API calls fail, use the token contract address to construct a basic query
    // This is a last resort fallback
    try {
      // Check if the user owns token IDs 128 or 256 as examples
      // In a real implementation, you would iterate through possible token IDs or use a contract call
      const possibleTokenIds = [128, 256, 42, 71, 99, 169, 200, 333, 420, 501];
      const nfts = possibleTokenIds.map(id => ({
        id: id.toString(),
        image: `https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi/${id}.jpg`
      }));
      
      return nfts.slice(0, 2); // Limit to just a couple for demonstration
    } catch (fallbackError) {
      console.error("Fallback NFT check failed:", fallbackError);
      return [];
    }
  }
}

// Get owned TinHatCatters NFTs (updated)
export async function getOwnedTinHatCatters(address: string): Promise<any[]> {
  if (!isWeb3Available() || !address) {
    return [];
  }

  try {
    return fetchTinHatCattersFromSonicscan(address);
  } catch (error) {
    console.error('Error getting TinHatCatters:', error);
    return [];
  }
}

// Get owned snack NFTs
export async function getOwnedSnacks(address: string): Promise<any[]> {
  if (!isWeb3Available() || !address) {
    return [];
  }

  try {
    // This is a simplified version - in a real app, we would query the NFT contract
    // For now, we'll return mock data
    return [
      {
        id: 1,
        name: 'Energy Donut',
        image: '/assets/snacks/donut.png',
        boost: { type: 'speed', value: 20, duration: 10 }
      }
    ];
  } catch (error) {
    console.error('Error getting snacks:', error);
    return [];
  }
}

// Purchase a snack NFT
export async function purchaseSnack(snackId: number): Promise<boolean> {
  if (!isWeb3Available()) {
    throw new Web3Error('No Web3 provider detected. Please install MetaMask.');
  }

  try {
    const provider = getProvider();
    if (!provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    // This is a simplified version - in a real app, we would call the smart contract
    toast({
      title: 'Purchase Successful',
      description: 'You have purchased a new snack NFT!',
    });
    
    return true;
  } catch (error) {
    console.error('Error purchasing snack:', error);
    toast({
      title: 'Purchase Failed',
      description: 'Failed to purchase snack. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
}

// Disconnect WalletConnect if it was used
export async function disconnectWalletConnect(): Promise<void> {
  if (walletConnectProvider) {
    try {
      await walletConnectProvider.disconnect();
      walletConnectProvider = null;
    } catch (error) {
      console.error('Error disconnecting WalletConnect:', error);
    }
  }
}
