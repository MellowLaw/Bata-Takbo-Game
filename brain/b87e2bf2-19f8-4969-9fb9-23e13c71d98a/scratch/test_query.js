import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Users/Lawrence/Documents/PROJECTS/Bata-Takbo---A-Survival-Game/server/.env' });

const { Pool } = pg;

async function run() {
  console.log('Connecting with DATABASE_URL:', process.env.DATABASE_URL);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`
      SELECT u.id, u.username, u.email, u.is_admin, u.banned, u.ban_reason, u.ban_appeal, u.cheat_score, u.last_login, u.created_at,
             CASE WHEN u.game_data IS NOT NULL THEN 1 ELSE 0 END as has_game_data,
             (SELECT COUNT(*) FROM inf_scores WHERE user_id = u.id) as games_played,
             (SELECT COALESCE(SUM(score), 0) FROM inf_scores WHERE user_id = u.id) as total_score
      FROM users u
      ORDER BY u.id DESC
    `);
    console.log('Query successful! Row count:', res.rows.length);
    if (res.rows.length > 0) {
      console.log('First user:', res.rows[0]);
    }
  } catch (err) {
    console.error('Query failed with error:', err);
  } finally {
    await pool.end();
  }
}

run();
