
import { User } from "../../types";
import { adminAuthService } from "../../services/adminAuth";

export const useAdminPermissions = (user: User | null) => {
  const canViewTab = (tab: string): boolean => {
    if (!user || !user.isAdmin) return false;
    
    switch (tab) {
      case 'users':
        return adminAuthService.hasPermission(user, 'canManageUsers');
      case 'games':
        return true; // All admin accounts can manage games
      case 'analytics':
        return adminAuthService.hasPermission(user, 'canViewAnalytics');
      case 'logs':
        return adminAuthService.hasPermission(user, 'canViewAuditLogs');
      case 'vip':
        return true; // All admin accounts can manage VIP
      default:
        return true;
    }
  };

  return { canViewTab };
};
