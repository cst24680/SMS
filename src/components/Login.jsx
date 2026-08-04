import { useState } from 'react';

function Login({ onLogin, error, success }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setInputMessage('Signing you in...');
    await onLogin(formData);
    setIsSubmitting(false);
  };

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
        <p className="mt-2 text-slate-600">Log in to continue your study journey.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            placeholder="Enter your password"
            className={`input-field ${focusedField === 'password' ? 'border-emerald-500 ring-1 ring-emerald-200' : ''}`}
            required
          />
          {inputMessage ? <p className="text-sm text-slate-500">{inputMessage}</p> : null}
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Signing in...' : 'Log In'}</button>
        </form>
        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      </div>
    </section>
  );
}

export default Login;
