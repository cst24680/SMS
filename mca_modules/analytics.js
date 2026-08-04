// mca_modules/analytics.js
// Lightweight analytics and gamification utilities (purely additive)

/**
 * computeDailyStudyHours(sessions)
 * - sessions: array of {date: '2026-07-28', durationHours: 1.5, subject}
 * Returns: { '2026-07-28': 3, ... }
 */
export function computeDailyStudyHours(sessions) {
  const acc = {};
  for (const s of sessions || []) {
    if (!s.date) continue;
    acc[s.date] = (acc[s.date] || 0) + (s.durationHours || 0);
  }
  return acc;
}

/**
 * computeSubjectPercentages(sessions)
 * Returns object mapping subject -> percentage
 */
export function computeSubjectPercentages(sessions) {
  const totals = {};
  let grand = 0;
  for (const s of sessions || []) {
    const subject = s.subject || 'Other';
    totals[subject] = (totals[subject] || 0) + (s.durationHours || 0);
    grand += (s.durationHours || 0);
  }
  const result = {};
  for (const key of Object.keys(totals)) {
    result[key] = grand ? Math.round((totals[key] / grand) * 100) : 0;
  }
  return result;
}

export function computeStudyStreak(dates) {
  // dates = array of ISO date strings when user studied at least once
  if (!dates || !dates.length) return 0;
  const days = Array.from(new Set(dates)).sort();
  // Convert to Date objects
  const dObjs = days.map(d => new Date(d));
  let streak = 1;
  for (let i = dObjs.length - 1; i > 0; i--) {
    const cur = dObjs[i];
    const prev = dObjs[i-1];
    const diffDays = Math.round((cur - prev) / (1000*60*60*24));
    if (diffDays === 1) streak++; else break;
  }
  return streak;
}
