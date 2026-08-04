import { useState } from 'react';

function Signup({ onSignup, error, success }) {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', age: '', institution: '', subjects: '', location: '', studyMode: 'Individual' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.age || !formData.institution) {
      return;
    }
    await onSignup(formData);
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
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="subjects" value={formData.subjects} onChange={handleChange} onInput={handleInput} onFocus={() => handleFocus('subjects')} onBlur={handleBlur} placeholder="Subjects: e.g. Programming, Maths" className={`input-field ${focusedField === 'subjects' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`} required />
            <input name="location" value={formData.location} onChange={handleChange} onInput={handleInput} onFocus={() => handleFocus('location')} onBlur={handleBlur} placeholder="City: e.g. Kochi" className={`input-field ${focusedField === 'location' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred study setting</label>
            <select name="studyMode" value={formData.studyMode} onChange={handleChange} className="input-field">
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
              <option value="Online">Online</option>
            </select>
          </div>
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
          <input
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('age')}
            onBlur={handleBlur}
            placeholder="Your age"
            className={`input-field ${focusedField === 'age' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
          />
          <input
            name="institution"
            type="text"
            value={formData.institution}
            onChange={handleChange}
            onInput={handleInput}
            onFocus={() => handleFocus('institution')}
            onBlur={handleBlur}
            placeholder="School / college / working"
            className={`input-field ${focusedField === 'institution' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
          />
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
