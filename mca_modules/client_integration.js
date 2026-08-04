// mca_modules/client_integration.js
// Lightweight client helpers to render Recommended Partners, Scheduling, and Analytics

import { calculateMatchScore } from './matching.js';
import { checkTimeConflict } from './calendar.js';
import { computeDailyStudyHours, computeSubjectPercentages, computeStudyStreak } from './analytics.js';

// Provide both window global and named exports for flexibility
async function fetchRecommendations(userId) {
  try {
    const r = await fetch(`/api/recommendations?userId=${encodeURIComponent(userId)}`);
    return await r.json();
  } catch (err) {
    console.warn('Recommendations fetch failed', err);
    return { success: false, error: 'server' };
  }
}

async function sendPartnerRequest(fromUserId, toUserId, message) {
  const r = await fetch('/api/partner-request', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ fromUserId, toUserId, message }) });
  return await r.json();
}

async function createSession(sessionObj) {
  const r = await fetch('/api/sessions', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(sessionObj) });
  return await r.json();
}

async function submitFeedback(fb) {
  const r = await fetch('/api/feedback', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(fb) });
  return await r.json();
}

window.MCA = {
  calculateMatchScore,
  checkTimeConflict,
  computeDailyStudyHours,
  computeSubjectPercentages,
  computeStudyStreak,
  fetchRecommendations,
  sendPartnerRequest,
  createSession,
  submitFeedback,
};

export { calculateMatchScore, checkTimeConflict, computeDailyStudyHours, computeSubjectPercentages, computeStudyStreak, fetchRecommendations, sendPartnerRequest, createSession, submitFeedback };
