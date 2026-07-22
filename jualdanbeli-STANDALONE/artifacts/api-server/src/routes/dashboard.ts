import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, usersTable, transactionsTable, messagesTable, notificationsTable, conversationsTable } from "@workspace/db";
import { eq, sql, desc, and, gte, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const isSeller = req.user!.role === "seller" || req.user!.role === "admin";

  const [buyerOrders] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable).where(eq(ordersTable.buyerId, userId));
  const [pendingOrders] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable).where(and(eq(ordersTable.buyerId, userId), eq(ordersTable.status, "pending_payment")));
  const [completedOrders] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable).where(and(eq(ordersTable.buyerId, userId), eq(ordersTable.status, "completed")));

  const completedSellerOrders = await db.select().from(ordersTable).where(and(eq(ordersTable.sellerId, userId), eq(ordersTable.status, "completed")));
  const totalRevenue = completedSellerOrders.reduce((s, o) => s + parseFloat(o.totalAmount as string), 0);

  const [totalProds] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(productsTable).where(eq(productsTable.sellerId, userId));
  const [activeProds] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(productsTable).where(and(eq(productsTable.sellerId, userId), eq(productsTable.status, "active")));

  const conversations = await db.select().from(conversationsTable).where(or(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, userId)));
  const convIds = conversations.map(c => c.id);

  let unreadMessages = 0;
  for (const convId of convIds) {
    const msgs = await db.select().from(messagesTable).where(and(eq(messagesTable.conversationId, convId), eq(messagesTable.isRead, false)));
    unreadMessages += msgs.filter(m => m.senderId !== userId).length;
  }

  const [unreadNotifs] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

  res.json({
    totalOrders: buyerOrders.count,
    pendingOrders: pendingOrders.count,
    completedOrders: completedOrders.count,
    totalRevenue,
    pendingBalance: 0,
    totalProducts: totalProds.count,
    activeProducts: activeProds.count,
    unreadMessages,
    unreadNotifications: unreadNotifs.count,
  });
});

router.get("/dashboard/admin-summary", requireAuth, async (req, res): Promise<void> => {
  if (req.user!.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }

  const [totalUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable);
  const [activeSellers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(and(eq(usersTable.role, "seller"), eq(usersTable.status, "active")));
  const [totalProducts] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(productsTable);
  const [totalOrders] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable);

  const completedOrders = await db.select().from(ordersTable).where(eq(ordersTable.status, "completed"));
  const totalRevenue = completedOrders.reduce((s, o) => s + parseFloat(o.totalAmount as string), 0);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [newUsersToday] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(gte(usersTable.createdAt, today));
  const [ordersToday] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable).where(gte(ordersTable.createdAt, today));

  const pendingWithdrawals = await db.select().from(transactionsTable).where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "pending")));

  res.json({
    totalUsers: totalUsers.count,
    activeSellers: activeSellers.count,
    totalProducts: totalProducts.count,
    totalOrders: totalOrders.count,
    totalRevenue,
    escrowBalance: totalRevenue * 0.1,
    pendingDisputes: 0,
    pendingReports: 0,
    pendingWithdrawals: pendingWithdrawals.length,
    newUsersToday: newUsersToday.count,
    ordersToday: ordersToday.count,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const orders = await db.select().from(ordersTable)
    .where(or(eq(ordersTable.buyerId, userId), eq(ordersTable.sellerId, userId)))
    .orderBy(desc(ordersTable.updatedAt)).limit(5);

  const activities = orders.map((o, i) => ({
    id: o.id + i * 1000,
    type: "order" as const,
    title: `Pesanan #${o.id}`,
    description: `Status: ${o.status}`,
    metadata: { orderId: o.id },
    createdAt: o.updatedAt,
  }));

  res.json(activities);
});

router.get("/dashboard/sales-chart", requireAuth, async (req, res): Promise<void> => {
  const { period = "7d" } = req.query;
  const days = period === "90d" ? 90 : period === "30d" ? 30 : 7;
  const points = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    points.push({ date: dateStr, value: Math.round(Math.random() * 5000000), label: dateStr });
  }
  res.json(points);
});

export default router;
