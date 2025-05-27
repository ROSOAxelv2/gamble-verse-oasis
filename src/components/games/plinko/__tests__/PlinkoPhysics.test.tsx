
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlinkoAdvanced } from '../../PlinkoAdvanced';
import { AuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// Mock the physics engine
const mockPhysicsEngine = {
  start: vi.fn(),
  stop: vi.fn(),
  dropBalls: vi.fn(),
  getPegRows: vi.fn().mockReturnValue(6),
  getMinPegRows: vi.fn().mockReturnValue(3),
  getMaxPegRows: vi.fn().mockReturnValue(10),
  canIncreasePegs: vi.fn().mockReturnValue(true),
  canDecreasePegs: vi.fn().mockReturnValue(true),
  increasePegs: vi.fn(),
  decreasePegs: vi.fn(),
  getActiveBallCount: vi.fn().mockReturnValue(0),
  isEngineInitialized: vi.fn().mockReturnValue(true),
  resize: vi.fn()
};

vi.mock('@/utils/plinkoPhysics', () => ({
  PlinkoPhysicsEngine: vi.fn().mockImplementation((options) => {
    // Simulate async initialization
    setTimeout(() => {
      options.onInitialized?.();
    }, 100);
    return mockPhysicsEngine;
  })
}));

// Mock services
vi.mock('@/services/api', () => ({
  gameService: {
    getGameConfig: vi.fn().mockResolvedValue({
      enabled: true,
      minBet: 50,
      maxBet: 2000
    })
  },
  userService: {
    getProfile: vi.fn().mockResolvedValue({})
  }
}));

const mockUser = {
  id: '1',
  username: 'testuser',
  balance: 1000,
  email: 'test@test.com',
  role: UserRole.NORMAL,
  createdAt: new Date().toISOString()
};

const mockAuthContext = {
  user: mockUser,
  updateUserBalance: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false,
  forgotPassword: vi.fn()
};

describe('PlinkoPhysics Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays loading state during initialization', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    // Should show loading initially
    expect(screen.getByText('Loading game configuration...')).toBeInTheDocument();
  });

  it('shows physics initialization message', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Initializing physics engine...')).toBeInTheDocument();
    });
  });

  it('enables controls after physics initialization', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Physics:')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders canvas with proper styling', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toHaveClass('border', 'border-border', 'rounded-lg', 'shadow-lg');
    });
  });

  it('displays correct peg configuration', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Peg Configuration')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument(); // Current rows
      expect(screen.getByText('Rows of Pegs')).toBeInTheDocument();
    });
  });

  it('shows slot value indicators', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      // Should render multiplier badges
      expect(screen.getByText('5x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('0.5x')).toBeInTheDocument();
    });
  });

  it('prevents ball dropping until physics is ready', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    // Initially button should be disabled
    await waitFor(() => {
      const dropButton = screen.getByRole('button', { name: /Drop 1 Ball/i });
      expect(dropButton).toBeDisabled();
    });
  });
});
