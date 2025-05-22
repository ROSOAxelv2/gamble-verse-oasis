
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Crown } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          Lovable Casino
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/games"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/games" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Games
              </Link>
              <Link
                to="/transactions"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/transactions" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Transactions
              </Link>
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Profile
              </Link>
              <Link
                to="/vip"
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                  location.pathname === "/vip" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Crown size={16} />
                VIP
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {user.username} - {user.balance.toLocaleString()} credits
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
