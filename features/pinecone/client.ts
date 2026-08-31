import { Pinecone } from "@pinecone-database/pinecone";
import { NonRetriableError } from "inngest";

let pinecone: Pinecone | null = null;

function requireEnv(name: "PINECONE_API_KEY" | "PINECONE_INDEX") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new NonRetriableError(
      `Missing ${name} in .env. Add PINECONE_API_KEY from Pinecone → API keys, and PINECONE_INDEX as the index name you created (e.g. sudan-review). Restart npm run dev after saving.`
    );
  }

  return value;
}

export function getPineconeIndex() {
  const apiKey = requireEnv("PINECONE_API_KEY");
  const indexName = requireEnv("PINECONE_INDEX");

  if (!pinecone) {
    pinecone = new Pinecone({ apiKey });
  }

  return pinecone.index({ name: indexName });
}
