/**
 * Applies Drizzle migrations from ./drizzle (run before server in Docker, or manually in dev).
 * Requires DATABASE_URL.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "..", "drizzle");

const client = postgres(url, { max: 1, onnotice: () => {} });
const db = drizzle(client);

try {
  await migrate(db, { migrationsFolder });
  console.log("Database migrations applied.");
} finally {
  await client.end();
}
