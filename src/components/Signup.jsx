import { useState } from 'react';

function Signup({ onSignup, error, success }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', pace: '', style: '' });
  const [focusedField, setFocusedField] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInputMessage(value ? `${name} looks good.` : `Enter your ${name}.`);
  };

  const handleFocus = (name) => {
    setFocusedField(name);
  };

  const handleBlur = () => {
    setFocusedField('');
    setInputMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      return;
    }
    onSignup(formData);
  };

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-slate-600">Join StudyBuddy and start building your study routine.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('fullName')}
            onBlur={handleBlur}
            placeholder="Your name"
            className={`input-field ${focusedField === 'fullName' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('email')}
            onBlur={handleBlur}
            placeholder="you@example.com"
            className={`input-field ${focusedField === 'email' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            required
          />
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('password')}
            onBlur={handleBlur}
            placeholder="Create a password"
            className={`input-field ${focusedField === 'password' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            required
          />
          <select
            name="pace"
            value={formData.pace}
            onChange={handleChange}
            onFocus={() => handleFocus('pace')}
            onBlur={handleBlur}
            className={`input-field ${focusedField === 'pace' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
          >
            <option value="">Select pace</option>
            <option value="Fast">Fast</option>
            <option value="Moderate">Moderate</option>
            <option value="Slow">Slow</option>
          </select>
          <select
            name="style"
            value={formData.style}
            onChange={handleChange}
            onFocus={() => handleFocus('style')}
            onBlur={handleBlur}
            className={`input-field ${focusedField === 'style' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
          >
            <option value="">Select style</option>
            <option value="Silent">Silent co-working</option>
            <option value="Discussion">Discussion-based</option>
            <option value="Mixed">Mixed</option>
          </select>
          {inputMessage ? <p className="text-sm text-slate-500">{inputMessage}</p> : null}
          <button type="submit" className="btn btn-primary w-full" onMouseOver={() => setInputMessage('Submit your new account')} onFocus={() => setInputMessage('Submit your new account')}>Sign Up</button>
        </form>
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      </div>
    </section>
  );
}

export default Signup;
