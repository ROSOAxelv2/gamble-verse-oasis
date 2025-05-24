
import { User, AdminRole, AdminPermissions, AuditLog, SystemHealth } from '../types';

let auditLogs: AuditLog[] = [];
let adminUsers: User[] = [];

// Role permissions mapping - Updated to allow normal admins to manage games
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
        canManageGameConfigs: true, // Allow normal admins to manage games
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
  // Admin login method
  adminLogin: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock admin users - in real app, check against database
        const mockAdmins = [
          {
            id: '2',
            username: 'admin',
            email: 'admin@example.com',
            balance: 5000,
            isAdmin: true,
            role: AdminRole.GAME_MODERATOR,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            username: 'superadmin',
            email: 'superadmin@lovablecasino.com',
            balance: 0,
            isAdmin: true,
            role: AdminRole.SUPER_ADMIN,
            createdAt: new Date().toISOString(),
          }
        ];

        const admin = mockAdmins.find(a => a.email === email);
        if (!admin) {
          reject(new Error('Invalid admin credentials'));
          return;
        }

        // In real app, verify password hash
        logAdminAction(admin.id, 'ADMIN_LOGIN', `Admin ${email} logged in`);
        resolve(admin);
      }, 500);
    });
  },

  // Reset admin password method
  resetAdminPassword: async (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock check for admin email
        const adminEmails = ['admin@example.com', 'superadmin@lovablecasino.com'];
        if (!adminEmails.includes(email)) {
          reject(new Error('No admin account found with this email'));
          return;
        }

        // In real app, send password reset email
        console.log(`Password reset requested for admin: ${email}`);
        resolve();
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

  // Create admin action log
  logAction: (userId: string, action: string, details: string) => {
    logAdminAction(userId, action, details);
  },
};
