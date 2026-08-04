import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded demo credentials for StudyBuddy login.
  const validUsername = 'admin';
  const validPassword = '12345';

  if (username === validUsername && password === validPassword) {
    return res.json({ success: true });
  }

  return res.json({ success: false, message: 'Invalid username or password' });
});

// --- Additive API endpoints for MCA/BCA features ---

// In-memory demo stores (replace with real DB later)
const users = [
  { id: 'u-admin', name: 'Admin', email: 'admin', subjects: ['Mathematics','Programming'], studyMode: 'Individual', timeSlots: [{day:'Mon',start:'18:00',end:'20:00'}], location: {city:'DemoCity'}, course: 'BCA' }
];
const partnerRequests = [];
const studySessions = [];
const feedbacks = [];

app.get('/api/recommendations', (req, res) => {
  // Simple demo: return all users with a random match score
  const { userId } = req.query;
  // In real usage the server would compute using the same calculateMatchScore logic
  const data = users.filter(u => u.id !== userId).map(u => ({ user: u, score: Math.floor(60 + Math.random()*40) }));
  res.json({ success: true, recommendations: data });
});

app.get('/api/subjects', (req, res) => {
  const subjectSet = new Set();
  // gather from users
  for (const u of users) {
    if (Array.isArray(u.subjects)) u.subjects.forEach(s => subjectSet.add(s));
  }
  // gather from sessions
  for (const s of studySessions) {
    if (s.subject) subjectSet.add(s.subject);
  }
  const subjects = Array.from(subjectSet);
  res.json({ success: true, subjects });
});

app.post('/api/partner-request', (req, res) => {
  const { fromUserId, toUserId, message } = req.body;
  const reqObj = { id: `pr_${Date.now()}`, fromUserId, toUserId, message, status: 'pending', created_at: new Date().toISOString() };
  partnerRequests.push(reqObj);
  res.json({ success: true, request: reqObj });
});

app.get('/api/sessions', (req, res) => {
  res.json({ success: true, sessions: studySessions });
});

app.post('/api/sessions', (req, res) => {
  const session = { id: `s_${Date.now()}`, ...req.body, created_at: new Date().toISOString() };
  studySessions.push(session);
  res.json({ success: true, session });
});

app.post('/api/feedback', (req, res) => {
  const fb = { id: `f_${Date.now()}`, ...req.body, created_at: new Date().toISOString() };
  feedbacks.push(fb);
  res.json({ success: true, feedback: fb });
});

app.listen(PORT, () => {
  console.log(`StudyBuddy server running on http://localhost:${PORT}`);
});
