import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { adminService } from "../services/api";
import { adminAuthService } from "../services/adminAuth";
import { User, GameConfig, GameType, AdminRole, SystemHealth, AuditLog } from "../types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VipConfigTab } from "../components/admin/VipConfigTab";
import { Shield, Users, Settings, BarChart3, AlertTriangle, CheckCircle, Activity } from "lucide-react";

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState({
    users: true,
    configs: true,
    health: true,
    logs: true,
  });

  useEffect(() => {
    // Get current admin user from localStorage
    const adminUser = localStorage.getItem("adminUser");
    if (adminUser) {
      setCurrentAdmin(JSON.parse(adminUser));
    }

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
        // Load game configurations including PG Soft Treasure of Aztec
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
            enabled: false,
          },
          {
            id: "3",
            gameType: GameType.SLOTS,
            minBet: 25,
            maxBet: 1500,
            payoutMultiplier: 8,
            enabled: false,
          },
          {
            id: "4",
            gameType: GameType.TREASURE_OF_AZTEC,
            minBet: 50,
            maxBet: 2500,
            payoutMultiplier: 5000, // Max win multiplier per PG Soft specs
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
      if (currentAdmin?.role === AdminRole.SUPER_ADMIN) {
        try {
          const logs = await adminAuthService.getAuditLogs(currentAdmin.id);
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
  }, [currentAdmin]);

  const updateGameConfig = async (config: GameConfig) => {
    if (!currentAdmin || !adminAuthService.hasPermission(currentAdmin, 'canManageGameConfigs')) {
      toast.error("Insufficient permissions");
      return;
    }

    try {
      await adminService.updateGameConfig(config);
      toast.success(`${config.gameType} configuration updated`);
      
      setGameConfigs(prevConfigs =>
        prevConfigs.map(c => (c.id === config.id ? config : c))
      );
    } catch (error) {
      toast.error("Failed to update game configuration");
    }
  };

  const getGameDisplayName = (gameType: GameType): string => {
    switch (gameType) {
      case GameType.TREASURE_OF_AZTEC:
        return "Treasures of Aztec (PG Soft)";
      case GameType.DICE:
        return "Dice Game";
      case GameType.PLINKO:
        return "Plinko";
      case GameType.SLOTS:
        return "Classic Slots";
      default:
        return gameType.charAt(0).toUpperCase() + gameType.slice(1);
    }
  };

  const canViewTab = (tab: string): boolean => {
    if (!currentAdmin) return false;
    
    switch (tab) {
      case 'users':
        return adminAuthService.hasPermission(currentAdmin, 'canManageUsers');
      case 'games':
        return adminAuthService.hasPermission(currentAdmin, 'canManageGameConfigs');
      case 'analytics':
        return adminAuthService.hasPermission(currentAdmin, 'canViewAnalytics');
      case 'logs':
        return adminAuthService.hasPermission(currentAdmin, 'canViewAuditLogs');
      case 'vip':
        return adminAuthService.hasPermission(currentAdmin, 'canManageGameConfigs');
      default:
        return true;
    }
  };

  return (
    <Layout requireAuth requireAdmin>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Logged in as: {currentAdmin?.email} 
              <Badge variant="secondary" className="ml-2">
                {currentAdmin?.role?.replace('_', ' ').toUpperCase()}
              </Badge>
            </p>
          </div>
          
          {systemHealth && (
            <Card className="w-64">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">System Status</span>
                  {systemHealth.errorRate < 0.05 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Error Rate: {(systemHealth.errorRate * 100).toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="games" disabled={!canViewTab('games')}>Games</TabsTrigger>
            <TabsTrigger value="users" disabled={!canViewTab('users')}>Users</TabsTrigger>
            <TabsTrigger value="vip" disabled={!canViewTab('vip')}>VIP</TabsTrigger>
            <TabsTrigger value="analytics" disabled={!canViewTab('analytics')}>Analytics</TabsTrigger>
            <TabsTrigger value="logs" disabled={!canViewTab('logs')}>Audit Logs</TabsTrigger>
          </TabsList>
          
          {/* Games Configuration Tab */}
          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Game Configurations</span>
                </CardTitle>
                <CardDescription>
                  Manage game settings, betting limits, and enable/disable games
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.configs ? (
                  <div className="text-center py-4">Loading configurations...</div>
                ) : (
                  <div className="space-y-6">
                    {gameConfigs.map(config => (
                      <Card key={config.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="capitalize">{getGameDisplayName(config.gameType)}</CardTitle>
                              {config.gameType === GameType.TREASURE_OF_AZTEC && (
                                <CardDescription className="text-xs mt-1">
                                  Source: <a href="https://www.slotstemple.com/us/free-slots/treasures-of-aztec/" 
                                           target="_blank" rel="noopener noreferrer" 
                                           className="text-blue-500 hover:underline">
                                    PG Soft Official Rules
                                  </a>
                                  <br />
                                  RTP: 96.71% | Volatility: High | Max Win: 5000x
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`enable-${config.id}`}>
                                {config.enabled ? "Enabled" : "Disabled"}
                              </Label>
                              <Switch
                                id={`enable-${config.id}`}
                                checked={config.enabled}
                                onCheckedChange={(checked) => {
                                  const updatedConfig = { ...config, enabled: checked };
                                  updateGameConfig(updatedConfig);
                                }}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`minBet-${config.id}`}>Minimum Bet</Label>
                              <Input
                                id={`minBet-${config.id}`}
                                type="number"
                                value={config.minBet}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value) && value >= 0) {
                                    const updatedConfig = { ...config, minBet: value };
                                    setGameConfigs(prevConfigs =>
                                      prevConfigs.map(c => (c.id === config.id ? updatedConfig : c))
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`maxBet-${config.id}`}>Maximum Bet</Label>
                              <Input
                                id={`maxBet-${config.id}`}
                                type="number"
                                value={config.maxBet}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value) && value >= 0) {
                                    const updatedConfig = { ...config, maxBet: value };
                                    setGameConfigs(prevConfigs =>
                                      prevConfigs.map(c => (c.id === config.id ? updatedConfig : c))
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`payout-${config.id}`}>
                                {config.gameType === GameType.TREASURE_OF_AZTEC ? "Max Win (x)" : "Payout Multiplier"}
                              </Label>
                              <Input
                                id={`payout-${config.id}`}
                                type="number"
                                value={config.payoutMultiplier}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value) && value >= 0) {
                                    const updatedConfig = { ...config, payoutMultiplier: value };
                                    setGameConfigs(prevConfigs =>
                                      prevConfigs.map(c => (c.id === config.id ? updatedConfig : c))
                                    );
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => updateGameConfig(config)}
                            disabled={!config.enabled}
                          >
                            Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Manage Users</span>
                </CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.users ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="text-right">{user.balance.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={user.isAdmin ? "default" : "secondary"}>
                                {user.isAdmin ? (user.role?.replace('_', ' ') || 'Admin') : 'Player'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" className="mr-2">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                Freeze
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* VIP Program Tab */}
          <TabsContent value="vip" className="space-y-6">
            <VipConfigTab />
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Casino Analytics</span>
                </CardTitle>
                <CardDescription>
                  View performance metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Wagers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">156,780</div>
                      <p className="text-sm text-muted-foreground">+12% from last week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">House Edge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.2%</div>
                      <p className="text-sm text-muted-foreground">+0.3% from last week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Active Players</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.length}</div>
                      <p className="text-sm text-muted-foreground">+2 from last week</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Game Popularity</h3>
                  <div className="bg-muted p-4 rounded-lg flex items-end h-60 space-x-4">
                    <div className="flex flex-col items-center flex-1">
                      <div className="bg-primary w-full" style={{ height: '80%' }}></div>
                      <div className="mt-2 text-sm">Dice</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="bg-primary w-full opacity-70" style={{ height: '60%' }}></div>
                      <div className="mt-2 text-sm">Aztec</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="bg-primary w-full opacity-70" style={{ height: '10%' }}></div>
                      <div className="mt-2 text-sm">Plinko</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="bg-primary w-full opacity-70" style={{ height: '5%' }}></div>
                      <div className="mt-2 text-sm">Slots</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Audit Logs</span>
                </CardTitle>
                <CardDescription>
                  System audit trail for security and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.logs ? (
                  <div className="text-center py-4">Loading audit logs...</div>
                ) : currentAdmin?.role !== AdminRole.SUPER_ADMIN ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Audit logs are only available to Super Administrators
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.slice(0, 50).map(log => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-xs">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{log.userId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
