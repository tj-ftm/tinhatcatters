
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

// The NFT contract ABI (minimal interface for what we need)
const NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)'
];

// Contract address for the NFT collection
const NFT_CONTRACT_ADDRESS = '0x2dc1886d67001d5d6a80feaa51513f7bb5a591fd';

// Sonic Network RPC URL
const SONIC_RPC_URL = 'https://rpc.sonic.network';

// Interface for NFT metadata
export interface NFTMetadata {
  id: string;
  name: string;
  image: string;
  description?: string;
  attributes?: any[];
  [key: string]: any;
}

/**
 * Fetches NFTs owned by the provided wallet address
 */
export const fetchOwnedNFTs = async (walletAddress: string): Promise<NFTMetadata[]> => {
  try {
    if (!walletAddress) {
      console.warn('No wallet address provided');
      return [];
    }

    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(SONIC_RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    // Get NFT balance for the wallet
    const balance = await contract.balanceOf(walletAddress);
    console.log(`Wallet has ${balance.toString()} NFTs from this collection`);

    if (balance.toString() === '0') {
      return [];
    }

    // Fetch all owned NFTs
    const nftPromises = [];
    for (let i = 0; i < balance; i++) {
      nftPromises.push(fetchNFTMetadata(contract, walletAddress, i));
    }

    // Wait for all promises to resolve
    const nfts = await Promise.all(nftPromises);
    
    // Filter out any null values (failed fetches)
    return nfts.filter(nft => nft !== null) as NFTMetadata[];
  } catch (error) {
    console.error('Error fetching owned NFTs:', error);
    toast({
      title: 'NFT Fetch Error',
      description: 'Failed to load your NFTs. Please try again later.',
      variant: 'destructive'
    });
    return [];
  }
};

/**
 * Fetches metadata for a single NFT by its index in the owner's collection
 */
const fetchNFTMetadata = async (
  contract: ethers.Contract,
  owner: string,
  index: number
): Promise<NFTMetadata | null> => {
  try {
    // Get the token ID at the specified index
    const tokenId = await contract.tokenOfOwnerByIndex(owner, index);
    console.log(`Fetching metadata for token ID ${tokenId} (index ${index})`);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    console.log(`Token URI for ${tokenId}: ${tokenURI}`);
    
    // Clean the URI - some URIs come with ipfs:// prefix or other protocols
    const cleanedURI = tokenURI.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
    console.log(`Cleaned URI: ${cleanedURI}`);
    
    // Fetch the metadata from the tokenURI
    const response = await fetch(cleanedURI);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log(`Metadata received for token ${tokenId}:`, metadata);
    
    // Clean the image URL if it's an IPFS URL
    if (metadata.image && metadata.image.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      console.log(`Cleaned image URL: ${metadata.image}`);
    }
    
    return {
      id: tokenId.toString(),
      name: metadata.name || `NFT #${tokenId}`,
      image: metadata.image || '',
      description: metadata.description || '',
      attributes: metadata.attributes || [],
      ...metadata
    };
  } catch (error) {
    console.error(`Error fetching NFT metadata for index ${index}:`, error);
    return null;
  }
};

/**
 * Fetch a single NFT by its token ID
 */
export const fetchNFTById = async (tokenId: string): Promise<NFTMetadata | null> => {
  try {
    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(SONIC_RPC_URL);
    const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
    
    // Get the token URI
    const tokenURI = await contract.tokenURI(tokenId);
    console.log(`Token URI for ID ${tokenId}: ${tokenURI}`);
    
    // Clean the URI
    const cleanedURI = tokenURI.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
    
    // Fetch the metadata
    const response = await fetch(cleanedURI);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const metadata = await response.json();
    
    // Clean the image URL if it's an IPFS URL
    if (metadata.image && metadata.image.startsWith('ipfs://')) {
      metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    
    return {
      id: tokenId,
      name: metadata.name || `NFT #${tokenId}`,
      image: metadata.image || '',
      description: metadata.description || '',
      attributes: metadata.attributes || [],
      ...metadata
    };
  } catch (error) {
    console.error(`Error fetching NFT with ID ${tokenId}:`, error);
    return null;
  }
};
