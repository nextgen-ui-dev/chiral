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
  user: schema.users._.name,
  session: schema.sessions._.name,
  key: schema.userAccounts._.name,
};

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
