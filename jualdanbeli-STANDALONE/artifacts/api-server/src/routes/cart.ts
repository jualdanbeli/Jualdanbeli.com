import { Router, type IRouter } from "express";
import { db, cartsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

async function getOrCreateCart(userId: number) {
  let [cart] = await db.select().from(cartsTable).where(eq(cartsTable.userId, userId));
  if (!cart) {
    [cart] = await db.insert(cartsTable).values({ userId }).returning();
  }
  return cart;
}

async function buildCartResponse(cart: typeof cartsTable.$inferSelect) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  const enrichedItems = await Promise.all(items.map(async (item) => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    return {
      ...item,
      unitPrice: parseFloat(item.unitPrice as string),
      product: product ? {
        ...product,
        price: parseFloat(product.price as string),
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice as string) : null,
        weight: null, averageRating: 0, totalReviews: 0, seller: null, category: null,
      } : null,
    };
  }));
  const subtotal = enrichedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  return { id: cart.id, userId: cart.userId, items: enrichedItems, subtotal };
}

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  const cart = await getOrCreateCart(req.user!.id);
  res.json(await buildCartResponse(cart));
});

router.post("/cart/items", requireAuth, async (req, res): Promise<void> => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) { res.status(400).json({ error: "productId required" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  if (product.stock < quantity) { res.status(400).json({ error: "Insufficient stock" }); return; }

  const cart = await getOrCreateCart(req.user!.id);
  const [existing] = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.cartId, cart.id), eq(cartItemsTable.productId, productId)));

  if (existing) {
    await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity }).where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      cartId: cart.id,
      productId,
      quantity,
      unitPrice: product.price,
    });
  }
  res.status(201).json(await buildCartResponse(cart));
});

router.patch("/cart/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemId = parseInt(raw, 10);
  const { quantity } = req.body;
  if (!quantity || quantity < 1) { res.status(400).json({ error: "Invalid quantity" }); return; }
  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  await db.update(cartItemsTable).set({ quantity }).where(eq(cartItemsTable.id, itemId));
  const cart = await getOrCreateCart(req.user!.id);
  res.json(await buildCartResponse(cart));
});

router.delete("/cart/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemId = parseInt(raw, 10);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  const cart = await getOrCreateCart(req.user!.id);
  res.json(await buildCartResponse(cart));
});

router.delete("/cart/clear", requireAuth, async (req, res): Promise<void> => {
  const cart = await getOrCreateCart(req.user!.id);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cart.id));
  res.json({ success: true, message: "Cart cleared" });
});

export default router;
