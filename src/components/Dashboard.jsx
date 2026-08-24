import { useMemo, useState } from 'react';
import CalendarPlanner from './CalendarPlanner';
import GoalForm from './GoalForm';
import GoalList from './GoalList';
import PartnerMatches from './PartnerMatches';
import PartnerRequests from './PartnerRequests';
import Profile from './Profile';
import StudyActivityManager from './StudyActivityManager';

const navItems = [
  { id: 'records', label: 'Study Activity', icon: '◷' },
  { id: 'overview', label: 'Overview', icon: '⌂' },
  { id: 'calendar', label: 'Calendar', icon: '□' },
  { id: 'goals', label: 'Study Goals', icon: '✓' },
  { id: 'partners', label: 'Partners', icon: '♧' },
];

function Dashboard({ currentUser, profile, users, goals, partnerRequests, calendarEvents, addGoal, updateGoal, deleteGoal, addCalendarEvent, sendPartnerRequest, respondToPartnerRequest, onRequest, success, dataError }) {
  const [activeView, setActiveView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const userGoals = useMemo(() => goals.filter((goal) => goal.userId === currentUser.id), [currentUser.id, goals]);
  const filteredGoals = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return userGoals.filter((goal) => goal.title.toLowerCase().includes(query) || goal.subject.toLowerCase().includes(query));
  }, [searchTerm, userGoals]);
  const incomingCount = partnerRequests.filter((request) => request.toUserId === currentUser.id && ['pending', 'sent'].includes(request.status)).length;
  const upcomingGoals = userGoals.filter((goal) => goal.deadline >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);

  const handleGoalSubmit = async (goalData) => {
    if (!editingGoal) return addGoal(goalData);
    const wasSaved = await updateGoal(editingGoal.id, goalData);
    if (wasSaved) setEditingGoal(null);
    return wasSaved;
  };

  const openGoals = () => { setEditingGoal(null); setActiveView('goals'); };

  return <section className="px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl lg:flex-row">
      <aside className="flex shrink-0 flex-row border-b border-slate-200 bg-slate-950 p-4 text-white lg:w-64 lg:flex-col lg:border-b-0 lg:border-r lg:p-6">
        <div className="hidden lg:block"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-bold">S</div><h2 className="mt-4 text-xl font-bold">Study space</h2><p className="mt-1 text-sm text-slate-400">Plan, connect, achieve.</p></div>
        <nav className="flex w-full gap-2 overflow-x-auto lg:mt-10 lg:flex-col">{navItems.map((item) => <button key={item.id} type="button" onClick={() => setActiveView(item.id)} className={`relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeView === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="text-lg">{item.icon}</span>{item.label}{item.id === 'partners' && incomingCount ? <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-emerald-700">{incomingCount}</span> : null}</button>)}</nav>
        <div className="ml-auto hidden rounded-2xl bg-slate-800 p-4 lg:mt-auto lg:block"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your progress</p><p className="mt-2 text-2xl font-bold">{userGoals.length}</p><p className="text-sm text-slate-300">active study goals</p></div>
      </aside>

      <main className="min-w-0 flex-1 bg-slate-50 p-5 sm:p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{navItems.find((item) => item.id === activeView)?.label}</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Hi, {currentUser.fullName}</h1><p className="mt-2 text-slate-600">Keep your study life organised in one place.</p></div>{activeView !== 'goals' ? <button type="button" onClick={openGoals} className="btn btn-primary">+ Add study goal</button> : null}</header>
        {success ? <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        {dataError ? <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{dataError}</p> : null}

        {activeView === 'overview' && <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-3xl bg-emerald-600 p-5 text-white"><p className="text-sm text-emerald-100">Active goals</p><p className="mt-2 text-4xl font-bold">{userGoals.length}</p></div><button type="button" onClick={() => setActiveView('calendar')} className="rounded-3xl bg-violet-600 p-5 text-left text-white transition hover:-translate-y-1"><p className="text-sm text-violet-100">Calendar tasks</p><p className="mt-2 text-4xl font-bold">{calendarEvents.filter((event) => event.userId === currentUser.id).length}</p></button><button type="button" onClick={() => setActiveView('partners')} className="rounded-3xl bg-slate-900 p-5 text-left text-white transition hover:-translate-y-1"><p className="text-sm text-slate-300">New requests</p><p className="mt-2 text-4xl font-bold">{incomingCount}</p></button></div><div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><Profile profile={profile} /><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Upcoming deadlines</h2><button type="button" onClick={() => setActiveView('calendar')} className="text-sm font-semibold text-emerald-700">View calendar</button></div><div className="mt-4 space-y-3">{upcomingGoals.length ? upcomingGoals.map((goal) => <div key={goal.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div><p className="font-semibold text-slate-800">{goal.title}</p><p className="text-sm text-slate-500">{goal.subject}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{goal.deadline}</span></div>) : <p className="text-slate-500">No upcoming goal deadlines.</p>}</div></section></div></div>}
        {activeView === 'calendar' && <CalendarPlanner currentUser={currentUser} goals={goals} calendarEvents={calendarEvents} onAddEvent={addCalendarEvent} />}
        {activeView === 'goals' && <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]"><GoalForm editingGoal={editingGoal} onSubmit={handleGoalSubmit} onCancel={() => setEditingGoal(null)} /><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">Your study goals</h2><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} onInput={(event) => setSearchTerm(event.target.value)} placeholder="Search goals" className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm sm:w-52" /></div><div className="mt-6"><GoalList goals={filteredGoals} onEdit={setEditingGoal} onDelete={deleteGoal} onHover={() => {}} /></div></section></div>}
        {activeView === 'records' && <StudyActivityManager onRequest={onRequest} currentUser={currentUser} goals={goals} />}
        {activeView === 'partners' && <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]"><PartnerMatches currentUser={currentUser} profile={profile} users={users} partnerRequests={partnerRequests} onConnect={sendPartnerRequest} /><PartnerRequests currentUser={currentUser} users={users} partnerRequests={partnerRequests} onRespond={respondToPartnerRequest} /></div>}
      </main>
    </div>
  </section>;
}

export default Dashboard;
