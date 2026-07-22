import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { hasSuspiciousQuery } from "./lib/security";

const app: Express = express();

app.set("trust proxy", 1);

// ─── Security Headers (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://app.midtrans.com", "https://api.midtrans.com"],
        connectSrc: ["'self'", "https://api.midtrans.com", "https://api.rajaongkir.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// ─── CORS — hanya izinkan domain yang dikenal ─────────────────────────────
const ALLOWED_ORIGINS = [
  /^https:\/\/jual-beli-aman\.replit\.app$/,
  /^https:\/\/.*\.replit\.app$/,
  /^https:\/\/.*\.repl\.co$/,
  /^https:\/\/.*\.replit\.dev$/,
  /^https:\/\/.*\.pike\.replit\.dev$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) { callback(null, true); return; }
      if (ALLOWED_ORIGINS.some(p => p.test(origin))) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "CORS blocked unknown origin");
        callback(new Error("CORS_BLOCKED"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// ─── Body size limits (prevent payload DoS) ───────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ─── Rate Limiters ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan, coba lagi dalam 15 menit." },
  skip: (req) => req.method === "OPTIONS",
});

// Auth: max 10 per 15 menit per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan, coba lagi dalam 15 menit." },
});

// Admin routes: max 120 per 5 menit
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan admin, tunggu sebentar." },
});

// Sensitive ops: max 5 per jam (reset password, forgot password)
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan, coba lagi dalam 1 jam." },
});

// ─── Request Logging ───────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── Remove server fingerprint headers ────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction): void => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
});

// ─── Suspicious request detection (SQLi, XSS, path traversal) ─────────────
app.use((req: Request, res: Response, next: NextFunction): void => {
  try {
    if (hasSuspiciousQuery(req)) {
      logger.warn({ ip: req.ip, url: req.url, ua: req.headers["user-agent"] }, "Suspicious request blocked");
      res.status(400).json({ error: "Permintaan tidak valid" });
      return;
    }
  } catch {
    // never block on detection failure
  }
  next();
});

// ─── Apply rate limiters ───────────────────────────────────────────────────
app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", strictLimiter);
app.use("/api/auth/reset-password", strictLimiter);
app.use("/api/admin", adminLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response): void => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// ─── Global error handler ──────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err.message === "CORS_BLOCKED") {
    res.status(403).json({ error: "Akses ditolak" });
    return;
  }
  logger.error({ err, url: req.url, ip: req.ip }, "Unhandled error");
  res.status(500).json({ error: "Terjadi kesalahan server" });
});

export default app;
