import { pgTable, serial, integer, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const billTypeEnum = pgEnum("bill_type", [
  "pln_pascabayar",
  "pln_prepaid",
  "bpjs_kesehatan",
  "bpjs_ketenagakerjaan",
  "pdam",
  "telepon",
  "internet",
  "finance",
  "tv_kabel",
  "pulsa",
  "paket_data",
  "pbb",
  "stnk",
  "gas",
]);

export const billPaymentStatusEnum = pgEnum("bill_payment_status", [
  "pending",
  "success",
  "failed",
]);

export const billPaymentsTable = pgTable("bill_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  billType: billTypeEnum("bill_type").notNull(),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  adminFee: numeric("admin_fee", { precision: 15, scale: 0 }).notNull().default("2500"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 }).notNull(),
  status: billPaymentStatusEnum("status").notNull().default("pending"),
  referenceNo: text("reference_no"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
