import { useEffect, useMemo, useState } from 'react';

function StudyActivityManager({ onRequest, currentUser, goals }) {
  const userGoals = useMemo(() => goals.filter((goal) => String(goal.userId) === String(currentUser.id)), [currentUser.id, goals]);
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ goalId: '', date: new Date().toISOString().slice(0, 10), duration: '', notes: '' });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState('study-record.txt');
  const [filePreview, setFilePreview] = useState('');
  const [fileMessage, setFileMessage] = useState('');
  const selectedGoal = userGoals.find((goal) => goal.id === form.goalId);
  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const loadActivities = async () => {
    try {
      const data = await onRequest(`/study-activities?userId=${encodeURIComponent(currentUser.id)}`);
      setActivities(data || []); setMessage('Activity history refreshed from MongoDB.');
    } catch (error) { setMessage(error.message); }
  };
  useEffect(() => { loadActivities(); }, [currentUser.id]);
  useEffect(() => { if (!form.goalId && userGoals.length) update('goalId', userGoals[0].id); }, [form.goalId, userGoals]);

  const saveSession = async (event) => {
    event.preventDefault();
    if (!selectedGoal || !form.duration || !form.notes.trim()) return setMessage('Choose a goal, enter the study time, and add a progress note.');
    setIsSaving(true);
    try {
      const savedActivity = await onRequest('/study-activities', { method: 'POST', body: JSON.stringify({ userId: currentUser.id, goalId: selectedGoal.id, goalTitle: selectedGoal.title, subject: selectedGoal.subject, date: form.date, duration: form.duration, notes: form.notes }) });
      setActivities((previous) => [savedActivity, ...previous]);
      setForm((previous) => ({ ...previous, duration: '', notes: '' }));
      setMessage('Study session saved to MongoDB.');
    } catch (error) { setMessage(error.message); } finally { setIsSaving(false); }
  };

  const deleteActivity = async (activityId) => {
    if (!window.confirm('Delete this study session?')) return;
    try { await onRequest(`/study-activities/${activityId}`, { method: 'DELETE' }); setActivities((previous) => previous.filter((activity) => activity.id !== activityId)); setMessage('Study session deleted.'); } catch (error) { setMessage(error.message); }
  };

  const activityText = (activity) => `[${activity.date}] ${activity.goalTitle} (${activity.subject}) — ${activity.duration}h\n${activity.notes}`;
  const writeBackup = async () => {
    try { const result = await onRequest('/study-record', { method: 'POST', body: JSON.stringify({ content: `StudyBuddy MongoDB activity export\n\n${activities.map(activityText).join('\n\n')}` }) }); setFilePreview(result.content); setFileName(result.fileName); setFileMessage('Activity export written to the server file.'); } catch (error) { setFileMessage(error.message); }
  };
  const readBackup = async () => {
    try { const result = await onRequest('/study-record'); setFilePreview(result.content); setFileName(result.fileName); setFileMessage('File read successfully.'); } catch (error) { setFileMessage(error.message); }
  };
  const appendLatest = async () => {
    if (!activities.length) return setFileMessage('Save a MongoDB study session before appending it to the file.');
    try { const result = await onRequest('/study-record', { method: 'PATCH', body: JSON.stringify({ content: activityText(activities[0]) }) }); setFilePreview(result.content); setFileName(result.fileName); setFileMessage('Latest MongoDB session appended to the file.'); } catch (error) { setFileMessage(error.message); }
  };
  const renameBackup = async () => {
    try { const result = await onRequest('/study-record/rename', { method: 'PATCH', body: JSON.stringify({ fileName }) }); setFilePreview(result.content); setFileName(result.fileName); setFileMessage('Backup file renamed.'); } catch (error) { setFileMessage(error.message); }
  };

  return <div className="grid gap-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Study activity</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Log a study session</h2><p className="mt-2 text-sm leading-6 text-slate-600">Your sessions are saved to MongoDB and linked to your study goals.</p>
      <form onSubmit={saveSession} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Study goal<select value={form.goalId} onChange={(event) => update('goalId', event.target.value)} className="input-field mt-2" disabled={!userGoals.length}>{userGoals.length ? userGoals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title} · {goal.subject}</option>) : <option value="">Add a study goal first</option>}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Date<input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} className="input-field mt-2" required /></label><label className="block text-sm font-semibold text-slate-700">Focused hours<input type="number" min="0.25" step="0.25" value={form.duration} onChange={(event) => update('duration', event.target.value)} placeholder="e.g. 2" className="input-field mt-2" required /></label></div><label className="block text-sm font-semibold text-slate-700">Progress note<textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} className="input-field mt-2 min-h-32 resize-y" placeholder="e.g. Completed chapter 4 exercises and revised formulas." required /></label><button type="submit" className="btn btn-primary w-full" disabled={!userGoals.length || isSaving}>{isSaving ? 'Saving session…' : 'Save study session'}</button></form>{message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">MongoDB activity history</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Your saved sessions</h2></div><div className="flex flex-wrap gap-2"><button type="button" onClick={appendLatest} className="btn btn-primary">Append latest</button><button type="button" onClick={renameBackup} className="btn btn-secondary">Rename file</button></div></div><div className="mt-4 flex flex-wrap gap-2"><input value={fileName} onChange={(event) => setFileName(event.target.value)} className="input-field max-w-xs" aria-label="Backup filename" /></div>{fileMessage ? <p className="mt-3 text-sm text-slate-600">{fileMessage}</p> : null}<div className="mt-6 space-y-3">{activities.length ? activities.map((activity) => <article key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{activity.goalTitle}</p><p className="mt-1 text-sm text-emerald-700">{activity.subject} · {activity.date} · {activity.duration}h</p></div><button type="button" onClick={() => deleteActivity(activity.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button></div><p className="mt-3 text-sm leading-6 text-slate-600">{activity.notes}</p></article>) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-700">No study sessions saved yet.</p><p className="mt-2 text-sm text-slate-500">Your MongoDB-backed sessions will appear here.</p></div>}</div></section>

  </div>;
}

export default StudyActivityManager;
