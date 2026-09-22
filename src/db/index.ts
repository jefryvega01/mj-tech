import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Falta la variable de entorno DATABASE_URL (cadena de conexión a Postgres). Revisa tu archivo .env."
  );
}

// Conexiones locales no necesitan SSL; proveedores en la nube como Neon,
// Supabase, etc. sí lo requieren.
const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const globalForDb = globalThis as unknown as { pgPool?: Pool };

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

export const db = drizzle(pool, { schema });
