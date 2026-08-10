import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function GoalManager() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({ title: '', subject: '', deadline: '', priority: 'Medium' });
  const [filterSubject, setFilterSubject] = useState('');
  const [searchId, setSearchId] = useState('');
  const [singleGoal, setSingleGoal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch all goals or filtered goals (Query Param)
  const fetchGoals = async (subject = '') => {
    try {
      const url = subject ? `/api/goals?subject=${encodeURIComponent(subject)}` : '/api/goals';
      const response = await axios.get(url);
      setGoals(response.data);
    } catch (err) {
      showMessage('Failed to fetch goals from server.', 'error');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // GET by ID (Path Param)
  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId) return setSingleGoal(null);
    try {
      const response = await axios.get(`/api/goals/${searchId}`);
      setSingleGoal(response.data);
      showMessage(`Loaded goal #${searchId} details`, 'success');
    } catch (err) {
      setSingleGoal(null);
      showMessage(`Goal #${searchId} not found`, 'error');
    }
  };

  // POST (Create) or PUT (Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Input Validation
    if (!formData.title.trim() || !formData.subject.trim() || !formData.deadline) {
      return showMessage('Please fill in all required fields (Title, Subject, Deadline).', 'error');
    }

    try {
      if (editingId) {
        await axios.put(`/api/goals/${editingId}`, formData);
        showMessage('Goal updated successfully!', 'success');
        setEditingId(null);
      } else {
        await axios.post('/api/goals', formData);
        showMessage('Goal created successfully!', 'success');
      }

      setFormData({ title: '', subject: '', deadline: '', priority: 'Medium' });
      fetchGoals(filterSubject);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error processing request.', 'error');
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await axios.delete(`/api/goals/${id}`);
      showMessage('Goal deleted successfully!', 'success');
      fetchGoals(filterSubject);
    } catch (err) {
      showMessage('Failed to delete goal.', 'error');
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal.id);
    setFormData({ title: goal.title, subject: goal.subject, deadline: goal.deadline, priority: goal.priority });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-emerald-600 mb-6">StudyBuddy Goal Manager</h1>

      {/* Notification Alert */}
      {message.text && (
        <div className={`p-3 rounded mb-4 text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-4 border rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Goal Title *"
          className="p-2 border rounded"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Subject *"
          className="p-2 border rounded"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />
        <input
          type="date"
          className="p-2 border rounded"
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        />
        <select
          className="p-2 border rounded"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>

        <button type="submit" className="md:col-span-2 bg-emerald-600 text-white font-medium p-2 rounded hover:bg-emerald-700">
          {editingId ? 'Update Goal' : 'Add Goal'}
        </button>
      </form>

      {/* Query & Path Parameter Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Filter by Subject (Query Param: /api/goals?subject=X) */}
        <div className="bg-gray-50 p-3 border rounded">
          <label className="block text-xs font-bold uppercase mb-1">Filter by Subject (Query Param)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Maths"
              className="p-2 border rounded w-full"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            />
            <button
              onClick={() => fetchGoals(filterSubject)}
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Search by ID (Path Param: /api/goals/:id) */}
        <div className="bg-gray-50 p-3 border rounded">
          <label className="block text-xs font-bold uppercase mb-1">Find by Goal ID (Path Param)</label>
          <form onSubmit={handleSearchById} className="flex gap-2">
            <input
              type="number"
              placeholder="e.g. 1"
              className="p-2 border rounded w-full"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Path Param Search Result */}
      {singleGoal && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-6">
          <p className="text-sm font-bold text-blue-800">Lookup Result for ID #{singleGoal.id}:</p>
          <p className="text-sm">{singleGoal.title} — {singleGoal.subject} ({singleGoal.priority} Priority, Due: {singleGoal.deadline})</p>
        </div>
      )}

      {/* Goals Table (Read / Delete / Edit) */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 bg-white shadow-sm text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Title</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Deadline</th>
              <th className="p-3 border">Priority</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="p-3 border font-mono">{g.id}</td>
                <td className="p-3 border font-medium">{g.title}</td>
                <td className="p-3 border">{g.subject}</td>
                <td className="p-3 border">{g.deadline}</td>
                <td className="p-3 border">{g.priority}</td>
                <td className="p-3 border space-x-2">
                  <button onClick={() => handleEdit(g)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {goals.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No goals found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}