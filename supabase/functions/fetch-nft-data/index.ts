
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { force } = await req.json().catch(() => ({ force: false }));
    
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

    // Fetch collection data from Sonicscan
    console.log("Fetching collection data from Sonicscan...");
    const response = await fetch(
      `https://sonicscan.org/api/v2/tokens/search?q=${THC_CONTRACT_ADDRESS}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch from Sonicscan: ${response.status}`);
    }

    const data = await response.json();
    if (!data.items || !data.items.length) {
      throw new Error("No collection data found");
    }

    const collection = data.items[0];
    console.log(`Found collection: ${collection.name}`);

    // Fetch token supply
    const supplyResponse = await fetch(
      `https://sonicscan.org/api/v2/tokens/${THC_CONTRACT_ADDRESS}/instances/count`
    );
    
    if (!supplyResponse.ok) {
      throw new Error(`Failed to fetch token supply: ${supplyResponse.status}`);
    }
    
    const supplyData = await supplyResponse.json();
    const totalSupply = supplyData.count || 0;
    
    console.log(`Total NFT supply: ${totalSupply}`);
    
    // Prepare to fetch NFTs in batches
    const batchSize = 50;
    const totalBatches = Math.ceil(totalSupply / batchSize);
    let processedNFTs = 0;
    
    // Prepare category for TinHatCatters
    const { data: categoryData, error: categoryError } = await supabase
      .from("nft_categories")
      .select("id")
      .eq("name", "thc")
      .single();
      
    if (categoryError) {
      console.error("Error fetching category:", categoryError);
      throw new Error("Failed to fetch category data");
    }
    
    const categoryId = categoryData.id;
    
    // Start fetching NFTs in batches
    for (let batch = 0; batch < totalBatches; batch++) {
      const offset = batch * batchSize;
      console.log(`Fetching batch ${batch + 1}/${totalBatches} (offset: ${offset})`);
      
      const nftsResponse = await fetch(
        `https://sonicscan.org/api/v2/tokens/${THC_CONTRACT_ADDRESS}/instances?offset=${offset}&limit=${batchSize}`
      );
      
      if (!nftsResponse.ok) {
        console.error(`Failed to fetch batch ${batch + 1}: ${nftsResponse.status}`);
        continue;
      }
      
      const nftsData = await nftsResponse.json();
      const nfts = nftsData.items || [];
      
      // Process each NFT
      for (const nft of nfts) {
        try {
          const tokenId = nft.id;
          console.log(`Processing NFT #${tokenId}`);
          
          // Fetch metadata if available
          let metadata = {};
          let name = `TinHat Catter #${tokenId}`;
          let description = "A cat with a tin foil hat on its head, protecting from the reptilians";
          let imageUrl = `https://ipfs.io/ipfs/QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi/${tokenId}.jpg`;
          
          // Try to fetch the token metadata if available
          if (nft.metadata_url) {
            try {
              const metadataResponse = await fetch(nft.metadata_url);
              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
                name = metadata.name || name;
                description = metadata.description || description;
                
                // Handle IPFS URLs
                if (metadata.image) {
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
          
          // Prepare NFT data for insertion
          const nftData = {
            id: tokenId.toString(),
            name,
            description,
            image_url: imageUrl,
            boost_type: "speed", // Default boost type
            boost_value: 10 + (parseInt(tokenId) % 20), // Random boost value between 10-30
            boost_duration: 30, // 30 seconds duration
            price: 100 + (parseInt(tokenId) % 900), // Random price between 100-1000 THC
            category_id: categoryId,
          };
          
          // Upsert NFT data to database
          const { error: upsertError } = await supabase
            .from("nfts")
            .upsert(nftData);
            
          if (upsertError) {
            console.error(`Error upserting NFT #${tokenId}:`, upsertError);
          } else {
            processedNFTs++;
          }
        } catch (nftError) {
          console.error(`Error processing NFT:`, nftError);
        }
      }
    }
    
    console.log(`Successfully processed ${processedNFTs} NFTs`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${processedNFTs} NFTs` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-nft-data function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
