import { Router, type IRouter } from "express";
import { db, productsTable, usersTable, categoriesTable, reviewsTable } from "@workspace/db";
import { eq, ilike, gte, lte, sql, and, desc, asc, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function buildUserProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
    stats: { totalProducts: 0, totalSales: 0, averageRating: 0, totalReviews: 0 },
    sellerInfo: {
      shopName: user.shopName ?? null,
      shopDescription: user.shopDescription ?? null,
      city: user.city ?? null,
      province: user.province ?? null,
      isVerified: user.isVerified,
    },
  };
}

async function enrichProduct(product: typeof productsTable.$inferSelect) {
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, product.sellerId));
  const [category] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, product.id));
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return {
    ...product,
    price: parseFloat(product.price as string),
    originalPrice: product.originalPrice ? parseFloat(product.originalPrice as string) : null,
    weight: product.weight ? parseFloat(product.weight as string) : null,
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
    seller: seller ? buildUserProfile(seller) : null,
    category: category ? { ...category, productCount: 0 } : null,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const { q, categoryId, minPrice, maxPrice, condition, sort, page = "1", limit = "20" } = req.query;

  let conditions: ReturnType<typeof eq>[] = [eq(productsTable.status, "active")];
  if (q) conditions.push(ilike(productsTable.name, `%${q}%`));
  if (categoryId) conditions.push(eq(productsTable.categoryId, parseInt(categoryId as string, 10)));
  if (minPrice) conditions.push(gte(sql`cast(${productsTable.price} as numeric)`, parseFloat(minPrice as string)));
  if (maxPrice) conditions.push(lte(sql`cast(${productsTable.price} as numeric)`, parseFloat(maxPrice as string)));
  if (condition) conditions.push(eq(productsTable.condition, condition as "new" | "used"));

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 50);
  const offset = (pageNum - 1) * limitNum;

  let orderBy;
  if (sort === "price_asc") orderBy = asc(sql`cast(${productsTable.price} as numeric)`);
  else if (sort === "price_desc") orderBy = desc(sql`cast(${productsTable.price} as numeric)`);
  else if (sort === "popular") orderBy = desc(productsTable.totalSold);
  else orderBy = desc(productsTable.createdAt);

  const products = await db.select().from(productsTable)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset);

  const [{ count: total }] = await db.select({ count: sql<number>`cast(count(*) as int)` })
    .from(productsTable).where(and(...conditions));

  const enriched = await Promise.all(products.map(enrichProduct));
  res.json({ data: enriched, total, page: pageNum, limit: limitNum });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.status, "active"))
    .orderBy(desc(productsTable.totalSold))
    .limit(8);
  const enriched = await Promise.all(products.map(enrichProduct));
  res.json(enriched);
});

router.get("/products/trending", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.status, "active"))
    .orderBy(desc(productsTable.createdAt))
    .limit(10);
  const enriched = await Promise.all(products.map(enrichProduct));
  res.json(enriched);
});

router.get("/products/:productId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(await enrichProduct(product));
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  if (user.role !== "seller" && user.role !== "admin") {
    res.status(403).json({ error: "Only sellers can create products" });
    return;
  }
  const { name, description, price, stock, condition, categoryId, images, weight, originalPrice } = req.body;
  if (!name || !description || !price || !categoryId || !images) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [product] = await db.insert(productsTable).values({
    name, description,
    price: price.toString(),
    originalPrice: originalPrice ? originalPrice.toString() : null,
    stock: stock || 0,
    condition: condition || "new",
    status: "active",
    sellerId: user.id,
    categoryId,
    images: images || [],
    weight: weight ? weight.toString() : null,
    city: user.city,
  }).returning();
  res.status(201).json(await enrichProduct(product));
});

router.patch("/products/:productId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  if (product.sellerId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { name, description, price, originalPrice, stock, condition, categoryId, images, weight } = req.body;
  const [updated] = await db.update(productsTable).set({
    ...(name && { name }),
    ...(description && { description }),
    ...(price && { price: price.toString() }),
    ...(originalPrice !== undefined && { originalPrice: originalPrice ? originalPrice.toString() : null }),
    ...(stock !== undefined && { stock }),
    ...(condition && { condition }),
    ...(categoryId && { categoryId }),
    ...(images && { images }),
    ...(weight !== undefined && { weight: weight ? weight.toString() : null }),
    updatedAt: new Date(),
  }).where(eq(productsTable.id, productId)).returning();
  res.json(await enrichProduct(updated));
});

router.delete("/products/:productId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  if (product.sellerId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  await db.update(productsTable).set({ status: "removed" }).where(eq(productsTable.id, productId));
  res.json({ success: true, message: "Product deleted" });
});

router.get("/products/:productId/reviews", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, productId)).orderBy(desc(reviewsTable.createdAt));
  const enriched = await Promise.all(reviews.map(async (r) => {
    const [reviewer] = await db.select().from(usersTable).where(eq(usersTable.id, r.reviewerId));
    return { ...r, reviewer: reviewer ? buildUserProfile(reviewer) : null };
  }));
  res.json(enriched);
});

router.post("/products/:productId/reviews", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const productId = parseInt(raw, 10);
  const { rating, comment, orderId, images } = req.body;
  if (!rating || !comment || !orderId) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [review] = await db.insert(reviewsTable).values({
    productId, reviewerId: req.user!.id, orderId, rating, comment, images: images || [],
  }).returning();
  const [reviewer] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  res.status(201).json({ ...review, reviewer: reviewer ? buildUserProfile(reviewer) : null });
});

export default router;
