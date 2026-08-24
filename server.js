import express from 'express';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './database/db.js';
import goalRoutes from './routes/goalRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const STUDY_RECORD_DIRECTORY = path.join(__dirname, 'data', 'study-records');
let studyRecordFileName = 'study-record.txt';

function getSafeRecordFileName(fileName) {
  const normalized = (fileName || '').toString().trim();
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.txt$/.test(normalized) || path.basename(normalized) !== normalized) {
    throw new Error('Use a simple .txt filename (letters, numbers, dots, hyphens, or underscores).');
  }
  return normalized;
}

function getStudyRecordPath(fileName = studyRecordFileName) {
  return path.join(STUDY_RECORD_DIRECTORY, getSafeRecordFileName(fileName));
}

async function readStudyRecord() {
  const content = await fs.readFile(getStudyRecordPath(), 'utf8');
  return { fileName: studyRecordFileName, content };
}

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

const studyActivitySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    goalId: { type: String, required: true },
    goalTitle: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: String, required: true },
    duration: { type: Number, required: true },
    notes: { type: String, required: true },
  },
  { timestamps: true }
);
studyActivitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; },
});
const StudyActivity = mongoose.models.StudyActivity || mongoose.model('StudyActivity', studyActivitySchema);

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

// StudyBuddy activity history: persisted in MongoDB for the dashboard.
app.get('/api/study-activities', async (req, res) => {
  try {
    const userId = (req.query.userId || '').toString();
    if (!userId) return res.status(400).json({ message: 'User ID is required.' });
    const activities = await StudyActivity.find({ userId }).sort({ date: -1, createdAt: -1 });
    res.json(activities);
  } catch {
    res.status(500).json({ message: 'Failed to load study activity.' });
  }
});

app.post('/api/study-activities', async (req, res) => {
  try {
    const { userId, goalId, goalTitle, subject, date, duration, notes } = req.body || {};
    if (!userId || !goalId || !goalTitle || !subject || !date || !duration || !notes?.trim()) {
      return res.status(400).json({ message: 'Goal, date, duration, and progress notes are required.' });
    }
    const activity = await StudyActivity.create({ userId: userId.toString(), goalId: goalId.toString(), goalTitle: goalTitle.trim(), subject: subject.trim(), date, duration: Number(duration), notes: notes.trim() });
    res.status(201).json(activity);
  } catch {
    res.status(500).json({ message: 'Failed to save the study session.' });
  }
});

app.delete('/api/study-activities/:id', async (req, res) => {
  try {
    const deletedActivity = await StudyActivity.findByIdAndDelete(req.params.id);
    if (!deletedActivity) return res.status(404).json({ message: 'Study session not found.' });
    res.status(204).end();
  } catch {
    res.status(400).json({ message: 'Invalid study session ID.' });
  }
});

// Exercise 7: FS operations stay in Node.js; React only calls these APIs.
app.post('/api/study-record', async (req, res) => {
  try {
    await fs.mkdir(STUDY_RECORD_DIRECTORY, { recursive: true });
    await fs.writeFile(getStudyRecordPath(), (req.body?.content || '').toString(), 'utf8');
    res.status(201).json(await readStudyRecord());
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create the study record.' });
  }
});

app.get('/api/study-record', async (req, res) => {
  try {
    res.json(await readStudyRecord());
  } catch (error) {
    res.status(error.code === 'ENOENT' ? 404 : 500).json({ message: error.code === 'ENOENT' ? 'No study record exists yet. Create one first.' : 'Failed to read the study record.' });
  }
});

app.patch('/api/study-record', async (req, res) => {
  try {
    const filePath = getStudyRecordPath();
    await fs.access(filePath);
    const content = (req.body?.content || '').toString();
    await fs.appendFile(filePath, content ? `\n${content}` : '', 'utf8');
    res.json(await readStudyRecord());
  } catch (error) {
    res.status(error.code === 'ENOENT' ? 404 : 400).json({ message: error.code === 'ENOENT' ? 'No study record exists yet. Create one before appending.' : error.message || 'Failed to append to the study record.' });
  }
});

app.patch('/api/study-record/rename', async (req, res) => {
  try {
    const nextFileName = getSafeRecordFileName(req.body?.fileName);
    const currentPath = getStudyRecordPath();
    const nextPath = getStudyRecordPath(nextFileName);
    await fs.access(currentPath);
    if (nextFileName !== studyRecordFileName) await fs.rename(currentPath, nextPath);
    studyRecordFileName = nextFileName;
    res.json(await readStudyRecord());
  } catch (error) {
    res.status(error.code === 'ENOENT' ? 404 : 400).json({ message: error.code === 'ENOENT' ? 'No study record exists yet. Create one before renaming.' : error.message || 'Failed to rename the study record.' });
  }
});

app.delete('/api/study-record', async (req, res) => {
  try {
    await fs.unlink(getStudyRecordPath());
    studyRecordFileName = 'study-record.txt';
    res.status(204).end();
  } catch (error) {
    res.status(error.code === 'ENOENT' ? 404 : 500).json({ message: error.code === 'ENOENT' ? 'No study record exists to delete.' : 'Failed to delete the study record.' });
  }
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
