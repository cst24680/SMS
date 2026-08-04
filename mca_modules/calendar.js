// mca_modules/calendar.js
// Study Session Scheduling + Conflict Detection

/**
 * checkTimeConflict(newSession, existingSessions)
 * - newSession: {day, start, end, participants: [userId,...]}
 * - existingSessions: array of same shape
 * Returns: {conflict: boolean, message: string, conflicts: [session,...]}
 */
export function checkTimeConflict(newSession, existingSessions) {
  const conflicts = [];
  for (const s of existingSessions) {
    // Check if any participant overlaps
    const shared = (newSession.participants || []).some(p => (s.participants || []).includes(p));
    if (!shared) continue;
    if (s.day !== newSession.day) continue;
    if (timeRangesOverlap(newSession.start, newSession.end, s.start, s.end)) {
      conflicts.push(s);
    }
  }
  if (conflicts.length) {
    return {
      conflict: true,
      message: '⚠️ Time Conflict: Partner is already booked at this time',
      conflicts,
    };
  }
  return { conflict: false, message: 'No conflict', conflicts: [] };
}

function timeRangesOverlap(s1, e1, s2, e2) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return Math.max(toMinutes(s1), toMinutes(s2)) < Math.min(toMinutes(e1), toMinutes(e2));
}
