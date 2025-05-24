
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, VipLevel } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUserBalance: (amount: number) => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
  updateUserBalance: () => {},
  forgotPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock login function
  const login = async (email: string, password: string) => {
    // In a real app, this would make an API call
    const mockUser: User = {
      id: "1",
      username: "demo_user",
      email: email,
      balance: 5000,
      isAdmin: email.includes("admin"),
      createdAt: new Date().toISOString(),
      vipStats: {
        level: VipLevel.BRONZE,
        lifetimeWagered: 10000,
        currentPoints: 500,
        nextLevelAt: 1000,
        badges: [
          {
            id: "1",
            name: "First Win",
            description: "Won your first game",
            imageUrl: "/badges/first-win.svg",
            earnedAt: new Date().toISOString(),
          },
        ],
      },
    };
    
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  // Mock register function
  const register = async (username: string, email: string, password: string) => {
    // In a real app, this would make an API call
    const mockUser: User = {
      id: "1",
      username: username,
      email: email,
      balance: 1000,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
  };

  // Mock forgot password function
  const forgotPassword = async (email: string) => {
    // In a real app, this would make an API call to send a reset email
    console.log(`Password reset email would be sent to: ${email}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  
  // Update user balance
  const updateUserBalance = (amount: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        balance: user.balance + amount
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Check for a saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUserBalance, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
