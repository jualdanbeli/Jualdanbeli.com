import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const productConditionEnum = pgEnum("product_condition", ["new", "used"]);
export const productStatusEnum = pgEnum("product_status", ["active", "pending", "flagged", "removed"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 15, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 15, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  condition: productConditionEnum("condition").notNull(),
  status: productStatusEnum("status").notNull().default("active"),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  images: text("images").array().notNull().default([]),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  city: text("city"),
  totalSold: integer("total_sold").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true, totalSold: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
