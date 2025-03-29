
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables for Supabase connection
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// TinHat Catters Contract Address
const THC_CONTRACT_ADDRESS = "0x2dc1886d67001d5d6a80feaa51513f7bb5a591fd";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create storage bucket for NFT images if it doesn't exist
async function ensureStorageBucketExists() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const nftBucket = buckets?.find(b => b.name === 'nft-images');
    
    if (!nftBucket) {
      // Create bucket for NFT images
      const { error } = await supabase.storage.createBucket('nft-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }
      console.log('Created nft-images bucket');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
}

// Fetch and store an image from URL to Supabase storage
async function storeImageFromUrl(imageUrl: string, tokenId: string): Promise<string> {
  try {
    // Fetch image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }
    
    // Get image binary data and content type
    const imageData = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('nft-images')
      .upload(`thc/${tokenId}.jpg`, imageData, {
        contentType,
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading image for NFT #${tokenId}:`, error);
      return imageUrl; // Return original URL on error
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('nft-images')
      .getPublicUrl(`thc/${tokenId}.jpg`);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error storing image for NFT #${tokenId}:`, error);
    return imageUrl; // Return original URL on error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { force, limit = 10, offset = 0 } = await req.json().catch(() => ({ force: false, limit: 10, offset: 0 }));
    
    // Check if we should force refresh data
    if (!force) {
      // Check if we already have data in the database
      const { count } = await supabase
        .from("nfts")
        .select("*", { count: "exact", head: true });
      
      if (count && count > 0) {
        console.log(`Found ${count} NFTs in database, skipping fetch. Use force=true to refresh.`);
        return new Response(
          JSON.stringify({ success: true, message: `Using existing ${count} NFTs from database` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Ensure storage bucket exists
    const bucketReady = await ensureStorageBucketExists();
    if (!bucketReady) {
      throw new Error("Failed to setup storage bucket");
    }
    
    // Fetch collection data from Sonicscan
    console.log("Fetching collection data from Sonicscan...");
    const collectionResponse = await fetch(
      `https://sonicscan.org/api/v2/tokens/search?q=${THC_CONTRACT_ADDRESS}`
    );

    if (!collectionResponse.ok) {
      throw new Error(`Failed to fetch from Sonicscan: ${collectionResponse.status}`);
    }

    const collectionData = await collectionResponse.json();
    if (!collectionData.items || !collectionData.items.length) {
      throw new Error("No collection data found");
    }

    const collection = collectionData.items[0];
    console.log(`Found collection: ${collection.name}`);
    
    // Fetch NFTs from Sonicscan inventory
    console.log(`Fetching NFTs with limit ${limit} and offset ${offset}`);
    const nftsResponse = await fetch(
      `https://sonicscan.org/api/v2/tokens/${THC_CONTRACT_ADDRESS}/instances?offset=${offset}&limit=${limit}`
    );
    
    if (!nftsResponse.ok) {
      throw new Error(`Failed to fetch NFTs: ${nftsResponse.status}`);
    }
    
    const nftsData = await nftsResponse.json();
    const nfts = nftsData.items || [];
    
    console.log(`Found ${nfts.length} NFTs to process`);
    
    // Prepare category for TinHatCatters
    const { data: categoryData, error: categoryError } = await supabase
      .from("nft_categories")
      .select("id")
      .eq("name", "thc")
      .single();
      
    let categoryId: number;
    
    if (categoryError) {
      // Create category if it doesn't exist
      const { data: newCategory, error: newCategoryError } = await supabase
        .from("nft_categories")
        .insert({ name: "thc", description: "TinHat Catters NFT Collection" })
        .select("id")
        .single();
        
      if (newCategoryError) {
        throw new Error("Failed to create category: " + newCategoryError.message);
      }
      
      categoryId = newCategory.id;
    } else {
      categoryId = categoryData.id;
    }
    
    // Process NFTs
    let processedCount = 0;
    for (const nft of nfts) {
      try {
        const tokenId = nft.id;
        console.log(`Processing NFT #${tokenId}`);
        
        // Get NFT metadata if available
        let metadata: any = {};
        let name = `TinHat Catter #${tokenId}`;
        let description = "A cat with a tin foil hat, part of the TinHat Catters collection";
        let imageUrl = `https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi/${tokenId}.jpg`;
        
        if (nft.metadata_url) {
          try {
            const metadataResponse = await fetch(nft.metadata_url);
            if (metadataResponse.ok) {
              metadata = await metadataResponse.json();
              name = metadata.name || name;
              description = metadata.description || description;
              
              if (metadata.image) {
                // Handle IPFS image URLs
                if (metadata.image.startsWith("ipfs://")) {
                  const ipfsHash = metadata.image.replace("ipfs://", "");
                  imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
                } else {
                  imageUrl = metadata.image;
                }
              }
            }
          } catch (metadataError) {
            console.error(`Error fetching metadata for NFT #${tokenId}:`, metadataError);
          }
        }
        
        // Store image in Supabase
        console.log(`Storing image for NFT #${tokenId} from ${imageUrl}`);
        const storedImageUrl = await storeImageFromUrl(imageUrl, tokenId.toString());
        
        // Prepare NFT data for database
        const nftData = {
          id: tokenId.toString(),
          name,
          description,
          image_url: storedImageUrl,
          boost_type: metadata.attributes?.find((a: any) => a.trait_type === "Boost Type")?.value || "speed",
          boost_value: metadata.attributes?.find((a: any) => a.trait_type === "Boost Value")?.value || 
                     (10 + (parseInt(tokenId) % 20)), // Random boost between 10-30
          boost_duration: metadata.attributes?.find((a: any) => a.trait_type === "Boost Duration")?.value || 30,
          price: metadata.attributes?.find((a: any) => a.trait_type === "Price")?.value || 
                (100 + (parseInt(tokenId) % 900)), // Random price between 100-1000
          category_id: categoryId,
        };
        
        // Upsert NFT data to database
        const { error: upsertError } = await supabase
          .from("nfts")
          .upsert(nftData);
          
        if (upsertError) {
          console.error(`Error upserting NFT #${tokenId}:`, upsertError);
        } else {
          processedCount++;
        }
      } catch (nftError) {
        console.error(`Error processing NFT:`, nftError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedCount}/${nfts.length} NFTs`,
        processed: processedCount,
        total: nfts.length,
        moreAvailable: nfts.length === limit
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error: any) {
    console.error("Error in import-nft-data function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
