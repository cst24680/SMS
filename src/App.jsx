import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

const USERS_KEY = 'studyBuddyUsers';
const CURRENT_USER_KEY = 'currentUser';
const STUDY_GOALS_KEY = 'studyGoals';
const USER_PROFILE_KEY = 'userProfile';

function App() {
  const [view, setView] = useState('home');
  const [users, setUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_PROFILE_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STUDY_GOALS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STUDY_GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(USER_PROFILE_KEY);
    }
  }, [profile]);

  const handleSignup = ({ fullName, email, password, pace, style }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      setAuthError('An account with this email already exists.');
      return false;
    }

    const newUser = { id: Date.now(), fullName, email: normalizedEmail, password, pace, style };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser({ id: newUser.id, fullName, email: normalizedEmail });
    setProfile({ fullName, email: normalizedEmail, pace, style });
    setAuthError('');
    setSuccessMessage('Account created successfully!');
    setView('dashboard');
    return true;
  };

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find((user) => user.email.toLowerCase() === normalizedEmail && user.password === password);

    if (!foundUser) {
      setAuthError('Invalid email or password.');
      return false;
    }

    setCurrentUser({ id: foundUser.id, fullName: foundUser.fullName, email: foundUser.email });
    setProfile({ fullName: foundUser.fullName, email: foundUser.email, pace: foundUser.pace || '', style: foundUser.style || '' });
    setAuthError('');
    setSuccessMessage('Welcome back!');
    setView('dashboard');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfile(null);
    setView('home');
    setSuccessMessage('You have been logged out.');
  };

  const addGoal = (goal) => {
    const newGoal = { id: Date.now(), ...goal };
    setGoals((prev) => [newGoal, ...prev]);
    setSuccessMessage('Goal added successfully.');
  };

  const updateGoal = (goalId, updatedGoal) => {
    setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, ...updatedGoal } : goal)));
    setSuccessMessage('Goal updated successfully.');
  };

  const deleteGoal = (goalId) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    setSuccessMessage('Goal deleted successfully.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar currentUser={currentUser} onLogout={handleLogout} setView={setView} />
      <main>
        {view === 'home' && <Home setView={setView} />}
        {view === 'login' && <Login onLogin={handleLogin} error={authError} success={successMessage} />}
        {view === 'signup' && <Signup onSignup={handleSignup} error={authError} success={successMessage} />}
        {view === 'dashboard' && currentUser && (
          <Dashboard
            currentUser={currentUser}
            profile={profile}
            goals={goals}
            addGoal={addGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
            success={successMessage}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
