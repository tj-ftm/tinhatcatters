
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// Check if Web3 is available
export const isWeb3Available = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Function to switch to Sonic Network
export const switchToSonicNetwork = async () => {
  if (!isWeb3Available()) return false;
  
  const sonicChainId = '0x8274'; // Chain ID for Sonic (33396 in decimal)
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: sonicChainId }],
    });
    return true;
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: sonicChainId,
              chainName: 'Sonic',
              nativeCurrency: {
                name: 'Sonic',
                symbol: 'SON',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sonic.game/'],
              blockExplorerUrls: ['https://sonicscan.io/'],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sonic network:', addError);
        return false;
      }
    }
    console.error('Error switching to Sonic network:', error);
    return false;
  }
};

// Connect wallet function
export const connectWallet = async (walletType?: string) => {
  if (!isWeb3Available()) {
    throw new Error('No Web3 wallet detected');
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error: any) {
    console.error('Error connecting wallet:', error);
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

// Disconnect WalletConnect
export const disconnectWalletConnect = async () => {
  // If using WalletConnect, we would implement disconnect logic here
  // This is a placeholder for now
  console.log('Disconnecting WalletConnect provider');
  return true;
};

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
