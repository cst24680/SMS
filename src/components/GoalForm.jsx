import { useState, useEffect } from 'react';

const initialGoal = {
  title: '',
  subject: '',
  deadline: '',
  dailyHours: '',
  studyMode: 'Individual',
  priority: 'Medium',
};

function GoalForm({ onSubmit, editingGoal, onCancel }) {
  const [formData, setFormData] = useState(initialGoal);
  const [focusedField, setFocusedField] = useState('');
  const [inputMessages, setInputMessages] = useState({});

  useEffect(() => {
    if (editingGoal) {
      setFormData(editingGoal);
    } else {
      setFormData(initialGoal);
    }
  }, [editingGoal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInputMessages((prev) => ({ ...prev, [name]: value ? 'Looks good.' : 'Please enter a value.' }));
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.deadline || !formData.dailyHours) {
      return;
    }
    onSubmit(formData);
    setFormData(initialGoal);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Goal Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('title')}
            onBlur={handleBlur}
            className={`input-field ${focusedField === 'title' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            placeholder="e.g. Finish React project"
            required
          />
          {inputMessages.title ? <p className="mt-1 text-xs text-slate-500">{inputMessages.title}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
          <input
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('subject')}
            onBlur={handleBlur}
            className={`input-field ${focusedField === 'subject' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            placeholder="e.g. Programming"
            required
          />
          {inputMessages.subject ? <p className="mt-1 text-xs text-slate-500">{inputMessages.subject}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Deadline</label>
          <input
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('deadline')}
            onBlur={handleBlur}
            className={`input-field ${focusedField === 'deadline' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            required
          />
          {inputMessages.deadline ? <p className="mt-1 text-xs text-slate-500">{inputMessages.deadline}</p> : null}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Daily Study Hours</label>
          <input
            name="dailyHours"
            type="number"
            min="1"
            value={formData.dailyHours}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('dailyHours')}
            onBlur={handleBlur}
            className={`input-field ${focusedField === 'dailyHours' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            required
          />
          {inputMessages.dailyHours ? <p className="mt-1 text-xs text-slate-500">{inputMessages.dailyHours}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Study Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="studyMode" value="Individual" checked={formData.studyMode === 'Individual'} onChange={handleChange} />
            Individual
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="studyMode" value="Group" checked={formData.studyMode === 'Group'} onChange={handleChange} />
            Group
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Priority</label>
        <select name="priority" value={formData.priority} onChange={handleChange} className="input-field">
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary">{editingGoal ? 'Update Goal' : 'Add Goal'}</button>
        {editingGoal ? <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button> : null}
      </div>
    </form>
  );
}

export default GoalForm;
