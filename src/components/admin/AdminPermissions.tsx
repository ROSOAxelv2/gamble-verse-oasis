
import { User } from "../../types";
import { rbacService } from "../../services/rbac";

export const useAdminPermissions = (user: User | null) => {
  const canViewTab = (tab: string): boolean => {
    if (!user) return false;
    
    switch (tab) {
      case 'users':
        return rbacService.canManageUsers(user);
      case 'games':
        return rbacService.canManageGameConfigs(user);
      case 'analytics':
        return rbacService.hasPermission(user, 'canViewAnalytics');
      case 'logs':
        return rbacService.canViewAuditLogs(user);
      case 'vip':
        return rbacService.canAccessAdminPanel(user);
      default:
        return false;
    }
  };

  return { canViewTab };
};
