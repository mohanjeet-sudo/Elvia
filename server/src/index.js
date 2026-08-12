import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { checkDbConnection } from './db/pool.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic liveness check — confirms the server process is up, no database needed.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Confirms the server can actually reach Postgres. Useful while wiring up
// Supabase credentials, since a wrong DATABASE_URL fails here, not silently.
app.get('/health/db', async (req, res) => {
  try {
    const now = await checkDbConnection();
    res.json({ status: 'ok', db_time: now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Elvia server listening on http://localhost:${PORT}`);
});
