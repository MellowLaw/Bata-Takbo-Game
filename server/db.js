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
