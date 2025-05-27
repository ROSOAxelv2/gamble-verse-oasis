
# Plinko Advanced - Technical Documentation

## Overview

Plinko Advanced is a physics-based casino game featuring dynamic peg control, multi-ball drops, and real-time slot value indicators. This implementation uses Matter.js for realistic physics simulation and provides a professional gaming experience.

## Architecture

### Core Components

1. **PlinkoAdvanced.tsx** - Main game component
2. **PlinkoPhysicsEngine** - Physics simulation engine
3. **PegManager** - Dynamic peg configuration management
4. **SlotValueDisplay** - Real-time bucket value indicators
5. **PegControls** - Dynamic peg adjustment UI
6. **MultiBallControls** - Multi-ball drop interface
7. **ResultsTracker** - Session results and statistics

### Key Features

#### 1. Ball-Drop Visibility
- Balls visibly drop from the top launcher (x: 400, y: 50)
- Smooth physics-based animation using Matter.js
- No hidden off-screen spawning
- Configurable drop delay between multiple balls

#### 2. Slot Value Display
- Real-time multiplier indicators above each bucket
- Highlight animation when balls approach buckets
- Landing animation with bounce and color effects
- Automatic cleanup after animation completion

#### 3. Dynamic Peg Control
- Adjustable peg rows (3-10 rows)
- Automatic peg pattern generation
- Playfield locking during active ball drops
- Persistent configuration storage in localStorage

#### 4. Unified Module Design
- Single PlinkoAdvanced component (no legacy code)
- Modular physics engine with clear separation of concerns
- Type-safe interfaces for all data structures
- Comprehensive error handling

## Configuration

### Peg Configuration (plinkoLayout.json)
```json
{
  "pegConfiguration": {
    "rows": 6,           // Default number of peg rows
    "minRows": 3,        // Minimum allowed rows
    "maxRows": 10,       // Maximum allowed rows
    "baseSpacing": 50,   // Horizontal spacing between pegs
    "verticalSpacing": 60, // Vertical spacing between rows
    "radius": 8          // Peg radius
  }
}
```

### Physics Configuration (physicsConfig.json)
```json
{
  "dropSettings": {
    "initialVelocity": { "x": 0, "y": 2 },
    "dropDelay": 300,           // Delay between multi-ball drops (ms)
    "maxConcurrentBalls": 10,   // Maximum balls on board
    "slowDropMultiplier": 0.5   // Slow motion multiplier
  }
}
```

## Usage Guide

### Adjusting Peg Count

1. **Prerequisites**: No active balls on the playfield
2. **Increase Pegs**: Click the "+" button (max 10 rows)
3. **Decrease Pegs**: Click the "-" button (min 3 rows)
4. **Persistence**: Changes are automatically saved to localStorage

### Slot Value Indicators

- **Static Display**: Multiplier values always visible above buckets
- **Highlight Effect**: Buckets pulse when balls are nearby
- **Landing Animation**: Winning buckets bounce and change color
- **Color Coding**: 
  - Blue: High multipliers (5x)
  - Purple: Medium multipliers (1.2x-2x)
  - Pink: Loss multiplier (0.5x)

### Multi-Ball Drops

1. **Configure**: Set number of balls (1-10) and bet per ball
2. **Drop**: Click "Drop X Balls" button
3. **Tracking**: Monitor active ball count and results
4. **Limits**: Respects maximum concurrent ball limits

## Testing

### Unit Tests
```bash
npm run test src/components/games/plinko/__tests__/
```

### Test Coverage
- Peg control enable/disable logic
- Slot value display rendering
- Ball drop animation sequences
- Configuration persistence
- Error handling

### Integration Tests
- Multi-ball drop scenarios
- Peg adjustment with active balls
- Result aggregation and balance updates
- Physics engine lifecycle management

## API Reference

### PlinkoPhysicsEngine

```typescript
class PlinkoPhysicsEngine {
  constructor(options: PlinkoPhysicsOptions)
  
  // Ball management
  dropBalls(bets: PlinkoDropBet[]): Promise<void>
  getActiveBallCount(): number
  
  // Peg management
  increasePegs(): void
  decreasePegs(): void
  getPegRows(): number
  canIncreasePegs(): boolean
  canDecreasePegs(): boolean
  
  // Engine control
  start(): void
  stop(): void
  updateSlowDrop(slowDrop: boolean): void
}
```

### Event Handlers

```typescript
interface PlinkoPhysicsOptions {
  onBallLand: (result: PlinkoResult) => void      // Ball lands in bucket
  onBallUpdate?: (ballId: string, position: Vector) => void  // Ball position update
  onBucketHighlight?: (bucketIndex: number) => void  // Bucket highlighting
}
```

## Performance Considerations

1. **Physics Optimization**: Configurable iteration counts for performance tuning
2. **Memory Management**: Automatic cleanup of completed balls and animations
3. **Rendering**: Efficient canvas updates with minimal redraws
4. **State Management**: Optimized React state updates to prevent unnecessary re-renders

## Troubleshooting

### Common Issues

1. **Balls Not Visible**: Check canvas initialization and engine start sequence
2. **Peg Controls Disabled**: Verify no active balls remain on playfield
3. **Slot Values Not Updating**: Check bucket highlight event handlers
4. **Performance Issues**: Reduce max concurrent balls or physics iterations

### Debug Mode

Enable physics debug rendering:
```typescript
this.render.options.showDebug = true;
this.render.options.showVelocity = true;
```

### Console Logging

Key events are logged for debugging:
- Ball landing results
- Peg configuration changes
- Physics engine lifecycle events
- Error conditions

## Future Enhancements

1. **Sound Effects**: Ball bouncing and landing sounds
2. **Visual Effects**: Particle systems for ball trails
3. **Advanced Statistics**: Win rate tracking and analytics
4. **Custom Themes**: Different visual styles and color schemes
5. **Tournament Mode**: Competitive multiplayer features
