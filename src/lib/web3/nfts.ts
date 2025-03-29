
import { ethers } from 'ethers';

// Etherscan API key
const ETHERSCAN_API_KEY = '5YNXI6EBCV3E1IZANWBC13V1ABXEVG9YFK';
// Sonic API URL - change to Sonic's Etherscan-compatible API if different
const SONIC_API_URL = 'https://api-sonic.etherscan.io/api';
// TinHatCatter contract address on Sonic network
const TIN_HAT_CATTER_CONTRACT = '0x2DC1886d67001d5d6A80FEaa51513f7BB5a591FD';

// Function to fetch NFTs from the specified contract for an address
export const fetchNFTsFromContract = async (address: string) => {
  try {
    console.log(`Fetching NFTs for address ${address} from contract ${TIN_HAT_CATTER_CONTRACT}`);
    
    // First, get all NFT transfers for this address
    const response = await fetch(
      `${SONIC_API_URL}?module=account&action=tokennfttx&address=${address}&contractaddress=${TIN_HAT_CATTER_CONTRACT}&startblock=0&endblock=999999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.status === '1' && data.result && Array.isArray(data.result)) {
      // Process the results to get unique token IDs owned by this address
      const ownedTokens = new Map();
      
      // Process transfers to determine current ownership
      data.result.forEach((tx: any) => {
        const tokenId = tx.tokenID;
        const from = tx.from.toLowerCase();
        const to = tx.to.toLowerCase();
        const userAddress = address.toLowerCase();
        
        // If token was sent from user, they no longer own it
        if (from === userAddress) {
          ownedTokens.delete(tokenId);
        }
        // If token was sent to user, they now own it
        if (to === userAddress) {
          ownedTokens.set(tokenId, {
            id: tokenId,
            contractAddress: tx.contractAddress,
            name: `Tin Hat Catter #${tokenId}`,
            // Using Sonic's block explorer for image URL if available
            image: `https://sonicscan.io/token/${TIN_HAT_CATTER_CONTRACT}/${tokenId}/image`,
            // Fallback image construction
            fallbackImage: `/assets/tinhats/${tokenId}.png`
          });
        }
      });
      
      console.log('Owned NFTs:', Array.from(ownedTokens.values()));
      return Array.from(ownedTokens.values());
    }
    
    // If no results or error
    console.log('No NFTs found or API error:', data.message || 'Unknown error');
    return [];
  } catch (error) {
    console.error('Error fetching NFT data from Sonic network:', error);
    return [];
  }
};

// Function to fetch metadata for a specific token ID
export const fetchNFTMetadata = async (tokenId: string) => {
  try {
    // Some contract APIs expose a tokenURI method to get metadata
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const abi = [
        "function tokenURI(uint256 tokenId) view returns (string)"
      ];
      
      const contract = new ethers.Contract(
        TIN_HAT_CATTER_CONTRACT,
        abi,
        provider
      );
      
      try {
        // Try to get the token URI
        const tokenURI = await contract.tokenURI(tokenId);
        console.log('Token URI:', tokenURI);
        
        // Fetch metadata from the URI
        if (tokenURI) {
          let metadataUrl = tokenURI;
          // Handle ipfs:// URIs
          if (tokenURI.startsWith('ipfs://')) {
            metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
          }
          
          const response = await fetch(metadataUrl);
          const metadata = await response.json();
          return metadata;
        }
      } catch (error) {
        console.warn('Error fetching tokenURI, falling back to default metadata:', error);
      }
    }
    
    // Fallback: return basic metadata
    return {
      name: `Tin Hat Catter #${tokenId}`,
      description: "A Tin Hat Catter NFT from the Sonic network",
      image: `https://sonicscan.io/token/${TIN_HAT_CATTER_CONTRACT}/${tokenId}/image`,
      attributes: []
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
};

// Main function to get owned Tin Hat Catters
export const getOwnedTinHatCatters = async (address: string) => {
  try {
    console.log(`Getting owned Tin Hat Catters for ${address}`);
    // Retrieve NFTs from contract
    const nfts = await fetchNFTsFromContract(address);
    
    // For each NFT, try to fetch its metadata
    const nftsWithMetadata = await Promise.all(
      nfts.map(async (nft: any) => {
        try {
          const metadata = await fetchNFTMetadata(nft.id);
          if (metadata) {
            return {
              ...nft,
              name: metadata.name || nft.name,
              description: metadata.description,
              image: metadata.image || nft.image,
              attributes: metadata.attributes || []
            };
          }
        } catch (error) {
          console.warn(`Error fetching metadata for token #${nft.id}:`, error);
        }
        return nft;
      })
    );
    
    console.log('NFTs with metadata:', nftsWithMetadata);
    return nftsWithMetadata;
  } catch (error) {
    console.error('Error getting owned THC tokens:', error);
    return [];
  }
};

// Function to fetch from Etherscan for backward compatibility
export const fetchTinHatCattersFromSonicscan = async (address: string) => {
  return getOwnedTinHatCatters(address);
};
