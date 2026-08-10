import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

const CURRENT_USER_KEY = 'currentUser';
const USER_PROFILE_KEY = 'userProfile';

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    throw new Error('Unable to connect to the StudyBuddy data server. Start it with npm run api.');
  }

  return response.status === 204 ? null : response.json();
}

function App() {
  const [view, setView] = useState('home');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null; } catch { return null; }
  });
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_PROFILE_KEY)) || null; } catch { return null; }
  });
  const [goals, setGoals] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedUsers, storedGoals, storedRequests, storedCalendarEvents] = await Promise.all([request('/users'), request('/goals'), request('/partnerRequests'), request('/calendarEvents')]);
        setUsers(storedUsers);
        setGoals(storedGoals);
        setPartnerRequests(storedRequests);
        setCalendarEvents(storedCalendarEvents);
        setDataError('');
      } catch (error) {
        setDataError(error.message);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(CURRENT_USER_KEY);
  }, [currentUser]);

  useEffect(() => {
    if (profile) localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(USER_PROFILE_KEY);
  }, [profile]);

  const handleSignup = async ({ fullName, email, password, age, institution, subjects, location, studyMode }) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setAuthError('An account with this email already exists.');
      return false;
    }

    try {
      const newUser = await request('/users', {
        method: 'POST',
        body: JSON.stringify({ fullName, email: normalizedEmail, password, age, institution, subjects, location, studyMode }),
      });
      setUsers((previous) => [...previous, newUser]);
      setCurrentUser({ id: newUser.id, fullName, email: normalizedEmail });
      setProfile({ fullName, email: normalizedEmail, age, institution, subjects, location, studyMode });
      setAuthError('');
      setSuccessMessage('Account created successfully!');
      setView('dashboard');
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const handleLogin = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const matchingUsers = await request(`/users?email=${encodeURIComponent(normalizedEmail)}`);
      const foundUser = matchingUsers.find((user) => user.password === password);
      if (!foundUser) {
        setAuthError('Invalid email or password.');
        return false;
      }

      setUsers((previous) => previous.some((user) => user.id === foundUser.id) ? previous : [...previous, foundUser]);
      setCurrentUser({ id: foundUser.id, fullName: foundUser.fullName, email: foundUser.email });
      setProfile({ fullName: foundUser.fullName, email: foundUser.email, age: foundUser.age || '', institution: foundUser.institution || '', subjects: foundUser.subjects || '', location: foundUser.location || '', studyMode: foundUser.studyMode || '' });
      setAuthError('');
      setSuccessMessage('Welcome back! Your study partners are ready.');
      setView('dashboard');
      return true;
    } catch (error) {
      setAuthError(error.message);
      return false;
    }
  };

  const sendPartnerRequest = async (partner) => {
    const hasActiveRequest = partnerRequests.some((requestItem) => (
      (requestItem.fromUserId === currentUser.id && requestItem.toUserId === partner.id) ||
      (requestItem.fromUserId === partner.id && requestItem.toUserId === currentUser.id)
    ) && ['pending', 'sent', 'accepted'].includes(requestItem.status));

    if (hasActiveRequest) {
      setSuccessMessage(`There is already an active study request with ${partner.fullName}.`);
      return false;
    }

    try {
      const newRequest = await request('/partnerRequests', {
        method: 'POST',
        body: JSON.stringify({ fromUserId: currentUser.id, toUserId: partner.id, status: 'pending', createdAt: new Date().toISOString() }),
      });
      setPartnerRequests((previous) => [...previous, newRequest]);
      setSuccessMessage(`Study request sent to ${partner.fullName}.`);
      return true;
    } catch (error) {
      setDataError(error.message);
      return false;
    }
  };

  const respondToPartnerRequest = async (requestItem, status) => {
    try {
      const updatedRequest = await request(`/partnerRequests/${requestItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...requestItem, status, respondedAt: new Date().toISOString() }),
      });
      setPartnerRequests((previous) => previous.map((item) => item.id === updatedRequest.id ? updatedRequest : item));
      const sender = users.find((user) => user.id === requestItem.fromUserId);
      setSuccessMessage(status === 'accepted' ? `You accepted ${sender?.fullName || 'the'} study request.` : 'Study request declined.');
      return true;
    } catch (error) {
      setDataError(error.message);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfile(null);
    setView('home');
    setSuccessMessage('You have been logged out.');
  };

  const addGoal = async (goal) => {
    try {
      const newGoal = await request('/goals', { method: 'POST', body: JSON.stringify({ ...goal, userId: currentUser.id }) });
      setGoals((previous) => [newGoal, ...previous]);
      setSuccessMessage('Goal added successfully.');
      return true;
    } catch (error) {
      setDataError(error.message);
      return false;
    }
  };

  const updateGoal = async (goalId, updatedGoal) => {
    try {
      const savedGoal = await request(`/goals/${goalId}`, { method: 'PUT', body: JSON.stringify({ ...updatedGoal, userId: currentUser.id }) });
      setGoals((previous) => previous.map((goal) => (goal.id === goalId ? savedGoal : goal)));
      setSuccessMessage('Goal updated successfully.');
      return true;
    } catch (error) {
      setDataError(error.message);
      return false;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await request(`/goals/${goalId}`, { method: 'DELETE' });
      setGoals((previous) => previous.filter((goal) => goal.id !== goalId));
      setSuccessMessage('Goal deleted successfully.');
    } catch (error) {
      setDataError(error.message);
    }
  };

  const addCalendarEvent = async (event) => {
    try {
      const savedEvent = await request('/calendarEvents', { method: 'POST', body: JSON.stringify({ ...event, userId: currentUser.id }) });
      setCalendarEvents((previous) => [...previous, savedEvent]);
      setSuccessMessage('Study task added to your calendar.');
      return true;
    } catch (error) {
      setDataError(error.message);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar currentUser={currentUser} onLogout={handleLogout} setView={setView} />
      <main>
        {view === 'home' && <Home setView={setView} />}
        {view === 'login' && <Login onLogin={handleLogin} error={authError} success={successMessage} />}
        {view === 'signup' && <Signup onSignup={handleSignup} error={authError} success={successMessage} />}
        {view === 'dashboard' && currentUser && <Dashboard currentUser={currentUser} profile={profile} users={users} goals={goals} partnerRequests={partnerRequests} calendarEvents={calendarEvents} addGoal={addGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} addCalendarEvent={addCalendarEvent} sendPartnerRequest={sendPartnerRequest} respondToPartnerRequest={respondToPartnerRequest} onRequest={request} success={successMessage} dataError={dataError} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
