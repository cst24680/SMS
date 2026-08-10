import { getDB } from '../database/db.js';

// GET All Records OR Filter by Subject (Query Parameter)
export async function getGoals(req, res, next) {
  try {
    const db = await getDB();
    const { subject } = req.query;

    if (subject && subject.trim() !== '') {
      const filtered = await db.all('SELECT * FROM goals WHERE LOWER(subject) = LOWER(?)', [subject.trim()]);
      return res.json(filtered);
    }

    const goals = await db.all('SELECT * FROM goals');
    res.json(goals);
  } catch (error) {
    next(error);
  }
}

// GET Single Record by ID (Path Parameter)
export async function getGoalById(req, res, next) {
  try {
    const db = await getDB();
    const goal = await db.get('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal record not found.' });
    }
    res.json(goal);
  } catch (error) {
    next(error);
  }
}

// POST Create Record (with Input Validation)
export async function createGoal(req, res, next) {
  try {
    const { title, subject, deadline, priority, dailyHours, studyMode } = req.body || {};

    // User Input Validation
    if (!title || !title.trim() || !subject || !subject.trim() || !deadline) {
      return res.status(400).json({ message: 'Title, Subject, and Deadline are required fields.' });
    }

    const db = await getDB();
    const result = await db.run(
      'INSERT INTO goals (title, subject, deadline, dailyHours, studyMode, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [
        title.trim(),
        subject.trim(),
        deadline,
        dailyHours || '1',
        studyMode || 'Individual',
        priority || 'Medium'
      ]
    );

    const newGoal = {
      id: result.lastID,
      title: title.trim(),
      subject: subject.trim(),
      deadline,
      dailyHours: dailyHours || '1',
      studyMode: studyMode || 'Individual',
      priority: priority || 'Medium'
    };

    res.status(201).json(newGoal);
  } catch (error) {
    next(error);
  }
}

// PUT Update Record
export async function updateGoal(req, res, next) {
  try {
    const { title, subject, deadline, priority } = req.body || {};
    const { id } = req.params;

    if (!title || !subject || !deadline) {
      return res.status(400).json({ message: 'Title, Subject, and Deadline are required for updates.' });
    }

    const db = await getDB();
    const result = await db.run(
      'UPDATE goals SET title = ?, subject = ?, deadline = ?, priority = ? WHERE id = ?',
      [title.trim(), subject.trim(), deadline, priority || 'Medium', id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    res.json({ id: Number(id), title, subject, deadline, priority });
  } catch (error) {
    next(error);
  }
}

// DELETE Record
export async function deleteGoal(req, res, next) {
  try {
    const db = await getDB();
    const result = await db.run('DELETE FROM goals WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}