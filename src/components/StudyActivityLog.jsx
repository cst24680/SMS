import { useEffect, useMemo, useState } from 'react';

function StudyActivityLog({ onRequest, currentUser, goals }) {
  const userGoals = useMemo(() => goals.filter((goal) => String(goal.userId) === String(currentUser.id)), [currentUser.id, goals]);
  const [form, setForm] = useState({ goalId: '', date: new Date().toISOString().slice(0, 10), duration: '', notes: '' });
  const [record, setRecord] = useState('');
  const [hasRecord, setHasRecord] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState('study-record.txt');

  const selectedGoal = userGoals.find((goal) => goal.id === form.goalId);
  const updateForm = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const loadRecord = async (quiet = false) => {
    try {
      const result = await onRequest('/study-record');
      setRecord(result.content || ''); setFileName(result.fileName || 'study-record.txt'); setHasRecord(true);
      if (!quiet) setMessage('Your study activity is up to date.');
    } catch (error) {
      setHasRecord(false); setRecord('');
      if (!quiet) setMessage(error.message.includes('No study record exists') ? 'No activity record exists yet. Save your first study session to create one.' : error.message);
    }
  };

  useEffect(() => { loadRecord(true); }, []);
  useEffect(() => { if (!form.goalId && userGoals.length) updateForm('goalId', userGoals[0].id); }, [form.goalId, userGoals]);

  const saveSession = async (event) => {
    event.preventDefault();
    if (!selectedGoal || !form.duration || !form.notes.trim()) return setMessage('Choose a goal, add study time, and write a progress note.');
    const hours = Number(form.duration) === 1 ? 'hour' : 'hours';
    const entry = `[${form.date}] ${currentUser.fullName} studied “${selectedGoal.title}” (${selectedGoal.subject}) for ${form.duration} ${hours}: ${form.notes.trim()}`;
    setIsSaving(true);
    try {
      const result = await onRequest('/study-record', { method: hasRecord ? 'PATCH' : 'POST', body: JSON.stringify({ content: hasRecord ? entry : `StudyBuddy activity log\n${entry}` }) });
      setRecord(result.content || ''); setFileName(result.fileName || 'study-record.txt'); setHasRecord(true);
      setForm((previous) => ({ ...previous, duration: '', notes: '' })); setMessage('Study session saved to your activity log.');
    } catch (error) { setMessage(error.message); } finally { setIsSaving(false); }
  };

  const renameRecord = async () => {
    try { const result = await onRequest('/study-record/rename', { method: 'PATCH', body: JSON.stringify({ fileName }) }); setFileName(result.fileName); setRecord(result.content || ''); setMessage('Your study log was renamed.'); } catch (error) { setMessage(error.message); }
  };
  const deleteRecord = async () => {
    if (!window.confirm('Delete the full study activity log? This cannot be undone.')) return;
    try { await onRequest('/study-record', { method: 'DELETE' }); setRecord(''); setHasRecord(false); setFileName('study-record.txt'); setMessage('Study activity log deleted.'); } catch (error) { setMessage(error.message); }
  };

  return <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Study activity</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Log a focused study session</h2><p className="mt-2 text-sm leading-6 text-slate-600">Connect your progress to a goal and keep a private server-side record of what you completed.</p>
      <form onSubmit={saveSession} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-700">Study goal<select value={form.goalId} onChange={(event) => updateForm('goalId', event.target.value)} className="input-field mt-2" disabled={!userGoals.length}>{userGoals.length ? userGoals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title} · {goal.subject}</option>) : <option value="">Add a study goal first</option>}</select></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Date<input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} className="input-field mt-2" required /></label><label className="block text-sm font-semibold text-slate-700">Focused hours<input type="number" min="0.25" step="0.25" value={form.duration} onChange={(event) => updateForm('duration', event.target.value)} placeholder="e.g. 2" className="input-field mt-2" required /></label></div><label className="block text-sm font-semibold text-slate-700">What did you achieve?<textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} className="input-field mt-2 min-h-32 resize-y" placeholder="e.g. Completed chapter 4 exercises and revised formulas." required /></label><button type="submit" className="btn btn-primary w-full" disabled={isSaving || !userGoals.length}>{isSaving ? 'Saving session…' : 'Save study session'}</button></form>
      {message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Your record</p><h2 className="mt-2 text-2xl font-bold text-slate-900">Study activity history</h2></div><button type="button" onClick={() => loadRecord()} className="btn btn-secondary">Refresh</button></div>{record ? <pre className="mt-6 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">{record}</pre> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-700">No sessions logged yet.</p><p className="mt-2 text-sm text-slate-500">Save a study session to create your activity record.</p></div>}<details className="mt-6 rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer text-sm font-semibold text-slate-700">File options</summary><p className="mt-2 text-xs text-slate-500">{hasRecord ? 'Rename or delete the saved activity record.' : 'These options unlock after you save your first study session.'}</p><div className="mt-4 flex flex-wrap gap-3"><input value={fileName} onChange={(event) => setFileName(event.target.value)} className="input-field max-w-xs" aria-label="Study record filename" disabled={!hasRecord} /><button type="button" onClick={renameRecord} className="btn btn-secondary" disabled={!hasRecord}>Rename</button><button type="button" onClick={deleteRecord} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!hasRecord}>Delete log</button></div></details></section>
  </div>;
}

export default StudyActivityLog;
