import { Router, type IRouter } from "express";
import { db, conversationsTable, messagesTable, usersTable, productsTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function buildProfile(user: typeof usersTable.$inferSelect) {
  return { id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl ?? null, createdAt: user.createdAt, stats: { totalProducts: 0, totalSales: 0, averageRating: 0, totalReviews: 0 }, sellerInfo: { shopName: user.shopName ?? null, shopDescription: user.shopDescription ?? null, city: user.city ?? null, province: user.province ?? null, isVerified: user.isVerified } };
}

router.get("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const convs = await db.select().from(conversationsTable)
    .where(or(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, userId)))
    .orderBy(desc(conversationsTable.updatedAt));

  const enriched = await Promise.all(convs.map(async (c) => {
    const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, c.participant1Id));
    const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, c.participant2Id));
    const unreadMsgs = await db.select().from(messagesTable)
      .where(and(eq(messagesTable.conversationId, c.id), eq(messagesTable.isRead, false)));
    const unreadCount = unreadMsgs.filter(m => m.senderId !== userId).length;
    return {
      id: c.id,
      participants: [p1 ? buildProfile(p1) : null, p2 ? buildProfile(p2) : null].filter(Boolean),
      productId: c.productId ?? null,
      product: null,
      lastMessage: c.lastMessage ?? null,
      unreadCount,
      updatedAt: c.updatedAt,
    };
  }));

  res.json(enriched);
});

router.post("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  const { recipientId, productId, initialMessage } = req.body;
  if (!recipientId) { res.status(400).json({ error: "recipientId required" }); return; }
  const userId = req.user!.id;

  // Check if conversation exists
  const existing = await db.select().from(conversationsTable).where(
    or(
      and(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, recipientId)),
      and(eq(conversationsTable.participant1Id, recipientId), eq(conversationsTable.participant2Id, userId))
    )
  );

  let conv = existing[0];
  if (!conv) {
    [conv] = await db.insert(conversationsTable).values({
      participant1Id: userId,
      participant2Id: recipientId,
      productId: productId || null,
      lastMessage: initialMessage || null,
    }).returning();

    if (initialMessage) {
      await db.insert(messagesTable).values({ conversationId: conv.id, senderId: userId, content: initialMessage });
    }
  }

  const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant1Id));
  const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant2Id));
  res.status(201).json({
    id: conv.id,
    participants: [p1 ? buildProfile(p1) : null, p2 ? buildProfile(p2) : null].filter(Boolean),
    productId: conv.productId ?? null, product: null,
    lastMessage: conv.lastMessage ?? null, unreadCount: 0, updatedAt: conv.updatedAt,
  });
});

router.get("/messages/conversations/:conversationId", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const convId = parseInt(raw, 10);
  const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, convId)).orderBy(messagesTable.createdAt);

  // Mark as read
  await db.update(messagesTable).set({ isRead: true }).where(and(eq(messagesTable.conversationId, convId)));

  const enriched = await Promise.all(msgs.map(async (m) => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId));
    return { ...m, sender: sender ? buildProfile(sender) : null };
  }));
  res.json(enriched);
});

router.post("/messages/conversations/:conversationId/send", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const convId = parseInt(raw, 10);
  const { content } = req.body;
  if (!content) { res.status(400).json({ error: "content required" }); return; }

  const [msg] = await db.insert(messagesTable).values({ conversationId: convId, senderId: req.user!.id, content }).returning();
  await db.update(conversationsTable).set({ lastMessage: content, updatedAt: new Date() }).where(eq(conversationsTable.id, convId));

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  res.status(201).json({ ...msg, sender: sender ? buildProfile(sender) : null });
});

export default router;
