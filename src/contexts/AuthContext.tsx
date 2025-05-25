

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
    console.log("AuthContext: Login attempt for", email);
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
    console.log("AuthContext: User logged in successfully", mockUser);
  };

  // Mock register function
  const register = async (username: string, email: string, password: string) => {
    console.log("AuthContext: Register attempt for", username, email);
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
    console.log("AuthContext: User registered successfully", mockUser);
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
    console.log("AuthContext: User logging out");
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
      console.log("AuthContext: User balance updated", updatedUser.balance);
    }
  };

  // Check for a saved user on initial load
  useEffect(() => {
    console.log("AuthContext: Checking for saved user in localStorage");
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log("AuthContext: Restored user from localStorage", parsedUser);
      } catch (error) {
        console.error("AuthContext: Error parsing saved user", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("AuthContext: No saved user found");
    }
    setLoading(false);
  }, []);

  // Debug current user state
  useEffect(() => {
    console.log("AuthContext: Current user state:", user);
    console.log("AuthContext: Loading state:", loading);
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUserBalance, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

