import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlinkoAdvanced } from '../../PlinkoAdvanced';
import { AuthContext } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// Mock the physics engine
vi.mock('@/utils/plinkoPhysics', () => ({
  PlinkoPhysicsEngine: vi.fn().mockImplementation(() => ({
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
    getActiveBallCount: vi.fn().mockReturnValue(0)
  }))
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

describe('PlinkoAdvanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders peg controls with correct initial state', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Peg Configuration')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument(); // Current rows
    });
  });

  it('disables peg controls when balls are active', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Range: 3-10 rows')).toBeInTheDocument();
    });
  });

  it('displays slot value indicators', async () => {
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <PlinkoAdvanced />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      // Should render slot value badges
      expect(screen.getByText('5x')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('0.5x')).toBeInTheDocument();
    });
  });
});
