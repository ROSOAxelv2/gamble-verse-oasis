import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { adminService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { rbacService } from "../services/rbac";
import { User, GameConfig, SystemHealth, AuditLog } from "../types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VipConfigTab } from "../components/admin/VipConfigTab";
import { GameConfigSection } from "../components/admin/GameConfigSection";
import { UsersSection } from "../components/admin/UsersSection";
import { AnalyticsSection } from "../components/admin/AnalyticsSection";
import { AuditLogsSection } from "../components/admin/AuditLogsSection";
import { SystemHealthCard } from "../components/admin/SystemHealthCard";

const AdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState({
    users: true,
    configs: true,
    health: true,
    logs: true,
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      console.log("AdminPage: Starting to fetch admin data for user:", user);
      
      // Load users
      try {
        console.log("AdminPage: Fetching users...");
        const usersData = await adminService.getAllUsers();
        console.log("AdminPage: Users loaded:", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error("AdminPage: Failed to load users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }

      // Load game configurations from API
      try {
        console.log("AdminPage: Fetching game configurations...");
        const configsData = await adminService.getAllGameConfigs();
        console.log("AdminPage: Game configurations loaded:", configsData);
        setGameConfigs(configsData);
      } catch (error) {
        console.error("AdminPage: Failed to load game configurations:", error);
        toast.error("Failed to load game configurations");
        // Fallback to empty array if API fails
        setGameConfigs([]);
      } finally {
        setLoading(prev => ({ ...prev, configs: false }));
      }

      // Load system health
      try {
        const health = await adminAuthService.getSystemHealth();
        setSystemHealth(health);
      } catch (error) {
        toast.error("Failed to load system health");
      } finally {
        setLoading(prev => ({ ...prev, health: false }));
      }

      // Load audit logs (Super Admin only)
      if (user?.role === 'super_admin') {
        try {
          const logs = await adminAuthService.getAuditLogs(user.id);
          setAuditLogs(logs);
        } catch (error) {
          toast.error("Failed to load audit logs");
        } finally {
          setLoading(prev => ({ ...prev, logs: false }));
        }
      } else {
        setLoading(prev => ({ ...prev, logs: false }));
      }
    };

    if (user) {
      fetchAdminData();
    }
  }, [user]);

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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'sponsored': return 'Sponsored';
      case 'normal': return 'Player';
      default: return 'Player';
    }
  };

  return (
    <Layout requireAuth requireAdmin>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Logged in as: {user?.email} 
              <Badge variant="secondary" className="ml-2">
                {getRoleDisplayName(user?.role || 'normal')}
              </Badge>
            </p>
          </div>
          
          <SystemHealthCard systemHealth={systemHealth} />
        </div>
        
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="games" disabled={!canViewTab('games')}>Games</TabsTrigger>
            <TabsTrigger value="users" disabled={!canViewTab('users')}>Users</TabsTrigger>
            <TabsTrigger value="vip" disabled={!canViewTab('vip')}>VIP</TabsTrigger>
            <TabsTrigger value="analytics" disabled={!canViewTab('analytics')}>Analytics</TabsTrigger>
            <TabsTrigger value="logs" disabled={!canViewTab('logs')}>Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="games" className="space-y-6">
            <GameConfigSection 
              gameConfigs={gameConfigs}
              setGameConfigs={setGameConfigs}
              loading={loading.configs}
              user={user}
            />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-6">
            <UsersSection users={users} loading={loading.users} />
          </TabsContent>
          
          <TabsContent value="vip" className="space-y-6">
            <VipConfigTab />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection users={users} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AuditLogsSection 
              user={user}
              auditLogs={auditLogs}
              loading={loading.logs}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
