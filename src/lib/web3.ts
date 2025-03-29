
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

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
export const TIN_HAT_CATTERS_ADDRESS = '0x123456789abcdef123456789abcdef123456789a';
export const SNACK_NFT_ADDRESS = '0xabcdef123456789abcdef123456789abcdef1234';

// Custom error for Web3 related issues
export class Web3Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Web3Error';
  }
}

// Check if MetaMask or another Web3 provider is available
export function isWeb3Available(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

// Get ethers provider based on wallet type
export function getProvider(walletType?: string): ethers.BrowserProvider | null {
  if (!isWeb3Available()) {
    return null;
  }
  
  // Custom provider selection logic could be added here
  // For now, we'll just use window.ethereum for all wallet types
  return new ethers.BrowserProvider(window.ethereum);
}

// Connect wallet and return address
export async function connectWallet(walletType?: string): Promise<string> {
  if (!isWeb3Available()) {
    throw new Web3Error('No Web3 provider detected. Please install MetaMask.');
  }

  try {
    const provider = getProvider(walletType);
    if (!provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    // Request account access
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      throw new Web3Error('No accounts found. Please unlock your wallet.');
    }

    // Check if user is on Sonic network
    await switchToSonicNetwork();
    
    return accounts[0];
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

    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

// Switch to Sonic network
export async function switchToSonicNetwork(): Promise<boolean> {
  if (!isWeb3Available()) {
    throw new Web3Error('No Web3 provider detected. Please install MetaMask.');
  }

  try {
    // Check if user is already on Sonic network
    const provider = getProvider();
    if (!provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    const network = await provider.getNetwork();
    
    if (network.chainId.toString() === SONIC_NETWORK.chainId) {
      return true;
    }

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

// Get owned TinHatCatters NFTs
export async function getOwnedTinHatCatters(address: string): Promise<any[]> {
  if (!isWeb3Available() || !address) {
    return [];
  }

  try {
    const provider = getProvider();
    if (!provider) {
      throw new Web3Error('Cannot initialize Web3 provider.');
    }

    // This is a simplified version - in a real app, we would query the NFT contract
    // For now, we'll return mock data
    return [
      {
        id: 1,
        name: 'TinHatCatter #1',
        image: '/assets/tinhats/tinhat1.png',
        boost: { type: 'speed', value: 10 }
      },
      {
        id: 2,
        name: 'TinHatCatter #2',
        image: '/assets/tinhats/tinhat2.png',
        boost: { type: 'jump', value: 15 }
      }
    ];
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
