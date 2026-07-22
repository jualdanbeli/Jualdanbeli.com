import { pgTable, serial, text, integer, numeric, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const voucherTypeEnum = pgEnum("voucher_type", ["percentage", "fixed"]);

export const vouchersTable = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: voucherTypeEnum("type").notNull(),
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  minOrder: numeric("min_order", { precision: 15, scale: 2 }).notNull().default("0"),
  maxDiscount: numeric("max_discount", { precision: 15, scale: 2 }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVoucherSchema = createInsertSchema(vouchersTable).omit({ id: true, usedCount: true, createdAt: true });
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type Voucher = typeof vouchersTable.$inferSelect;
