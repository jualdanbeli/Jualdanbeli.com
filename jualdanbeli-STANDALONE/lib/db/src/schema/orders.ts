import { pgTable, serial, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment", "paid", "confirmed", "shipped", "delivered", "completed", "cancelled", "disputed"
]);
export const escrowStatusEnum = pgEnum("escrow_status", ["holding", "released", "refunded"]);
export const disputeStatusEnum = pgEnum("dispute_status", [
  "open", "investigating", "resolved_buyer", "resolved_seller", "closed"
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => usersTable.id),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 15, scale: 2 }).notNull().default("0"),
  shippingAddress: text("shipping_address").notNull(),
  courierId: integer("courier_id"),
  trackingNumber: text("tracking_number"),
  escrowStatus: escrowStatusEnum("escrow_status").notNull().default("holding"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }).notNull(),
});

export const disputesTable = pgTable("disputes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id).unique(),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  disputeType: text("dispute_type").notNull().default("other"),
  courierName: text("courier_name"),
  trackingNumber: text("tracking_number"),
  escalatedToCourier: text("escalated_to_courier").default("no"),
  escalatedAt: timestamp("escalated_at"),
  insuranceClaimStatus: text("insurance_claim_status").default("none"),
  insuranceClaimId: text("insurance_claim_id"),
  insuranceAmount: numeric("insurance_amount", { precision: 15, scale: 2 }),
  status: disputeStatusEnum("status").notNull().default("open"),
  ruling: text("ruling"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type Dispute = typeof disputesTable.$inferSelect;
