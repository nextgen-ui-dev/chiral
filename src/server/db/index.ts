import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "~/env.mjs";
import * as schema from "./schema";

interface AuthTables {
  user: string;
  session: string | null;
  key: string;
}

export const authTables: AuthTables = {
  user: "users",
  session: "sessions",
  key: "user_accounts",
};

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
