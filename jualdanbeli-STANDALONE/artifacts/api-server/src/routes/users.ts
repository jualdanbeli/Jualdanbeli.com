import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, reviewsTable, ordersTable } from "@workspace/db";
import { eq, count, sql, avg } from "drizzle-orm";
import { requireAuth, hashPassword } from "../lib/auth";

const router: IRouter = Router();

function buildUserProfile(user: typeof usersTable.$inferSelect, stats?: { totalProducts: number; totalSales: number; averageRating: number; totalReviews: number }) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
    stats: stats ?? { totalProducts: 0, totalSales: 0, averageRating: 0, totalReviews: 0 },
    sellerInfo: {
      shopName: user.shopName ?? null,
      shopDescription: user.shopDescription ?? null,
      city: user.city ?? null,
      province: user.province ?? null,
      isVerified: user.isVerified,
    },
  };
}

router.get("/users/:userId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [productCountRow] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(productsTable).where(eq(productsTable.sellerId, userId));
  const [salesRow] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(ordersTable).where(eq(ordersTable.sellerId, userId));
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.reviewerId, userId));
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const stats = {
    totalProducts: productCountRow?.count ?? 0,
    totalSales: salesRow?.count ?? 0,
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
  };
  res.json(buildUserProfile(user, stats));
});

router.patch("/users/:userId/update", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (req.user!.id !== userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { name, phone, avatarUrl, shopName, shopDescription, city, province, address } = req.body;
  const [updated] = await db.update(usersTable).set({
    ...(name && { name }),
    ...(phone && { phone }),
    ...(avatarUrl !== undefined && { avatarUrl }),
    ...(shopName !== undefined && { shopName }),
    ...(shopDescription !== undefined && { shopDescription }),
    ...(city !== undefined && { city }),
    ...(province !== undefined && { province }),
    ...(address !== undefined && { address }),
    updatedAt: new Date(),
  }).where(eq(usersTable.id, userId)).returning();
  const { passwordHash: _, ...safeUser } = updated;
  res.json({ ...safeUser, sellerInfo: { shopName: updated.shopName, shopDescription: updated.shopDescription, city: updated.city, province: updated.province, isVerified: updated.isVerified } });
});

router.post("/users/change-password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Password lama dan baru wajib diisi" }); return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ error: "Password baru minimal 8 karakter" }); return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) { res.status(404).json({ error: "User tidak ditemukan" }); return; }
  if (user.passwordHash !== hashPassword(currentPassword)) {
    res.status(400).json({ error: "Password lama tidak sesuai" }); return;
  }
  await db.update(usersTable).set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() }).where(eq(usersTable.id, req.user!.id));
  res.json({ message: "Password berhasil diubah" });
});

router.get("/users/:userId/products", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.sellerId, userId));
  res.json(products.map(p => ({
    ...p,
    price: parseFloat(p.price as string),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice as string) : null,
    weight: p.weight ? parseFloat(p.weight as string) : null,
    averageRating: 0,
    totalReviews: 0,
    seller: null,
    category: null,
  })));
});

router.get("/users/:userId/reviews", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.reviewerId, userId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json(reviews.map(r => ({ ...r, reviewer: user ? buildUserProfile(user) : null })));
});

export default router;
