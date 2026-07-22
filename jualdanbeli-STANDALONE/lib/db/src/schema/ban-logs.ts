import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const banLogsTable = pgTable("ban_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  adminId: integer("admin_id").notNull().references(() => usersTable.id),
  action: varchar("action", { length: 20 }).notNull(), // "banned" | "suspended" | "activated"
  reason: varchar("reason", { length: 100 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
