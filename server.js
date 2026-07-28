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

app.listen(PORT, () => {
  console.log(`StudyBuddy server running on http://localhost:${PORT}`);
});
