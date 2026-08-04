function GoalCard({ goal, onEdit, onDelete, onHover }) {

  return (
    <div onMouseOver={() => onHover(goal.title)} onMouseOut={() => onHover('')} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">{goal.subject}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{goal.title}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${goal.priority === 'High' ? 'bg-red-100 text-red-700' : goal.priority === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {goal.priority}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p><span className="font-semibold text-slate-800">Deadline:</span> {goal.deadline}</p>
        <p><span className="font-semibold text-slate-800">Daily Hours:</span> {goal.dailyHours}</p>
        <p><span className="font-semibold text-slate-800">Study Mode:</span> {goal.studyMode}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => onEdit(goal)} onFocus={() => console.log('Edit button focused')} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Edit</button>
        <button onClick={() => onDelete(goal.id)} onFocus={() => console.log('Delete button focused')} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Delete</button>
      </div>
    </div>
  );
}

export default GoalCard;
