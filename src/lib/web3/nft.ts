
// Etherscan API key
const ETHERSCAN_API_KEY = '5YNXI6EBCV3E1IZANWBC13V1ABXEVG9YFK';
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

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
