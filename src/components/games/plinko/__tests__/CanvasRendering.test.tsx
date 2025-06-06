
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlinkoPhysicsEngine } from '@/utils/plinkoPhysics';

// Mock Matter.js
vi.mock('matter-js', () => ({
  Engine: {
    create: vi.fn().mockReturnValue({
      world: {
        gravity: { x: 0, y: 0, scale: 0 },
        bodies: []
      }
    }),
    run: vi.fn(),
    clear: vi.fn()
  },
  Render: {
    create: vi.fn().mockReturnValue({
      options: {},
      canvas: { width: 800, height: 600 }
    }),
    run: vi.fn(),
    stop: vi.fn()
  },
  World: {
    add: vi.fn(),
    remove: vi.fn()
  },
  Bodies: {
    rectangle: vi.fn().mockReturnValue({ label: 'test-body' }),
    circle: vi.fn().mockReturnValue({ label: 'test-circle' })
  },
  Body: {
    setVelocity: vi.fn()
  },
  Events: {
    on: vi.fn()
  }
}));

describe('Canvas Rendering Tests', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockParentElement: HTMLElement;

  beforeEach(() => {
    // Create mock context
    mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      }),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1
    } as any;

    // Create mock parent element
    mockParentElement = {
      clientWidth: 800
    } as HTMLElement;

    // Create mock canvas
    mockCanvas = {
      width: 800,
      height: 600,
      style: {},
      getContext: vi.fn().mockReturnValue(mockContext)
    } as any;

    // Define parentElement as a configurable property for testing
    Object.defineProperty(mockCanvas, 'parentElement', {
      value: mockParentElement,
      writable: true,
      configurable: true
    });
  });

  it('initializes canvas with correct dimensions', () => {
    const engine = new PlinkoPhysicsEngine({
      canvas: mockCanvas,
      onBallLand: vi.fn()
    });

    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
  });

  it('creates responsive canvas dimensions', () => {
    // Test with smaller container
    const smallParentElement = { clientWidth: 400 } as HTMLElement;
    Object.defineProperty(mockCanvas, 'parentElement', {
      value: smallParentElement,
      writable: true,
      configurable: true
    });

    const engine = new PlinkoPhysicsEngine({
      canvas: mockCanvas,
      onBallLand: vi.fn()
    });

    expect(mockCanvas.width).toBeLessThan(800);
    expect(mockCanvas.style.width).toBeDefined();
  });

  it('handles resize events properly', () => {
    const engine = new PlinkoPhysicsEngine({
      canvas: mockCanvas,
      onBallLand: vi.fn()
    });

    // Change container size
    const resizedParentElement = { clientWidth: 600 } as HTMLElement;
    Object.defineProperty(mockCanvas, 'parentElement', {
      value: resizedParentElement,
      writable: true,
      configurable: true
    });
    
    engine.resize();

    expect(mockCanvas.width).toBeLessThan(800);
  });

  it('maintains aspect ratio during resize', () => {
    const engine = new PlinkoPhysicsEngine({
      canvas: mockCanvas,
      onBallLand: vi.fn()
    });

    const originalAspectRatio = mockCanvas.width / mockCanvas.height;
    
    engine.resize();
    
    const newAspectRatio = mockCanvas.width / mockCanvas.height;
    expect(Math.abs(originalAspectRatio - newAspectRatio)).toBeLessThan(0.01);
  });
});
