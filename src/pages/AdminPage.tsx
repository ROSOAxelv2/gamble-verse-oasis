import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { adminService } from "../services/api";
import { User, GameConfig, GameType } from "../types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [gameConfigs, setGameConfigs] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState({
    users: true,
    configs: true,
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
        // In a real app, we'd have an API call to get all game configs
        // For now, we'll use hardcoded data from services/api.ts
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
        ]);
        setLoading(prev => ({ ...prev, configs: false }));
      } catch (error) {
        toast.error("Failed to load game configurations");
        setLoading(prev => ({ ...prev, configs: false }));
      }
    };

    fetchAdminData();
  }, []);

  const updateGameConfig = async (config: GameConfig) => {
    try {
      await adminService.updateGameConfig(config);
      toast.success(`${config.gameType} configuration updated`);
      
      // Update local state
      setGameConfigs(prevConfigs =>
        prevConfigs.map(c => (c.id === config.id ? config : c))
      );
    } catch (error) {
      toast.error("Failed to update game configuration");
    }
  };

  return (
    <Layout requireAuth requireAdmin>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="games">Game Config</TabsTrigger>
            <TabsTrigger value="vip">VIP Program</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
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
                            <TableCell>{user.isAdmin ? "Admin" : "Player"}</TableCell>
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
          
          {/* Games Configuration Tab */}
          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Configurations</CardTitle>
                <CardDescription>
                  Adjust settings for all casino games
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
                            <CardTitle className="capitalize">{config.gameType}</CardTitle>
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
                              <Label htmlFor={`payout-${config.id}`}>Payout Multiplier</Label>
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
          
          {/* VIP Program Tab */}
          <TabsContent value="vip" className="space-y-6">
            <VipConfigTab />
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Casino Analytics</CardTitle>
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
                      <div className="bg-primary w-full opacity-70" style={{ height: '10%' }}></div>
                      <div className="mt-2 text-sm">Plinko</div>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="bg-primary w-full opacity-70" style={{ height: '5%' }}></div>
                      <div className="mt-2 text-sm">Slots</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: Plinko and Slots are not active yet, showing placeholder data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
