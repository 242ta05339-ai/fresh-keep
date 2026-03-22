import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FridgeProvider } from "@/lib/fridge-context";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import Analytics from "./pages/Analytics";
import Recipes from "./pages/Recipes";
import Sustainability from "./pages/Sustainability";
import Notifications from "./pages/Notifications";
import Family from "./pages/Family";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <FridgeProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddFood />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/sustainability" element={<Sustainability />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/family" element={<Family />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </FridgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
