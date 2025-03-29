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

// Function to get the current account balance
export const getBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      return ethers.utils.formatEther(balance);
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenAddress = process.env.NEXT_PUBLIC_THC_CONTRACT_ADDRESS; // Ensure this is set in your environment variables
      if (!tokenAddress) {
        console.error('THC token address not set in environment variables!');
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
      return ethers.utils.formatUnits(balance, decimals);
    } else {
      console.error('MetaMask or compatible wallet not detected!');
      return '0';
    }
  } catch (error: any) {
    console.error('Error getting THC balance:', error);
    return '0';
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
