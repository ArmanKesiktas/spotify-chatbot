import { Pool, QueryResultRow } from "pg";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No database connection string found");
}

console.log("Database connection string exists:", !!connectionString);
console.log("Connection string starts with:", connectionString.substring(0, 15));

const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 10_000,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    console.log("Executing SQL:", sql);
    const res = await client.query<T>(sql, params);
    console.log("Query result:", res.rows?.length, "rows");
    return res.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    client.release();
  }
}