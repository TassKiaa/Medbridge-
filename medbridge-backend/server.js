// server.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// MySQL DB connection
const db = require('./config/db');

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());

// ===== AUTH MIDDLEWARE =====
// Dummy auth middleware (replace with real authentication)
app.use((req, res, next) => {
  // TODO: Replace this with real auth logic, e.g., JWT verification
  req.userId = 1; // hardcoded user id for testing; change as needed
  next();
});

// Static files (CSS, JS, images)
app.use('/public', express.static(path.join(__dirname, '../MedBridgeFrontend/public')));

// Base path for Views
const viewsPath = path.join(__dirname, '../MedBridgeFrontend/views');

// ===== API ROUTES =====
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const itemRoutes = require('./routes/itemRoutes');
const fundRoutes = require('./routes/fundRoutes');

app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/funds', fundRoutes);


// ===== FRONTEND ROUTES (HTML Pages) =====
app.get(['/', '/index', '/index.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'index.html'));
});

app.get(['/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'login.html'));
});

app.get(['/register', '/register.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'register.html'));
});

app.get(['/dashboard', '/dashboard.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'dashboard.html'));
});

app.get(['/admin', '/admin.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'admin-panel.html'));
});

app.get(['/ngo', '/ngo.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'ngo-panel.html'));
});

app.get(['/about', '/about.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'about.html'));
});

app.get(['/request', '/request.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'request.html'));
});

app.get(['/rent', '/rent.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'rent.html'));
});

app.get('/post.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../MedBridgeFrontend/Views/post-item.html'));
});
app.get(['/manage-items', '/manage-items.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'manage-items.html'));
});

app.get(['/edit-item', '/edit-item.html'], (req, res) => {
  res.sendFile(path.join(viewsPath, 'edit-item.html'));
});

// Logout just redirects to login
app.get('/logout', (req, res) => {
  res.redirect('/login');
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
