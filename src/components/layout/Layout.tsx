
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "../../contexts/AuthContext";
import { rbacService } from "../../services/rbac";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthPage from "../auth/AuthPage";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const Layout = ({ children, requireAuth = false, requireAdmin = false }: LayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Check if we're on a mobile game page
  const isMobileGamePage = isMobile && location.pathname.startsWith('/play/');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <AuthPage />;
  }

  if (requireAdmin && !rbacService.canAccessAdminPanel(user)) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  // Mobile game page - no header/footer
  if (isMobileGamePage) {
    return <>{children}</>;
  }

  // Standard layout with header/footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
};
