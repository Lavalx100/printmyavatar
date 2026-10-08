import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AvatarProvider } from "./contexts/AvatarContext";
import Landing from "./pages/Landing";
import Create from "./pages/Create";
import Order from "./pages/Order";
import History from "./pages/History";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AvatarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<Create />} />
            <Route path="/order" element={<Order />} />
            <Route path="/history" element={<History />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AvatarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
