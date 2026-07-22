import { Router, type IRouter } from "express";
import { db, vouchersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

// Apply/validate a voucher code
router.post("/vouchers/apply", requireAuth, async (req, res): Promise<void> => {
  const { code, orderTotal } = req.body;
  if (!code) { res.status(400).json({ error: "Kode voucher diperlukan" }); return; }

  const [voucher] = await db.select().from(vouchersTable).where(eq(vouchersTable.code, code.toUpperCase()));
  if (!voucher) { res.status(404).json({ error: "Kode voucher tidak valid" }); return; }
  if (!voucher.isActive) { res.status(400).json({ error: "Voucher tidak aktif" }); return; }
  if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
    res.status(400).json({ error: "Voucher sudah kadaluarsa" }); return;
  }
  if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
    res.status(400).json({ error: "Voucher sudah mencapai batas penggunaan" }); return;
  }
  const total = parseFloat(orderTotal || "0");
  const minOrder = parseFloat(voucher.minOrder as string);
  if (total < minOrder) {
    res.status(400).json({ error: `Minimum belanja ${minOrder.toLocaleString("id-ID", { style: "currency", currency: "IDR" })} untuk voucher ini` });
    return;
  }

  const voucherValue = parseFloat(voucher.value as string);
  let discount = 0;
  if (voucher.type === "percentage") {
    discount = Math.round(total * (voucherValue / 100));
    if (voucher.maxDiscount) {
      discount = Math.min(discount, parseFloat(voucher.maxDiscount as string));
    }
  } else {
    discount = voucherValue;
  }
  discount = Math.min(discount, total);

  res.json({
    valid: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucherValue,
      description: voucher.description,
    },
    discount,
    finalTotal: total - discount,
  });
});

// Admin: list all vouchers
router.get("/vouchers", requireAdmin, async (req, res): Promise<void> => {
  const vouchers = await db.select().from(vouchersTable);
  res.json(vouchers.map(v => ({
    ...v,
    value: parseFloat(v.value as string),
    minOrder: parseFloat(v.minOrder as string),
    maxDiscount: v.maxDiscount ? parseFloat(v.maxDiscount as string) : null,
  })));
});

// Admin: create voucher
router.post("/vouchers", requireAdmin, async (req, res): Promise<void> => {
  const { code, type, value, minOrder, maxDiscount, maxUses, expiresAt, description } = req.body;
  if (!code || !type || !value) { res.status(400).json({ error: "Kode, tipe, dan nilai voucher diperlukan" }); return; }
  const [voucher] = await db.insert(vouchersTable).values({
    code: code.toUpperCase(),
    type,
    value: value.toString(),
    minOrder: (minOrder || 0).toString(),
    maxDiscount: maxDiscount ? maxDiscount.toString() : null,
    maxUses: maxUses || null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    description: description || null,
    isActive: true,
  }).returning();
  res.status(201).json(voucher);
});

// Admin: toggle voucher active status
router.patch("/vouchers/:id/toggle", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [voucher] = await db.select().from(vouchersTable).where(eq(vouchersTable.id, id));
  if (!voucher) { res.status(404).json({ error: "Voucher tidak ditemukan" }); return; }
  const [updated] = await db.update(vouchersTable).set({ isActive: !voucher.isActive }).where(eq(vouchersTable.id, id)).returning();
  res.json(updated);
});

export default router;
