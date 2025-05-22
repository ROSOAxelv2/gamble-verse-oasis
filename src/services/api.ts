
import { User, Transaction, GameType, TransactionType, DiceGameResult, GameConfig } from '../types';

// Mock user data
let currentUser: User | null = null;
const registeredUsers: User[] = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    balance: 1000,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    balance: 5000,
    isAdmin: true,
    createdAt: new Date().toISOString(),
  },
];

// Mock game configurations
const gameConfigurations: GameConfig[] = [
  {
    id: '1',
    gameType: GameType.DICE,
    minBet: 10,
    maxBet: 1000,
    payoutMultiplier: 5,
    enabled: true,
  },
  {
    id: '2',
    gameType: GameType.PLINKO,
    minBet: 50,
    maxBet: 2000,
    payoutMultiplier: 10,
    enabled: false,
  },
  {
    id: '3',
    gameType: GameType.SLOTS,
    minBet: 25,
    maxBet: 1500,
    payoutMultiplier: 8,
    enabled: false,
  },
];

// Mock transactions
const transactions: Transaction[] = [];

// Authentication services
export const authService = {
  register: async (username: string, email: string, password: string): Promise<User> => {
    // In a real app, we'd hash the password and store in DB
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user exists
        const existingUser = registeredUsers.find(u => u.email === email || u.username === username);
        if (existingUser) {
          reject(new Error('User already exists'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: (registeredUsers.length + 1).toString(),
          username,
          email,
          balance: 1000, // Starting balance
          isAdmin: false,
          createdAt: new Date().toISOString(),
        };

        registeredUsers.push(newUser);
        currentUser = newUser;
        resolve(newUser);
      }, 500);
    });
  },

  login: async (emailOrUsername: string, password: string): Promise<User> => {
    // In a real app, we'd verify the password hash
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = registeredUsers.find(
          u => u.email === emailOrUsername || u.username === emailOrUsername
        );

        if (!user) {
          reject(new Error('Invalid credentials'));
          return;
        }

        currentUser = user;
        resolve(user);
      }, 500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        currentUser = null;
        resolve();
      }, 300);
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = registeredUsers.find(u => u.email === email);
        if (!user) {
          reject(new Error('No account found with this email'));
          return;
        }
        
        // In a real app, send an email with reset link
        console.log(`Password reset requested for ${email}`);
        resolve();
      }, 500);
    });
  },

  getCurrentUser: (): User | null => {
    return currentUser;
  },
};

// User services
export const userService = {
  getProfile: async (): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }
        resolve(currentUser);
      }, 300);
    });
  },

  updateBalance: async (amount: number, type: TransactionType, gameType?: GameType): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        // Update balance
        const balanceBefore = currentUser.balance;
        if (type === TransactionType.BET) {
          if (currentUser.balance < amount) {
            reject(new Error('Insufficient balance'));
            return;
          }
          currentUser.balance -= amount;
        } else if (type === TransactionType.WIN) {
          currentUser.balance += amount;
        } else if (type === TransactionType.DEPOSIT) {
          currentUser.balance += amount;
        } else if (type === TransactionType.WITHDRAWAL) {
          if (currentUser.balance < amount) {
            reject(new Error('Insufficient balance'));
            return;
          }
          currentUser.balance -= amount;
        }

        // Record transaction
        const transaction: Transaction = {
          id: (transactions.length + 1).toString(),
          userId: currentUser.id,
          amount,
          type,
          gameType,
          createdAt: new Date().toISOString(),
          balanceAfter: currentUser.balance,
        };
        transactions.push(transaction);

        resolve(currentUser);
      }, 300);
    });
  },

  getTransactions: async (): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }
        
        // Return only the current user's transactions, in reverse chronological order
        const userTransactions = transactions
          .filter(t => t.userId === currentUser?.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
        resolve(userTransactions);
      }, 300);
    });
  },
};

// Game services
export const gameService = {
  getGameConfig: async (gameType: GameType): Promise<GameConfig> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const config = gameConfigurations.find(c => c.gameType === gameType);
        if (!config) {
          reject(new Error(`No configuration found for ${gameType}`));
          return;
        }
        if (!config.enabled) {
          reject(new Error(`${gameType} is currently disabled`));
          return;
        }
        resolve(config);
      }, 300);
    });
  },

  playDiceGame: async (chosenNumber: number, betAmount: number): Promise<DiceGameResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        // Get dice game config
        const config = gameConfigurations.find(c => c.gameType === GameType.DICE);
        if (!config || !config.enabled) {
          reject(new Error('Dice game is not available'));
          return;
        }

        // Validate bet amount
        if (betAmount < config.minBet || betAmount > config.maxBet) {
          reject(new Error(`Bet amount must be between ${config.minBet} and ${config.maxBet}`));
          return;
        }

        // Check sufficient balance
        if (currentUser.balance < betAmount) {
          reject(new Error('Insufficient balance'));
          return;
        }

        // Generate random dice roll (1-6)
        const actualNumber = Math.floor(Math.random() * 6) + 1;
        const isWin = chosenNumber === actualNumber;
        let winAmount = 0;

        // Process bet
        userService.updateBalance(betAmount, TransactionType.BET, GameType.DICE)
          .then(() => {
            if (isWin) {
              winAmount = betAmount * config.payoutMultiplier;
              return userService.updateBalance(winAmount, TransactionType.WIN, GameType.DICE);
            }
            return Promise.resolve(currentUser!);
          })
          .then(() => {
            const result: DiceGameResult = {
              playerNumber: chosenNumber,
              actualNumber,
              betAmount,
              winAmount,
              isWin,
            };
            resolve(result);
          })
          .catch(error => reject(error));
      }, 800); // Slightly longer delay to simulate the game
    });
  },
};

// Admin services
export const adminService = {
  getAllUsers: async (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser?.isAdmin) {
          reject(new Error('Unauthorized'));
          return;
        }
        resolve([...registeredUsers]);
      }, 500);
    });
  },

  updateGameConfig: async (config: GameConfig): Promise<GameConfig> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser?.isAdmin) {
          reject(new Error('Unauthorized'));
          return;
        }
        
        const index = gameConfigurations.findIndex(c => c.id === config.id);
        if (index === -1) {
          reject(new Error('Configuration not found'));
          return;
        }
        
        gameConfigurations[index] = { ...config };
        resolve(gameConfigurations[index]);
      }, 500);
    });
  },

  getAllTransactions: async (): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser?.isAdmin) {
          reject(new Error('Unauthorized'));
          return;
        }
        
        resolve([...transactions].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }, 500);
    });
  },
};
