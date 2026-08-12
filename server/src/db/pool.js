import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// A "pool" reuses a handful of open database connections instead of opening
// a brand new one for every query — much faster and avoids overwhelming Postgres.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false,
});

export async function checkDbConnection() {
  const result = await pool.query('select now()');
  return result.rows[0].now;
}
