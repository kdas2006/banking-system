const API = 'http://localhost:3000'; // The backend server address
// Check if user is logged in. If not, send them to the login page.
function checkAuth() {
  const user = localStorage.getItem('simplebank_user');
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return JSON.parse(user);
}

// Get the currently logged-in user (without redirecting)
function getUser() {
  const user = localStorage.getItem('simplebank_user');
  return user ? JSON.parse(user) : null;
}

// Logout: clear saved data and go to login page
function logout() {
  localStorage.removeItem('simplebank_user');
  window.location.href = 'index.html';
}

// Show a success (green) or error (red) message
function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = 'message ' + type;
}

// Switch between Login and Register tabs
function showTab(tab, e) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  e.target.classList.add('active');
}

// Register a new account
async function register() {
  const name     = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value.trim();

  if (!name || !username || !password) {
    showMessage('register-message', 'Please fill in all fields.', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, username, password })
    });
    const data = await res.json();

    if (data.success) {
      showMessage('register-message', data.message, 'success');
      // Clear the form fields
      document.getElementById('reg-name').value     = '';
      document.getElementById('reg-username').value = '';
      document.getElementById('reg-password').value = '';
    } else {
      showMessage('register-message', data.message, 'error');
    }
  } catch (err) {
    showMessage('register-message', 'Cannot connect to server. Make sure it is running.', 'error');
  }
}

// Login to an existing account
async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    showMessage('login-message', 'Please enter your username and password.', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      // Save user info to localStorage (browser memory)
      localStorage.setItem('simplebank_user', JSON.stringify({ username, name: data.name }));
      window.location.href = 'dashboard.html'; // Go to dashboard
    } else {
      showMessage('login-message', data.message, 'error');
    }
  } catch (err) {
    showMessage('login-message', 'Cannot connect to server. Make sure it is running.', 'error');
  }
}

// Load everything on the dashboard
async function loadDashboard() {
  const user = checkAuth();
  if (!user) return;

  // Show username in navbar
  document.getElementById('user-name').textContent = user.name;

  // --- Load Balance ---
  try {
    const res  = await fetch(`${API}/api/balance/${user.username}`);
    const data = await res.json();

    if (data.success) {
      // Format number in Indian style (e.g. ₹1,00,000.00)
      document.getElementById('balance').textContent =
        '₹' + data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }
  } catch (err) {
    document.getElementById('balance').textContent = 'Error';
  }

  // --- Load Recent Transactions (last 5 only) ---
  try {
    const res  = await fetch(`${API}/api/transactions/${user.username}`);
    const data = await res.json();

    const tbody = document.getElementById('recent-tx-body');
    tbody.innerHTML = '';

    if (!data.transactions || data.transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No transactions yet. Try depositing!</td></tr>';
      return;
    }

    // Only show the 5 most recent
    data.transactions.slice(0, 5).forEach(tx => {
      const isCredit = tx.type.includes('Deposit') || tx.type.includes('from');
      tbody.innerHTML += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.type}</td>
          <td class="${isCredit ? 'credit' : 'debit'}">
            ${isCredit ? '+' : '-'} ₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
          <td>₹${tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    });
  } catch (err) {
    document.getElementById('recent-tx-body').innerHTML =
      '<tr><td colspan="4" class="empty-state">Could not load transactions.</td></tr>';
  }
}

// Deposit money
async function deposit() {
  const user   = getUser();
  const amount = parseFloat(document.getElementById('deposit-amount').value);

  if (!amount || amount <= 0) {
    showMessage('deposit-message', 'Please enter a valid amount.', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/deposit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username: user.username, amount })
    });
    const data = await res.json();

    if (data.success) {
      showMessage('deposit-message', data.message, 'success');
      document.getElementById('deposit-amount').value = '';
      loadDashboard(); // Refresh the page data
    } else {
      showMessage('deposit-message', data.message, 'error');
    }
  } catch (err) {
    showMessage('deposit-message', 'Server error. Please try again.', 'error');
  }
}

// Withdraw money
async function withdraw() {
  const user   = getUser();
  const amount = parseFloat(document.getElementById('withdraw-amount').value);

  if (!amount || amount <= 0) {
    showMessage('withdraw-message', 'Please enter a valid amount.', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/withdraw`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username: user.username, amount })
    });
    const data = await res.json();

    if (data.success) {
      showMessage('withdraw-message', data.message, 'success');
      document.getElementById('withdraw-amount').value = '';
      loadDashboard(); // Refresh the page data
    } else {
      showMessage('withdraw-message', data.message, 'error');
    }
  } catch (err) {
    showMessage('withdraw-message', 'Server error. Please try again.', 'error');
  }
}

// Load the transfer page (show username + balance)
async function loadTransferPage() {
  const user = checkAuth();
  if (!user) return;

  document.getElementById('user-name').textContent = user.name;

  // Load current balance to show on transfer page
  try {
    const res  = await fetch(`${API}/api/balance/${user.username}`);
    const data = await res.json();

    if (data.success) {
      document.getElementById('balance').textContent =
        '₹' + data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    }
  } catch (err) {
    document.getElementById('balance').textContent = 'Error';
  }
}

// Transfer money to another user
async function transfer() {
  const user       = getUser();
  const toUsername = document.getElementById('to-username').value.trim();
  const amount     = parseFloat(document.getElementById('transfer-amount').value);

  if (!toUsername) {
    showMessage('transfer-message', "Please enter the recipient's username.", 'error');
    return;
  }
  if (!amount || amount <= 0) {
    showMessage('transfer-message', 'Please enter a valid amount.', 'error');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/transfer`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fromUsername: user.username, toUsername, amount })
    });
    const data = await res.json();

    if (data.success) {
      showMessage('transfer-message', data.message, 'success');
      document.getElementById('to-username').value    = '';
      document.getElementById('transfer-amount').value = '';
      // Update the balance shown on this page
      document.getElementById('balance').textContent =
        '₹' + data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    } else {
      showMessage('transfer-message', data.message, 'error');
    }
  } catch (err) {
    showMessage('transfer-message', 'Server error. Please try again.', 'error');
  }
}

// Load all transactions for the history page
async function loadHistory() {
  const user = checkAuth();
  if (!user) return;

  document.getElementById('user-name').textContent = user.name;

  try {
    const res  = await fetch(`${API}/api/transactions/${user.username}`);
    const data = await res.json();

    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';

    if (!data.transactions || data.transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No transactions yet.</td></tr>';
      return;
    }

    data.transactions.forEach(tx => {
      const isCredit = tx.type.includes('Deposit') || tx.type.includes('from');
      tbody.innerHTML += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.type}</td>
          <td class="${isCredit ? 'credit' : 'debit'}">
            ${isCredit ? '+' : '-'} ₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
          <td>₹${tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    });
  } catch (err) {
    document.getElementById('history-body').innerHTML =
      '<tr><td colspan="4" class="empty-state">Could not load transaction history.</td></tr>';
  }
}
