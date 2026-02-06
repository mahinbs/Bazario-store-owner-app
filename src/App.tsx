import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";
import DashboardHome from "./pages/DashboardHome";
import ProductsPage from "./pages/ProductsPage";
import TimingsPage from "./pages/TimingsPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CommissionPage from "./pages/CommissionPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/timings" element={<TimingsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/commission" element={<CommissionPage />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
