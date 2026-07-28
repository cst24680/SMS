import { useMemo, useState } from 'react';
import GoalForm from './GoalForm';
import GoalList from './GoalList';
import Profile from './Profile';

function Dashboard({ currentUser, profile, goals, addGoal, updateGoal, deleteGoal, success }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const filteredGoals = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return goals.filter((goal) => goal.title.toLowerCase().includes(query) || goal.subject.toLowerCase().includes(query));
  }, [goals, searchTerm]);

  const handleGoalSubmit = (goalData) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
      setEditingGoal(null);
    } else {
      addGoal(goalData);
    }
  };

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-emerald-600 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">Dashboard</p>
          <h2 className="mt-2 text-3xl font-bold">Welcome back, {currentUser.fullName}!</h2>
          <p className="mt-3 text-emerald-50">Manage your study plans and stay on top of your goals.</p>
        </div>

        {success ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <Profile profile={profile} />
            <GoalForm editingGoal={editingGoal} onSubmit={handleGoalSubmit} onCancel={() => setEditingGoal(null)} />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-slate-900">Your Study Goals</h3>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onInput={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => console.log('Search focused')}
                  onMouseOver={() => console.log('Search hover')}
                  placeholder="Search goals"
                  className="w-48 rounded-full border border-slate-200 px-4 py-2 text-sm"
                />
              </div>
              <div className="mt-6">
                <GoalList goals={filteredGoals} onEdit={setEditingGoal} onDelete={deleteGoal} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
