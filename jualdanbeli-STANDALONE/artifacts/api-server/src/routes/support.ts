import { Router, type IRouter } from "express";
import { db, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

function buildProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}

// Get or create support conversation with admin for current user
router.post("/support/chat", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;

  // Find any admin user
  const [admin] = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  if (!admin) { res.status(503).json({ error: "No admin available" }); return; }

  if (userId === admin.id) {
    res.status(400).json({ error: "Admin cannot open support chat with themselves" });
    return;
  }

  // Find existing support conversation
  const existing = await db.select().from(conversationsTable).where(
    or(
      and(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, admin.id)),
      and(eq(conversationsTable.participant1Id, admin.id), eq(conversationsTable.participant2Id, userId))
    )
  );

  let conv = existing[0];
  if (!conv) {
    const { initialMessage } = req.body;
    [conv] = await db.insert(conversationsTable).values({
      participant1Id: userId,
      participant2Id: admin.id,
      productId: null,
      lastMessage: initialMessage || "Halo, saya butuh bantuan.",
    }).returning();

    await db.insert(messagesTable).values({
      conversationId: conv.id,
      senderId: userId,
      content: initialMessage || "Halo, saya butuh bantuan.",
    });
  }

  const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant1Id));
  const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant2Id));

  res.status(201).json({
    id: conv.id,
    participants: [buildProfile(p1), buildProfile(p2)],
    lastMessage: conv.lastMessage ?? null,
    updatedAt: conv.updatedAt,
    adminId: admin.id,
  });
});

// Get current user's existing support conversation (if any)
router.get("/support/chat", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const [admin] = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  if (!admin) { res.status(503).json({ error: "No admin available" }); return; }

  const existing = await db.select().from(conversationsTable).where(
    or(
      and(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, admin.id)),
      and(eq(conversationsTable.participant1Id, admin.id), eq(conversationsTable.participant2Id, userId))
    )
  );

  if (!existing[0]) { res.json(null); return; }

  const conv = existing[0];
  const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant1Id));
  const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant2Id));

  res.json({
    id: conv.id,
    participants: [buildProfile(p1), buildProfile(p2)],
    lastMessage: conv.lastMessage ?? null,
    updatedAt: conv.updatedAt,
    adminId: admin.id,
  });
});

// Admin: get all support conversations (where admin is a participant)
router.get("/support/conversations", requireAdmin, async (req, res): Promise<void> => {
  const adminId = req.user!.id;

  const convs = await db.select().from(conversationsTable).where(
    or(
      eq(conversationsTable.participant1Id, adminId),
      eq(conversationsTable.participant2Id, adminId)
    )
  ).orderBy(desc(conversationsTable.updatedAt));

  const enriched = await Promise.all(convs.map(async (c) => {
    const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, c.participant1Id));
    const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, c.participant2Id));
    const unreadMsgs = await db.select().from(messagesTable)
      .where(and(eq(messagesTable.conversationId, c.id), eq(messagesTable.isRead, false)));
    const unreadCount = unreadMsgs.filter(m => m.senderId !== adminId).length;
    const user = p1?.role !== "admin" ? p1 : p2;
    return {
      id: c.id,
      user: user ? buildProfile(user) : null,
      lastMessage: c.lastMessage ?? null,
      unreadCount,
      updatedAt: c.updatedAt,
    };
  }));

  res.json(enriched);
});

export default router;
