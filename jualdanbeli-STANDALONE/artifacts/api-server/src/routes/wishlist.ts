import { Router, type IRouter } from "express";
import { db, wishlistsTable, productsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const items = await db.select().from(wishlistsTable).where(eq(wishlistsTable.userId, userId));
  const enriched = await Promise.all(items.map(async (w) => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, w.productId));
    if (!product) return null;
    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, product.sellerId));
    const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    const price = parseFloat(product.price as string);
    const originalPrice = product.originalPrice ? parseFloat(product.originalPrice as string) : null;
    const discountPercent = originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : null;
    return {
      wishlistId: w.id,
      addedAt: w.createdAt,
      product: {
        ...product,
        price,
        originalPrice,
        discountPercent,
        sellerName: seller?.shopName || seller?.name || "Toko",
        categoryName: category?.name || "",
      },
    };
  }));
  res.json(enriched.filter(Boolean));
});

router.post("/wishlist/:productId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const productId = parseInt(Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId, 10);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Produk tidak ditemukan" }); return; }
  const existing = await db.select().from(wishlistsTable).where(and(eq(wishlistsTable.userId, userId), eq(wishlistsTable.productId, productId)));
  if (existing[0]) { res.status(409).json({ error: "Sudah ada di wishlist" }); return; }
  const [item] = await db.insert(wishlistsTable).values({ userId, productId }).returning();
  res.status(201).json(item);
});

router.delete("/wishlist/:productId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const productId = parseInt(Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId, 10);
  await db.delete(wishlistsTable).where(and(eq(wishlistsTable.userId, userId), eq(wishlistsTable.productId, productId)));
  res.json({ success: true });
});

router.get("/wishlist/check/:productId", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const productId = parseInt(Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId, 10);
  const existing = await db.select().from(wishlistsTable).where(and(eq(wishlistsTable.userId, userId), eq(wishlistsTable.productId, productId)));
  res.json({ inWishlist: !!existing[0] });
});

export default router;
