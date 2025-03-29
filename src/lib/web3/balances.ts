
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

    if (typeof window.ethereum !== 'undefined') {
      // Update for ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenAddress = process.env.NEXT_PUBLIC_THC_CONTRACT_ADDRESS; // Ensure this is set in your environment variables
      if (!tokenAddress) {
        console.error('THC token address not set in environment variables!');
        return '0';
      }
      
      const abi = [
        "function balanceOf(address) view returns (uint)",
        "function decimals() view returns (uint8)"
      ];
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        abi,
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
