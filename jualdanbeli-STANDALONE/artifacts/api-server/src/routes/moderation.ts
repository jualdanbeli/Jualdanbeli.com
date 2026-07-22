import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, ordersTable, banLogsTable, walletsTable, notificationsTable } from "@workspace/db";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

const BAN_REASONS = [
  "fraud", "spam", "fake_product", "scam", "harassment",
  "fake_account", "payment_fraud", "policy_violation", "other"
] as const;

const REASON_LABEL: Record<string, string> = {
  fraud: "Penipuan / Fraud",
  spam: "Spam",
  fake_product: "Produk Palsu / Tidak Sesuai",
  scam: "Scam / Menipu Pembeli",
  harassment: "Pelecehan / Intimidasi",
  fake_account: "Akun Palsu",
  payment_fraud: "Manipulasi Pembayaran",
  policy_violation: "Melanggar Kebijakan Platform",
  other: "Lainnya",
};

// GET /api/admin/ban-logs — all ban actions
router.get("/admin/ban-logs", requireAdmin, async (req, res): Promise<void> => {
  const logs = await db
    .select()
    .from(banLogsTable)
    .orderBy(desc(banLogsTable.createdAt))
    .limit(100);

  const enriched = await Promise.all(logs.map(async (log) => {
    const [user] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role }).from(usersTable).where(eq(usersTable.id, log.userId));
    const [admin] = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable).where(eq(usersTable.id, log.adminId));
    return {
      ...log,
      user,
      admin,
      reasonLabel: REASON_LABEL[log.reason] || log.reason,
    };
  }));
  res.json(enriched);
});

// GET /api/admin/users/:userId/ban-logs — ban history for a specific user
router.get("/admin/users/:userId/ban-logs", requireAdmin, async (req, res): Promise<void> => {
  const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10);
  const logs = await db
    .select()
    .from(banLogsTable)
    .where(eq(banLogsTable.userId, userId))
    .orderBy(desc(banLogsTable.createdAt));

  const enriched = await Promise.all(logs.map(async (log) => {
    const [admin] = await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable).where(eq(usersTable.id, log.adminId));
    return { ...log, admin, reasonLabel: REASON_LABEL[log.reason] || log.reason };
  }));
  res.json(enriched);
});

// POST /api/admin/users/:userId/ban — full ban with cascade
router.post("/admin/users/:userId/ban", requireAdmin, async (req, res): Promise<void> => {
  const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10);
  const { reason, notes } = req.body;

  if (!reason || !BAN_REASONS.includes(reason)) {
    res.status(400).json({ error: "Alasan ban diperlukan" }); return;
  }
  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!target) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  if (target.role === "admin") { res.status(403).json({ error: "Tidak bisa banned sesama admin" }); return; }

  const effects: string[] = [];

  // 1. Update user status to banned
  await db.update(usersTable).set({ status: "banned", updatedAt: new Date() }).where(eq(usersTable.id, userId));
  effects.push("status_banned");

  // 2. If seller: unpublish ALL their products
  if (target.role === "seller") {
    await db
      .update(productsTable)
      .set({ status: "removed", updatedAt: new Date() })
      .where(and(eq(productsTable.sellerId, userId), eq(productsTable.status, "active")));
    effects.push("products_deactivated");

    // 3. Cancel all their pending/confirmed orders as seller
    await db
      .update(ordersTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(ordersTable.sellerId, userId), inArray(ordersTable.status, ["paid", "confirmed"])));
    effects.push("orders_cancelled");
  }

  // 4. Cancel any pending orders as buyer too
  if (target.role === "buyer") {
    await db
      .update(ordersTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(ordersTable.buyerId, userId), inArray(ordersTable.status, ["paid", "confirmed"])));
    effects.push("buyer_orders_cancelled");
  }

  // 5. Freeze wallet balance (set to 0, record the amount)
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
  let frozenAmount = 0;
  if (wallet && parseFloat(wallet.balance as string) > 0) {
    frozenAmount = parseFloat(wallet.balance as string);
    await db.update(walletsTable).set({
      balance: "0",
      frozenBalance: sql`${walletsTable.frozenBalance} + ${frozenAmount}`,
      updatedAt: new Date(),
    }).where(eq(walletsTable.userId, userId));
    effects.push("wallet_frozen");
  }

  // 6. Record ban log
  await db.insert(banLogsTable).values({
    userId,
    adminId: req.user!.id,
    action: "banned",
    reason,
    notes: notes || null,
  });

  // 7. Send in-app notification to user
  await db.insert(notificationsTable).values({
    userId,
    type: "system",
    title: "Akun Anda Telah Dibekukan",
    body: `Akun Anda telah dinonaktifkan oleh platform karena: ${REASON_LABEL[reason] || reason}. Hubungi support jika ada pertanyaan.`,
  });

  res.json({
    success: true,
    effects,
    frozenAmount,
    message: `Akun @${target.name} berhasil di-banned dengan ${effects.length} efek cascade.`,
  });
});

// POST /api/admin/users/:userId/suspend — suspend (temporary)
router.post("/admin/users/:userId/suspend", requireAdmin, async (req, res): Promise<void> => {
  const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10);
  const { reason, notes } = req.body;

  if (!reason) { res.status(400).json({ error: "Alasan suspend diperlukan" }); return; }
  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!target) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  if (target.role === "admin") { res.status(403).json({ error: "Tidak bisa suspend sesama admin" }); return; }

  await db.update(usersTable).set({ status: "suspended", updatedAt: new Date() }).where(eq(usersTable.id, userId));

  // If seller, hide products temporarily
  if (target.role === "seller") {
    await db.update(productsTable)
      .set({ status: "flagged", updatedAt: new Date() })
      .where(and(eq(productsTable.sellerId, userId), eq(productsTable.status, "active")));
  }

  await db.insert(banLogsTable).values({
    userId,
    adminId: req.user!.id,
    action: "suspended",
    reason,
    notes: notes || null,
  });

  await db.insert(notificationsTable).values({
    userId,
    type: "system",
    title: "Akun Anda Disuspend",
    body: `Akun Anda sementara disuspend karena: ${REASON_LABEL[reason] || reason}. Hubungi tim support untuk informasi lebih lanjut.`,
  });

  res.json({ success: true, message: `Akun @${target.name} berhasil disuspend.` });
});

// POST /api/admin/users/:userId/unban — restore account
router.post("/admin/users/:userId/unban", requireAdmin, async (req, res): Promise<void> => {
  const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId, 10);
  const { notes } = req.body;

  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!target) { res.status(404).json({ error: "User tidak ditemukan" }); return; }

  await db.update(usersTable).set({ status: "active", updatedAt: new Date() }).where(eq(usersTable.id, userId));

  // Unfreeze wallet
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
  if (wallet && parseFloat(wallet.frozenBalance as string) > 0) {
    await db.update(walletsTable).set({
      balance: sql`${walletsTable.balance} + ${walletsTable.frozenBalance}`,
      frozenBalance: "0",
      updatedAt: new Date(),
    }).where(eq(walletsTable.userId, userId));
  }

  await db.insert(banLogsTable).values({
    userId,
    adminId: req.user!.id,
    action: "activated",
    reason: "other",
    notes: notes || "Akun dipulihkan oleh admin",
  });

  await db.insert(notificationsTable).values({
    userId,
    type: "system",
    title: "Akun Anda Telah Dipulihkan",
    body: "Akun Anda telah diaktifkan kembali. Anda bisa menggunakan platform seperti biasa.",
  });

  res.json({ success: true, message: `Akun @${target.name} berhasil dipulihkan.` });
});

export default router;
