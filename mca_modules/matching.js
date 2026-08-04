// mca_modules/matching.js
// Additive Smart Partner Matching Engine

/**
 * calculateMatchScore(userA, userB)
 * - userA and userB are objects with fields:
 *   subjects: array of strings
 *   studyMode: string ('Individual'|'Group')
 *   timeSlots: array of {day: 'Mon', start: '18:00', end: '19:00'}
 *   location: {lat, lng, city}
 *   course: string or number
 *
 * Returns a normalized percentage 0-100.
 */
export function calculateMatchScore(userA, userB) {
  // Safety checks
  if (!userA || !userB) return 0;

  // Helper: subject overlap
  const subjectsA = new Set((userA.subjects || []).map((s) => s.toLowerCase()));
  const subjectsB = new Set((userB.subjects || []).map((s) => s.toLowerCase()));
  let common = 0;
  subjectsA.forEach((s) => { if (subjectsB.has(s)) common++; });
  const totalSubjects = Math.max(subjectsA.size + subjectsB.size - common, 1);
  const subjectScore = (common / totalSubjects) || 0;

  // Study mode match
  const modeScore = (userA.studyMode && userB.studyMode && userA.studyMode === userB.studyMode) ? 1 : 0;

  // Time slot compatibility (simple overlap count / normalized)
  const timeScore = computeTimeCompatibility(userA.timeSlots || [], userB.timeSlots || []);

  // Proximity: if lat/lng available compute distance, else compare city
  const proximityScore = computeProximityScore(userA.location, userB.location);

  // Course/semester match
  const courseScore = (userA.course && userB.course && String(userA.course) === String(userB.course)) ? 1 : 0;

  // Weights per spec
  const weights = {
    subjects: 0.4,
    studyMode: 0.2,
    time: 0.15,
    proximity: 0.15,
    course: 0.10,
  };

  const rawScore = (
    subjectScore * weights.subjects +
    modeScore * weights.studyMode +
    timeScore * weights.time +
    proximityScore * weights.proximity +
    courseScore * weights.course
  );

  return Math.round(rawScore * 100);
}

function computeTimeCompatibility(slotsA, slotsB) {
  // Simple algorithm: count overlapping slot pairs, normalize by max slots
  let overlaps = 0;
  for (const a of slotsA) {
    for (const b of slotsB) {
      if (a.day !== b.day) continue;
      if (timeRangesOverlap(a.start, a.end, b.start, b.end)) overlaps++;
    }
  }
  const maxSlots = Math.max(slotsA.length, slotsB.length, 1);
  return Math.min(1, overlaps / maxSlots);
}

function timeRangesOverlap(s1, e1, s2, e2) {
  // Assume HH:MM strings
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const a1 = toMinutes(s1), a2 = toMinutes(e1), b1 = toMinutes(s2), b2 = toMinutes(e2);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

function computeProximityScore(locA, locB) {
  if (!locA || !locB) return 0;
  if (locA.city && locB.city && locA.city.toLowerCase() === locB.city.toLowerCase()) return 1;
  if (typeof locA.lat === 'number' && typeof locB.lat === 'number') {
    const d = haversineDistance(locA.lat, locA.lng, locB.lat, locB.lng); // km
    // Score 1 for <=1km, 0.5 for <=10km, else 0
    if (d <= 1) return 1;
    if (d <= 10) return 0.5;
    return 0;
  }
  return 0;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
