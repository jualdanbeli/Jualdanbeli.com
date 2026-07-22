import { Router, type IRouter } from "express";
import { db, usersTable, walletsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";
import { hashPassword, generateToken, requireAuth } from "../lib/auth";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../lib/email";
import {
  checkLoginLockout,
  recordFailedLogin,
  clearLoginAttempts,
  validatePassword,
  sanitizeString,
  sanitizeEmail,
} from "../lib/security";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const name = sanitizeString(req.body.name);
  const email = sanitizeEmail(req.body.email);
  const phone = sanitizeString(req.body.phone);
  const password: string = req.body.password ?? "";
  const role: string = req.body.role ?? "";

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "Semua field wajib diisi" });
    return;
  }

  // Validasi kekuatan password
  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    res.status(400).json({ error: pwCheck.errors.join(", ") });
    return;
  }

  // Validasi format email sederhana
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Format email tidak valid" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email sudah terdaftar" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    phone,
    passwordHash,
    role: role === "seller" ? "seller" : "buyer",
    status: "active",
  }).returning();

  await db.insert(walletsTable).values({ userId: user.id, balance: "0", pendingBalance: "0" });

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;

  sendWelcomeEmail(user.email, user.name).catch(() => {});

  res.status(201).json({ user: safeUser, token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const email = sanitizeEmail(req.body.email);
  const password: string = req.body.password ?? "";

  if (!email || !password) {
    res.status(400).json({ error: "Email dan password wajib diisi" });
    return;
  }

  const ip = (req.ip ?? req.socket?.remoteAddress ?? "unknown");

  // Cek apakah IP+email sedang terkunci
  const lockStatus = checkLoginLockout(email, ip);
  if (lockStatus.locked) {
    res.status(429).json({
      error: `Akun terkunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${lockStatus.minutesLeft} menit.`,
    });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  // Selalu hash dulu sebelum bandingkan (timing-safe)
  const inputHash = hashPassword(password);
  const passwordMatch = user && user.passwordHash === inputHash;

  if (!user || !passwordMatch) {
    const result = recordFailedLogin(email, ip);
    if (result.locked) {
      req.log.warn({ email, ip }, "Account locked after too many failed logins");
      res.status(429).json({
        error: "Akun terkunci 30 menit karena terlalu banyak percobaan login gagal.",
      });
    } else {
      res.status(401).json({
        error: `Email atau password salah. Sisa percobaan: ${result.attemptsLeft}`,
      });
    }
    return;
  }

  if (user.status === "banned") {
    res.status(403).json({ error: "Akun Anda telah diblokir permanen. Hubungi support." });
    return;
  }
  if (user.status === "suspended") {
    res.status(403).json({ error: "Akun Anda sedang disuspend. Hubungi support." });
    return;
  }

  // Login berhasil — bersihkan riwayat gagal
  clearLoginAttempts(email, ip);

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  req.log.info({ userId: user.id, role: user.role }, "User logged in");
  res.json({ user: safeUser, token });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const emailOrPhone = sanitizeString(req.body.emailOrPhone);
  if (!emailOrPhone) {
    res.status(400).json({ error: "Email atau nomor HP wajib diisi" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(
    or(eq(usersTable.email, emailOrPhone.toLowerCase()), eq(usersTable.phone, emailOrPhone)),
  );
  // Selalu kirim respon sama (jangan bocorkan email terdaftar)
  const SAFE_MSG = "Jika akun ditemukan, link reset akan dikirim ke email terdaftar.";
  if (!user) {
    res.json({ message: SAFE_MSG });
    return;
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  await db.update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, user.id));
  const APP_URL = process.env.APP_URL ?? "https://jual-beli-aman.replit.app";
  const resetLink = `${APP_URL}/reset-password?token=${token}`;
  sendPasswordResetEmail(user.email, { name: user.name, resetLink }).catch(() => {});
  res.json({ message: SAFE_MSG });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token } = req.body;
  const newPassword: string = req.body.newPassword ?? "";
  if (!token || !newPassword) {
    res.status(400).json({ error: "Token dan password baru wajib diisi" });
    return;
  }

  // Validasi kekuatan password baru
  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.valid) {
    res.status(400).json({ error: pwCheck.errors.join(", ") });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    res.status(400).json({ error: "Link reset tidak valid atau sudah kadaluarsa. Minta link baru." });
    return;
  }
  await db.update(usersTable).set({
    passwordHash: hashPassword(newPassword),
    resetToken: null,
    resetTokenExpiry: null,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, user.id));
  req.log.info({ userId: user.id }, "Password reset successful");
  res.json({ message: "Password berhasil direset. Silakan login dengan password baru." });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const { passwordHash: _, ...safeUser } = user;
  const sellerInfo = {
    shopName: user.shopName ?? null,
    shopDescription: user.shopDescription ?? null,
    city: user.city ?? null,
    province: user.province ?? null,
    isVerified: user.isVerified,
  };
  res.json({ ...safeUser, sellerInfo });
});

export default router;
