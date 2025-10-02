import { Pool, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
});

export async function query<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}