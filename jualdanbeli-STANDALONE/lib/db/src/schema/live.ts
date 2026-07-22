import { pgTable, serial, integer, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const liveSessionsTable = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  isActive: boolean("is_active").notNull().default(false),
  viewerCount: integer("viewer_count").notNull().default(0),
  peakViewers: integer("peak_viewers").notNull().default(0),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const liveChatsTable = pgTable("live_chats", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => liveSessionsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  userName: varchar("user_name", { length: 100 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const liveFeaturedProductsTable = pgTable("live_featured_products", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => liveSessionsTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});
