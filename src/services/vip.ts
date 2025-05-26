import { VipLevel, VipProgramConfig, VipStats, UserBadge, VipBenefits } from '../types';
import { authService } from './api';
import { rbacService } from './rbac';

// Default VIP program configuration
const defaultVipConfig: VipProgramConfig = {
  id: '1',
  levelThresholds: {
    [VipLevel.BRONZE]: 0,
    [VipLevel.SILVER]: 10000,
    [VipLevel.GOLD]: 50000,
    [VipLevel.PLATINUM]: 200000,
    [VipLevel.DIAMOND]: 1000000,
  },
  levelBenefits: {
    [VipLevel.BRONZE]: {
      dailyFreeSpin: 1,
      cashbackPercent: 0.5,
      badges: ['bronze-member'],
    },
    [VipLevel.SILVER]: {
      dailyFreeSpin: 3,
      cashbackPercent: 1,
      badges: ['silver-member', 'fast-track'],
    },
    [VipLevel.GOLD]: {
      dailyFreeSpin: 5,
      cashbackPercent: 2,
      badges: ['gold-member', 'high-roller'],
    },
    [VipLevel.PLATINUM]: {
      dailyFreeSpin: 10,
      cashbackPercent: 3,
      badges: ['platinum-member', 'whale', 'vip-club'],
    },
    [VipLevel.DIAMOND]: {
      dailyFreeSpin: 20,
      cashbackPercent: 5,
      badges: ['diamond-member', 'legend', 'inner-circle', 'high-society'],
    },
  },
  enabled: true,
};

// Badge definitions
const badgeDefinitions: Record<string, { name: string; description: string; imageUrl: string }> = {
  'bronze-member': {
    name: 'Bronze Member',
    description: 'You have reached Bronze VIP status',
    imageUrl: '/badges/bronze.svg',
  },
  'silver-member': {
    name: 'Silver Member',
    description: 'You have reached Silver VIP status',
    imageUrl: '/badges/silver.svg',
  },
  'gold-member': {
    name: 'Gold Member',
    description: 'You have reached Gold VIP status',
    imageUrl: '/badges/gold.svg',
  },
  'platinum-member': {
    name: 'Platinum Member',
    description: 'You have reached Platinum VIP status',
    imageUrl: '/badges/platinum.svg',
  },
  'diamond-member': {
    name: 'Diamond Member',
    description: 'You have reached Diamond VIP status',
    imageUrl: '/badges/diamond.svg',
  },
  'fast-track': {
    name: 'Fast Track',
    description: 'You\'re moving up the VIP ladder quickly',
    imageUrl: '/badges/fast-track.svg',
  },
  'high-roller': {
    name: 'High Roller',
    description: 'You\'ve placed some impressive bets',
    imageUrl: '/badges/high-roller.svg',
  },
  'whale': {
    name: 'Whale',
    description: 'One of our top players by bet size',
    imageUrl: '/badges/whale.svg',
  },
  'vip-club': {
    name: 'VIP Club',
    description: 'Member of our exclusive VIP Club',
    imageUrl: '/badges/vip-club.svg',
  },
  'legend': {
    name: 'Legend',
    description: 'Your reputation precedes you',
    imageUrl: '/badges/legend.svg',
  },
  'inner-circle': {
    name: 'Inner Circle',
    description: 'Part of our most exclusive group of players',
    imageUrl: '/badges/inner-circle.svg',
  },
  'high-society': {
    name: 'High Society',
    description: 'The elite of the elite',
    imageUrl: '/badges/high-society.svg',
  },
};

// Placeholder SVG files for badges
const placeholderSvgs: Record<string, string> = {
  bronze: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#CD7F32"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">B</text></svg>',
  silver: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#C0C0C0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">S</text></svg>',
  gold: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFD700"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">G</text></svg>',
  platinum: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#E5E4E2"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">P</text></svg>',
  diamond: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#B9F2FF"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10">D</text></svg>',
};

// State container for VIP-related data
let vipConfig = { ...defaultVipConfig };

export const vipService = {
  getUserVipStats: async (): Promise<VipStats | null> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        // In a real app, we'd fetch this from the server
        // For now, we'll generate it based on a percentage of the user's balance
        const lifetimeWagered = currentUser.balance * 20; // Sample calculation
        const level = vipService.calculateVipLevel(lifetimeWagered);
        const nextLevel = vipService.getNextLevel(level);
        const nextLevelAt = nextLevel ? vipConfig.levelThresholds[nextLevel] : Infinity;
        
        // Calculate VIP points - 1 point per 100 wagered
        const currentPoints = Math.floor(lifetimeWagered / 100);
        
        // Get badges for the current level
        const badges = vipService.getUserBadges(level);
        
        const vipStats: VipStats = {
          level,
          lifetimeWagered,
          currentPoints,
          nextLevelAt,
          badges,
        };
        
        resolve(vipStats);
      }, 300);
    });
  },
  
  calculateVipLevel: (lifetimeWagered: number): VipLevel => {
    const levels = Object.values(VipLevel);
    
    // Find the highest level threshold that's less than or equal to lifetimeWagered
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      if (lifetimeWagered >= vipConfig.levelThresholds[level]) {
        return level;
      }
    }
    
    return VipLevel.BRONZE; // Default
  },
  
  getNextLevel: (currentLevel: VipLevel): VipLevel | null => {
    const levels = Object.values(VipLevel);
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    
    return null; // Already at the highest level
  },
  
  getUserBadges: (level: VipLevel): UserBadge[] => {
    const badges: UserBadge[] = [];
    const levels = Object.values(VipLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    // Add badges from the current level and all levels below it
    for (let i = 0; i <= currentLevelIndex; i++) {
      const levelBadges = vipConfig.levelBenefits[levels[i]].badges;
      
      for (const badgeId of levelBadges) {
        const badgeDefinition = badgeDefinitions[badgeId];
        if (badgeDefinition) {
          badges.push({
            id: badgeId,
            name: badgeDefinition.name,
            description: badgeDefinition.description,
            imageUrl: badgeDefinition.imageUrl,
            earnedAt: new Date().toISOString(), // In a real app, this would be the actual date
          });
        }
      }
    }
    
    return badges;
  },
  
  getLevelBenefits: (level: VipLevel): VipBenefits => {
    return vipConfig.levelBenefits[level];
  },
  
  getVipConfig: async (): Promise<VipProgramConfig> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...vipConfig });
      }, 300);
    });
  },
  
  updateVipConfig: async (config: VipProgramConfig): Promise<VipProgramConfig> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        if (!rbacService.canAccessAdminPanel(currentUser)) {
          reject(new Error('Unauthorized'));
          return;
        }
        
        vipConfig = { ...config };
        resolve(vipConfig);
      }, 500);
    });
  },
  
  claimDailyReward: async (): Promise<{ success: boolean; reward: number }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }
        
        // In a real app, we'd check if the user has already claimed their daily reward
        // For now, we'll just give them the reward based on their level
        vipService.getUserVipStats()
          .then(stats => {
            if (!stats) {
              reject(new Error('VIP stats not found'));
              return;
            }
            
            const benefits = vipService.getLevelBenefits(stats.level);
            const reward = benefits.dailyFreeSpin * 50; // 50 credits per free spin
            
            // Update user balance
            // In a real app, we'd have a transaction type for this
            currentUser.balance += reward;
            
            resolve({ success: true, reward });
          })
          .catch(error => reject(error));
      }, 800);
    });
  }
};

// Create a placeholder for badge SVGs
// In a real app, these would be actual files in the public directory
if (typeof document !== 'undefined') {
  Object.entries(placeholderSvgs).forEach(([name, svg]) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Mock the file URL
    // In a real app, don't do this - use actual files
    // This is just for the demo
    Object.defineProperty(window, `${name}Url`, {
      get: () => url
    });
  });
}
