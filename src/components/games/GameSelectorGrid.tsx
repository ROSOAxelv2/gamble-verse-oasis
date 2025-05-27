
import React, { useState, useMemo } from 'react';
import { GameTile } from './GameTile';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { GameConfig } from '@/types/games';
import gamesConfig from '@/config/games.json';

export const GameSelectorGrid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const games = gamesConfig.games as GameConfig[];
  
  const categories = useMemo(() => {
    const cats = [...new Set(games.map(game => game.category))];
    return ['all', ...cats];
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Select Your Game
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our exciting collection of casino games. Each game offers unique features and winning opportunities!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 transition-colors capitalize"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Games' : category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredGames.map(game => (
          <GameTile key={game.id} game={game} />
        ))}
      </div>

      {/* No Results */}
      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No games found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredGames.length} of {games.length} games
      </div>
    </div>
  );
};
