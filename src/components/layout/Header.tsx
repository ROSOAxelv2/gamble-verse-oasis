
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">
              <span className="text-casino-gold">Lovable</span> Casino
            </span>
          </Link>
          
          {user && (
            <nav className="hidden md:ml-8 md:flex md:items-center md:space-x-4">
              <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link to="/games" className="text-sm font-medium transition-colors hover:text-primary">
                Games
              </Link>
              <Link to="/transactions" className="text-sm font-medium transition-colors hover:text-primary">
                Transactions
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm font-medium">
              <span className="mr-1">Balance:</span>
              <span className="text-casino-gold">{user.balance.toLocaleString()} Credits</span>
            </div>
            
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2"
                >
                  <User size={16} />
                  <span className="hidden md:inline">{user.username}</span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="md:hidden">
                  <span>Balance: {user.balance.toLocaleString()} Credits</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2" size={14} />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2" size={14} />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2" size={14} />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => navigate("/")}>Login</Button>
        )}
      </div>
    </header>
  );
};
