import { Router, type IRouter } from "express";
import { db, notificationsTable, reportsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(notifs);
});

router.patch("/notifications/:notificationId/read", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;
  const notifId = parseInt(raw, 10);
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, notifId));
  res.json({ success: true, message: "Marked as read" });
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, req.user!.id));
  res.json({ success: true, message: "All notifications marked as read" });
});

// Reports
router.get("/reports", requireAuth, async (req, res): Promise<void> => {
  const { status } = req.query;
  let reports;
  if (status) {
    reports = await db.select().from(reportsTable).where(eq(reportsTable.status, status as any)).orderBy(desc(reportsTable.createdAt));
  } else {
    reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.createdAt));
  }
  res.json(reports);
});

router.post("/reports", requireAuth, async (req, res): Promise<void> => {
  const { targetType, targetId, reason, description } = req.body;
  if (!targetType || !targetId || !reason) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [report] = await db.insert(reportsTable).values({
    reporterId: req.user!.id,
    targetType,
    targetId,
    reason,
    description: description || null,
    status: "pending",
  }).returning();
  res.status(201).json(report);
});

router.patch("/reports/:reportId/resolve", requireAuth, async (req, res): Promise<void> => {
  if (req.user!.role !== "admin") { res.status(403).json({ error: "Admin only" }); return; }
  const raw = Array.isArray(req.params.reportId) ? req.params.reportId[0] : req.params.reportId;
  const reportId = parseInt(raw, 10);
  const { status, resolution } = req.body;
  const [report] = await db.update(reportsTable).set({ status, resolution }).where(eq(reportsTable.id, reportId)).returning();
  res.json(report);
});

export default router;
