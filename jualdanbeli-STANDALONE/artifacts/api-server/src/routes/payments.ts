import { Router, type IRouter } from "express";
import { db, walletsTable, transactionsTable, ordersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/payments/escrow", requireAuth, async (req, res): Promise<void> => {
  const transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, req.user!.id))
    .orderBy(desc(transactionsTable.createdAt));

  const escrow = transactions.filter(t => t.status === "pending" && t.type === "sale").map(t => ({
    id: t.id,
    orderId: t.orderId,
    amount: parseFloat(t.amount as string),
    status: "holding" as const,
    createdAt: t.createdAt,
  }));
  res.json(escrow);
});

router.get("/payments/wallet", requireAuth, async (req, res): Promise<void> => {
  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, req.user!.id));
  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId: req.user!.id, balance: "0", pendingBalance: "0" }).returning();
  }
  const transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, req.user!.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(20);

  res.json({
    balance: parseFloat(wallet.balance as string),
    pendingBalance: parseFloat(wallet.pendingBalance as string),
    transactions: transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount as string),
    })),
  });
});

router.post("/payments/withdraw", requireAuth, async (req, res): Promise<void> => {
  const { amount, bankName, accountNumber, accountName } = req.body;
  if (!amount || !bankName || !accountNumber || !accountName) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, req.user!.id));
  if (!wallet || parseFloat(wallet.balance as string) < amount) {
    res.status(400).json({ error: "Insufficient balance" }); return;
  }

  // Deduct from wallet
  const newBalance = parseFloat(wallet.balance as string) - amount;
  await db.update(walletsTable).set({ balance: newBalance.toString() }).where(eq(walletsTable.userId, req.user!.id));

  const [tx] = await db.insert(transactionsTable).values({
    userId: req.user!.id,
    type: "withdrawal",
    amount: amount.toString(),
    status: "pending",
    description: `Penarikan ke ${bankName} - ${accountNumber}`,
    bankName,
    accountNumber,
    accountName,
  }).returning();

  res.status(201).json({ ...tx, amount: parseFloat(tx.amount as string) });
});

export default router;
