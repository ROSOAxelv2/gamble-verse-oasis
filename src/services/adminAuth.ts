
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
