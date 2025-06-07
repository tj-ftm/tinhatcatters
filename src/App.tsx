import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/contexts/Web3Context";
import { PointsProvider } from "@/hooks/use-points";
import { GrowRoomProvider } from "@/contexts/GrowRoomContext";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Desktop from "./components/Desktop";
import Analytics from "./pages/Analytics";
import GrowRoom from "./components/GrowRoom";
import ThirdwebProviderWrapper from "@/contexts/ThirdwebProvider";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1
    }
  }
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProviderWrapper>
        <Web3Provider>
          <PointsProvider>
            <GrowRoomProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Desktop />}>
                      <Route index element={<Index />} />
                      <Route path="/game" element={<Game />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/growroom" element={<GrowRoom />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </GrowRoomProvider>
          </PointsProvider>
        </Web3Provider>
      </ThirdwebProviderWrapper>
    </QueryClientProvider>
  );
};

export default App;
