import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const couriersTable = pgTable("couriers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  logoUrl: text("logo_url").notNull(),
});

export type Courier = typeof couriersTable.$inferSelect;
