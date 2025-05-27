
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameName: string;
  isGameInProgress?: boolean;
}

export const ExitConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  gameName,
  isGameInProgress = false 
}: ExitConfirmationDialogProps) => {
  const navigate = useNavigate();

  const handleConfirmExit = () => {
    onOpenChange(false);
    navigate('/games');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Leave {gameName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isGameInProgress 
              ? "A game is currently in progress. Are you sure you want to leave? Your progress may be lost."
              : "Are you sure you want to return to the games lobby?"
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay in Game</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmExit}
            className="bg-red-600 hover:bg-red-700"
          >
            Leave Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
