import { Client } from "cassandra-driver";
import { env } from "~/env.mjs";

export const astra = new Client({
  cloud: {
    secureConnectBundle: env.ASTRA_SCB_PATH,
  },
  credentials: {
    username: env.ASTRA_CLIENT_ID,
    password: env.ASTRA_CLIENT_SECRET,
  },
  keyspace: env.ASTRA_KEYSPACE,
});

// Create document embeddings table and connect to astra DB
void (async function () {
  try {
    await astra.connect();

    await astra.execute(`
CREATE TABLE IF NOT EXISTS document_embeddings (
  id TEXT PRIMARY KEY,
  document_id TEXT,
  line_from INT,
  line_to INT,
  text TEXT,
  embedding VECTOR<FLOAT, 1024>,
)
`);
  } catch (error) {
    console.log(error);
    await astra.shutdown();
    process.exit(1);
  }
})();
