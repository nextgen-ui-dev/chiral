import { lucia } from "lucia";
import { pg } from "@lucia-auth/adapter-postgresql";
import { nextjs_future } from "lucia/middleware";
import { env } from "~/env.mjs";
import { pool, authTables } from "./db";

export const auth = lucia({
  env: env.NODE_ENV === "production" ? "PROD" : "DEV",
  adapter: pg(pool, authTables),
  middleware: nextjs_future(),
});

export type Auth = typeof auth;
