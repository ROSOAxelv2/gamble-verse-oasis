import { User, Transaction, GameType, TransactionType, DiceGameResult, GameConfig, PlinkoGameResult, SlotGameResult, AdminAnalytics } from '../types';

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
  
  playPlinkoGame: async (betAmount: number, difficulty: string = "Easy"): Promise<PlinkoGameResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        // Get plinko game config
        const config = gameConfigurations.find(c => c.gameType === GameType.PLINKO);
        if (!config || !config.enabled) {
          reject(new Error('Plinko game is not available'));
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

        // Set rows based on difficulty
        let rows = 8;
        let multipliers: number[] = [];
        
        switch (difficulty) {
          case "Easy":
            rows = 8;
            multipliers = [2, 1.5, 1.2, 1, 0, 1, 1.2, 1.5, 2];
            break;
          case "Medium":
            rows = 10;
            multipliers = [3, 2, 1.5, 1.2, 0.8, 0.5, 0.8, 1.2, 1.5, 2, 3];
            break;
          case "Hard":
            rows = 12;
            multipliers = [5, 3, 2, 1.5, 1, 0.5, 0, 0.5, 1, 1.5, 2, 3, 5];
            break;
          default:
            rows = 8;
            multipliers = [2, 1.5, 1.2, 1, 0, 1, 1.2, 1.5, 2];
        }
        
        // Generate path through the plinko board
        const path: number[] = [];
        
        for (let i = 0; i < rows; i++) {
          // 0 = left, 1 = right
          path.push(Math.round(Math.random()));
        }
        
        // Calculate which bucket the ball ends up in
        // Count number of 'right' moves to determine bucket
        const rightMoves = path.filter(dir => dir === 1).length;
        const finalBucket = rightMoves;
        
        // Determine win amount based on bucket
        const bucketMultiplier = multipliers[finalBucket] || 0;
        const isWin = bucketMultiplier > 0;
        const winAmount = isWin ? betAmount * bucketMultiplier : 0;
        
        // Process bet with slow animation (simulate longer gameplay)
        setTimeout(() => {
          userService.updateBalance(betAmount, TransactionType.BET, GameType.PLINKO)
            .then(() => {
              if (isWin) {
                return userService.updateBalance(winAmount, TransactionType.WIN, GameType.PLINKO);
              }
              return Promise.resolve(currentUser!);
            })
            .then(() => {
              const result: PlinkoGameResult = {
                betAmount,
                winAmount,
                path,
                finalBucket,
                isWin,
              };
              resolve(result);
            })
            .catch(error => reject(error));
        }, 1000);
      }, 800);
    });
  },
  
  playSlotsGame: async (betAmount: number): Promise<SlotGameResult> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        // Get slots game config
        const config = gameConfigurations.find(c => c.gameType === GameType.SLOTS);
        if (!config || !config.enabled) {
          reject(new Error('Slots game is not available'));
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
        
        // Define symbols and their probabilities
        const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "7️⃣", "💰"];
        const weights = [30, 30, 20, 10, 5, 3, 2];
        
        // Generate random reels
        const reels: string[][] = [[], [], []];
        
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            // Weighted random selection
            let random = Math.random() * weights.reduce((a, b) => a + b, 0);
            let selectedIndex = 0;
            
            for (let k = 0; k < weights.length; k++) {
              random -= weights[k];
              if (random <= 0) {
                selectedIndex = k;
                break;
              }
            }
            
            reels[i][j] = symbols[selectedIndex];
          }
        }
        
        // Check for winning paylines
        const paylines: number[] = [];
        let totalWin = 0;
        
        // Define payline patterns
        const paylinePatterns = [
          { id: 1, positions: [[0, 0], [0, 1], [0, 2]], multiplier: 2 },
          { id: 2, positions: [[1, 0], [1, 1], [1, 2]], multiplier: 1 },
          { id: 3, positions: [[2, 0], [2, 1], [2, 2]], multiplier: 2 },
          { id: 4, positions: [[0, 0], [1, 1], [2, 2]], multiplier: 3 },
          { id: 5, positions: [[0, 2], [1, 1], [2, 0]], multiplier: 3 },
        ];
        
        // Check each payline
        paylinePatterns.forEach(payline => {
          const symbols = payline.positions.map(pos => reels[pos[0]][pos[1]]);
          const isWin = symbols.every(s => s === symbols[0]);
          
          if (isWin) {
            paylines.push(payline.id);
            
            // Calculate win amount based on symbol and multiplier
            let symbolMultiplier = 0;
            const symbol = symbols[0];
            
            switch (symbol) {
              case "🍒": symbolMultiplier = 1; break;
              case "🍋": symbolMultiplier = 2; break;
              case "🍊": symbolMultiplier = 3; break;
              case "🍇": symbolMultiplier = 4; break;
              case "🔔": symbolMultiplier = 5; break;
              case "7️⃣": symbolMultiplier = 10; break;
              case "💰": symbolMultiplier = 20; break;
            }
            
            totalWin += betAmount * symbolMultiplier * payline.multiplier;
          }
        });
        
        const isWin = paylines.length > 0;
        const winAmount = isWin ? totalWin : 0;
        
        // Process bet - add a delay to slow down the animation
        setTimeout(() => {
          userService.updateBalance(betAmount, TransactionType.BET, GameType.SLOTS)
            .then(() => {
              if (isWin) {
                return userService.updateBalance(winAmount, TransactionType.WIN, GameType.SLOTS);
              }
              return Promise.resolve(currentUser!);
            })
            .then(() => {
              const result: SlotGameResult = {
                betAmount,
                winAmount,
                reels,
                paylines,
                isWin,
              };
              resolve(result);
            })
            .catch(error => reject(error));
        }, 1500); // Longer delay for slots animation
      }, 800);
    });
  }
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
  
  getAnalytics: async (): Promise<AdminAnalytics> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser?.isAdmin) {
          reject(new Error('Unauthorized'));
          return;
        }
        
        // Calculate analytics from transaction data
        const totalWagers = transactions
          .filter(t => t.type === TransactionType.BET)
          .reduce((sum, t) => sum + t.amount, 0);
          
        const totalWins = transactions
          .filter(t => t.type === TransactionType.WIN)
          .reduce((sum, t) => sum + t.amount, 0);
          
        const houseEdge = totalWagers > 0 
          ? parseFloat(((totalWagers - totalWins) / totalWagers * 100).toFixed(1))
          : 0;
          
        // Game popularity (count of bets per game)
        const betsByGame = transactions
          .filter(t => t.type === TransactionType.BET && t.gameType)
          .reduce((counts, t) => {
            const gameType = t.gameType as GameType;
            counts[gameType] = (counts[gameType] || 0) + 1;
            return counts;
          }, {} as Record<GameType, number>);
          
        // Fill in missing games with zero counts
        Object.values(GameType).forEach(gameType => {
          if (!betsByGame[gameType]) {
            betsByGame[gameType] = 0;
          }
        });
        
        const analytics: AdminAnalytics = {
          totalWagers,
          houseEdge,
          activePlayers: registeredUsers.length,
          gamePopularity: betsByGame
        };
        
        resolve(analytics);
      }, 500);
    });
  },
  
  updateUserStatus: async (userId: string, action: 'freeze' | 'unfreeze'): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser?.isAdmin) {
          reject(new Error('Unauthorized'));
          return;
        }
        
        const userIndex = registeredUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        // In a real app, we'd update a 'status' field in the user object
        // For this mock, we'll just return the user without changes
        resolve(registeredUsers[userIndex]);
      }, 500);
    });
  }
};
