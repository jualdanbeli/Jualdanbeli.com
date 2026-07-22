import { Router, type IRouter } from "express";
import { db, liveSessionsTable, liveChatsTable, liveFeaturedProductsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, desc, gt } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

// GET /api/live — list all active live sessions
router.get("/live", async (req, res): Promise<void> => {
  const sessions = await db
    .select()
    .from(liveSessionsTable)
    .where(eq(liveSessionsTable.isActive, true))
    .orderBy(desc(liveSessionsTable.viewerCount));

  const enriched = await Promise.all(sessions.map(async (s) => {
    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, s.sellerId));
    const featured = await db.select().from(liveFeaturedProductsTable).where(eq(liveFeaturedProductsTable.sessionId, s.id));
    const products = await Promise.all(featured.map(async (f) => {
      const [p] = await db.select().from(productsTable).where(eq(productsTable.id, f.productId));
      return p ? { ...p, price: parseFloat(p.price as string) } : null;
    }));
    return {
      ...s,
      sellerName: seller?.shopName || seller?.name || "Toko",
      sellerAvatar: seller?.avatarUrl,
      featuredProducts: products.filter(Boolean),
    };
  }));
  res.json(enriched);
});

// GET /api/live/past — past sessions for seller
router.get("/live/past", requireAuth, async (req, res): Promise<void> => {
  const sessions = await db
    .select()
    .from(liveSessionsTable)
    .where(and(eq(liveSessionsTable.sellerId, req.user!.id), eq(liveSessionsTable.isActive, false)))
    .orderBy(desc(liveSessionsTable.createdAt))
    .limit(20);
  res.json(sessions);
});

// GET /api/live/:id — get session detail
router.get("/live/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [session] = await db.select().from(liveSessionsTable).where(eq(liveSessionsTable.id, id));
  if (!session) { res.status(404).json({ error: "Live tidak ditemukan" }); return; }

  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, session.sellerId));
  const featured = await db.select().from(liveFeaturedProductsTable).where(eq(liveFeaturedProductsTable.sessionId, id));
  const featuredProducts = await Promise.all(featured.map(async (f) => {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, f.productId));
    return p ? { ...p, price: parseFloat(p.price as string) } : null;
  }));

  res.json({
    ...session,
    sellerName: seller?.shopName || seller?.name || "Toko",
    sellerAvatar: seller?.avatarUrl,
    sellerCity: (seller as any)?.sellerInfo?.city ?? null,
    featuredProducts: featuredProducts.filter(Boolean),
  });
});

// POST /api/live/start — seller starts a live
router.post("/live/start", requireAuth, async (req, res): Promise<void> => {
  if (req.user!.role !== "seller" && req.user!.role !== "admin") {
    res.status(403).json({ error: "Hanya penjual yang bisa live" }); return;
  }
  // End any existing active session first
  await db.update(liveSessionsTable)
    .set({ isActive: false, endedAt: new Date() })
    .where(and(eq(liveSessionsTable.sellerId, req.user!.id), eq(liveSessionsTable.isActive, true)));

  const { title, description, thumbnailUrl } = req.body;
  if (!title) { res.status(400).json({ error: "Judul live diperlukan" }); return; }

  const [session] = await db.insert(liveSessionsTable).values({
    sellerId: req.user!.id,
    title,
    description: description || null,
    thumbnailUrl: thumbnailUrl || null,
    isActive: true,
    startedAt: new Date(),
  }).returning();
  res.status(201).json(session);
});

// PATCH /api/live/:id/end — seller ends live
router.patch("/live/:id/end", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [session] = await db.select().from(liveSessionsTable).where(eq(liveSessionsTable.id, id));
  if (!session) { res.status(404).json({ error: "Live tidak ditemukan" }); return; }
  if (session.sellerId !== req.user!.id) { res.status(403).json({ error: "Bukan live Anda" }); return; }
  const [updated] = await db.update(liveSessionsTable)
    .set({ isActive: false, endedAt: new Date() })
    .where(eq(liveSessionsTable.id, id))
    .returning();
  res.json(updated);
});

// PATCH /api/live/:id/viewers — increment viewer count (called when joining)
router.patch("/live/:id/viewers", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { delta } = req.body; // +1 or -1
  const [session] = await db.select().from(liveSessionsTable).where(eq(liveSessionsTable.id, id));
  if (!session) { res.status(404).json({ error: "Live tidak ditemukan" }); return; }
  const newCount = Math.max(0, session.viewerCount + (delta === -1 ? -1 : 1));
  const newPeak = Math.max(session.peakViewers, newCount);
  const [updated] = await db.update(liveSessionsTable)
    .set({ viewerCount: newCount, peakViewers: newPeak })
    .where(eq(liveSessionsTable.id, id))
    .returning();
  res.json(updated);
});

// GET /api/live/:id/chat — get chat messages
router.get("/live/:id/chat", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const since = req.query.since ? parseInt(req.query.since as string, 10) : 0;
  const chats = await db
    .select()
    .from(liveChatsTable)
    .where(and(eq(liveChatsTable.sessionId, id), gt(liveChatsTable.id, since)))
    .orderBy(liveChatsTable.id)
    .limit(50);
  res.json(chats);
});

// POST /api/live/:id/chat — send chat message
router.post("/live/:id/chat", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { message } = req.body;
  if (!message?.trim()) { res.status(400).json({ error: "Pesan tidak boleh kosong" }); return; }
  const userName = req.user!.shopName || req.user!.name || "Pengguna";
  const [chat] = await db.insert(liveChatsTable).values({
    sessionId: id,
    userId: req.user!.id,
    userName,
    message: message.trim(),
  }).returning();
  res.status(201).json(chat);
});

// POST /api/live/:id/feature/:productId — feature a product during live
router.post("/live/:id/feature/:productId", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const productId = parseInt(Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId, 10);
  const [session] = await db.select().from(liveSessionsTable).where(eq(liveSessionsTable.id, id));
  if (!session || session.sellerId !== req.user!.id) { res.status(403).json({ error: "Tidak diizinkan" }); return; }
  const existing = await db.select().from(liveFeaturedProductsTable)
    .where(and(eq(liveFeaturedProductsTable.sessionId, id), eq(liveFeaturedProductsTable.productId, productId)));
  if (existing[0]) { res.status(409).json({ error: "Produk sudah ditampilkan" }); return; }
  const [fp] = await db.insert(liveFeaturedProductsTable).values({ sessionId: id, productId }).returning();
  res.status(201).json(fp);
});

// DELETE /api/live/:id/feature/:productId — remove featured product
router.delete("/live/:id/feature/:productId", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const productId = parseInt(Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId, 10);
  await db.delete(liveFeaturedProductsTable)
    .where(and(eq(liveFeaturedProductsTable.sessionId, id), eq(liveFeaturedProductsTable.productId, productId)));
  res.json({ success: true });
});

export default router;
