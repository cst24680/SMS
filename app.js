// app.js - Client-side login logic for StudyBuddy

window.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  if (!loginForm || !loginEmail || !loginPassword) {
    return;
  }

  const messageContainer = document.createElement('div');
  messageContainer.id = 'loginMessage';
  loginForm.parentNode.insertBefore(messageContainer, loginForm.nextSibling);

  const showMessage = (text, success = true) => {
    messageContainer.textContent = text;
    messageContainer.className = success
      ? 'mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
      : 'mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700';
  };

  const clearMessage = () => {
    messageContainer.textContent = '';
    messageContainer.className = '';
  };

  const getStoredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('studyBuddyUsers')) || [];
    } catch (error) {
      return [];
    }
  };

  const handleLocalStorageLogin = (username, password) => {
    const users = getStoredUsers();
    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === username.toLowerCase() && user.password === password
    );

    if (!matchedUser) {
      return false;
    }

    localStorage.setItem(
      'currentUser',
      JSON.stringify({ name: matchedUser.name || matchedUser.fullName, email: matchedUser.email })
    );
    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        name: matchedUser.name || matchedUser.fullName,
        email: matchedUser.email,
        pace: matchedUser.pace || '',
        style: matchedUser.style || '',
      })
    );
    return true;
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const username = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!username || !password) {
      showMessage('Please enter both username and password.', false);
      return;
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response returned from server');
      }

      const result = await response.json();

      if (result.success) {
        showMessage('Login successful! Redirecting to dashboard...', true);
        localStorage.setItem(
          'currentUser',
          JSON.stringify(result.user || { username })
        );
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
        return;
      }

      showMessage(result.message || 'Invalid username or password.', false);
    } catch (error) {
      console.warn('Backend login check failed, falling back to localStorage...', error);

      if (handleLocalStorageLogin(username, password)) {
        showMessage('Local login successful! Redirecting to dashboard...', true);
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
        return;
      }

      showMessage('Invalid email or password. Please try again or create an account.', false);
    }
  });
});