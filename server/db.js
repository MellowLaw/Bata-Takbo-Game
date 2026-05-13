import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      encrypted_data TEXT,
      game_data TEXT,
      failed_attempts INTEGER DEFAULT 0,
      lockout_time INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      banned INTEGER DEFAULT 0,
      ban_reason TEXT,
      cheat_score REAL DEFAULT 0,
      last_login INTEGER,
      reset_token TEXT,
      reset_token_expiry INTEGER,
      username_changed_at INTEGER,
      invalidate_before INTEGER
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS endless_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      survival_seconds INTEGER NOT NULL,
      control_type TEXT NOT NULL CHECK(control_type IN ('gesture', 'keyboard')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migrate older databases by adding new columns if they are missing
  try { await db.exec('ALTER TABLE users ADD COLUMN email TEXT'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN game_data TEXT'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN lockout_time INTEGER DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN ban_reason TEXT'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN cheat_score REAL DEFAULT 0'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN last_login INTEGER'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN reset_token TEXT'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN reset_token_expiry INTEGER'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN username_changed_at INTEGER'); } catch(e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN invalidate_before INTEGER'); } catch(e) {}

  // Seed data for testing (password is 'password' for all)
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password', salt);
    await db.run('INSERT OR IGNORE INTO users (username, password_hash, encrypted_data, is_admin) VALUES (?, ?, ?, ?)', ['ADMIN', hash, null, 1]);
    await db.run('INSERT OR IGNORE INTO users (username, password_hash, encrypted_data) VALUES (?, ?, ?)', ['PLAYER1', hash, null]);
    await db.run('INSERT OR IGNORE INTO users (username, password_hash, encrypted_data) VALUES (?, ?, ?)', ['TESTER', hash, null]);
    // Update existing ADMIN to have is_admin=1
    await db.run('UPDATE users SET is_admin = 1 WHERE username = ?', ['ADMIN']);

    // Ensure ADMIN always has all chapters unlocked for testing purposes
    const adminRow = await db.get('SELECT game_data FROM users WHERE username = ?', ['ADMIN']);
    if (adminRow) {
      let adminData = {};
      try {
        if (adminRow.game_data) adminData = JSON.parse(adminRow.game_data);
      } catch (e) { /* ignore parse errors */ }

      adminData.tutorialComplete = true;
      adminData.gestureSetupComplete = true;
      const existingCompleted = adminData.chapterProgress?.chaptersCompleted || [];
      const allCompleted = [1, 2, 3].reduce((arr, id) => arr.includes(id) ? arr : [...arr, id], existingCompleted);
      adminData.chapterProgress = {
        ...(adminData.chapterProgress || {}),
        chaptersUnlocked: [1, 2, 3],
        chaptersCompleted: allCompleted,
        bestScores: adminData.chapterProgress?.bestScores || {}
      };

      await db.run('UPDATE users SET game_data = ? WHERE username = ?', [JSON.stringify(adminData), 'ADMIN']);
    }
  } catch (e) {
    console.error('Error seeding data:', e);
  }

  // Database Privileges Emulation via strict permissions
  try {
    fs.chmodSync(dbPath, 0o600);
  } catch(e) {
    console.warn('Could not set strict file permissions, potentially unsupported on this OS:', e.message);
  }

  return db;
}
