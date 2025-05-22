
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t py-6 bg-card/80">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-casino-gold">Lovable Casino</h3>
            <p className="text-sm text-muted-foreground">
              A fully secure and configurable web application for in-game currency gambling.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/games" className="transition-colors hover:text-primary">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition-colors hover:text-primary">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="transition-colors hover:text-primary">
                  Transactions
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="transition-colors hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/responsible-gaming" className="transition-colors hover:text-primary">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Lovable Casino. All rights reserved. No real money gambling.
          </p>
        </div>
      </div>
    </footer>
  );
};
