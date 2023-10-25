import { lucia } from "lucia";
import { pg } from "@lucia-auth/adapter-postgresql";
import { nextjs_future } from "lucia/middleware";
import { env } from "~/env.mjs";
import { pool, authTables } from "./db";

export const enum ValidAuthProviders {
  LINEAR = "linear",
}

export const auth = lucia({
  env: env.NODE_ENV === "production" ? "PROD" : "DEV",
  adapter: pg(pool, authTables),
  middleware: nextjs_future(),
  getUserAttributes: (user) => ({ ...user }),
  getSessionAttributes: (session) => ({ ...session }),
  sessionExpiresIn: {
    activePeriod: 1000 * 3600 * 24 * 3, // 3 days
    idlePeriod: 1000 * 3600 * 8, // 8 hours
  },
});

export type Auth = typeof auth;
