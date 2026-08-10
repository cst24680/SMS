import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const dataDirectory = path.join(__dirname, 'data');
const appDataFile = path.join(__dirname, 'db.json');
const recordStateFile = path.join(dataDirectory, 'record-state.json');

app.use(express.json());

async function ensureDataFile() {
  await fs.mkdir(dataDirectory, { recursive: true });
  try {
    await fs.access(appDataFile);
  } catch {
    const seed = JSON.parse(await fs.readFile(path.join(__dirname, 'db.json'), 'utf8'));
    await fs.writeFile(appDataFile, JSON.stringify(seed, null, 2), 'utf8');
  }
}

async function readAppData() {
  await ensureDataFile();
  return JSON.parse(await fs.readFile(appDataFile, 'utf8'));
}

async function writeAppData(data) {
  await fs.writeFile(appDataFile, JSON.stringify(data, null, 2), 'utf8');
}

function newId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

// -------------------------------------------------------------
// Authentication Endpoint
// -------------------------------------------------------------
app.post('/api/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const data = await readAppData();
    const users = data.users || [];
    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === username.toLowerCase() && user.password === password
    );

    if (matchedUser) {
      return res.json({
        success: true,
        message: 'Login successful',
        user: { name: matchedUser.fullName || matchedUser.name, email: matchedUser.email },
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// Generic Collection Routes
// -------------------------------------------------------------
for (const collection of ['users', 'goals', 'partnerRequests', 'calendarEvents']) {
  app.get(`/api/${collection}`, async (req, res, next) => {
    try {
      const data = await readAppData();
      const query = Object.entries(req.query);
      res.json(
        (data[collection] || []).filter((record) =>
          query.every(([key, value]) => String(record[key]) === value)
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post(`/api/${collection}`, async (req, res, next) => {
    try {
      const data = await readAppData();
      const records = data[collection] || [];
      const record = { ...req.body, id: newId(records) };
      data[collection] = [...records, record];
      await writeAppData(data);
      res.status(201).json(record);
    } catch (error) {
      next(error);
    }
  });

  app.put(`/api/${collection}/:id`, async (req, res, next) => {
    try {
      const data = await readAppData();
      const records = data[collection] || [];
      const index = records.findIndex((record) => String(record.id) === req.params.id);
      if (index < 0) return res.status(404).json({ message: 'Record not found.' });
      const record = { ...req.body, id: records[index].id };
      records[index] = record;
      data[collection] = records;
      await writeAppData(data);
      res.json(record);
    } catch (error) {
      next(error);
    }
  });

  app.delete(`/api/${collection}/:id`, async (req, res, next) => {
    try {
      const data = await readAppData();
      const records = data[collection] || [];
      const remaining = records.filter((record) => String(record.id) !== req.params.id);
      if (remaining.length === records.length)
        return res.status(404).json({ message: 'Record not found.' });
      data[collection] = remaining;
      await writeAppData(data);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
}

function validRecordName(name) {
  return /^[a-z0-9_-]+\.txt$/i.test(name || '');
}

async function getRecordName() {
  try {
    return JSON.parse(await fs.readFile(recordStateFile, 'utf8')).fileName;
  } catch {
    return 'study-record.txt';
  }
}

async function saveRecordName(fileName) {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(recordStateFile, JSON.stringify({ fileName }), 'utf8');
}

// -------------------------------------------------------------
// Exercise 7: Node.js File System (FS) Endpoints
// -------------------------------------------------------------
app.get('/api/study-record', async (req, res, next) => {
  try {
    const fileName = await getRecordName();
    res.json({
      fileName,
      content: await fs.readFile(path.join(dataDirectory, fileName), 'utf8'),
    });
  } catch (error) {
    if (error.code === 'ENOENT')
      return res.status(404).json({ message: 'No study record file exists yet.' });
    next(error);
  }
});

app.post('/api/study-record', async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!String(content || '').trim())
      return res.status(400).json({ message: 'Study record content is required.' });
    await fs.mkdir(dataDirectory, { recursive: true });
    const fileName = await getRecordName();
    await fs.writeFile(path.join(dataDirectory, fileName), content.trim(), 'utf8');
    await saveRecordName(fileName);
    res.status(201).json({ fileName, content: content.trim() });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/study-record', async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!String(content || '').trim())
      return res.status(400).json({ message: 'Text to append is required.' });
    const fileName = await getRecordName();
    await fs.appendFile(path.join(dataDirectory, fileName), `\n${content.trim()}`, 'utf8');
    res.json({
      fileName,
      content: await fs.readFile(path.join(dataDirectory, fileName), 'utf8'),
    });
  } catch (error) {
    if (error.code === 'ENOENT')
      return res.status(404).json({ message: 'Create the study record before appending.' });
    next(error);
  }
});

app.patch('/api/study-record/rename', async (req, res, next) => {
  try {
    const { fileName } = req.body;
    if (!validRecordName(fileName))
      return res.status(400).json({ message: 'Use a simple .txt filename (letters, numbers, _ or -).' });
    const currentName = await getRecordName();
    await fs.rename(path.join(dataDirectory, currentName), path.join(dataDirectory, fileName));
    await saveRecordName(fileName);
    res.json({ fileName });
  } catch (error) {
    if (error.code === 'ENOENT')
      return res.status(404).json({ message: 'Create the study record before renaming.' });
    next(error);
  }
});

app.delete('/api/study-record', async (req, res, next) => {
  try {
    const fileName = await getRecordName();
    await fs.unlink(path.join(dataDirectory, fileName));
    await fs.unlink(recordStateFile).catch(() => {});
    res.status(204).end();
  } catch (error) {
    if (error.code === 'ENOENT')
      return res.status(404).json({ message: 'No study record file exists to delete.' });
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'The StudyBuddy file operation could not be completed.' });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, () => console.log(`StudyBuddy server running on http://localhost:${PORT}`));