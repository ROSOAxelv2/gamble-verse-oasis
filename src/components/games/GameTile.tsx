
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameConfig } from '@/types/games';

interface GameTileProps {
  game: GameConfig;
  className?: string;
}

export const GameTile = ({ game, className = '' }: GameTileProps) => {
  return (
    <Card className={`
      group relative overflow-hidden transition-all duration-300 
      hover:scale-105 hover:shadow-2xl hover:shadow-primary/20
      bg-gradient-to-br from-card to-card/80 border-2 border-border/50
      hover:border-primary/50 cursor-pointer
      ${className}
    `}>
      <Link to={`/play/${game.id}`} className="block">
        <div className="relative">
          {/* Game Icon */}
          <div className="aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="text-8xl md:text-9xl transition-transform duration-300 group-hover:scale-110">
              {game.iconUrl}
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="
            absolute inset-0 bg-black/80 backdrop-blur-sm
            opacity-0 group-hover:opacity-100 
            transition-all duration-300
            flex flex-col items-center justify-center
            text-center p-4
          ">
            <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
            <p className="text-sm text-gray-300 mb-4 line-clamp-3">
              {game.description}
            </p>
            <div className="text-xs text-gray-400 mb-4">
              Bet: {game.minBet} - {game.maxBet.toLocaleString()} credits
            </div>
            <Button 
              variant="default" 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Play Now
            </Button>
          </div>
        </div>

        {/* Game Title */}
        <div className="p-4 text-center">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {game.name}
          </h3>
          <div className="text-xs text-muted-foreground mt-1 capitalize">
            {game.category}
          </div>
        </div>
      </Link>
    </Card>
  );
};
