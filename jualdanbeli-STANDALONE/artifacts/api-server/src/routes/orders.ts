import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, productsTable, usersTable, disputesTable, walletsTable, transactionsTable, notificationsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { sendOrderCreatedEmail, sendOrderStatusEmail, sendShippingDisputeEmail } from "../lib/email";

const PLATFORM_COMMISSION_RATE = 0.02;

const router: IRouter = Router();

function buildProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id, name: user.name, role: user.role,
    avatarUrl: user.avatarUrl ?? null, createdAt: user.createdAt,
    stats: { totalProducts: 0, totalSales: 0, averageRating: 0, totalReviews: 0 },
    sellerInfo: { shopName: user.shopName ?? null, shopDescription: user.shopDescription ?? null, city: user.city ?? null, province: user.province ?? null, isVerified: user.isVerified },
  };
}

async function enrichOrder(order: typeof ordersTable.$inferSelect) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, order.buyerId));
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, order.sellerId));
  const [dispute] = await db.select().from(disputesTable).where(eq(disputesTable.orderId, order.id));
  return {
    ...order,
    totalAmount: parseFloat(order.totalAmount as string),
    shippingCost: parseFloat(order.shippingCost as string),
    items: items.map(i => ({ ...i, unitPrice: parseFloat(i.unitPrice as string) })),
    buyer: buyer ? buildProfile(buyer) : null,
    seller: seller ? buildProfile(seller) : null,
    dispute: dispute ?? null,
    updatedAt: order.updatedAt,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const { role, status } = req.query;
  const userId = req.user!.id;
  let cond;
  if (role === "seller") {
    cond = status ? and(eq(ordersTable.sellerId, userId), eq(ordersTable.status, status as any)) : eq(ordersTable.sellerId, userId);
  } else {
    cond = status ? and(eq(ordersTable.buyerId, userId), eq(ordersTable.status, status as any)) : eq(ordersTable.buyerId, userId);
  }
  const orders = await db.select().from(ordersTable).where(cond as any).orderBy(desc(ordersTable.createdAt));
  const enriched = await Promise.all(orders.map(enrichOrder));
  res.json(enriched);
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const { items, shippingAddress, courierId, notes } = req.body;
  if (!items || !items.length || !shippingAddress) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  let totalAmount = 0;
  const orderItems = [];
  let sellerId: number | null = null;

  for (const item of items) {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) { res.status(404).json({ error: `Product ${item.productId} not found` }); return; }
    if (product.stock < item.quantity) { res.status(400).json({ error: `Insufficient stock for ${product.name}` }); return; }
    const unitPrice = parseFloat(product.price as string);
    totalAmount += unitPrice * item.quantity;
    sellerId = product.sellerId;
    orderItems.push({ productId: product.id, productName: product.name, productImage: product.images[0] ?? null, quantity: item.quantity, unitPrice: product.price });
  }

  if (!sellerId) { res.status(400).json({ error: "Invalid order" }); return; }

  const shippingCost = 15000;
  totalAmount += shippingCost;

  const [order] = await db.insert(ordersTable).values({
    buyerId: req.user!.id,
    sellerId,
    status: "paid",
    totalAmount: totalAmount.toString(),
    shippingCost: shippingCost.toString(),
    shippingAddress,
    courierId: courierId || null,
    notes: notes || null,
    escrowStatus: "holding",
  }).returning();

  for (const item of orderItems) {
    await db.insert(orderItemsTable).values({ orderId: order.id, ...item });
    await db.update(productsTable).set({ stock: sql`${productsTable.stock} - ${item.quantity}` }).where(eq(productsTable.id, item.productId));
  }

  // Create escrow transaction
  await db.insert(transactionsTable).values({
    userId: req.user!.id,
    orderId: order.id,
    type: "sale",
    amount: totalAmount.toString(),
    status: "pending",
    description: `Escrow for order #${order.id}`,
  });

  // Notify seller
  await db.insert(notificationsTable).values({
    userId: sellerId,
    type: "order_update",
    title: "Pesanan Baru",
    body: `Anda mendapat pesanan baru #${order.id}`,
    metadata: { orderId: order.id },
  });

  // Send email to buyer
  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, sellerId));
  if (buyer && seller) {
    sendOrderCreatedEmail(buyer.email, {
      orderId: order.id,
      buyerName: buyer.name,
      productName: orderItems[0]?.productName ?? "Produk",
      quantity: orderItems[0]?.quantity ?? 1,
      totalAmount: totalAmount,
      sellerName: seller.name,
    }).catch(() => {});
  }

  res.status(201).json(await enrichOrder(order));
});

router.get("/orders/:orderId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  res.json(await enrichOrder(order));
});

router.patch("/orders/:orderId/status", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  const { status, trackingNumber, notes } = req.body;
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const [updated] = await db.update(ordersTable).set({
    status, ...(trackingNumber && { trackingNumber }), ...(notes && { notes }), updatedAt: new Date(),
  }).where(eq(ordersTable.id, orderId)).returning();

  // Notify buyer of status change
  await db.insert(notificationsTable).values({
    userId: order.buyerId,
    type: "order_update",
    title: "Status Pesanan Diperbarui",
    body: `Pesanan #${orderId} sekarang berstatus: ${status}`,
    metadata: { orderId },
  });

  // Send email to buyer
  const [buyerUser] = await db.select().from(usersTable).where(eq(usersTable.id, order.buyerId));
  if (buyerUser) {
    sendOrderStatusEmail(buyerUser.email, {
      orderId,
      recipientName: buyerUser.name,
      status,
      trackingNumber,
      courierName: order.courierId ? String(order.courierId) : undefined,
    }).catch(() => {});
  }

  res.json(await enrichOrder(updated));
});

router.post("/orders/:orderId/confirm-received", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.buyerId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }

  const [updated] = await db.update(ordersTable).set({
    status: "completed", escrowStatus: "released", updatedAt: new Date(),
  }).where(eq(ordersTable.id, orderId)).returning();

  // Release payment to seller wallet minus platform commission (2%)
  const grossAmount = parseFloat(order.totalAmount as string);
  const commissionAmount = Math.round(grossAmount * PLATFORM_COMMISSION_RATE);
  const netAmount = grossAmount - commissionAmount;

  const [sellerWallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, order.sellerId));
  if (sellerWallet) {
    const newBalance = parseFloat(sellerWallet.balance as string) + netAmount;
    await db.update(walletsTable).set({ balance: newBalance.toString() }).where(eq(walletsTable.userId, order.sellerId));
  }

  // Record net sale transaction for seller
  await db.insert(transactionsTable).values({
    userId: order.sellerId,
    orderId: order.id,
    type: "sale",
    amount: netAmount.toString(),
    status: "completed",
    description: `Pembayaran order #${order.id} (setelah komisi platform 2%)`,
  });


  // Notify seller
  await db.insert(notificationsTable).values({
    userId: order.sellerId,
    type: "payment",
    title: "Pembayaran Diterima",
    body: `Dana dari order #${orderId} telah dicairkan ke dompet Anda`,
    metadata: { orderId },
  });

  res.json(await enrichOrder(updated));
});

router.post("/orders/:orderId/dispute", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const orderId = parseInt(raw, 10);
  const { reason, description, disputeType, courierName, trackingNumber } = req.body;
  if (!reason || !description) { res.status(400).json({ error: "Missing required fields" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.buyerId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }
  if (order.status !== "shipped" && order.status !== "delivered" && order.status !== "paid" && order.status !== "confirmed") {
    res.status(400).json({ error: "Sengketa tidak dapat dibuka untuk pesanan dengan status ini" }); return;
  }

  const isCourierIssue = disputeType === "paket_tidak_sampai" || disputeType === "kurir_nakal" || disputeType === "paket_hilang";
  const isInsuranceEligible = disputeType === "kurir_nakal" || disputeType === "paket_hilang" || disputeType === "paket_rusak";
  const resolvedTrackingNumber = trackingNumber || order.trackingNumber;
  const resolvedCourierName = courierName || (order.courierId ? String(order.courierId) : null);

  // Auto-generate insurance claim ID for eligible cases
  const insuranceClaimId = isInsuranceEligible
    ? `JDB-INS-${orderId}-${Date.now()}`
    : null;

  const [newDispute] = await db.insert(disputesTable).values({
    orderId,
    reason,
    description,
    disputeType: disputeType || "other",
    courierName: resolvedCourierName,
    trackingNumber: resolvedTrackingNumber,
    escalatedToCourier: isCourierIssue ? "pending" : "no",
    escalatedAt: isCourierIssue ? new Date() : null,
    insuranceClaimStatus: isInsuranceEligible ? "pending" : "none",
    insuranceClaimId,
    insuranceAmount: isInsuranceEligible ? order.totalAmount : null,
    status: "open",
  }).returning();

  const [updated] = await db.update(ordersTable).set({ status: "disputed", updatedAt: new Date() })
    .where(eq(ordersTable.id, orderId)).returning();

  // Notify admin
  const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  for (const admin of admins) {
    await db.insert(notificationsTable).values({
      userId: admin.id,
      type: "dispute",
      title: isCourierIssue ? "🚨 Laporan Masalah Kurir Baru" : "⚠️ Sengketa Baru",
      body: `Pesanan #${orderId}: ${reason}${resolvedCourierName ? ` — Kurir: ${resolvedCourierName}` : ""}`,
      metadata: { orderId, disputeId: newDispute.id, disputeType: disputeType || "other" },
    });
  }

  // Notify buyer
  await db.insert(notificationsTable).values({
    userId: order.buyerId,
    type: "dispute",
    title: isInsuranceEligible ? "Klaim asuransi pengiriman diajukan" : "Laporan pengiriman diterima",
    body: isInsuranceEligible
      ? `Laporan pesanan #${orderId} diterima. Klaim asuransi (${insuranceClaimId}) telah diajukan ke kurir dan akan diproses dalam 1×24 jam.`
      : `Laporan untuk pesanan #${orderId} sedang diproses. Tim kami akan menghubungi Anda dalam 1×24 jam.`,
    metadata: { orderId, insuranceClaimId },
  });

  // Send email notifications
  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, order.buyerId));
  if (buyer) {
    sendShippingDisputeEmail(buyer.email, {
      orderId,
      buyerName: buyer.name,
      disputeType: disputeType || "other",
      courierName: resolvedCourierName,
      trackingNumber: resolvedTrackingNumber,
      description,
    }).catch(() => {});
  }

  res.status(201).json(await enrichOrder(updated));
});

export default router;
