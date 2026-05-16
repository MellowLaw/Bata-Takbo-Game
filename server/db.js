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

  await db.exec(`
    CREATE TABLE IF NOT EXISTS inf_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      chapter_id INTEGER NOT NULL CHECK(chapter_id IN (1, 2, 3)),
      score INTEGER NOT NULL,
      waves_survived INTEGER NOT NULL DEFAULT 0,
      survival_seconds INTEGER NOT NULL DEFAULT 0,
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
  
  // Add invalidate_before column if missing
  try {
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const hasInvalidate = tableInfo.some(c => c.name === 'invalidate_before');
    if (!hasInvalidate) {
      await db.exec(`ALTER TABLE users ADD COLUMN invalidate_before INTEGER`);
      console.log('Migration: Added invalidate_before to users table');
    }
  } catch(e) {}

  // Add created_at column if missing
  try {
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const hasCreatedAt = tableInfo.some(c => c.name === 'created_at');
    if (!hasCreatedAt) {
      await db.exec(`ALTER TABLE users ADD COLUMN created_at INTEGER`);
      console.log('Migration: Added created_at to users table');
    }
  } catch(e) {}

  // Add ban_appeal column if missing
  try {
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const hasBanAppeal = tableInfo.some(c => c.name === 'ban_appeal');
    if (!hasBanAppeal) {
      await db.exec(`ALTER TABLE users ADD COLUMN ban_appeal TEXT`);
      console.log('Migration: Added ban_appeal to users table');
    }
  } catch(e) {}

  // Add avatar_url column if missing
  try {
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const hasAvatar = tableInfo.some(c => c.name === 'avatar_url');
    if (!hasAvatar) {
      await db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT`);
      console.log('Migration: Added avatar_url to users table');
    }
  } catch(e) {}

  // ─── Seed admin accounts from .env ───────────────────────────────────────
  // Reads ADMIN_SEED_1/2/3 variables. Creates accounts only if the username
  // doesn't exist yet. Set ADMIN_SEED_FORCE=true to also update existing
  // accounts' email/password (useful when you change credentials in .env).
  try {
    const forceReseed = process.env.ADMIN_SEED_FORCE === 'true';
    if (forceReseed) {
      console.warn('[SEED] ⚠️  ADMIN_SEED_FORCE=true — will update existing admin credentials.');
      console.warn('[SEED]     Remember to set ADMIN_SEED_FORCE=false after restarting!');
    }

    // Remove legacy test accounts (ADMIN/PLAYER1/TESTER) if still present.
    for (const legacyUser of ['ADMIN', 'PLAYER1', 'TESTER']) {
      const legacy = await db.get('SELECT id FROM users WHERE username = ? COLLATE NOCASE', [legacyUser]);
      if (legacy) {
        await db.run('DELETE FROM users WHERE id = ?', [legacy.id]);
        console.log(`[SEED] Removed legacy account: ${legacyUser}`);
      }
    }

    const fullUnlockData = JSON.stringify({
      tutorialComplete: true,
      gestureSetupComplete: true,
      chapterProgress: {
        chaptersUnlocked: [1, 2, 3],
        chaptersCompleted: [1, 2, 3],
        bestScores: {}
      }
    });

    for (let i = 1; i <= 3; i++) {
      const username = process.env[`ADMIN_SEED_${i}_USERNAME`];
      const email    = process.env[`ADMIN_SEED_${i}_EMAIL`];
      const password = process.env[`ADMIN_SEED_${i}_PASSWORD`];

      if (!username || !password) continue; // slot not configured

      const existing = await db.get('SELECT id, is_admin FROM users WHERE username = ? COLLATE NOCASE', [username]);

      if (!existing) {
        // Account doesn't exist — create it fresh
        const hash = await bcrypt.hash(password, 12);
        await db.run(
          'INSERT INTO users (username, email, password_hash, is_admin, game_data) VALUES (?, ?, ?, 1, ?)',
          [username, email || null, hash, fullUnlockData]
        );
        console.log(`[SEED] ✅ Created admin account: ${username}`);

      } else if (forceReseed) {
        // Force mode — update email and rehash password
        const hash = await bcrypt.hash(password, 12);
        await db.run(
          'UPDATE users SET email = ?, password_hash = ?, is_admin = 1 WHERE id = ?',
          [email || null, hash, existing.id]
        );
        console.log(`[SEED] 🔄 Updated admin credentials: ${username}`);

      } else if (!existing.is_admin) {
        // Exists but not admin — promote
        await db.run('UPDATE users SET is_admin = 1 WHERE id = ?', [existing.id]);
        console.log(`[SEED] ⬆️  Promoted to admin: ${username}`);

      } else {
        console.log(`[SEED] ✓ Admin already exists (skipped): ${username}`);
      }
    }
  } catch (e) {
    console.error('[SEED] Error seeding admin accounts:', e);
  }



  // Database Privileges Emulation via strict permissions
  try {
    fs.chmodSync(dbPath, 0o600);
  } catch(e) {
    console.warn('Could not set strict file permissions, potentially unsupported on this OS:', e.message);
  }

  return db;
}
