import express from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
} from '../controllers/goalController.js';

const router = express.Router();

router.get('/goals', getGoals);          // GET /api/goals & GET /api/goals?subject=... (Query Param)
router.get('/goals/:id', getGoalById);   // GET /api/goals/:id (Path Param)
router.post('/goals', createGoal);       // POST /api/goals
router.put('/goals/:id', updateGoal);    // PUT /api/goals/:id
router.delete('/goals/:id', deleteGoal); // DELETE /api/goals/:id

export default router;