
import { User, UserRole, RolePermissions } from '../types';

// Role permissions mapping
export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return {
        canViewAdminPanel: true,
        canManageUsers: true,
        canManageGameConfigs: true,
        canViewAuditLogs: true,
        canManagePayouts: true,
        canModerateBalances: true,
        canViewAnalytics: true,
        canAdjustLuck: true,
        canModifyServerConfigs: true,
      };
    case UserRole.ADMIN:
      return {
        canViewAdminPanel: true,
        canManageUsers: true,
        canManageGameConfigs: true,
        canViewAuditLogs: false,
        canManagePayouts: false,
        canModerateBalances: true,
        canViewAnalytics: true,
        canAdjustLuck: true,
        canModifyServerConfigs: false,
      };
    case UserRole.SPONSORED:
      return {
        canViewAdminPanel: false,
        canManageUsers: false,
        canManageGameConfigs: false,
        canViewAuditLogs: false,
        canManagePayouts: false,
        canModerateBalances: false,
        canViewAnalytics: false,
        canAdjustLuck: false,
        canModifyServerConfigs: false,
      };
    case UserRole.NORMAL:
    default:
      return {
        canViewAdminPanel: false,
        canManageUsers: false,
        canManageGameConfigs: false,
        canViewAuditLogs: false,
        canManagePayouts: false,
        canModerateBalances: false,
        canViewAnalytics: false,
        canAdjustLuck: false,
        canModifyServerConfigs: false,
      };
  }
};

// RBAC middleware functions
export const rbacService = {
  hasPermission: (user: User | null, permission: keyof RolePermissions): boolean => {
    if (!user) return false;
    const permissions = getRolePermissions(user.role);
    return permissions[permission];
  },

  canAccessAdminPanel: (user: User | null): boolean => {
    return rbacService.hasPermission(user, 'canViewAdminPanel');
  },

  canManageUsers: (user: User | null): boolean => {
    return rbacService.hasPermission(user, 'canManageUsers');
  },

  canManageGameConfigs: (user: User | null): boolean => {
    return rbacService.hasPermission(user, 'canManageGameConfigs');
  },

  canViewAuditLogs: (user: User | null): boolean => {
    return rbacService.hasPermission(user, 'canViewAuditLogs');
  },

  canAdjustLuck: (user: User | null): boolean => {
    return rbacService.hasPermission(user, 'canAdjustLuck');
  },

  isNormal: (user: User | null): boolean => {
    return user?.role === UserRole.NORMAL;
  },

  isSponsored: (user: User | null): boolean => {
    return user?.role === UserRole.SPONSORED;
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.ADMIN;
  },

  isSuperAdmin: (user: User | null): boolean => {
    return user?.role === UserRole.SUPER_ADMIN;
  },

  getUserLuckMultiplier: (user: User | null): number => {
    if (!user || user.role !== UserRole.SPONSORED) return 1.0;
    return user.luckMultiplier || 1.0;
  }
};
