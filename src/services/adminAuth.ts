
import { User, AdminRole, AdminPermissions, AuditLog, SystemHealth } from '../types';

// Super admin credentials (in real app, use environment variables)
const SUPER_ADMIN_EMAIL = 'admin@lovablecasino.com';
const SUPER_ADMIN_PASSWORD = 'SuperAdmin2024!'; // In real app: process.env.SUPER_ADMIN_PASSWORD

let auditLogs: AuditLog[] = [];
let adminUsers: User[] = [];

// Initialize super admin on first startup
const initializeSuperAdmin = (): User => {
  const superAdmin: User = {
    id: 'super-admin-1',
    username: 'superadmin',
    email: SUPER_ADMIN_EMAIL,
    balance: 0,
    isAdmin: true,
    role: AdminRole.SUPER_ADMIN,
    createdAt: new Date().toISOString(),
  };
  
  if (!adminUsers.find(u => u.email === SUPER_ADMIN_EMAIL)) {
    adminUsers.push(superAdmin);
  }
  
  return superAdmin;
};

// Role permissions mapping
export const getRolePermissions = (role: AdminRole): AdminPermissions => {
  switch (role) {
    case AdminRole.SUPER_ADMIN:
      return {
        canManageUsers: true,
        canManageGameConfigs: true,
        canViewAuditLogs: true,
        canManagePayouts: true,
        canModerateBalances: true,
        canViewAnalytics: true,
      };
    case AdminRole.GAME_MODERATOR:
      return {
        canManageUsers: false,
        canManageGameConfigs: false,
        canViewAuditLogs: false,
        canManagePayouts: false,
        canModerateBalances: true,
        canViewAnalytics: true,
      };
    default:
      return {
        canManageUsers: false,
        canManageGameConfigs: false,
        canViewAuditLogs: false,
        canManagePayouts: false,
        canModerateBalances: false,
        canViewAnalytics: false,
      };
  }
};

// Log admin actions for audit trail
const logAdminAction = (userId: string, action: string, details: string) => {
  const log: AuditLog = {
    id: `audit-${Date.now()}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1', // In real app, get actual IP
  };
  auditLogs.push(log);
};

export const adminAuthService = {
  // Initialize super admin on app startup
  initialize: (): void => {
    initializeSuperAdmin();
  },

  // Admin login (separate from player login)
  adminLogin: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check super admin credentials
        if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
          const superAdmin = initializeSuperAdmin();
          logAdminAction(superAdmin.id, 'ADMIN_LOGIN', `Super admin logged in from ${email}`);
          resolve(superAdmin);
          return;
        }

        // Check other admin users
        const adminUser = adminUsers.find(u => u.email === email && u.isAdmin);
        if (adminUser) {
          logAdminAction(adminUser.id, 'ADMIN_LOGIN', `Admin logged in from ${email}`);
          resolve(adminUser);
        } else {
          reject(new Error('Invalid admin credentials'));
        }
      }, 500);
    });
  },

  // Reset admin password
  resetAdminPassword: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const adminUser = adminUsers.find(u => u.email === email && u.isAdmin);
        if (!adminUser) {
          reject(new Error('Admin account not found'));
          return;
        }
        
        logAdminAction('system', 'PASSWORD_RESET', `Password reset requested for ${email}`);
        console.log(`Admin password reset email would be sent to: ${email}`);
        resolve();
      }, 1000);
    });
  },

  // Create new admin user (Super Admin only)
  createAdminUser: async (userData: Omit<User, 'id' | 'createdAt'>, createdBy: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const creator = adminUsers.find(u => u.id === createdBy);
        if (!creator || creator.role !== AdminRole.SUPER_ADMIN) {
          reject(new Error('Unauthorized: Only Super Admins can create admin users'));
          return;
        }

        const newAdmin: User = {
          ...userData,
          id: `admin-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        adminUsers.push(newAdmin);
        logAdminAction(createdBy, 'CREATE_ADMIN', `Created admin user: ${newAdmin.email}`);
        resolve(newAdmin);
      }, 500);
    });
  },

  // Get system health metrics
  getSystemHealth: async (): Promise<SystemHealth> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uptime: Date.now(),
          dbConnections: 5,
          activeGames: 4,
          errorRate: 0.02,
        });
      }, 300);
    });
  },

  // Get audit logs (Super Admin only)
  getAuditLogs: async (requesterId: string): Promise<AuditLog[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requester = adminUsers.find(u => u.id === requesterId);
        if (!requester || requester.role !== AdminRole.SUPER_ADMIN) {
          reject(new Error('Unauthorized: Only Super Admins can view audit logs'));
          return;
        }

        resolve([...auditLogs].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      }, 300);
    });
  },

  // Check if user has specific permission
  hasPermission: (user: User, permission: keyof AdminPermissions): boolean => {
    if (!user.isAdmin || !user.role) return false;
    const permissions = getRolePermissions(user.role);
    return permissions[permission];
  },
};

// Initialize on module load
adminAuthService.initialize();
