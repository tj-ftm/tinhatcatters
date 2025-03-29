
import { ethers } from 'ethers';
import { isWeb3Available } from './core';

// Function to get the current account balance
export const getBalance = async (address: string | null): Promise<string> => {
  try {
    if (!address) {
      console.warn('No address provided to getBalance');
      return '0';
    }

    if (typeof window.ethereum !== 'undefined') {
      // Update for ethers v6
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

    if (!isWeb3Available()) {
      console.error('Web3 is not available');
      return '0';
    }

    // Log to check if we're getting here
    console.log('Getting THC balance for address:', address);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Use the specific contract address provided
      const tokenAddress = '0xae8e9b2222031c464342dbfab7433b64eb5c15cf';
      
      console.log('Using token contract address:', tokenAddress);
      
      const abi = [
        "function balanceOf(address) view returns (uint)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ];
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        abi,
        provider
      );
      
      // Get token decimals
      console.log('Fetching token decimals...');
      const decimals = await tokenContract.decimals();
      console.log('Token decimals:', decimals);
      
      // Get balance
      console.log('Fetching balance for address:', address);
      const balance = await tokenContract.balanceOf(address);
      console.log('Raw balance:', balance.toString());
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log('Formatted THC balance:', formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('Error in THC balance inner try/catch:', error);
      return '0';
    }
  } catch (error: any) {
    console.error('Error getting THC balance (outer):', error);
    console.error('Error details:', error.message);
    return '0';
  }
};
