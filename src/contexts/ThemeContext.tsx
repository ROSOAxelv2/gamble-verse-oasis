
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeType = "light" | "dark" | "purple" | "gold" | "blue";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeType[];
  purchasedThemes: ThemeType[];
  purchaseTheme: (theme: ThemeType) => void;
}

const defaultThemes: ThemeType[] = ["light", "dark"];
const purchasableThemes: ThemeType[] = ["purple", "gold", "blue"];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [purchasedThemes, setPurchasedThemes] = useState<ThemeType[]>([]);
  
  // Load saved theme and purchased themes from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    const savedPurchasedThemes = JSON.parse(localStorage.getItem("purchasedThemes") || "[]");
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedPurchasedThemes.length) {
      setPurchasedThemes(savedPurchasedThemes);
    }
  }, []);
  
  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.className = theme;
  }, [theme]);
  
  // Save purchased themes to localStorage
  useEffect(() => {
    localStorage.setItem("purchasedThemes", JSON.stringify(purchasedThemes));
  }, [purchasedThemes]);
  
  const handleSetTheme = (newTheme: ThemeType) => {
    // Check if theme is available or purchased
    if (defaultThemes.includes(newTheme) || purchasedThemes.includes(newTheme)) {
      setTheme(newTheme);
    }
  };
  
  const purchaseTheme = (themeType: ThemeType) => {
    if (!purchasedThemes.includes(themeType) && purchasableThemes.includes(themeType)) {
      setPurchasedThemes([...purchasedThemes, themeType]);
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        availableThemes: [...defaultThemes, ...purchasableThemes],
        purchasedThemes,
        purchaseTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
