
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GamesPage from "./pages/GamesPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import VipPage from "./pages/VipPage";

// Components
import { Dashboard } from "./components/dashboard/Dashboard";
import { Layout } from "./components/layout/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Navigate to="/games" replace />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/vip" element={<VipPage />} />
              <Route path="/admin" element={<AdminPage />} />
              {/* Redirect old admin login to main login */}
              <Route path="/admin-login" element={<Navigate to="/" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
