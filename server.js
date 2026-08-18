import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './database/db.js';
import goalRoutes from './routes/goalRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// MongoDB Schemas & Models
// -------------------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    age: String,
    institution: String,
    subjects: String,
    location: String,
    studyMode: String,
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const partnerRequestSchema = new mongoose.Schema({
  fromUserId: String,
  toUserId: String,
  status: String,
  createdAt: String,
  respondedAt: String,
});
const PartnerRequest =
  mongoose.models.PartnerRequest || mongoose.model('PartnerRequest', partnerRequestSchema);

const calendarEventSchema = new mongoose.Schema({
  title: String,
  date: String,
  userId: String,
});
const CalendarEvent =
  mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', calendarEventSchema);

// -------------------------------------------------------------
// Login Endpoint (MongoDB - Email OR Full Name)
// -------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    const loginIdentifier = (username || email || '').toString().trim();
    const pass = (password || '').toString().trim();

    if (!loginIdentifier || !pass) {
      return res.status(400).json({ success: false, message: 'Username/Email and password are required.' });
    }

    const matchedUser = await User.findOne({
      $or: [
        { email: new RegExp(`^${loginIdentifier}$`, 'i') },
        { fullName: new RegExp(`^${loginIdentifier}$`, 'i') },
      ],
      password: pass,
    });

    if (matchedUser) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: matchedUser._id,
          name: matchedUser.fullName || matchedUser.email,
          email: matchedUser.email,
          age: matchedUser.age,
          institution: matchedUser.institution,
          subjects: matchedUser.subjects,
          location: matchedUser.location,
          studyMode: matchedUser.studyMode,
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
    const users = await User.find({});
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

    const existing = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      age,
      institution,
      subjects,
      location,
      studyMode,
    });

    res.status(201).json({
      id: newUser._id,
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
// Additional Dashboard Helper Endpoints (MongoDB)
// -------------------------------------------------------------
app.get('/api/partnerRequests', async (req, res) => {
  try {
    const rows = await PartnerRequest.find({});
    res.json(rows);
  } catch {
    res.json([]);
  }
});

app.post('/api/partnerRequests', async (req, res) => {
  try {
    const newReq = await PartnerRequest.create(req.body);
    res.status(201).json(newReq);
  } catch {
    res.status(500).json({ message: 'Failed to create partner request.' });
  }
});

app.put('/api/partnerRequests/:id', async (req, res) => {
  try {
    const updated = await PartnerRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update partner request.' });
  }
});

app.get('/api/calendarEvents', async (req, res) => {
  try {
    const rows = await CalendarEvent.find({});
    res.json(rows);
  } catch {
    res.json([]);
  }
});

app.post('/api/calendarEvents', async (req, res) => {
  try {
    const newEvent = await CalendarEvent.create(req.body);
    res.status(201).json(newEvent);
  } catch {
    res.status(500).json({ message: 'Failed to create calendar event.' });
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
  console.log(`StudyBuddy Exercise 8 MongoDB Server running on http://localhost:${PORT}`);
});