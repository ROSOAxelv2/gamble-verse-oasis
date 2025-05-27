
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GameConfig } from '@/types/games';
import { ExitConfirmationDialog } from './ExitConfirmationDialog';

interface MobileGameContainerProps {
  children: React.ReactNode;
  game: GameConfig;
}

export const MobileGameContainer = ({ children, game }: MobileGameContainerProps) => {
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Check if game is in progress (spinning, bonus active)
    // For now, we'll show a simple confirmation
    setShowExitDialog(true);
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      {/* Back to Lobby Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link 
          to="/games"
          onClick={handleBackClick}
          className="
            flex items-center gap-2 px-4 py-2 
            bg-black/50 backdrop-blur-sm text-white
            rounded-full shadow-lg
            hover:bg-black/70 transition-colors
            focus:outline-none focus:ring-2 focus:ring-white/50
          "
          aria-label="Back to games"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Games</span>
        </Link>
      </div>

      {/* Game Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationDialog 
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        gameName={game.name}
      />
    </div>
  );
};
