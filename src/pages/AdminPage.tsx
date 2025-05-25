
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { adminService } from "../services/api";
import { adminAuthService } from "../services/adminAuth";
import { useAuth } from "../contexts/AuthContext";
import { User, GameConfig, GameType, AdminRole, SystemHealth, AuditLog } from "../types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VipConfigTab } from "../components/admin/VipConfigTab";
import { GameConfigSection } from "../components/admin/GameConfigSection";
import { UsersSection } from "../components/admin/UsersSection";
import { AnalyticsSection } from "../components/admin/AnalyticsSection";
import { AuditLogsSection } from "../components/admin/AuditLogsSection";
import { SystemHealthCard } from "../components/admin/SystemHealthCard";
import { useAdminPermissions } from "../components/admin/AdminPermissions";

const AdminPage = () => {
  const { user } = useAuth();
  const { canViewTab } = useAdminPermissions(user);
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
      try {
        const usersData = await adminService.getAllUsers();
        setUsers(usersData);
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }

      try {
        // Load game configurations with all games enabled
        setGameConfigs([
          {
            id: "1",
            gameType: GameType.DICE,
            minBet: 10,
            maxBet: 1000,
            payoutMultiplier: 5,
            enabled: true,
          },
          {
            id: "2",
            gameType: GameType.PLINKO,
            minBet: 50,
            maxBet: 2000,
            payoutMultiplier: 10,
            enabled: true,
          },
          {
            id: "3",
            gameType: GameType.SLOTS,
            minBet: 25,
            maxBet: 1500,
            payoutMultiplier: 8,
            enabled: true,
          },
          {
            id: "4",
            gameType: GameType.TREASURE_OF_AZTEC,
            minBet: 50,
            maxBet: 2500,
            payoutMultiplier: 5000,
            enabled: true,
          },
          {
            id: "5",
            gameType: GameType.CRASH,
            minBet: 50,
            maxBet: 5000,
            payoutMultiplier: 10,
            enabled: true,
          },
        ]);
        setLoading(prev => ({ ...prev, configs: false }));
      } catch (error) {
        toast.error("Failed to load game configurations");
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
      if (user?.role === AdminRole.SUPER_ADMIN) {
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

    fetchAdminData();
  }, [user]);

  return (
    <Layout requireAuth requireAdmin>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Logged in as: {user?.email} 
              <Badge variant="secondary" className="ml-2">
                {user?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
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
