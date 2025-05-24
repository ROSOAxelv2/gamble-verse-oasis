
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from "lucide-react";
import { adminAuthService } from "../services/adminAuth";
import { toast } from "sonner";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const adminUser = await adminAuthService.adminLogin(email, password);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));
      toast.success("Admin login successful");
      navigate("/admin");
    } catch (error) {
      setError((error as Error).message);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setLoading(true);
    try {
      await adminAuthService.resetAdminPassword(email);
      toast.success("Password reset instructions sent to your email");
      setShowPasswordReset(false);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Secure login for Lovable Casino administrators
          </CardDescription>
        </CardHeader>
        
        {!showPasswordReset ? (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@lovablecasino.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Login as Admin"}
              </Button>
              
              <div className="flex justify-between w-full text-sm">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowPasswordReset(true)}
                  className="p-0 h-auto"
                >
                  Forgot password?
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate("/")}
                  className="p-0 h-auto"
                >
                  Player Login
                </Button>
              </div>
            </CardFooter>
          </form>
        ) : (
          <div>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reset-email">Admin Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@lovablecasino.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Enter your admin email address to receive password reset instructions.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button onClick={handlePasswordReset} className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Instructions"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowPasswordReset(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </CardFooter>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminLoginPage;
