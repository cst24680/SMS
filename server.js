import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from './database/db.js';
import goalRoutes from './routes/goalRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// Login Endpoint (SQLite - Email OR Full Name)
// -------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const loginIdentifier = (username || email || '').toString().trim();
    const pass = (password || '').toString().trim();

    if (!loginIdentifier || !pass) {
      return res.status(400).json({ success: false, message: 'Username/Email and password are required.' });
    }

    const db = await getDB();
    const matchedUser = await db.get(
      `SELECT * FROM users 
       WHERE (LOWER(email) = LOWER(?) OR LOWER(fullName) = LOWER(?)) 
         AND password = ?`,
      [loginIdentifier, loginIdentifier, pass]
    );

    if (matchedUser) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: { 
          name: matchedUser.fullName || matchedUser.email, 
          email: matchedUser.email,
          age: matchedUser.age,
          institution: matchedUser.institution,
          subjects: matchedUser.subjects,
          location: matchedUser.location,
          studyMode: matchedUser.studyMode
        },
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed.' });
  }
});

// -------------------------------------------------------------
// Users Collection Endpoints (Required by app.js)
// -------------------------------------------------------------
app.get('/api/users', async (req, res) => {
  try {
    const db = await getDB();
    const users = await db.all('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const b = req.body || {};
    const fullName = (b.fullName || b.name || 'Student').toString().trim();
    const email = (b.email || b.username || '').toString().trim();
    const password = (b.password || '').toString().trim();
    const age = (b.age || '').toString().trim();
    const institution = (b.institution || '').toString().trim();
    const subjects = (b.subjects || '').toString().trim();
    const location = (b.location || '').toString().trim();
    const studyMode = (b.studyMode || '').toString().trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const db = await getDB();
    const existing = await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const result = await db.run(
      `INSERT INTO users (fullName, email, password, age, institution, subjects, location, studyMode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, password, age, institution, subjects, location, studyMode]
    );

    res.status(201).json({
      id: result.lastID,
      fullName,
      email,
      message: 'Account created successfully!',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed.' });
  }
});

// -------------------------------------------------------------
// Exercise 8 Goals REST API Routes
// -------------------------------------------------------------
app.use('/api', goalRoutes);

// -------------------------------------------------------------
// Additional Dashboard Helper Endpoints
// -------------------------------------------------------------
app.get('/api/partnerRequests', async (req, res) => {
  try {
    const db = await getDB();
    const rows = await db.all('SELECT * FROM partnerRequests');
    res.json(rows);
  } catch {
    res.json([]);
  }
});

app.get('/api/calendarEvents', async (req, res) => {
  try {
    const db = await getDB();
    const rows = await db.all('SELECT * FROM calendarEvents');
    res.json(rows);
  } catch {
    res.json([]);
  }
});

app.get('/api/study-record', (req, res) => {
  res.json({ fileName: 'study-record.txt', content: 'Study session record initialized.' });
});

// -------------------------------------------------------------
// API Fallback Guard (Prevents returning HTML to API requests)
// -------------------------------------------------------------
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: 'Requested API endpoint not found.' });
});

// Server Static Frontend & Error Handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error processing request.' });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => {
  console.log(`StudyBuddy Exercise 8 SQLite Server running on http://localhost:${PORT}`);
});