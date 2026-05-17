import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __envPath = path.join(__dirname, '.env');
dotenv.config({ path: __envPath });

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';
if (!process.env.JWT_SECRET || !process.env.AES_SECRET_KEY) {
  console.error('[FATAL] JWT_SECRET and AES_SECRET_KEY must be set in environment variables.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const AES_SECRET_KEY = process.env.AES_SECRET_KEY;

// Nodemailer Transporter Configuration (Check 2)
const hasEmailCreds = process.env.EMAIL_USER && process.env.EMAIL_PASS;
let transporter = null;

if (hasEmailCreds) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.error('[EMAIL] Transporter verification FAILED:', error.message);
    } else {
      console.log('[EMAIL] Transporter ready. Emails can be sent.');
    }
  });
} else {
  console.log('[EMAIL] No credentials in .env - email features disabled (OK for dev)');
}

// CORS policy: dev = Vite dev server, prod = real domain from env
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: IS_PROD ? process.env.FRONTEND_URL : 'http://localhost:5173',
  credentials: true
}));

// Raise body limit so the gesture model (KNN tensor data) fits.
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting: 25 requests per minute for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  message: { error: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/auth', authLimiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reset requests. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const tokenBlacklist = new Set();

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  if (tokenBlacklist.has(token)) return res.status(401).json({ error: 'Token invalidated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.get('SELECT invalidate_before FROM users WHERE id = ?', [decoded.id]);
    if (user && user.invalidate_before && decoded.iat * 1000 < user.invalidate_before) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware - checks if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await db.get('SELECT is_admin, banned FROM users WHERE id = ?', [req.user.id]);
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (user.banned) {
      return res.status(403).json({ error: 'Account banned' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

let db;

// Basic validation for username
// A-Z, a-z, 0-9, _, - and length 3-20
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) return false;
  
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(trimmed);
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(trimmed) && trimmed.length <= 255;
}

app.post('/auth/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Sanitize & Validate input
    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }
    
    const sanitizedUsername = username.trim();
    
    // Parameterized query to prevent SQL Injection
    const user = await db.get('SELECT id, username FROM users WHERE LOWER(username) = LOWER(?)', [sanitizedUsername]);
    
    if (user) {
      return res.status(200).json({ exists: true, username: user.username });
    } else {
      return res.status(404).json({ exists: false });
    }
  } catch (err) {
    console.error('Check username error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || typeof username !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid registration details' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8 || password.length > 50) {
      return res.status(400).json({ error: 'Password must be between 8 and 50 characters' });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one special character' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }

    if (/\s/.test(password)) {
      return res.status(400).json({ error: 'Password cannot contain spaces' });
    }

    const sanitizedUsername = username.trim();
    const sanitizedEmail = email.trim();

    // Check if user already exists
    const existing = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [sanitizedUsername]);
    if (existing) {
      return res.status(400).json({ error: 'Username already taken. Please try another.' });
    }

    const existingEmail = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [sanitizedEmail]);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered. Please login or try another.' });
    }

    // Hash password with bcrypt cost 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Encrypt initial user data with AES-256
    const initialData = JSON.stringify({ registeredAt: Date.now() });
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(AES_SECRET_KEY, 'hex'), iv);
    
    let encryptedData = cipher.update(initialData, 'utf8', 'base64');
    encryptedData += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');
    const ivBase64 = iv.toString('base64');
    
    const dbEncryptedString = JSON.stringify({ iv: ivBase64, data: encryptedData, tag: authTag });

    // Insert user safely mapped into the database using param queries
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash, encrypted_data, created_at) VALUES (?, ?, ?, ?, ?)',
      [sanitizedUsername, sanitizedEmail, passwordHash, dbEncryptedString, Date.now()]
    );

    // After success, instantly log them in using identically constructed JWT token logic 
    const token = jwt.sign({ id: result.lastID, username: sanitizedUsername }, JWT_SECRET, { expiresIn: '30d' });
      
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 2592000000,
      secure: IS_PROD,
      sameSite: 'lax'
    });

    return res.status(200).json({ success: true, message: 'Account created efficiently!' });

  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Username already taken.' });
    }
    console.error('Registration internal tracking error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid credentials' });
    }
    
    const sanitizedUsername = username.trim();
    const user = await db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)', [sanitizedUsername, sanitizedUsername]);
    
    if (!user) {
      // Intentionally generic error
      return res.status(401).json({ error: 'Incorrect password. Try again.' }); 
    }

    // Check lockout
    if (user.lockout_time > Date.now()) {
      return res.status(401).json({ error: 'Too many attempts. Try again later.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (isValid) {
      if (user.banned) {
        return res.status(403).json({ 
          error: 'BANNED', 
          reason: user.ban_reason,
          appeal_status: user.ban_appeal ? 'pending' : 'none',
          username: user.username // pass back username so client can use it for appeal
        });
      }

      // Reset attempts and record last login
      await db.run('UPDATE users SET failed_attempts = 0, lockout_time = 0, last_login = ? WHERE id = ?', [Date.now(), user.id]);
      
      // Issue a signed JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
      
      // Store JWT in an HttpOnly secure cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 2592000000, // 30 days
        secure: IS_PROD,
        sameSite: 'lax'
      });

      let gameData = null;
      try {
        if (user.game_data) gameData = JSON.parse(user.game_data);
      } catch (e) {
        console.error('Failed to parse game data on login:', e);
      }

      // Load gesture model from its dedicated table
      const modelRow = await db.get('SELECT model_data FROM user_gesture_models WHERE user_id = ?', [user.id]);
      if (modelRow && modelRow.model_data) {
        try {
          if (!gameData) gameData = {};
          gameData.gestureModel = JSON.parse(modelRow.model_data);
        } catch(e) { /* ignore */ }
      }

      console.log(`[LOGIN] user=${user.username} returning: tutorialComplete=${gameData?.tutorialComplete} gestureSetupComplete=${gameData?.gestureSetupComplete} chaptersUnlocked=${gameData?.chapterProgress?.chaptersUnlocked} hasModel=${!!gameData?.gestureModel}`);

      return res.status(200).json({ success: true, gameData });
    } else {
      let attempts = user.failed_attempts + 1;
      let lockoutTime = 0;
      let msg = 'Incorrect password. Try again.';
      
      if (attempts >= 5) {
        lockoutTime = Date.now() + 15 * 60 * 1000; // 15 mins
        msg = 'Too many attempts. Try again later.';
      }
      
      await db.run('UPDATE users SET failed_attempts = ?, lockout_time = ? WHERE id = ?', [attempts, lockoutTime, user.id]);
      return res.status(401).json({ error: msg });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/appeal-ban', async (req, res) => {
  try {
    const { username, password, appeal } = req.body;
    if (!username || !password || !appeal || appeal.trim() === '') {
      return res.status(400).json({ error: 'Missing information' });
    }

    const sanitizedUsername = username.trim();
    const user = await db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [sanitizedUsername]);
    
    if (!user) return res.status(401).json({ error: 'Authentication failed' });
    if (!user.banned) return res.status(400).json({ error: 'User is not banned' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Authentication failed' });

    await db.run('UPDATE users SET ban_appeal = ? WHERE id = ?', [appeal.trim(), user.id]);
    return res.status(200).json({ success: true, message: 'Appeal submitted successfully' });
  } catch (err) {
    console.error('Appeal error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let registeredAt = null;
    try {
      if (user.encrypted_data) {
        const { iv, data, tag } = JSON.parse(user.encrypted_data);
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(AES_SECRET_KEY, 'hex'), Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(tag, 'base64'));
        let decrypted = decipher.update(data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        const parsed = JSON.parse(decrypted);
        registeredAt = parsed.registeredAt;
      }
    } catch(e) {
      console.error('Failed to decrypt user data:', e);
    }

    return res.status(200).json({
      username: user.username,
      email: user.email || null,
      accountType: 'Registered',
      registeredAt: registeredAt,
      avatar_url: user.avatar_url || null
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/save-data', authMiddleware, async (req, res) => {
  try {
    const { settings, tutorialComplete, gestureSetupComplete, chapterProgress, bestiary, gestureModel } = req.body;
    console.log(`[SAVE] user=${req.user.username} id=${req.user.id} incoming: tutorialComplete=${tutorialComplete} gestureSetupComplete=${gestureSetupComplete} chaptersUnlocked=${chapterProgress?.chaptersUnlocked}`);

    // Merge with existing game_data so partial saves don't wipe other fields.
    let existing = {};
    try {
      const row = await db.get('SELECT game_data FROM users WHERE id = ?', [req.user.id]);
      if (row && row.game_data) existing = JSON.parse(row.game_data) || {};
    } catch (e) { /* ignore */ }

    // gestureModel is stored in its own table to keep users table lean
    const gameData = {
      ...existing,
      ...(settings !== undefined ? { settings } : {}),
      ...(tutorialComplete !== undefined ? { tutorialComplete } : {}),
      ...(gestureSetupComplete !== undefined ? { gestureSetupComplete } : {}),
      ...(chapterProgress !== undefined ? { chapterProgress } : {}),
      ...(bestiary !== undefined ? { bestiary } : {}),
    };

    await db.run('UPDATE users SET game_data = ? WHERE id = ?', [JSON.stringify(gameData), req.user.id]);

    // Save gesture model to its own table if provided
    if (gestureModel !== undefined && gestureModel !== null) {
      const upsertSql = `INSERT INTO user_gesture_models (user_id, model_data, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET model_data = EXCLUDED.model_data, updated_at = EXCLUDED.updated_at`;
      await db.pool.query(upsertSql, [req.user.id, JSON.stringify(gestureModel), Date.now()]);
    }

    // Read it back to confirm what's actually persisted.
    const verifyRow = await db.get('SELECT game_data FROM users WHERE id = ?', [req.user.id]);
    let stored = null;
    try { stored = verifyRow && verifyRow.game_data ? JSON.parse(verifyRow.game_data) : null; } catch(e) {}
    console.log(`[SAVE] user=${req.user.username} stored: tutorialComplete=${stored?.tutorialComplete} gestureSetupComplete=${stored?.gestureSetupComplete} chaptersUnlocked=${stored?.chapterProgress?.chaptersUnlocked}`);

    // Echo the persisted state back so the client can verify.
    return res.status(200).json({ success: true, gameData: stored });
  } catch (err) {
    console.error('Save data error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /auth/me — authoritative load of the player's saved game state.
 * The login endpoint also returns gameData inline, but using this endpoint
 * after login gives us a clean, verifiable second pass and avoids any race
 * between cookie set and state hydration.
 */
app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const row = await db.get('SELECT username, game_data FROM users WHERE id = ?', [req.user.id]);
    if (!row) return res.status(404).json({ error: 'User not found' });

    let gameData = null;
    try {
      if (row.game_data) gameData = JSON.parse(row.game_data);
    } catch(e) {
      console.error('[ME] Failed to parse game_data for', row.username, e);
    }

    // Load gesture model from its dedicated table
    const modelRow = await db.get('SELECT model_data FROM user_gesture_models WHERE user_id = ?', [req.user.id]);
    if (modelRow && modelRow.model_data) {
      try {
        if (!gameData) gameData = {};
        gameData.gestureModel = JSON.parse(modelRow.model_data);
      } catch(e) { /* ignore malformed model */ }
    }

    console.log(`[ME] user=${row.username} returning: tutorialComplete=${gameData?.tutorialComplete} gestureSetupComplete=${gameData?.gestureSetupComplete} chaptersUnlocked=${gameData?.chapterProgress?.chaptersUnlocked} hasModel=${!!gameData?.gestureModel}`);

    return res.status(200).json({ username: row.username, gameData });
  } catch (err) {
    console.error('/auth/me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || typeof currentPassword !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid required fields' });
    }

    if (newPassword.length < 8 || newPassword.length > 50) {
      return res.status(400).json({ error: 'New password must be 8-50 characters' });
    }

    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }

    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one special character' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }

    if (/\s/.test(newPassword)) {
      return res.status(400).json({ error: 'Password cannot contain spaces' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/auth/change-username', authMiddleware, async (req, res) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername || typeof newUsername !== 'string') return res.status(400).json({ error: 'New username is required and must be a string' });

    if (!isValidUsername(newUsername)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens' });
    }

    const trimmed = newUsername.trim();

    const existing = await db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?', [trimmed, req.user.id]);
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const currentUser = await db.get('SELECT username_changed_at FROM users WHERE id = ?', [req.user.id]);
    if (currentUser && currentUser.username_changed_at) {
      const cooldownMs = 7 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - currentUser.username_changed_at;
      if (elapsed < cooldownMs) {
        const daysLeft = Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000));
        return res.status(429).json({ error: `You can change your username again in ${daysLeft} day(s).` });
      }
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE users SET username = $1, username_changed_at = $2 WHERE id = $3', [trimmed, Date.now(), req.user.id]);
      await client.query('UPDATE endless_scores SET username = $1 WHERE user_id = $2', [trimmed, req.user.id]);
      await client.query('UPDATE inf_scores SET username = $1 WHERE user_id = $2', [trimmed, req.user.id]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const newToken = jwt.sign({ id: req.user.id, username: trimmed }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('jwt', newToken, {
      httpOnly: true,
      maxAge: 2592000000,
      secure: IS_PROD,
      sameSite: 'lax'
    });

    return res.status(200).json({ success: true, username: trimmed });
  } catch (err) {
    console.error('Change username error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Change Avatar Endpoint ---
app.post('/auth/change-avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (avatarUrl !== null && typeof avatarUrl !== 'string') {
      return res.status(400).json({ error: 'Invalid avatar data type' });
    }

    if (avatarUrl) {
      const isDataUrl = avatarUrl.startsWith('data:image/');
      const isHttpUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://');

      if (!isDataUrl && !isHttpUrl) {
        return res.status(400).json({ error: 'Must be a valid image URL or uploaded image file' });
      }

      // Limit base64 size to ~2MB (base64 is ~1.37x the binary size)
      if (isDataUrl && avatarUrl.length > 2 * 1024 * 1024 * 1.37) {
        return res.status(413).json({ error: 'Image is too large. Please use an image under 2MB.' });
      }
    }

    await db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl || null, req.user.id]);
    res.json({ success: true, avatarUrl: avatarUrl || null });
  } catch (error) {
    console.error('Change avatar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/change-email', authMiddleware, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || typeof newEmail !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required and must be text' });
    }

    if (!isValidEmail(newEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const user = await db.get('SELECT id, password_hash FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    const existing = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?', [newEmail.trim(), req.user.id]);
    if (existing) return res.status(409).json({ error: 'That email is already in use by another account' });

    await db.run('UPDATE users SET email = ? WHERE id = ?', [newEmail.trim().toLowerCase(), req.user.id]);
    return res.status(200).json({ success: true, message: 'Email updated successfully' });
  } catch (err) {
    console.error('Change email error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/logout-all', authMiddleware, async (req, res) => {
  try {
    await db.run('UPDATE users SET invalidate_before = ? WHERE id = ?', [Date.now(), req.user.id]);
    const token = req.cookies.jwt;
    if (token) tokenBlacklist.add(token);
    res.clearCookie('jwt', { httpOnly: true, secure: IS_PROD, sameSite: 'lax' });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Logout all error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/logout', authMiddleware, (req, res) => {
  const token = req.cookies.jwt;
  if (token) tokenBlacklist.add(token);
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax'
  });
  return res.status(200).json({ success: true });
});
app.delete('/auth/delete-account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'A valid password is required to delete your account' });

    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Incorrect password' });

    await db.run('DELETE FROM users WHERE id = ?', [req.user.id]);

    // Invalidate JWT cookie
    const token = req.cookies.jwt;
    if (token) tokenBlacklist.add(token);
    res.clearCookie('jwt', { httpOnly: true, secure: IS_PROD, sameSite: 'lax' });

    return res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/admin/delete-user', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account from admin panel' });
    }

    const target = await db.get('SELECT id, username, is_admin FROM users WHERE id = ?', [userId]);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.is_admin) {
      return res.status(403).json({ error: 'Cannot delete another admin account' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [userId]);

    return res.status(200).json({ success: true, message: `User ${target.username} deleted` });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/forgot-username', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const sanitizedEmail = email.trim();
    const user = await db.get('SELECT username FROM users WHERE LOWER(email) = LOWER(?)', [sanitizedEmail]);

    if (user) {
      const mailOptions = {
        from: process.env.EMAIL_USER || '"Bata Takbo Support" <noreply@batatakbo.com>',
        to: sanitizedEmail,
        subject: 'Your Bata, Takbo! Username',
        html: `
          <div style="font-family: monospace; background: #130f04; color: #f0e6d3; padding: 32px; max-width: 480px; margin: 0 auto; border-radius: 8px;">
            <h2 style="color: #E4CFC0; letter-spacing: 2px;">BATA, TAKBO!</h2>
            <p>Here is your username:</p>
            <div style="background: #201c11; border: 1px solid #E4CFC0; border-radius: 4px; padding: 16px; text-align: center; font-size: 1.4rem; letter-spacing: 3px; margin: 16px 0;">${user.username}</div>
            <p style="color: #5a5068; font-size: 0.8rem;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      };
      if (transporter) {
        try { await transporter.sendMail(mailOptions); } catch (mailErr) { console.error('Forgot username mail error:', mailErr); }
      } else {
        console.log('[EMAIL] Would send forgot username email to:', sanitizedEmail);
      }
    }

    return res.status(200).json({ success: true, message: 'If that email is registered, your username has been sent.' });
  } catch (err) {
    console.error('Forgot username error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const sanitizedEmail = email.trim();
    const user = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [sanitizedEmail]);

    if (user) {
      const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
      const expiry = Date.now() + 15 * 60 * 1000; // 15 mins

      await db.run('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [code, expiry, user.id]);

      const mailOptions = {
        from: process.env.EMAIL_USER || '"Bata Takbo Support" <noreply@batatakbo.com>',
        to: sanitizedEmail,
        subject: 'Your Password Reset Code — Bata, Takbo!',
        html: `
          <div style="font-family: monospace; background: #130f04; color: #f0e6d3; padding: 32px; max-width: 480px; margin: 0 auto; border-radius: 8px;">
            <h2 style="color: #E4CFC0; letter-spacing: 2px; margin-bottom: 0.5rem;">BATA, TAKBO!</h2>
            <p style="color: #a89b8c; font-size: 0.9rem; margin-bottom: 1.5rem;">You requested a password reset. Enter this code in the app:</p>
            <div style="background: #201c11; border: 2px solid #E4CFC0; border-radius: 4px; padding: 20px; text-align: center; font-size: 2.5rem; letter-spacing: 8px; margin: 0 0 1.5rem; color: #fff;">${code}</div>
            <p style="color: #a89b8c; font-size: 0.8rem; margin-bottom: 0.5rem;">This code expires in <b style="color:#f0e6d3;">15 minutes</b>.</p>
            <p style="color: #5a5068; font-size: 0.75rem;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      };

      if (transporter) {
        try {
          console.log(`[INFO] Sending reset code to: ${sanitizedEmail}`);
          await transporter.sendMail(mailOptions);
          console.log(`[INFO] Reset code sent to: ${sanitizedEmail}`);
        } catch (emailErr) {
          console.error(`[ERROR] Failed to send reset code to ${sanitizedEmail}:`, emailErr);
        }
      } else {
        console.log(`[EMAIL] Would send reset code to: ${sanitizedEmail} (dev mode)`);
      }
    }

    return res.status(200).json({ success: true, message: 'If that email is registered, a 6-digit code was sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const user = await db.get('SELECT id, reset_token, reset_token_expiry FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    if (!user || user.reset_token !== String(code).trim()) {
      return res.status(400).json({ error: 'Incorrect code. Please check your email and try again.' });
    }
    if (Date.now() > user.reset_token_expiry) {
      return res.status(400).json({ error: 'expired' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Verify reset code error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Missing required fields' });

    // Validate password complexity
    if (newPassword.length < 8 || newPassword.length > 50) {
      return res.status(400).json({ error: 'Password must be between 8 and 50 characters' });
    }
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one number' });
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one special character' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
    }
    if (/\s/.test(newPassword)) {
      return res.status(400).json({ error: 'Password cannot contain spaces' });
    }

    const user = await db.get('SELECT id, reset_token, reset_token_expiry FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

    if (!user || user.reset_token !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }
    if (Date.now() > user.reset_token_expiry) {
      return res.status(400).json({ error: 'expired' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [newHash, user.id]);

    return res.status(200).json({ success: true, message: 'Password has been successfully reset.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/auth/guest-scores', (req, res) => {
  // Placeholder endpoint for guest cleanup
  return res.status(200).json({ success: true });
});

// ========== ADMIN ENDPOINTS ==========

// Check if current user is admin
app.get('/admin/check', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT is_admin, banned FROM users WHERE id = ?', [req.user.id]);
    if (!user || user.banned) {
      return res.status(403).json({ isAdmin: false, error: 'Account banned' });
    }
    return res.status(200).json({ isAdmin: !!user.is_admin });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
app.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await db.all(`
      SELECT u.id, u.username, u.email, u.is_admin, u.banned, u.ban_reason, u.ban_appeal, u.cheat_score, u.last_login, u.created_at,
             CASE WHEN u.game_data IS NOT NULL THEN 1 ELSE 0 END as has_game_data,
             (SELECT COUNT(*) FROM inf_scores WHERE user_id = u.id) + (SELECT COUNT(*) FROM endless_scores WHERE user_id = u.id) as games_played,
             (SELECT COALESCE(SUM(score), 0) FROM inf_scores WHERE user_id = u.id) as total_score
      FROM users u
      ORDER BY u.id DESC
    `);
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = (await db.get('SELECT COUNT(*) as c FROM users')).c;
    const totalInfGames = (await db.get('SELECT COUNT(*) as c FROM inf_scores')).c;
    const totalEndlessGames = (await db.get('SELECT COUNT(*) as c FROM endless_scores')).c;
    // PostgreSQL: get approximate db size via pg_database
    const dbSizeRow = await db.get(`SELECT pg_database_size(current_database()) as size`);
    const dbSize = parseInt(dbSizeRow?.size || 0);
    const uptime = process.uptime();
    
    const recentScores = await db.all("SELECT username, 'Chapter ' || chapter_id as action, created_at as time, score as value FROM inf_scores ORDER BY created_at DESC LIMIT 20");
    const recentLogins = await db.all("SELECT username, 'Login' as action, last_login as time, 0 as value FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT 20");
    const recentRegs = await db.all("SELECT username, 'Registered' as action, created_at as time, 0 as value FROM users WHERE created_at IS NOT NULL ORDER BY created_at DESC LIMIT 20");
    
    let activity = [...recentScores, ...recentLogins, ...recentRegs]
      .sort((a,b) => b.time - a.time)
      .slice(0, 20);
      
    return res.status(200).json({
      stats: { totalUsers, totalGamesPlayed: totalInfGames + totalEndlessGames, totalInfGames, totalEndlessGames, dbSize, uptime },
      activity
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

app.post('/admin/force-logout', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    await db.run('UPDATE users SET invalidate_before = ? WHERE id = ?', [Date.now(), userId]);
    return res.status(200).json({ success: true, message: 'User forced to logout on next request' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Ban/unban user (admin only)
app.post('/admin/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, banned, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Prevent banning yourself or other admins
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }
    const targetUser = await db.get('SELECT is_admin FROM users WHERE id = ?', [userId]);
    if (targetUser && targetUser.is_admin) {
      return res.status(403).json({ error: 'Cannot ban an admin account' });
    }
    
    await db.run(
      'UPDATE users SET banned = ?, ban_reason = ?, ban_appeal = CASE WHEN ? = 0 THEN NULL ELSE ban_appeal END WHERE id = ?',
      [banned ? 1 : 0, reason || null, banned ? 1 : 0, userId]
    );
    
    return res.status(200).json({ 
      success: true, 
      message: banned ? 'User banned' : 'User unbanned',
      userId 
    });
  } catch (err) {
    console.error('Admin ban error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset user progress (admin only)
app.post('/admin/reset-progress', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Block resetting another admin's progress
    const targetUser = await db.get('SELECT is_admin FROM users WHERE id = ?', [userId]);
    if (targetUser && targetUser.is_admin && parseInt(userId) !== req.user.id) {
      return res.status(403).json({ error: 'Cannot reset another admin\'s progress' });
    }

    // Reset game_data to null (will use defaults on next login)
    await db.run('UPDATE users SET game_data = NULL WHERE id = ?', [userId]);
    
    return res.status(200).json({ 
      success: true, 
      message: 'User progress reset',
      userId 
    });
  } catch (err) {
    console.error('Admin reset error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard with cheat scores (admin only)
app.get('/admin/leaderboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const infScores = await db.all('SELECT s.id, s.user_id, s.username, s.chapter_id, s.score, s.waves_survived, s.survival_seconds, s.control_type, s.created_at, u.banned, u.cheat_score FROM inf_scores s JOIN users u ON s.user_id = u.id ORDER BY s.score DESC');
    const endlessScores = await db.all('SELECT s.id, s.user_id, s.username, s.survival_seconds, s.control_type, s.created_at, u.banned, u.cheat_score FROM endless_scores s JOIN users u ON s.user_id = u.id ORDER BY s.survival_seconds DESC');
    
    const flaggedInf = infScores.map(s => {
      let suspicious = s.cheat_score > 50;
      if (s.score > 5000 && s.survival_seconds < 30) suspicious = true;
      if (s.score > 25000) suspicious = true;
      return { ...s, type: 'inf', suspicious };
    });
    
    const flaggedEndless = endlessScores.map(s => {
      let suspicious = s.cheat_score > 50;
      if (s.survival_seconds > 3600) suspicious = true; // Over 1 hour endless
      return { ...s, type: 'endless', suspicious };
    });
    
    return res.status(200).json({ leaderboard: { inf: flaggedInf, endless: flaggedEndless } });
  } catch (err) {
    console.error('Admin leaderboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/admin/delete-score', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id, type } = req.body;
    if (type === 'inf') await db.run('DELETE FROM inf_scores WHERE id = ?', [id]);
    else if (type === 'endless') await db.run('DELETE FROM endless_scores WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Score deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mark suspicious user (admin only)
app.post('/admin/mark-cheat', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, cheatScore, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const MAX_CHEAT_SCORE = 999;
    await db.run(
      'UPDATE users SET cheat_score = MIN(cheat_score + ?, ?), ban_reason = COALESCE(ban_reason, ?) WHERE id = ?',
      [cheatScore || 10, MAX_CHEAT_SCORE, reason || 'Suspicious activity', userId]
    );

    return res.status(200).json({ success: true, message: 'User marked' });
  } catch (err) {
    console.error('Admin mark cheat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset cheat score (admin only)
app.post('/admin/reset-cheat', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    await db.run('UPDATE users SET cheat_score = 0, ban_reason = NULL WHERE id = ?', [userId]);
    return res.status(200).json({ success: true, message: 'Cheat score cleared' });
  } catch (err) {
    console.error('Admin reset cheat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Issue a signed short-lived test-mode token (admin only)
app.post('/admin/test-token', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { mode, chapterId, invincible, oneHitKill, attackId } = req.body;
    const payload = { mode, chapterId, invincible, oneHitKill, attackId };
    // 30-second TTL — just long enough to navigate from dashboard to game scene
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30s' });
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify a test-mode token and return its settings (admin only)
app.post('/admin/verify-test-token', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false, error: 'No token provided' });
    const settings = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ valid: true, settings });
  } catch (err) {
    return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// ========== ENDLESS LEADERBOARD ==========

// Submit endless score (registered users only)
app.post('/leaderboard/endless', authMiddleware, async (req, res) => {
  try {
    const { survivalSeconds, controlType } = req.body;
    if (!survivalSeconds || !controlType) return res.status(400).json({ error: 'Missing survivalSeconds or controlType' });
    if (!['gesture', 'keyboard'].includes(controlType)) return res.status(400).json({ error: 'Invalid controlType' });
    if (typeof survivalSeconds !== 'number' || survivalSeconds < 0 || survivalSeconds > 86400) {
      return res.status(400).json({ error: 'Invalid survivalSeconds' });
    }

    const user = await db.get('SELECT username, banned, is_admin FROM users WHERE id = ?', [req.user.id]);
    if (!user || user.banned) return res.status(403).json({ error: 'Forbidden' });
    if (user.is_admin) return res.status(403).json({ error: 'Admin accounts cannot submit scores' });

    await db.run(
      'INSERT INTO endless_scores (user_id, username, survival_seconds, control_type, created_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, user.username, Math.floor(survivalSeconds), controlType, Date.now()]
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Endless score submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get endless leaderboard (top 20 per control type, best score per user)
app.get('/leaderboard/endless', async (req, res) => {
  try {
    const { controlType } = req.query;
    if (!controlType || !['gesture', 'keyboard'].includes(controlType)) {
      return res.status(400).json({ error: 'Invalid or missing controlType' });
    }

    const rows = await db.all(`
      SELECT e.username, MAX(e.survival_seconds) AS best_seconds
      FROM endless_scores e
      INNER JOIN users u ON e.user_id = u.id
      WHERE e.control_type = ? AND u.banned = FALSE AND u.is_admin = FALSE
      GROUP BY e.user_id, e.username
      ORDER BY best_seconds DESC
      LIMIT 20
    `, [controlType]);

    return res.status(200).json({ entries: rows });
  } catch (err) {
    console.error('Endless leaderboard fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== INF LEADERBOARD ==========

// Submit INF score (registered users only)
app.post('/leaderboard/inf', authMiddleware, async (req, res) => {
  try {
    const { chapterId, score, wavesSurvived, survivalSeconds, controlType } = req.body;
    if (!chapterId || score == null || !controlType) return res.status(400).json({ error: 'Missing required fields' });
    if (![1, 2, 3].includes(Number(chapterId))) return res.status(400).json({ error: 'Invalid chapterId' });
    if (!['gesture', 'keyboard'].includes(controlType)) return res.status(400).json({ error: 'Invalid controlType' });
    if (typeof score !== 'number' || score < 0 || score > 9999999) return res.status(400).json({ error: 'Invalid score' });

    const user = await db.get('SELECT username, banned, is_admin FROM users WHERE id = ?', [req.user.id]);
    if (!user || user.banned) return res.status(403).json({ error: 'Forbidden' });
    if (user.is_admin) return res.status(403).json({ error: 'Admin accounts cannot submit scores' });

    await db.run(
      'INSERT INTO inf_scores (user_id, username, chapter_id, score, waves_survived, survival_seconds, control_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, user.username, Number(chapterId), Math.floor(score), Math.floor(wavesSurvived) || 0, Math.floor(survivalSeconds) || 0, controlType, Date.now()]
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('INF score submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get INF leaderboard (top 20 per chapter + control type, best score per user)
app.get('/leaderboard/inf', async (req, res) => {
  try {
    const { chapterId, controlType } = req.query;
    if (!chapterId || ![1, 2, 3].includes(Number(chapterId))) return res.status(400).json({ error: 'Invalid or missing chapterId' });
    if (!controlType || !['gesture', 'keyboard'].includes(controlType)) return res.status(400).json({ error: 'Invalid or missing controlType' });

    const rows = await db.all(`
      SELECT i.username, MAX(i.score) AS best_score,
             i.waves_survived, i.survival_seconds
      FROM inf_scores i
      INNER JOIN users u ON i.user_id = u.id
      WHERE i.chapter_id = ? AND i.control_type = ? AND u.banned = FALSE AND u.is_admin = FALSE
      GROUP BY i.user_id, i.username, i.waves_survived, i.survival_seconds
      ORDER BY best_score DESC
      LIMIT 20
    `, [Number(chapterId), controlType]);

    return res.status(200).json({ entries: rows });
  } catch (err) {
    console.error('INF leaderboard fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database and start server
initDb().then(database => {
  db = database;
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
