
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { PointsProvider } from "@/hooks/use-points";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";
import Desktop from "./components/Desktop";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  // Set favicon
  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = "/favicon.png";
    } else {
      const newFavicon = document.createElement("link");
      newFavicon.rel = "icon";
      newFavicon.href = "/favicon.png";
      document.head.appendChild(newFavicon);
    }
    
    // Set document title
    document.title = "TinHatCatters Game";
    
    // Fetch NFT data on startup (only if the NFTs table is empty)
    const fetchNftData = async () => {
      try {
        // Check if NFT data exists
        const { count } = await supabase
          .from("nfts")
          .select("*", { count: "exact", head: true });
          
        if (!count || count === 0) {
          console.log("No NFT data found, fetching from API...");
          // Call the edge function to fetch NFT data
          await fetch(`${window.location.origin}/api/fetch-nft-data`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });
        }
      } catch (error) {
        console.error("Error checking/fetching NFT data:", error);
      }
    };
    
    fetchNftData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <PointsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Desktop />}>
                  <Route index element={<Index />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PointsProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
};

export default App;
