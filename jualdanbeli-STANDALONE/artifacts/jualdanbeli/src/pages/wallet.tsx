import { useGetWallet, useRequestWithdrawal, getGetWalletQueryKey } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR, formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const { user } = useAuth();
  const { data: wallet, isLoading } = useGetWallet();
  const requestWithdrawal = useRequestWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''));
    if (!numAmount || numAmount < 50000) {
      toast({ title: "Invalid amount", description: "Minimum withdrawal is Rp 50.000", variant: "destructive" });
      return;
    }
    if (wallet && numAmount > wallet.balance) {
      toast({ title: "Insufficient balance", description: "You cannot withdraw more than your available balance", variant: "destructive" });
      return;
    }

    requestWithdrawal.mutate({
      data: {
        amount: numAmount,
        bankName,
        accountNumber,
        accountName
      }
    }, {
      onSuccess: () => {
        toast({ title: "Withdrawal requested", description: "Your request is being processed" });
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
        setAmount("");
      }
    });
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'sale' || type === 'topup') return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    if (type === 'withdrawal') return <ArrowUpRight className="w-5 h-5 text-red-500" />;
    if (type === 'refund') return <RefreshCw className="w-5 h-5 text-blue-500" />;
    return <WalletIcon className="w-5 h-5" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === 'sale' || type === 'topup' || type === 'refund') return "text-green-600";
    return "text-foreground";
  };

  const Layout = user?.role === "seller" ? SellerLayout : MainLayout;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and transactions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <WalletIcon className="w-5 h-5" />
              <span className="font-medium">Available Balance</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">{formatIDR(wallet?.balance || 0)}</h2>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full font-bold">
                  <Landmark className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleWithdraw} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Amount (IDR)</Label>
                    <Input 
                      placeholder="e.g. 500000" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min="50000"
                    />
                    <p className="text-xs text-muted-foreground">Available: {formatIDR(wallet?.balance || 0)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input placeholder="e.g. BCA, Mandiri" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input placeholder="e.g. 1234567890" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder Name</Label>
                    <Input placeholder="e.g. Budi Santoso" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={requestWithdrawal.isPending}>Submit Request</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Pending Balance</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{formatIDR(wallet?.pendingBalance || 0)}</h2>
            <p className="text-sm text-muted-foreground">
              Funds in escrow waiting for buyer confirmation.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!wallet?.transactions || wallet.transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {getTransactionIcon(tx.type, tx.status)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">{formatDateTime(tx.createdAt)}</div>
                      {tx.description && <div className="text-xs text-muted-foreground mt-1">{tx.description}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getTransactionColor(tx.type)}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}{formatIDR(tx.amount)}
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'secondary' : tx.status === 'rejected' ? 'destructive' : 'outline'} className="capitalize mt-1">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
