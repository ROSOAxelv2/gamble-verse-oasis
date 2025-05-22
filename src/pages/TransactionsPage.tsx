
import { useState, useEffect } from "react";
import { Layout } from "../components/layout/Layout";
import { userService } from "../services/api";
import { Transaction, TransactionType } from "../types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await userService.getTransactions();
        setTransactions(data);
      } catch (error) {
        toast.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = filter === "all"
    ? transactions
    : transactions.filter(t => t.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
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
    <Layout requireAuth>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">Transaction History</h1>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value={TransactionType.DEPOSIT}>Deposits</SelectItem>
                <SelectItem value={TransactionType.WITHDRAWAL}>Withdrawals</SelectItem>
                <SelectItem value={TransactionType.BET}>Bets</SelectItem>
                <SelectItem value={TransactionType.WIN}>Wins</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-card rounded-lg overflow-hidden border border-border">
          {loading ? (
            <div className="p-8 text-center">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              {filter === "all" 
                ? "No transactions found" 
                : `No ${filter.toLowerCase()} transactions found`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell>{getTransactionLabel(transaction)}</TableCell>
                      <TableCell className={`text-right ${
                        transaction.type === TransactionType.WIN || transaction.type === TransactionType.DEPOSIT
                          ? "text-green-500"
                          : transaction.type === TransactionType.BET || transaction.type === TransactionType.WITHDRAWAL
                          ? "text-red-500"
                          : ""
                      }`}>
                        {transaction.type === TransactionType.WIN || transaction.type === TransactionType.DEPOSIT
                          ? `+${transaction.amount.toLocaleString()}`
                          : `-${transaction.amount.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.balanceAfter.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-2xl font-bold text-green-500">
                +{transactions
                  .filter(t => t.type === TransactionType.DEPOSIT)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-500">
                -{transactions
                  .filter(t => t.type === TransactionType.WITHDRAWAL)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Bets</p>
              <p className="text-2xl font-bold text-red-500">
                -{transactions
                  .filter(t => t.type === TransactionType.BET)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Wins</p>
              <p className="text-2xl font-bold text-green-500">
                +{transactions
                  .filter(t => t.type === TransactionType.WIN)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransactionsPage;
