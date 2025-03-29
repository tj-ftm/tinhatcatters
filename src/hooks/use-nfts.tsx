
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from './use-toast';

export interface NFT {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  boost_type: string;
  boost_value: number;
  boost_duration?: number;
  price: number;
  category_id?: number;
  owned?: boolean;
}

export const useNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [ownedNfts, setOwnedNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useWeb3();

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all NFTs from the database
      const { data: nftData, error: nftError } = await supabase
        .from('nfts')
        .select('*')
        .order('id');

      if (nftError) {
        throw nftError;
      }

      setNfts(nftData || []);

      // If user is connected, fetch their owned NFTs
      if (address) {
        // Set wallet address for RLS - fixing the type issue with proper typing
        await supabase.rpc(
          'set_wallet_address', 
          { wallet_address: address } as Record<string, unknown>
        );

        const { data: userNftsData, error: userNftsError } = await supabase
          .from('user_nfts')
          .select('nft_id');

        if (userNftsError) {
          console.error('Error fetching user NFTs:', userNftsError);
        } else {
          // Mark owned NFTs
          const ownedNftIds = new Set(userNftsData.map(item => item.nft_id));
          
          const userOwnedNfts = nftData
            ?.filter(nft => ownedNftIds.has(nft.id))
            .map(nft => ({ ...nft, owned: true })) || [];
            
          setOwnedNfts(userOwnedNfts);
        }
      }
    } catch (err: any) {
      console.error('Error in useNFTs:', err);
      setError(err.message || 'Failed to fetch NFTs');
      toast({
        title: 'Error',
        description: 'Failed to fetch NFTs. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [address]);

  const purchaseNFT = async (nftId: string) => {
    if (!address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase NFTs',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Set wallet address for RLS - fixing the type issue with proper typing
      await supabase.rpc(
        'set_wallet_address', 
        { wallet_address: address } as Record<string, unknown>
      );

      // Check if user already owns this NFT
      const { data: existingNft } = await supabase
        .from('user_nfts')
        .select('*')
        .eq('nft_id', nftId)
        .eq('wallet_address', address)
        .single();

      if (existingNft) {
        toast({
          title: 'Already owned',
          description: 'You already own this NFT',
        });
        return true;
      }

      // In a real app, we'd verify the purchase on-chain here
      // For now, we'll just add it to the user's collection
      const { error } = await supabase
        .from('user_nfts')
        .insert([
          {
            wallet_address: address,
            nft_id: nftId,
            purchase_date: new Date().toISOString(),
          },
        ]);

      if (error) {
        throw error;
      }

      // Refresh the NFT list
      fetchNFTs();

      toast({
        title: 'Purchase successful',
        description: 'You now own this NFT',
      });

      return true;
    } catch (err: any) {
      console.error('Error purchasing NFT:', err);
      toast({
        title: 'Purchase failed',
        description: err.message || 'Failed to purchase NFT',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    nfts,
    ownedNfts,
    loading,
    error,
    purchaseNFT,
    refreshNFTs: fetchNFTs,
  };
};
