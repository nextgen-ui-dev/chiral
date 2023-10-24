import { bigint, pgTable, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
});

export const userAccounts = pgTable("user_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(), // In the form of <providerId:providerUserId> e.g. google:aodwoaidhawiodh
  userId: varchar("user_id", { length: 255 }).notNull(),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});
