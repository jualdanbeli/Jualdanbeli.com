import { pgTable, serial, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const transactionTypeEnum = pgEnum("transaction_type", ["sale", "withdrawal", "refund", "topup"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "rejected"]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  pendingBalance: numeric("pending_balance", { precision: 15, scale: 2 }).notNull().default("0"),
  frozenBalance: numeric("frozen_balance", { precision: 15, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  orderId: integer("order_id").references(() => ordersTable.id),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Wallet = typeof walletsTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
