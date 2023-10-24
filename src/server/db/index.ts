import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "~/env.mjs";
import * as schema from "./schema";

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
