
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
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Desktop from "./components/Desktop";

const queryClient = new QueryClient();

const App = () => (
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
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PointsProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
