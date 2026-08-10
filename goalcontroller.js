import { getDB } from '../database/db.js';

// GET all items or filter via query parameter (?subject=X)
export async function getGoals(req, res) {
  try {
    const db = await getDB();
    const { subject } = req.query;

    if (subject) {
      const filtered = await db.all('SELECT * FROM goals WHERE LOWER(subject) = LOWER(?)', [subject]);
      return res.json(filtered);
    }

    const goals = await db.all('SELECT * FROM goals');
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET single item using path parameter (/api/goals/:id)
export async function getGoalById(req, res) {
  try {
    const db = await getDB();
    const goal = await db.get('SELECT * FROM goals WHERE id = ?', [req.params.id]);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST create item with input validation[cite: 18]
export async function createGoal(req, res) {
  try {
    const { title, subject, deadline, priority } = req.body;
    if (!title?.trim() || !subject?.trim() || !deadline || !priority) {
      return res.status(400).json({ message: 'All fields (title, subject, deadline, priority) are required.' });
    }

    const db = await getDB();
    const result = await db.run(
      'INSERT INTO goals (title, subject, deadline, priority) VALUES (?, ?, ?, ?)',
      [title.trim(), subject.trim(), deadline, priority]
    );
    res.status(201).json({ id: result.lastID, title, subject, deadline, priority });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT update item[cite: 18]
export async function updateGoal(req, res) {
  try {
    const { title, subject, deadline, priority } = req.body;
    if (!title?.trim() || !subject?.trim() || !deadline || !priority) {
      return res.status(400).json({ message: 'All fields are required to update.' });
    }

    const db = await getDB();
    const result = await db.run(
      'UPDATE goals SET title = ?, subject = ?, deadline = ?, priority = ? WHERE id = ?',
      [title.trim(), subject.trim(), deadline, priority, req.params.id]
    );

    if (result.changes === 0) return res.status(404).json({ message: 'Goal not found' });
    res.json({ id: Number(req.params.id), title, subject, deadline, priority });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE item[cite: 18]
export async function deleteGoal(req, res) {
  try {
    const db = await getDB();
    const result = await db.run('DELETE FROM goals WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ message: 'Goal not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}