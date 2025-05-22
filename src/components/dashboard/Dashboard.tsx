
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { userService } from "../../services/api";
import { Transaction, GameType, TransactionType } from "../../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await userService.getTransactions();
        setTransactions(data.slice(0, 5)); // Only show the last 5 transactions
      } catch (error) {
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleDeposit = async () => {
    try {
      // In a real app, this would open a deposit modal or redirect to a deposit page
      // For now, we'll just add 1000 credits as a demo
      await userService.updateBalance(1000, TransactionType.DEPOSIT);
      toast.success("1000 credits added to your account!");
      
      // Refresh transactions
      const data = await userService.getTransactions();
      setTransactions(data.slice(0, 5));
    } catch (error) {
      toast.error("Deposit failed");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionLabel = (transaction: Transaction) => {
    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        return "Deposit";
      case TransactionType.WITHDRAWAL:
        return "Withdrawal";
      case TransactionType.BET:
        return `Bet (${transaction.gameType})`;
      case TransactionType.WIN:
        return `Win (${transaction.gameType})`;
      default:
        return transaction.type;
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.username}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Your Balance</CardTitle>
            <CardDescription>Current available credits</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-casino-gold">
              {user?.balance.toLocaleString()} Credits
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleDeposit}>
              Deposit
            </Button>
            <Button variant="outline" size="sm">Withdraw</Button>
          </CardFooter>
        </Card>
        
        {/* Quick Stats Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Quick Stats</CardTitle>
            <CardDescription>Your gaming activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bets:</span>
              <span className="font-medium">
                {transactions.filter(t => t.type === TransactionType.BET).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Wins:</span>
              <span className="font-medium">
                {transactions.filter(t => t.type === TransactionType.WIN).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="font-medium">
                {transactions.filter(t => t.type === TransactionType.BET).length > 0
                  ? `${Math.round((transactions.filter(t => t.type === TransactionType.WIN).length / 
                      transactions.filter(t => t.type === TransactionType.BET).length) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Featured Game Card */}
        <Card className="col-span-1 bg-gradient-to-br from-casino-deep-purple to-casino-blue">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Featured Game</CardTitle>
            <CardDescription>Try your luck today!</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-2">Guess-the-Number Dice</p>
            <p className="text-sm opacity-80">
              Pick a number, place your bet, and win up to 5x your wager!
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/games">
              <Button className="w-full bg-white/20 hover:bg-white/30">
                Play Now
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Recent Transactions</h2>
          <Link to="/transactions">
            <Button variant="link">View All</Button>
          </Link>
        </div>
        
        <div className="bg-card rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-4 text-center">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-4 text-center">No transactions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-border">
                      <td className="px-4 py-2 text-sm">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-2">
                        {getTransactionLabel(transaction)}
                      </td>
                      <td className={`px-4 py-2 text-right ${
                        transaction.type === TransactionType.WIN || transaction.type === TransactionType.DEPOSIT
                          ? "text-green-500"
                          : transaction.type === TransactionType.BET || transaction.type === TransactionType.WITHDRAWAL
                          ? "text-red-500"
                          : ""
                      }`}>
                        {transaction.type === TransactionType.WIN || transaction.type === TransactionType.DEPOSIT
                          ? `+${transaction.amount}`
                          : `-${transaction.amount}`}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {transaction.balanceAfter}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Available Games */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dice Game Card */}
          <Card className="game-card">
            <CardHeader>
              <CardTitle>Dice Game</CardTitle>
              <CardDescription>
                Test your luck by guessing the dice roll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="dice">?</div>
              </div>
              <p className="text-sm">
                Pick a number from 1-6 and win 5x your bet if you guess correctly!
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/games" className="w-full">
                <Button className="w-full">Play Now</Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Plinko Card (Coming Soon) */}
          <Card className="game-card opacity-70">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Plinko</CardTitle>
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
              </div>
              <CardDescription>
                Watch the ball bounce through pegs to big wins
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="h-24 flex items-center justify-center">
                <p className="text-muted-foreground">Available in Phase 2</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
          
          {/* Slot Machine Card (Coming Soon) */}
          <Card className="game-card opacity-70">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Slot Machine</CardTitle>
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
              </div>
              <CardDescription>
                Spin the reels and match symbols to win big
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="h-24 flex items-center justify-center">
                <p className="text-muted-foreground">Available in Phase 2</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
