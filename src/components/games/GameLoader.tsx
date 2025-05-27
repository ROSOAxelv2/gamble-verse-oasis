
import React, { Suspense, lazy } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { GameConfig } from '@/types/games';
import gamesConfig from '@/config/games.json';
import { useIsMobile } from '@/hooks/use-mobile';
import { CurrencyBar } from './mobile/CurrencyBar';
import { DesktopCurrencyBar } from './DesktopCurrencyBar';
import { MobileGameContainer } from './mobile/MobileGameContainer';

// Lazy load game components
const DiceGame = lazy(() => import('./DiceGame').then(module => ({ default: module.DiceGame })));
const PlinkoGame = lazy(() => import('./PlinkoGame').then(module => ({ default: module.PlinkoGame })));
const SlotMachine = lazy(() => import('./SlotMachine').then(module => ({ default: module.SlotMachine })));
const PragmaticSlotMachine = lazy(() => import('./PragmaticSlotMachine').then(module => ({ default: module.PragmaticSlotMachine })));
const SuperAceSlotMachine = lazy(() => import('./SuperAceSlotMachine').then(module => ({ default: module.SuperAceSlotMachine })));
const CrashGame = lazy(() => import('./CrashGame').then(module => ({ default: module.CrashGame })));

// Create lazy wrapper components that don't require props
const SlotMachineWrapper = lazy(() => Promise.resolve({ default: () => <SlotMachine /> }));
const PragmaticSlotMachineWrapper = lazy(() => Promise.resolve({ default: () => <PragmaticSlotMachine /> }));
const SuperAceSlotMachineWrapper = lazy(() => Promise.resolve({ default: () => <SuperAceSlotMachine /> }));

const gameComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'dice': DiceGame,
  'plinko': PlinkoGame,
  'slots': SlotMachineWrapper,
  'pragmatic-slots': PragmaticSlotMachineWrapper,
  'super-ace': SuperAceSlotMachineWrapper,
  'crash': CrashGame,
};

const GameLoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64 mx-auto" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const GameLoader = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const isMobile = useIsMobile();
  
  const games = gamesConfig.games as GameConfig[];
  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return <Navigate to="/games" replace />;
  }

  const GameComponent = gameComponents[game.id];
  
  if (!GameComponent) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Available</h1>
          <p className="text-muted-foreground mb-6">
            The game "{game.name}" is currently under development.
          </p>
          <Button asChild>
            <Link to="/games">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Mobile full-screen view
  if (isMobile) {
    return (
      <MobileGameContainer game={game}>
        <CurrencyBar gameId={game.id} />
        <div className="pt-16"> {/* Account for currency bar height */}
          <Suspense fallback={<GameLoadingSkeleton />}>
            <GameComponent />
          </Suspense>
        </div>
      </MobileGameContainer>
    );
  }

  // Desktop view with live currency bar
  return (
    <div className="container py-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/games" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Games
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">
                {game.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Desktop Currency Bar - Live Updates */}
      {game.features?.mobileCurrencyBar && (
        <DesktopCurrencyBar gameId={game.id} />
      )}

      {/* Game Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{game.iconUrl}</div>
          <div>
            <h1 className="text-3xl font-bold">{game.name}</h1>
            <p className="text-muted-foreground">{game.description}</p>
          </div>
        </div>
        
        <Button variant="outline" asChild>
          <Link to="/games">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Link>
        </Button>
      </div>

      {/* Game Container */}
      <Card className="p-6">
        <Suspense fallback={<GameLoadingSkeleton />}>
          <GameComponent />
        </Suspense>
      </Card>
    </div>
  );
};
