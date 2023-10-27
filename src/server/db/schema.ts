import {
  bigint,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const workspaceProviders = pgEnum("workspace_providers", ["linear"]);

export const workspaces = pgTable(
  "workspaces",
  {
    providerId: workspaceProviders("provider_id").notNull(),
    providerWorkspaceId: text("provider_workspace_id").notNull(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    name: text("name").notNull(),
  },
  (workspace) => ({
    pk: primaryKey(
      workspace.providerId,
      workspace.providerWorkspaceId,
      workspace.accountId,
    ),
  }),
);

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  avatarUrl: text("avatar_url"),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  activeExpires: bigint("active_expires", { mode: "number" }).notNull(),
  idleExpires: bigint("idle_expires", { mode: "number" }).notNull(),
  accessToken: varchar("access_token", { length: 255 }),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  workspaceId: text("workspace_id").notNull(),
});

export const userAccounts = pgTable("user_accounts", {
  id: varchar("id", { length: 255 }).primaryKey(), // In the form of <providerId:providerUserId> e.g. google:aodwoaidhawiodh
  userId: varchar("user_id", { length: 255 }).notNull(),
  hashedPassword: varchar("hashed_password", {
    length: 255,
  }),
});
