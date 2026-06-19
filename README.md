# 🏦 SimpleBank — Web Banking System

A simple web-based banking system built as a college project.

**Tech Stack:** HTML · CSS · JavaScript · Node.js · Express.js

---

## Features

- User Registration and Login
- View Account Balance
- Deposit Money
- Withdraw Money
- Transfer Money to other users
- Full Transaction History
- New accounts start with ₹1,000 welcome balance

---

## Project Structure

```
banking-system/
├── backend/
│   ├── server.js         ← Main server (run this)
│   ├── package.json      ← Dependencies list
│   └── data/
│       └── users.json    ← User data storage
└── frontend/
    ├── index.html        ← Login & Register page
    ├── dashboard.html    ← Main dashboard
    ├── transfer.html     ← Transfer money page
    ├── history.html      ← Transaction history page
    ├── style.css         ← All styling
    └── app.js            ← Frontend JavaScript
```

---

## How to Run This Project

### Step 1 — Install Node.js
Download and install Node.js from: **https://nodejs.org**
Choose the **LTS** version.

To check it installed correctly, open a terminal and type:
```
node --version
```
You should see a version number like `v18.x.x`

---

### Step 2 — Open Terminal in the Backend Folder
Navigate to the `backend` folder inside the project:

```bash
cd banking-system/backend
```

---

### Step 3 — Install Dependencies
This installs Express and CORS (required packages):

```bash
npm install
```

Wait for it to finish. A `node_modules` folder will appear — that's normal.

---

### Step 4 — Start the Server
```bash
node server.js
```

You should see:
```
  ✅  SimpleBank server is running!
  🌐  Open your browser: http://localhost:3000
```

---

### Step 5 — Open in Browser
Go to: **http://localhost:3000**

You will see the Login page. Register a new account and start using SimpleBank!

> **Note:** Keep the terminal open while using the app. The server must be running.

---

## How to Upload to GitHub

### Step 1 — Install Git
Download from: **https://git-scm.com/downloads**
Install with default settings.

---

### Step 2 — Create a GitHub Account
Go to **https://github.com** and sign up for a free account.

---

### Step 3 — Create a New Repository on GitHub
1. Click the **+** icon (top right) → **New repository**
2. Name it: `banking-system`
3. Set visibility: **Public**
4. Do **NOT** check "Add a README file" (we already have one)
5. Click **Create repository**

---

### Step 4 — Open Git Bash / Terminal in Your Project Folder
- Right-click inside the `banking-system` folder
- Select **Open Git Bash here** (or open your terminal and `cd` to the folder)

---

### Step 5 — Initialize Git
```bash
git init
```

---

### Step 6 — Add All Files
```bash
git add .
```

---

### Step 7 — Save Your Changes (Commit)
```bash
git commit -m "Initial commit - SimpleBank project"
```

---

### Step 8 — Connect to Your GitHub Repository
Copy the URL from GitHub (it looks like `https://github.com/YOUR_USERNAME/banking-system.git`)

Then run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/banking-system.git
```

---

### Step 9 — Push to GitHub
```bash
git branch -M main
git push -u origin main
```

Enter your GitHub username and password (or personal access token) when asked.

Done! Your project is now live on GitHub. ✅

---

## Important Notes

- Passwords are stored as plain text in this project. This is fine for a demo/college project, but in a real application, passwords must be hashed using a library like `bcrypt`.
- User data is saved in `backend/data/users.json`. This file is your "database".
- The `node_modules` folder is NOT uploaded to GitHub (it is in `.gitignore`). Anyone who clones your project just needs to run `npm install` to get those files back.

---

## Made With
- Node.js + Express.js (Backend)
- HTML + CSS + JavaScript (Frontend)
- JSON file as database
