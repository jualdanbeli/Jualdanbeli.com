/**
 * Security utilities: login lockout, password validation, input sanitization.
 * All in-memory (resets on restart) — permanent blocks use DB status field.
 */

interface LoginAttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;   // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000;  // 30 minutes lockout

// Cleanup stale records every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (record.lockedUntil && now > record.lockedUntil + WINDOW_MS) {
      loginAttempts.delete(key);
    } else if (!record.lockedUntil && now - record.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);

export function getLoginKey(email: string, ip: string): string {
  return `${email.toLowerCase().trim()}|${ip}`;
}

export function checkLoginLockout(email: string, ip: string): { locked: boolean; minutesLeft?: number } {
  const key = getLoginKey(email, ip);
  const record = loginAttempts.get(key);
  if (!record) return { locked: false };

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60_000);
    return { locked: true, minutesLeft };
  }
  // Lockout expired — reset
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(key);
    return { locked: false };
  }
  return { locked: false };
}

export function recordFailedLogin(email: string, ip: string): { locked: boolean; attemptsLeft: number } {
  const key = getLoginKey(email, ip);
  const now = Date.now();
  const record = loginAttempts.get(key) ?? { count: 0, firstAttempt: now, lockedUntil: null };

  // Reset window if too old
  if (now - record.firstAttempt > WINDOW_MS && !record.lockedUntil) {
    record.count = 0;
    record.firstAttempt = now;
  }

  record.count++;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    loginAttempts.set(key, record);
    return { locked: true, attemptsLeft: 0 };
  }

  loginAttempts.set(key, record);
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - record.count };
}

export function clearLoginAttempts(email: string, ip: string): void {
  loginAttempts.delete(getLoginKey(email, ip));
}

// ─── Password strength ─────────────────────────────────────────────────────

export interface PasswordCheckResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordCheckResult {
  const errors: string[] = [];
  if (!password || password.length < 8) errors.push("Minimal 8 karakter");
  if (password.length > 128) errors.push("Maksimal 128 karakter");
  if (!/[a-zA-Z]/.test(password)) errors.push("Harus mengandung huruf");
  if (!/[0-9]/.test(password)) errors.push("Harus mengandung angka");
  if (/\s/.test(password)) errors.push("Tidak boleh mengandung spasi");
  return { valid: errors.length === 0, errors };
}

// ─── Input sanitization ────────────────────────────────────────────────────

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")          // strip HTML angle brackets
    .replace(/javascript:/gi, "")  // strip JS protocol
    .replace(/on\w+=/gi, "")       // strip event handlers
    .trim()
    .slice(0, 1000);               // cap length
}

export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.toLowerCase().trim().slice(0, 254);
}

// ─── Token expiry ──────────────────────────────────────────────────────────

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function isTokenExpired(timestamp: number): boolean {
  return Date.now() - timestamp > TOKEN_MAX_AGE_MS;
}

// ─── Suspicious request detection ─────────────────────────────────────────

const SUSPICIOUS_PATTERNS = [
  /union\s+select/i,
  /drop\s+table/i,
  /<script/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /base64_decode/i,
  /\/etc\/passwd/i,
  /\.\.\//,
];

export function isSuspiciousInput(input: string): boolean {
  return SUSPICIOUS_PATTERNS.some(p => p.test(input));
}

export function hasSuspiciousQuery(req: { url?: string; body?: any; query?: any }): boolean {
  const checkStr = JSON.stringify({ url: req.url, body: req.body, query: req.query });
  return isSuspiciousInput(checkStr);
}
