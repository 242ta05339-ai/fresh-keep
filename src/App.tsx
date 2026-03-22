import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { FridgeProvider } from "@/lib/fridge-context";
import { FamilyProvider } from "@/lib/family-context";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import Analytics from "./pages/Analytics";
import Recipes from "./pages/Recipes";
import Sustainability from "./pages/Sustainability";
import Notifications from "./pages/Notifications";
import Family from "./pages/Family";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <span className="text-4xl">🧊</span>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <FridgeProvider>
      <FamilyProvider>
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
      </FamilyProvider>
    </FridgeProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
