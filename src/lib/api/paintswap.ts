
// PaintSwap API service
const PAINTSWAP_BASE_URL = 'https://api.paintswap.finance';

export interface PaintSwapNFT {
  id: string;
  name: string;
  image: string;
  description?: string;
  collection?: {
    name: string;
    address: string;
  };
  metadata?: any;
}

export const fetchUserNFTs = async (walletAddress: string): Promise<PaintSwapNFT[]> => {
  try {
    // Using the user's NFTs endpoint from PaintSwap API
    const response = await fetch(`${PAINTSWAP_BASE_URL}/user/${walletAddress}/nfts`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the response to our interface format
    return data.map((nft: any) => ({
      id: nft.tokenId || nft.id,
      name: nft.name || `NFT #${nft.tokenId || nft.id}`,
      image: nft.image || nft.imageUrl,
      description: nft.description,
      collection: {
        name: nft.collection?.name || 'Unknown Collection',
        address: nft.contractAddress || nft.collection?.address
      },
      metadata: nft.metadata || nft
    }));
  } catch (error) {
    console.error('Error fetching NFTs from PaintSwap:', error);
    return [];
  }
};

export const fetchNFTMetadata = async (contractAddress: string, tokenId: string): Promise<PaintSwapNFT | null> => {
  try {
    const response = await fetch(`${PAINTSWAP_BASE_URL}/nft/${contractAddress}/${tokenId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const nft = await response.json();
    
    return {
      id: nft.tokenId || tokenId,
      name: nft.name || `NFT #${tokenId}`,
      image: nft.image || nft.imageUrl,
      description: nft.description,
      collection: {
        name: nft.collection?.name || 'Unknown Collection',
        address: contractAddress
      },
      metadata: nft.metadata || nft
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
};
