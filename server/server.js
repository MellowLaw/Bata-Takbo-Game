import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'super_secret_jwt_key_at_least_256_bits_long_1234567890_abcdefghij';
const AES_SECRET_KEY = 'stable_secure_backend_aes_256_ky'; // exactly 32 bytes

// CORS policy: strictly allow only the Vite development server origin
app.use(cors({
  origin: 'http://localhost:5173',
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

const tokenBlacklist = new Set();

const authMiddleware = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  if (tokenBlacklist.has(token)) return res.status(401).json({ error: 'Token invalidated' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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

// DEBUG: Simple test endpoint to verify server is running updated code
app.get('/test', (req, res) => {
  return res.json({ message: 'Server is running updated code', timestamp: Date.now() });
});

// Basic validation for username
// A-Z, a-z, 0-9, _, - and length 3-20
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) return false;
  
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(trimmed);
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
    const user = await db.get('SELECT id, username FROM users WHERE username = ? COLLATE NOCASE', [sanitizedUsername]);
    
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
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing registration details' });

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    if (password.length < 8 || password.length > 50) {
      return res.status(400).json({ error: 'Password must be between 8 and 50 characters' });
    }

    const sanitizedUsername = username.trim();

    // Check if user already exists
    const existing = await db.get('SELECT id FROM users WHERE username = ? COLLATE NOCASE', [sanitizedUsername]);
    if (existing) {
      return res.status(400).json({ error: 'Username already taken. Please try another.' });
    }

    // Hash password with bcrypt cost 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Encrypt initial user data with AES-256
    const initialData = JSON.stringify({ registeredAt: Date.now() });
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(AES_SECRET_KEY, 'utf-8'), iv);
    
    let encryptedData = cipher.update(initialData, 'utf8', 'base64');
    encryptedData += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');
    const ivBase64 = iv.toString('base64');
    
    const dbEncryptedString = JSON.stringify({ iv: ivBase64, data: encryptedData, tag: authTag });

    // Insert user safely mapped into the database using param queries
    const result = await db.run(
      'INSERT INTO users (username, password_hash, encrypted_data) VALUES (?, ?, ?)',
      [sanitizedUsername, passwordHash, dbEncryptedString]
    );

    // After success, instantly log them in using identically constructed JWT token logic 
    const token = jwt.sign({ id: result.lastID, username: sanitizedUsername }, JWT_SECRET, { expiresIn: '1h' });
      
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 3600000,
      secure: false,
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

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    
    const sanitizedUsername = username.trim();
    const user = await db.get('SELECT * FROM users WHERE username = ? COLLATE NOCASE', [sanitizedUsername]);
    
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
      // Reset attempts
      await db.run('UPDATE users SET failed_attempts = 0, lockout_time = 0 WHERE id = ?', [user.id]);
      
      // Issue a signed JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
      
      // Store JWT in an HttpOnly secure cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour
        secure: false, // Requires HTTPS in production
        sameSite: 'lax'
      });

      let gameData = null;
      try {
        if (user.game_data) gameData = JSON.parse(user.game_data);
      } catch (e) {
        console.error('Failed to parse game data on login:', e);
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

app.get('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let registeredAt = null;
    try {
      if (user.encrypted_data) {
        const { iv, data, tag } = JSON.parse(user.encrypted_data);
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(AES_SECRET_KEY, 'utf-8'), Buffer.from(iv, 'base64'));
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
      accountType: 'Registered',
      registeredAt: registeredAt
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

    const gameData = {
      ...existing,
      ...(settings !== undefined ? { settings } : {}),
      ...(tutorialComplete !== undefined ? { tutorialComplete } : {}),
      ...(gestureSetupComplete !== undefined ? { gestureSetupComplete } : {}),
      ...(chapterProgress !== undefined ? { chapterProgress } : {}),
      ...(bestiary !== undefined ? { bestiary } : {}),
      ...(gestureModel !== undefined && gestureModel !== null ? { gestureModel } : {})
    };

    await db.run('UPDATE users SET game_data = ? WHERE id = ?', [JSON.stringify(gameData), req.user.id]);

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
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (newPassword.length < 8 || newPassword.length > 50) {
      return res.status(400).json({ error: 'New password must be 8-50 characters' });
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

app.post('/auth/logout', authMiddleware, (req, res) => {
  const token = req.cookies.jwt;
  if (token) tokenBlacklist.add(token);
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  });
  return res.status(200).json({ success: true });
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
      SELECT id, username, is_admin, banned, ban_reason, cheat_score, last_login,
             CASE WHEN game_data IS NOT NULL THEN 1 ELSE 0 END as has_game_data
      FROM users
      ORDER BY id DESC
    `);
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban/unban user (admin only)
app.post('/admin/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, banned, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Prevent banning yourself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }
    
    await db.run(
      'UPDATE users SET banned = ?, ban_reason = ? WHERE id = ?',
      [banned ? 1 : 0, reason || null, userId]
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
    const users = await db.all(`
      SELECT id, username, cheat_score, banned, ban_reason,
             game_data
      FROM users
      WHERE game_data IS NOT NULL
      ORDER BY cheat_score DESC
    `);
    
    // Parse scores and detect anomalies
    const leaderboard = users.map(u => {
      let scores = [];
      try {
        const data = JSON.parse(u.game_data);
        if (data.chapterProgress?.bestScores) {
          scores = Object.entries(data.chapterProgress.bestScores).map(([ch, score]) => ({
            chapter: ch,
            score: score
          }));
        }
      } catch (e) {}
      
      // Flag suspicious scores (e.g., impossibly high or rapid completion)
      const suspicious = u.cheat_score > 50 || scores.some(s => s.score > 100000);
      
      return {
        id: u.id,
        username: u.username,
        cheatScore: u.cheat_score,
        banned: u.banned,
        banReason: u.ban_reason,
        scores,
        suspicious
      };
    });
    
    return res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('Admin leaderboard error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark suspicious user (admin only)
app.post('/admin/mark-cheat', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, cheatScore, reason } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    await db.run(
      'UPDATE users SET cheat_score = cheat_score + ?, ban_reason = COALESCE(ban_reason, ?) WHERE id = ?',
      [cheatScore || 10, reason || 'Suspicious activity', userId]
    );
    
    return res.status(200).json({ success: true, message: 'User marked' });
  } catch (err) {
    console.error('Admin mark cheat error:', err);
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
