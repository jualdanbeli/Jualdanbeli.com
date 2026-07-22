import { Router, type IRouter } from "express";
import { db, ordersTable, transactionsTable, walletsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { sendPaymentSuccessEmail, sendOrderStatusEmail } from "../lib/email";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const MidtransClient = require("midtrans-client");

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY ?? "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

function getSnap() {
  return new MidtransClient.Snap({
    isProduction: IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY,
  });
}

const router: IRouter = Router();

router.post("/payments/midtrans/token", requireAuth, async (req, res): Promise<void> => {
  if (!MIDTRANS_SERVER_KEY) {
    res.status(503).json({ error: "Payment gateway belum dikonfigurasi. Hubungi admin." });
    return;
  }

  const { orderId } = req.body;
  if (!orderId) { res.status(400).json({ error: "orderId diperlukan" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) { res.status(404).json({ error: "Pesanan tidak ditemukan" }); return; }
  if (order.buyerId !== req.user!.id) { res.status(403).json({ error: "Akses ditolak" }); return; }
  if (order.status !== "pending_payment") { res.status(400).json({ error: "Pesanan sudah dibayar atau dibatalkan" }); return; }

  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));

  const parameter = {
    transaction_details: {
      order_id: `JDB-${orderId}-${Date.now()}`,
      gross_amount: Math.round(parseFloat(order.totalAmount as string)),
    },
    customer_details: {
      first_name: buyer.name.split(" ")[0],
      last_name: buyer.name.split(" ").slice(1).join(" ") || "-",
      email: buyer.email,
      phone: buyer.phone ?? "",
    },
    callbacks: {
      finish: `${process.env.APP_URL ?? ""}/orders/${orderId}`,
    },
  };

  try {
    const snap = getSnap();
    const transaction = await snap.createTransaction(parameter);
    res.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      clientKey: MIDTRANS_CLIENT_KEY,
      isProduction: IS_PRODUCTION,
    });
  } catch (err: any) {
    req.log.error({ err }, "Midtrans token creation failed");
    res.status(500).json({ error: "Gagal membuat transaksi pembayaran" });
  }
});

router.post("/payments/midtrans/webhook", async (req, res): Promise<void> => {
  try {
    const snap = getSnap();
    const notification = await snap.transaction.notification(req.body);
    const { transaction_status, fraud_status, order_id, gross_amount, payment_type } = notification;

    const orderIdStr = String(order_id).split("-")[1];
    const orderId = parseInt(orderIdStr, 10);
    if (!orderId) { res.json({ ok: true }); return; }

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) { res.json({ ok: true }); return; }

    const isPaid =
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement";

    const isFailed =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire";

    if (isPaid && order.status === "pending_payment") {
      await db.update(ordersTable).set({ status: "paid", updatedAt: new Date() }).where(eq(ordersTable.id, orderId));

      await db.insert(transactionsTable).values({
        userId: order.buyerId,
        orderId: order.id,
        type: "topup",
        amount: gross_amount,
        status: "completed",
        description: `Pembayaran pesanan #${orderId} via ${payment_type}`,
      });

      const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, order.buyerId));
      if (buyer) {
        await sendPaymentSuccessEmail(buyer.email, {
          orderId,
          buyerName: buyer.name,
          amount: parseFloat(gross_amount),
          paymentMethod: payment_type,
        });
        await sendOrderStatusEmail(buyer.email, { orderId, recipientName: buyer.name, status: "paid" });
      }
    }

    if (isFailed && order.status === "pending_payment") {
      await db.update(ordersTable).set({ status: "cancelled", updatedAt: new Date() }).where(eq(ordersTable.id, orderId));
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Midtrans webhook error");
    res.status(500).json({ error: "Webhook error" });
  }
});

router.get("/payments/midtrans/config", (_req, res): void => {
  res.json({
    clientKey: MIDTRANS_CLIENT_KEY,
    isProduction: IS_PRODUCTION,
    enabled: !!MIDTRANS_SERVER_KEY,
  });
});

export default router;
