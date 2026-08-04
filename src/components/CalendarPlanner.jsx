import { useMemo, useState } from 'react';

const dateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const todayKey = () => { const today = new Date(); return dateKey(today.getFullYear(), today.getMonth(), today.getDate()); };

function CalendarPlanner({ currentUser, goals, calendarEvents, onAddEvent }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('18:00');

  const entriesByDate = useMemo(() => {
    const entries = {};
    const add = (date, entry) => { if (!entries[date]) entries[date] = []; entries[date].push(entry); };
    goals.filter((goal) => goal.userId === currentUser.id).forEach((goal) => add(goal.deadline, { id: `goal-${goal.id}`, title: goal.title, kind: 'Goal deadline', color: 'bg-emerald-500' }));
    calendarEvents.filter((event) => event.userId === currentUser.id).forEach((event) => add(event.date, { ...event, kind: 'Study task', color: 'bg-violet-500' }));
    return entries;
  }, [calendarEvents, currentUser.id, goals]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];

  const moveMonth = (offset) => {
    const next = new Date(year, month + offset, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const addEvent = async (event) => {
    event.preventDefault();
    if (!eventTitle.trim()) return;
    const saved = await onAddEvent({ title: eventTitle.trim(), date: selectedDate, time: eventTime });
    if (saved) setEventTitle('');
  };

  return <div className="grid gap-6 xl:grid-cols-[1.55fr_0.75fr]">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Study planner</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{monthLabel}</h2></div><div className="flex gap-2"><button type="button" onClick={() => moveMonth(-1)} className="utility-btn px-3">←</button><button type="button" onClick={() => moveMonth(1)} className="utility-btn px-3">→</button></div></div>
      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="py-2">{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{cells.map((day, index) => {
        if (!day) return <div key={`blank-${index}`} className="min-h-20 rounded-xl bg-slate-50/50" />;
        const key = dateKey(year, month, day); const entries = entriesByDate[key] || []; const selected = key === selectedDate; const isToday = key === todayKey();
        return <button type="button" key={key} onClick={() => setSelectedDate(key)} className={`min-h-20 rounded-xl border p-2 text-left transition hover:border-emerald-400 ${selected ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200' : 'border-slate-100 bg-white'} ${isToday ? 'font-bold text-emerald-700' : 'text-slate-700'}`}><span className="text-sm">{day}</span><div className="mt-1 space-y-1">{entries.slice(0, 2).map((entry) => <span key={entry.id} className={`block truncate rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${entry.color}`}>{entry.title}</span>)}{entries.length > 2 ? <span className="text-[10px] text-slate-500">+{entries.length - 2} more</span> : null}</div></button>;
      })}</div>
    </section>
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Selected day</p><h3 className="mt-1 text-xl font-bold text-slate-900">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
      <div className="mt-5 space-y-3">{(entriesByDate[selectedDate] || []).length ? (entriesByDate[selectedDate] || []).map((entry) => <div key={entry.id} className="rounded-2xl bg-slate-50 p-3"><p className="font-semibold text-slate-800">{entry.title}</p><p className="mt-1 text-xs text-slate-500">{entry.kind}{entry.time ? ` · ${entry.time}` : ''}</p></div>) : <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No tasks scheduled.</p>}</div>
      <form onSubmit={addEvent} className="mt-5 space-y-3 border-t border-slate-100 pt-5"><label className="text-sm font-semibold text-slate-700">Add study task</label><input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} onInput={(event) => setEventTitle(event.target.value)} className="input-field" placeholder="e.g. Revise chapter 3" required /><input type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} className="input-field" /><button type="submit" className="btn btn-primary w-full">Add to calendar</button></form>
    </aside>
  </div>;
}

export default CalendarPlanner;
