
import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const themeNames = {
  light: "Light Theme",
  dark: "Dark Theme",
  purple: "Royal Purple",
  gold: "Gold Rush",
  blue: "Ocean Blue"
};

const themePrices = {
  purple: 500,
  gold: 1000,
  blue: 750
};

export const ThemeSwitcher = () => {
  const { theme, setTheme, availableThemes, purchasedThemes, purchaseTheme } = useTheme();
  const { user, updateUserBalance } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handlePurchase = (themeType: string) => {
    if (!user) return;
    
    const price = themePrices[themeType as keyof typeof themePrices] || 0;
    
    if (user.balance < price) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${price} credits to purchase this theme.`,
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would make an API call here
    updateUserBalance(-price);
    purchaseTheme(themeType as any);
    
    toast({
      title: "Theme Purchased!",
      description: `You have purchased the ${themeNames[themeType as keyof typeof themeNames]} theme.`,
    });
  };
  
  const handleApplyTheme = () => {
    setTheme(selectedTheme);
    toast({
      title: "Theme Applied",
      description: `Your theme has been changed to ${themeNames[selectedTheme as keyof typeof themeNames]}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Customize your casino experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableThemes.map((themeType) => {
            const isOwned = purchasedThemes.includes(themeType) || themeType === "light" || themeType === "dark";
            const isSelected = selectedTheme === themeType;
            const price = themePrices[themeType as keyof typeof themePrices];
            
            return (
              <div
                key={themeType}
                className={`relative border rounded-md p-4 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : "hover:border-primary"
                } ${
                  isOwned ? "" : "opacity-70"
                }`}
                onClick={() => isOwned && setSelectedTheme(themeType)}
              >
                <div className={`w-full h-20 rounded-md mb-3 ${themeType}`}></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{themeNames[themeType as keyof typeof themeNames]}</span>
                  {!isOwned ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(themeType);
                      }}
                    >
                      {price} Credits
                    </Button>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      Owned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleApplyTheme}
          disabled={theme === selectedTheme}
        >
          Apply Theme
        </Button>
      </CardFooter>
    </Card>
  );
};
