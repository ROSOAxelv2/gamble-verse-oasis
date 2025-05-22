
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useAuth } from "../../contexts/AuthContext";
import AuthPage from "../auth/AuthPage";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const Layout = ({ children, requireAuth = false, requireAdmin = false }: LayoutProps) => {
  const { user, loading } = useAuth();

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

  if (requireAdmin && (!user || !user.isAdmin)) {
    return (
      <Layout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  );
};
