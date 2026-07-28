// app.js - Client-side login logic for StudyBuddy
// This script attaches to the login form, sends credentials to the Express backend,
// and updates the UI with a success or error message without refreshing the page.

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
      JSON.stringify({ name: matchedUser.name, email: matchedUser.email })
    );
    localStorage.setItem(
      'userProfile',
      JSON.stringify({
        name: matchedUser.name,
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
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Login successful! Redirecting...', true);
        localStorage.setItem('currentUser', JSON.stringify({ username }));
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
        return;
      }

      showMessage(result.message || 'Invalid username or password.', false);
    } catch (error) {
      console.error('Login request failed:', error);

      // If the server is unavailable, try a localStorage-based login first.
      // If the user is not registered locally, show a clear "not registered" message
      // instead of a generic server-unavailable message.
      if (handleLocalStorageLogin(username, password)) {
        showMessage('Local login successful! Redirecting...', true);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
        return;
      }

      // No local account found — tell the user they're not registered locally.
      showMessage('No matching account found locally. Please sign up or try again later.', false);
    }
  });
});
