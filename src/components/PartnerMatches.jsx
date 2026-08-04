import { useMemo } from 'react';

const normaliseSubjects = (subjects = '') => subjects.split(',').map((subject) => subject.trim().toLowerCase()).filter(Boolean);

function PartnerMatches({ currentUser, profile, users, partnerRequests, onConnect }) {

  const matches = useMemo(() => {
    const mySubjects = normaliseSubjects(profile?.subjects);
    const myLocation = profile?.location?.trim().toLowerCase();

    return users
      .filter((user) => user.id !== currentUser.id)
      .filter((user) => !partnerRequests.some((request) => (request.fromUserId === currentUser.id && request.toUserId === user.id || request.fromUserId === user.id && request.toUserId === currentUser.id) && ['pending', 'sent', 'accepted'].includes(request.status)))
      .map((user) => {
        const commonSubjects = normaliseSubjects(user.subjects).filter((subject) => mySubjects.includes(subject));
        const sameLocation = Boolean(myLocation && user.location?.trim().toLowerCase() === myLocation);
        const sameMode = Boolean(profile?.studyMode && user.studyMode === profile.studyMode);
        const score = Math.min(100, commonSubjects.length * 30 + (sameLocation ? 35 : 0) + (sameMode ? 15 : 0) + 10);
        return { user, commonSubjects, sameLocation, sameMode, score };
      })
      .filter((match) => match.commonSubjects.length || match.sameLocation)
      .sort((first, second) => second.score - first.score);
  }, [currentUser.id, partnerRequests, profile, users]);

  const connect = async (partner) => {
    const sent = await onConnect(partner);
    return sent;
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Partner finder</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">Recommended study partners</h3>
          <p className="mt-1 text-sm text-slate-500">Ranked by shared subjects, city, and study setting.</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{matches.length} matches</span>
      </div>

      {!profile?.subjects || !profile?.location ? <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Add subjects and a location when signing up to receive more precise matches.</p> : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {matches.length ? matches.map(({ user, commonSubjects, sameLocation, sameMode, score }) => (
          <article key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white">{user.fullName?.charAt(0).toUpperCase()}</span>
                <div><h4 className="font-semibold text-slate-900">{user.fullName}</h4><p className="text-sm text-slate-500">{user.institution || 'StudyBuddy learner'}</p></div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-700">{score}%</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              {commonSubjects.map((subject) => <span key={subject} className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">{subject}</span>)}
              {sameLocation ? <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-700">Same city: {user.location}</span> : null}
              {sameMode ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700">{user.studyMode} setting</span> : null}
            </div>
            <button type="button" onClick={() => connect(user)} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Connect to study</button>
          </article>
        )) : <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 md:col-span-2">No compatible partners yet. Invite classmates who share your subject or city.</p>}
      </div>
    </section>
  );
}

export default PartnerMatches;
