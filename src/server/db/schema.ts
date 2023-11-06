import {
  bigint,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  integer,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const workspaceProviders = pgEnum("workspace_providers", ["linear"]);
export const chatSenders = pgEnum("chat_senders", ["system", "user"]);

export const documentMessages = pgTable("document_messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  documentId: varchar("document_id", { length: 255 }).notNull(),
  sender: chatSenders("sender").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    providerDocumentId: text("provider_document_id").notNull(),
    workspaceId: text("workspace_id").notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
  },
  (document) => ({
    unq: unique().on(
      document.providerDocumentId,
      document.workspaceId,
      document.userId,
    ),
  }),
);

export const generatedIssues = pgTable(
  "generated_issues",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    providerIssueId: text("provider_issue_id").notNull(),
    workspaceId: text("workspace_id").notNull(),
    teamId: varchar("team_id", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
  },
  (issue) => ({
    unq: unique().on(
      issue.providerIssueId,
      issue.workspaceId,
      issue.teamId,
      issue.userId,
    ),
  }),
);

export const generatedIssueDetail = pgTable("generated_issue_detail", {
  id: varchar("id", { length: 255 }).primaryKey(),
  issueId: varchar("issue_id", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: integer("priority"),
});

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
