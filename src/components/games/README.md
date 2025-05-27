# Casino Game Selector

A dynamic, responsive game selector that displays casino games as interactive tiles and loads them without full page refreshes.

## Features

- **Responsive Grid Layout**: 4 columns on desktop, 3 on tablet, 2 on mobile
- **Dynamic Game Loading**: Games load lazily when clicked with smooth transitions
- **Search & Filter**: Real-time search and category filtering
- **SPA Navigation**: Browser history support with back button functionality
- **Deep Linking**: Direct links to games work properly (e.g., `/play/dice`)
- **Accessibility**: Full keyboard navigation and screen reader support

## Adding a New Game

### 1. Update games.json

Add your game configuration to `src/config/games.json`:

```json
{
  "id": "your-game-id",
  "name": "Your Game Name",
  "iconUrl": "🎮", // Use emoji or image URL
  "route": "/games/your-game",
  "description": "A brief description of your game mechanics and features.",
  "minBet": 25,
  "maxBet": 1000,
  "category": "classic" // classic, arcade, slots, multiplier
}
```

### 2. Create Game Component

Create your game component in `src/components/games/YourGameName.tsx`:

```tsx
import React from 'react';
import { Card } from '@/components/ui/card';

export const YourGameName = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Game Name</h2>
      {/* Your game logic here */}
    </Card>
  );
};
```

### 3. Register Component

Add your component to the lazy imports in `GameLoader.tsx`:

```tsx
const YourGameName = lazy(() => import('./YourGameName').then(module => ({ default: module.YourGameName })));

const gameComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  // ... existing games
  'your-game-id': YourGameName,
};
```

### 4. Test Integration

1. Start the development server: `npm run dev`
2. Navigate to `/games` to see your new game tile
3. Click the tile to verify it loads properly
4. Test the back button functionality
5. Test direct navigation to `/play/your-game-id`

## Architecture

### Components

- **GameSelectorGrid**: Main grid component with search/filter functionality
- **GameTile**: Individual game tile with hover effects and routing
- **GameLoader**: Handles dynamic game loading and breadcrumb navigation

### Configuration

- **games.json**: Central configuration for all available games
- **games.ts**: TypeScript interfaces for type safety

### Routing

- `/games`: Main game selector grid
- `/play/:gameId`: Individual game player with breadcrumbs

## Styling

The selector uses Tailwind CSS with:
- Dark theme card styling
- Hover animations (scale, glow effects)
- Responsive breakpoints
- Smooth transitions

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Performance

- Lazy loading of game components
- Optimized image loading
- Efficient search filtering
- Minimal bundle splitting
