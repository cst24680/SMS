import { useEffect, useMemo, useState } from 'react';
import GoalForm from './GoalForm';
import GoalList from './GoalList';
import Profile from './Profile';

function Dashboard({ currentUser, profile, goals, addGoal, updateGoal, deleteGoal, success, dataError }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [hoveredGoal, setHoveredGoal] = useState('');

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredGoals = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return goals.filter((goal) => goal.userId === currentUser.id && (goal.title.toLowerCase().includes(query) || goal.subject.toLowerCase().includes(query)));
  }, [goals, searchTerm, currentUser.id]);

  const handleGoalSubmit = async (goalData) => {
    if (editingGoal) {
      const wasSaved = await updateGoal(editingGoal.id, goalData);
      if (wasSaved) setEditingGoal(null);
      return wasSaved;
    } else {
      return addGoal(goalData);
    }
  };

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-emerald-600 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">Dashboard</p>
          <h2 className="mt-2 text-3xl font-bold">Welcome back, {currentUser.fullName}!</h2>
          <p className="mt-3 text-emerald-50">Manage your study plans and stay on top of your goals.</p>
          <p className="mt-2 text-sm text-emerald-100">Responsive view: {screenWidth}px wide</p>
        </div>

        {success ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        {dataError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{dataError}</p> : null}

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
                {hoveredGoal ? <p className="mb-3 text-sm text-slate-500">Viewing: {hoveredGoal}</p> : null}
                <GoalList goals={filteredGoals} onEdit={setEditingGoal} onDelete={deleteGoal} onHover={setHoveredGoal} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
