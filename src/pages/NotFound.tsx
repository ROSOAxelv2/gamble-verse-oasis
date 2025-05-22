
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen casino-gradient flex flex-col items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-6xl font-bold mb-4 text-casino-gold">404</h1>
        <p className="text-xl mb-8">Oops! This page doesn't exist.</p>
        <p className="mb-8 text-muted-foreground">
          We couldn't find the page you were looking for. It might have been removed, 
          renamed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-casino-purple to-casino-blue hover:opacity-90">
            Go Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
