// server.js - SimpleBank Backend Server
// Built with Node.js and Express.js
// Handles all banking operations via API

const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH  = path.join(DATA_DIR, 'users.json');

// ---- MIDDLEWARE ----
app.use(cors());                                                      // Allow frontend to call API
app.use(express.json());                                              // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '../frontend')));         // Serve HTML/CSS/JS files

// ---- SETUP: Create data folder and users.json if they don't exist ----
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

// ---- DATABASE HELPERS ----

// Read all users from the JSON file
function readUsers() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// Save all users back to the JSON file
function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

// ============================================
//              API ROUTES
// ============================================

// POST /api/register — Create a new bank account
app.post('/api/register', (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  const users = readUsers();

  if (users[username]) {
    return res.json({ success: false, message: 'Username already taken. Try another one.' });
  }

  // Create new user — everyone starts with ₹1,000
  users[username] = {
    name:         name,
    password:     password,   // NOTE: In real apps, always hash passwords (bcrypt)
    balance:      1000,
    transactions: []
  };

  writeUsers(users);
  res.json({ success: true, message: 'Account created! You can now login.' });
});

// -----------------------------------------------

// POST /api/login — Login to an existing account
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (!users[username] || users[username].password !== password) {
    return res.json({ success: false, message: 'Incorrect username or password.' });
  }

  res.json({
    success: true,
    name:    users[username].name,
    balance: users[username].balance
  });
});

// -----------------------------------------------

// GET /api/balance/:username — Get account balance
app.get('/api/balance/:username', (req, res) => {
  const users = readUsers();
  const user  = users[req.params.username];

  if (!user) {
    return res.json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, balance: user.balance, name: user.name });
});

// -----------------------------------------------

// POST /api/deposit — Add money to account
app.post('/api/deposit', (req, res) => {
  const { username, amount } = req.body;
  const users = readUsers();
  const user  = users[username];

  if (!user)                return res.json({ success: false, message: 'User not found.' });
  if (!amount || amount <= 0) return res.json({ success: false, message: 'Enter a valid amount.' });
  if (amount > 100000)      return res.json({ success: false, message: 'Max deposit per transaction is ₹1,00,000.' });

  // Update balance and log transaction
  user.balance += Number(amount);
  user.transactions.unshift({
    type:    'Deposit',
    amount:  Number(amount),
    date:    new Date().toLocaleString('en-IN'),
    balance: user.balance
  });

  writeUsers(users);
  res.json({ success: true, balance: user.balance, message: `Deposited ₹${amount} successfully!` });
});

// -----------------------------------------------

// POST /api/withdraw — Take money from account
app.post('/api/withdraw', (req, res) => {
  const { username, amount } = req.body;
  const users = readUsers();
  const user  = users[username];

  if (!user)                      return res.json({ success: false, message: 'User not found.' });
  if (!amount || amount <= 0)     return res.json({ success: false, message: 'Enter a valid amount.' });
  if (user.balance < Number(amount)) return res.json({ success: false, message: 'Insufficient balance.' });

  user.balance -= Number(amount);
  user.transactions.unshift({
    type:    'Withdrawal',
    amount:  Number(amount),
    date:    new Date().toLocaleString('en-IN'),
    balance: user.balance
  });

  writeUsers(users);
  res.json({ success: true, balance: user.balance, message: `Withdrew ₹${amount} successfully!` });
});

// -----------------------------------------------

// POST /api/transfer — Send money to another user
app.post('/api/transfer', (req, res) => {
  const { fromUsername, toUsername, amount } = req.body;
  const users    = readUsers();
  const sender   = users[fromUsername];
  const receiver = users[toUsername];

  if (!sender)                           return res.json({ success: false, message: 'Your account was not found.' });
  if (!receiver)                         return res.json({ success: false, message: 'Recipient account not found. Check the username.' });
  if (fromUsername === toUsername)        return res.json({ success: false, message: 'You cannot transfer to your own account.' });
  if (!amount || amount <= 0)            return res.json({ success: false, message: 'Enter a valid amount.' });
  if (sender.balance < Number(amount))   return res.json({ success: false, message: 'Insufficient balance.' });

  const date = new Date().toLocaleString('en-IN');

  // Deduct from sender
  sender.balance -= Number(amount);
  sender.transactions.unshift({
    type:    `Transfer to @${toUsername}`,
    amount:  Number(amount),
    date:    date,
    balance: sender.balance
  });

  // Add to receiver
  receiver.balance += Number(amount);
  receiver.transactions.unshift({
    type:    `Transfer from @${fromUsername}`,
    amount:  Number(amount),
    date:    date,
    balance: receiver.balance
  });

  writeUsers(users);
  res.json({
    success: true,
    balance: sender.balance,
    message: `Successfully transferred ₹${amount} to @${toUsername}!`
  });
});

// -----------------------------------------------

// GET /api/transactions/:username — Get all transactions for a user
app.get('/api/transactions/:username', (req, res) => {
  const users = readUsers();
  const user  = users[req.params.username];

  if (!user) {
    return res.json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, transactions: user.transactions });
});

// -----------------------------------------------

// Start the server
app.listen(PORT, () => {
  console.log('');
  console.log('  ✅  SimpleBank server is running!');
  console.log(`  🌐  Open your browser: http://localhost:${PORT}`);
  console.log('');
});
