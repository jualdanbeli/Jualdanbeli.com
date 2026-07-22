import { Router, type IRouter } from "express";
import { db, ordersTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, sql, desc, and, gte, between } from "drizzle-orm";
import { requireAdmin, requireOwner } from "../lib/auth";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const router: IRouter = Router();

const SETTINGS_FILE = join(process.cwd(), "platform-settings.json");

const DEFAULT_SETTINGS = {
  platformName: "jualdanbeli",
  commissionRate: 1,
  umkmTaxRate: 0.5,
  maxWithdrawalAmount: 50000000,
  minWithdrawalAmount: 50000,
  autoReleaseEscrowDays: 7,
  maintenanceMode: false,
  contactEmail: "admin@jualdanbeli.com",
};

function loadSettings() {
  try {
    if (existsSync(SETTINGS_FILE)) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(readFileSync(SETTINGS_FILE, "utf-8")) };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: Record<string, any>) {
  try { writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2)); } catch {}
}

router.get("/admin/analytics", requireOwner, async (req, res): Promise<void> => {
  const { period = "30" } = req.query;
  const days = Math.min(parseInt(period as string, 10) || 30, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const settings = loadSettings();
  const commissionRate = settings.commissionRate / 100;
  const umkmTaxRate = settings.umkmTaxRate / 100;

  const revenueRows = await db
    .select({
      date: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<number>`cast(coalesce(sum(${ordersTable.totalAmount}),0) as float)`,
      orders: sql<number>`cast(count(*) as int)`,
    })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, since), eq(ordersTable.status, "completed")))
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`);

  const allOrderRows = await db
    .select({
      date: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`,
      orders: sql<number>`cast(count(*) as int)`,
    })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, since))
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`);

  const userRows = await db
    .select({
      date: sql<string>`to_char(${usersTable.createdAt}, 'YYYY-MM-DD')`,
      users: sql<number>`cast(count(*) as int)`,
    })
    .from(usersTable)
    .where(gte(usersTable.createdAt, since))
    .groupBy(sql`to_char(${usersTable.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${usersTable.createdAt}, 'YYYY-MM-DD')`);

  const dateMap: Record<string, { date: string; revenue: number; commission: number; umkmTax: number; orders: number; newUsers: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dateMap[key] = { date: key, revenue: 0, commission: 0, umkmTax: 0, orders: 0, newUsers: 0 };
  }

  for (const r of revenueRows) {
    if (dateMap[r.date]) {
      dateMap[r.date].revenue = r.revenue;
      dateMap[r.date].commission = Math.round(r.revenue * commissionRate);
      dateMap[r.date].umkmTax = Math.round(r.revenue * umkmTaxRate);
      dateMap[r.date].orders = r.orders;
    }
  }
  for (const r of allOrderRows) {
    if (dateMap[r.date] && dateMap[r.date].orders === 0) {
      dateMap[r.date].orders = r.orders;
    }
  }
  for (const r of userRows) {
    if (dateMap[r.date]) dateMap[r.date].newUsers = r.users;
  }

  const chartData = Object.values(dateMap);

  const [totalUsers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable);
  const [totalSellers] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(usersTable).where(eq(usersTable.role, "seller"));
  const [totalOrders] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable);
  const [completedOrders] = await db.select({ count: sql<number>`cast(count(*) as int)`, revenue: sql<number>`cast(coalesce(sum(${ordersTable.totalAmount}),0) as float)` }).from(ordersTable).where(eq(ordersTable.status, "completed"));
  const [pendingTxs] = await db.select({ total: sql<number>`cast(coalesce(sum(${transactionsTable.amount}),0) as float)` }).from(transactionsTable).where(and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "pending")));

  const totalRevenue = completedOrders.revenue || 0;
  const totalCommission = Math.round(totalRevenue * commissionRate);
  const totalUmkmTax = Math.round(totalRevenue * umkmTaxRate);

  const topSellers = await db
    .select({
      sellerId: ordersTable.sellerId,
      totalSales: sql<number>`cast(coalesce(sum(${ordersTable.totalAmount}),0) as float)`,
      orderCount: sql<number>`cast(count(*) as int)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.status, "completed"))
    .groupBy(ordersTable.sellerId)
    .orderBy(desc(sql`sum(${ordersTable.totalAmount})`))
    .limit(5);

  const sellerIds = topSellers.map(s => s.sellerId);
  const sellerNames: Record<number, string> = {};
  if (sellerIds.length > 0) {
    const sellers = await db.select({ id: usersTable.id, name: usersTable.name, shopName: usersTable.shopName }).from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(sellerIds.map(id => sql`${id}`), sql`, `)}]::int[])`);
    for (const s of sellers) sellerNames[s.id] = s.shopName || s.name;
  }

  res.json({
    chartData,
    summary: {
      totalUsers: totalUsers.count,
      totalSellers: totalSellers.count,
      totalOrders: totalOrders.count,
      completedOrders: completedOrders.count,
      totalRevenue,
      totalCommission,
      totalUmkmTax,
      totalDeductions: totalCommission + totalUmkmTax,
      pendingWithdrawals: pendingTxs.total || 0,
      commissionRate: settings.commissionRate,
      umkmTaxRate: settings.umkmTaxRate,
    },
    topSellers: topSellers.map(s => ({
      sellerId: s.sellerId,
      sellerName: sellerNames[s.sellerId] || `Seller #${s.sellerId}`,
      totalSales: s.totalSales,
      orderCount: s.orderCount,
      commission: Math.round(s.totalSales * commissionRate),
      umkmTax: Math.round(s.totalSales * umkmTaxRate),
      sellerReceives: Math.round(s.totalSales * (1 - commissionRate - umkmTaxRate)),
    })),
  });
});

router.get("/admin/platform-settings", requireOwner, async (req, res): Promise<void> => {
  res.json(loadSettings());
});

router.patch("/admin/platform-settings", requireOwner, async (req, res): Promise<void> => {
  const current = loadSettings();
  const updated = { ...current, ...req.body };
  saveSettings(updated);
  req.log.info({ settings: updated }, "Platform settings updated");
  res.json(updated);
});

router.get("/admin/financial-report", requireOwner, async (req, res): Promise<void> => {
  const { from, to } = req.query;
  const settings = loadSettings();
  const commissionRate = settings.commissionRate / 100;
  const umkmTaxRate = settings.umkmTaxRate / 100;

  const fromDate = from ? new Date(from as string) : (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; })();
  const toDate = to ? new Date(to as string) : new Date();

  const orders = await db
    .select({
      date: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`cast(count(*) as int)`,
      revenue: sql<number>`cast(coalesce(sum(${ordersTable.totalAmount}),0) as float)`,
      shipping: sql<number>`cast(coalesce(sum(${ordersTable.shippingCost}),0) as float)`,
    })
    .from(ordersTable)
    .where(and(eq(ordersTable.status, "completed"), between(ordersTable.createdAt, fromDate, toDate)))
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM-DD')`);

  const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0);
  const totalOrders = orders.reduce((s, o) => s + o.count, 0);
  const totalShipping = orders.reduce((s, o) => s + o.shipping, 0);
  const totalCommission = Math.round(totalRevenue * commissionRate);
  const totalUmkmTax = Math.round(totalRevenue * umkmTaxRate);

  res.json({
    period: { from: fromDate.toISOString().split("T")[0], to: toDate.toISOString().split("T")[0] },
    summary: {
      totalRevenue,
      totalOrders,
      totalShipping,
      totalCommission,
      totalUmkmTax,
      totalDeductions: totalCommission + totalUmkmTax,
      netToSellers: Math.round(totalRevenue - totalCommission - totalUmkmTax),
    },
    rows: orders.map(o => ({
      date: o.date,
      orders: o.count,
      revenue: o.revenue,
      shipping: o.shipping,
      commission: Math.round(o.revenue * commissionRate),
      umkmTax: Math.round(o.revenue * umkmTaxRate),
      sellerReceives: Math.round(o.revenue * (1 - commissionRate - umkmTaxRate)),
    })),
    commissionRate: settings.commissionRate,
    umkmTaxRate: settings.umkmTaxRate,
  });
});

export default router;
