import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isTokenExpired } from "./security";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "jualdanbeli_salt_2024").digest("hex");
}

export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  return Buffer.from(payload).toString("base64url");
}

export function parseToken(token: string): { userId: number; issuedAt: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const userId = parseInt(parts[0], 10);
    const issuedAt = parseInt(parts[1], 10);
    if (isNaN(userId) || isNaN(issuedAt)) return null;
    return { userId, issuedAt };
  } catch {
    return null;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: typeof usersTable.$inferSelect;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const parsed = parseToken(token);
  if (!parsed) {
    res.status(401).json({ error: "Token tidak valid" });
    return;
  }

  // Token expiry check — 30 hari
  if (isTokenExpired(parsed.issuedAt)) {
    res.status(401).json({ error: "Sesi berakhir, silakan login kembali" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.userId));
  if (!user) {
    res.status(401).json({ error: "Pengguna tidak ditemukan" });
    return;
  }
  if (user.status === "banned") {
    res.status(403).json({ error: "Akun Anda telah diblokir permanen" });
    return;
  }
  if (user.status === "suspended") {
    res.status(403).json({ error: "Akun Anda sedang disuspend, hubungi support" });
    return;
  }

  req.user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.user.role !== "admin") {
      req.log?.warn({ userId: req.user.id, role: req.user.role, url: req.url }, "Unauthorized admin access attempt");
      res.status(403).json({ error: "Akses ditolak" });
      return;
    }
    // Extra: admin must be active
    if (req.user.status !== "active") {
      res.status(403).json({ error: "Akun admin tidak aktif" });
      return;
    }
    next();
  });
}

// Hanya pemilik platform (paten) yang bisa akses operator dashboard
const OWNER_EMAIL = "radjapamungkas007@gmail.com";

export async function requireOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAdmin(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.user.email !== OWNER_EMAIL) {
      req.log?.warn({ userId: req.user.id, email: req.user.email, url: req.url }, "Unauthorized owner access attempt");
      res.status(403).json({ error: "Akses ditolak. Hanya pemilik platform yang bisa mengakses fitur ini." });
      return;
    }
    next();
  });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }
  requireAuth(req, res, next);
}
