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

void (async function () {
  try {
    await astra.connect();

    // Create document embeddings table
    await astra.execute(`
CREATE TABLE IF NOT EXISTS document_embeddings (
  id TEXT,
  document_id TEXT,
  line_from INT,
  line_to INT,
  text TEXT,
  embedding VECTOR<FLOAT, 1024>,
  created_at TIMESTAMP,

  PRIMARY KEY((document_id), created_at, id)
) WITH CLUSTERING ORDER BY (created_at DESC, id DESC)
`);

    // Create index on embeddings
    await astra.execute(`
CREATE CUSTOM INDEX IF NOT EXISTS
ON document_embeddings (embedding) 
USING 'StorageAttachedIndex'
WITH OPTIONS = {'similarity_function': 'COSINE'};
    `);
  } catch (error) {
    console.log(error);
    await astra.shutdown();
    process.exit(1);
  }
})();
