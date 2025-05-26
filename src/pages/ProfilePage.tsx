
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { rbacService } from "../services/rbac";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

const ProfilePage = () => {
  const { user } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      case 'sponsored': return 'Sponsored Player';
      case 'normal': return 'Player';
      default: return 'Player';
    }
  };

  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium">{getRoleDisplayName(user?.role || 'normal')}</p>
                </div>
                {rbacService.isSponsored(user) && user?.luckMultiplier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Luck Multiplier</p>
                    <p className="font-medium text-green-600">{user.luckMultiplier}x</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(user?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Edit Profile</Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
                <CardDescription>Your current casino credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Credits</p>
                    <p className="text-3xl font-bold text-casino-gold">
                      {user?.balance.toLocaleString()} Credits
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button>Deposit</Button>
                    <Button variant="outline">Withdraw</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Theme Switcher */}
            <div className="mb-6">
              <ThemeSwitcher />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Gaming Preferences</CardTitle>
                <CardDescription>Customize your gaming experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Game Notifications</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Receive notifications for game results
                    </span>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Sound Effects</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Play sounds during gameplay
                    </span>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Responsible Gaming Limits</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Set daily/weekly betting limits
                    </span>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
