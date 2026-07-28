import GoalCard from './GoalCard';

function GoalList({ goals, onEdit, onDelete }) {
  if (!goals.length) {
    return <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">No study goals yet. Add one to start building your plan.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default GoalList;
