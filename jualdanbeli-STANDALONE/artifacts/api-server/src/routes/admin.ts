import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, ordersTable, disputesTable, transactionsTable, reportsTable, banLogsTable } from "@workspace/db";
import { eq, desc, ilike, and, sql, gte, inArray } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const { q, status, role, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  let conditions: any[] = [];
  if (q) conditions.push(ilike(usersTable.name, `%${q}%`));
  if (status) conditions.push(eq(usersTable.status, status as any));
  if (role) conditions.push(eq(usersTable.role, role as any));

  const query = conditions.length > 0 ? and(...conditions) : undefined;
  const users = await db.select().from(usersTable).where(query as any).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const [{ count }] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(query as any);

  res.json({
    data: users.map(u => { const { passwordHash: _, ...safe } = u; return { ...safe, sellerInfo: { shopName: u.shopName, shopDescription: u.shopDescription, city: u.city, province: u.province, isVerified: u.isVerified } }; }),
    total: count,
    page: pageNum,
  });
});

router.patch("/admin/users/:userId/status", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const { status } = req.body;
  const [updated] = await db.update(usersTable).set({ status, updatedAt: new Date() }).where(eq(usersTable.id, userId)).returning();
  const { passwordHash: _, ...safe } = updated;
  res.json({ ...safe, sellerInfo: { shopName: updated.shopName, shopDescription: updated.shopDescription, city: updated.city, province: updated.province, isVerified: updated.isVerified } });
});

router.get("/admin/products", requireAdmin, async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const cond = status ? eq(productsTable.status, status as any) : undefined;
  const products = await db.select().from(productsTable).where(cond).orderBy(desc(productsTable.createdAt)).limit(limit).offset(offset);
  res.json(products.map(p => ({ ...p, price: parseFloat(p.price as string), originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : null, weight: null, averageRating: 0, totalReviews: 0, seller: null, category: null })));
});

router.patch("/admin/products/:productId/moderate", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const { status } = req.body;
  const [updated] = await db.update(productsTable).set({ status, updatedAt: new Date() }).where(eq(productsTable.id, productId)).returning();
  res.json({ ...updated, price: parseFloat(updated.price as string), originalPrice: updated.originalPrice ? parseFloat(updated.originalPrice as string) : null, weight: null, averageRating: 0, totalReviews: 0, seller: null, category: null });
});

router.get("/admin/orders", requireAdmin, async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const cond = status ? eq(ordersTable.status, status as any) : undefined;
  const orders = await db.select().from(ordersTable).where(cond).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);
  res.json(orders.map(o => ({ ...o, totalAmount: parseFloat(o.totalAmount as string), shippingCost: parseFloat(o.shippingCost as string), items: [], buyer: null, seller: null, dispute: null })));
});

router.get("/admin/disputes", requireAdmin, async (req, res): Promise<void> => {
  const disputes = await db.select().from(disputesTable).orderBy(desc(disputesTable.createdAt));
  res.json(disputes);
});

router.patch("/admin/disputes/:disputeId/resolve", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.disputeId) ? req.params.disputeId[0] : req.params.disputeId;
  const disputeId = parseInt(raw, 10);
  const { ruling, outcome } = req.body;
  const [updated] = await db.update(disputesTable).set({ ruling, status: outcome }).where(eq(disputesTable.id, disputeId)).returning();

  // Update order escrow based on outcome
  if (outcome === "resolved_buyer") {
    await db.update(ordersTable).set({ escrowStatus: "refunded", status: "cancelled", updatedAt: new Date() }).where(eq(ordersTable.id, updated.orderId));
  } else if (outcome === "resolved_seller") {
    await db.update(ordersTable).set({ escrowStatus: "released", status: "completed", updatedAt: new Date() }).where(eq(ordersTable.id, updated.orderId));
  }

  res.json(updated);
});

router.get("/admin/withdrawals", requireAdmin, async (req, res): Promise<void> => {
  const { status } = req.query;
  let txs;
  if (status) {
    txs = await db.select().from(transactionsTable)
      .where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, status as any)))
      .orderBy(desc(transactionsTable.createdAt));
  } else {
    txs = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.type, "withdrawal"))
      .orderBy(desc(transactionsTable.createdAt));
  }
  res.json(txs.map(t => ({ ...t, amount: parseFloat(t.amount as string) })));
});

router.patch("/admin/withdrawals/:withdrawalId/process", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.withdrawalId) ? req.params.withdrawalId[0] : req.params.withdrawalId;
  const withdrawalId = parseInt(raw, 10);
  const { status, notes } = req.body;
  const [updated] = await db.update(transactionsTable).set({ status, ...(notes && { description: notes }) }).where(eq(transactionsTable.id, withdrawalId)).returning();
  res.json({ ...updated, amount: parseFloat(updated.amount as string) });
});

// GET /api/admin/monitoring — realtime platform monitoring data
router.get("/admin/monitoring", requireAdmin, async (req, res): Promise<void> => {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Recent registrations (24h)
  const recentUsers = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, status: usersTable.status, createdAt: usersTable.createdAt,
  }).from(usersTable).where(gte(usersTable.createdAt, since24h)).orderBy(desc(usersTable.createdAt)).limit(20);

  // Orders (24h)
  const orderStats = await db.select({
    status: ordersTable.status,
    count: sql<number>`cast(count(*) as int)`,
    total: sql<number>`cast(coalesce(sum(${ordersTable.totalAmount}),0) as float)`,
  }).from(ordersTable).where(gte(ordersTable.createdAt, since24h)).groupBy(ordersTable.status);

  // Pending reports
  const pendingReports = await db.select({
    id: reportsTable.id, targetType: reportsTable.targetType, targetId: reportsTable.targetId,
    reason: reportsTable.reason, status: reportsTable.status, createdAt: reportsTable.createdAt,
    reporterId: reportsTable.reporterId,
  }).from(reportsTable).where(eq(reportsTable.status, "pending")).orderBy(desc(reportsTable.createdAt)).limit(30);

  // Enrich reports with reporter name
  const reporterIds = [...new Set(pendingReports.map(r => r.reporterId))];
  const reporterUsers = reporterIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
        .from(usersTable).where(inArray(usersTable.id, reporterIds))
    : [];
  const reporterMap: Record<number, any> = {};
  for (const u of reporterUsers) reporterMap[u.id] = u;

  // Target user IDs reported
  const targetUserIds = pendingReports.filter(r => r.targetType === "user").map(r => r.targetId);
  const targetUsers = targetUserIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, status: usersTable.status })
        .from(usersTable).where(inArray(usersTable.id, targetUserIds))
    : [];
  const targetMap: Record<number, any> = {};
  for (const u of targetUsers) targetMap[u.id] = u;

  // Fraud alerts: users reported 2+ times (pending)
  const reportCounts: Record<number, number> = {};
  for (const r of pendingReports) {
    if (r.targetType === "user") reportCounts[r.targetId] = (reportCounts[r.targetId] || 0) + 1;
  }
  const fraudAlerts = Object.entries(reportCounts)
    .filter(([, count]) => count >= 2)
    .map(([uid, count]) => ({ user: targetMap[parseInt(uid)], reportCount: count }))
    .filter(a => a.user)
    .sort((a, b) => b.reportCount - a.reportCount);

  // Recent ban actions (last 7d)
  const recentBanLogs = await db.select().from(banLogsTable)
    .where(gte(banLogsTable.createdAt, since7d))
    .orderBy(desc(banLogsTable.createdAt)).limit(20);

  const banLogUserIds = [...new Set([...recentBanLogs.map(l => l.userId), ...recentBanLogs.map(l => l.adminId)])];
  const banLogUsers = banLogUserIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role })
        .from(usersTable).where(inArray(usersTable.id, banLogUserIds))
    : [];
  const banLogUserMap: Record<number, any> = {};
  for (const u of banLogUsers) banLogUserMap[u.id] = u;

  // Platform counts
  const [totalUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable);
  const [totalSellers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(eq(usersTable.role, "seller"));
  const [totalBuyers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(eq(usersTable.role, "buyer"));
  const [bannedUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(eq(usersTable.status, "banned"));
  const [suspendedUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(eq(usersTable.status, "suspended"));
  const [pendingDisputes] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(disputesTable).where(eq(disputesTable.status, "open"));
  const [pendingReportCount] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(reportsTable).where(eq(reportsTable.status, "pending"));
  const [pendingWithdrawals] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(transactionsTable).where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "pending")));

  res.json({
    updatedAt: now.toISOString(),
    platformStats: {
      totalUsers: totalUsers.count,
      totalSellers: totalSellers.count,
      totalBuyers: totalBuyers.count,
      bannedUsers: bannedUsers.count,
      suspendedUsers: suspendedUsers.count,
      pendingDisputes: pendingDisputes.count,
      pendingReports: pendingReportCount.count,
      pendingWithdrawals: pendingWithdrawals.count,
    },
    recentUsers,
    orderStats,
    pendingReports: pendingReports.map(r => ({
      ...r,
      reporter: reporterMap[r.reporterId] || null,
      targetUser: r.targetType === "user" ? targetMap[r.targetId] || null : null,
    })),
    fraudAlerts,
    recentBanLogs: recentBanLogs.map(l => ({
      ...l,
      user: banLogUserMap[l.userId] || null,
      admin: banLogUserMap[l.adminId] || null,
    })),
  });
});

export default router;
