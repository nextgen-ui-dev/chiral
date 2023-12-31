import { CassandraStore } from "langchain/vectorstores/cassandra";
import { env } from "~/env.mjs";
import { embeddingModel } from "~/lib/document";

const cassandraConfig = {
  cloud: {
    secureConnectBundle: env.ASTRA_SCB_PATH,
  },
  credentials: {
    username: env.ASTRA_CLIENT_ID,
    password: env.ASTRA_CLIENT_SECRET,
  },
  keyspace: env.ASTRA_KEYSPACE,
  dimensions: 1024,
  table: "test",
  indices: [{ name: "name", value: "(name)" }],
  primaryKey: {
    name: "id",
    type: "int",
  },
  metadataColumns: [
    {
      name: "name",
      type: "text",
    },
  ],
};

export const cassandraStore = new CassandraStore(
  embeddingModel,
  cassandraConfig
);