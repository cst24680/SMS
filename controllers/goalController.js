import Goal from '../models/Goal.js';

// GET All / Filter by Subject (Query Parameter)
export async function getGoals(req, res, next) {
  try {
    const { subject } = req.query;
    const filter = subject ? { subject: new RegExp(`^${subject.trim()}$`, 'i') } : {};
    
    const goals = await Goal.find(filter);
    res.json(goals);
  } catch (error) {
    next(error);
  }
}

// GET Single Record by ID (Path Parameter)
export async function getGoalById(req, res, next) {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal record not found.' });
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID format.' });
  }
}

// POST Create Record
export async function createGoal(req, res, next) {
  try {
    const { title, subject, deadline, priority, dailyHours, studyMode, userId } = req.body || {};

    if (!title || !title.trim() || !subject || !subject.trim() || !deadline) {
      return res.status(400).json({ message: 'Title, Subject, and Deadline are required fields.' });
    }

    const newGoal = await Goal.create({
      title: title.trim(),
      subject: subject.trim(),
      deadline,
      priority: priority || 'Medium',
      dailyHours: dailyHours || '1',
      studyMode: studyMode || 'Individual',
      userId: userId?.toString() || '1',
    });

    res.status(201).json(newGoal);
  } catch (error) {
    next(error);
  }
}

// PUT Update Record
export async function updateGoal(req, res, next) {
  try {
    const { title, subject, deadline, priority, dailyHours, studyMode, userId } = req.body || {};

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        title,
        subject,
        deadline,
        priority,
        dailyHours,
        studyMode,
        ...(userId ? { userId: userId.toString() } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedGoal) return res.status(404).json({ message: 'Goal not found.' });
    res.json(updatedGoal);
  } catch (error) {
    next(error);
  }
}

// DELETE Record
export async function deleteGoal(req, res, next) {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);
    if (!deletedGoal) return res.status(404).json({ message: 'Goal not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
