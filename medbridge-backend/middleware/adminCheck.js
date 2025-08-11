// middleware/adminCheck.js
const db = require('../config/db'); // adjust path if needed

function adminCheck(req, res, next) {
  const userId = req.userId; // This should be set by your auth middleware

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID missing' });
  }

  const sql = 'SELECT role FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('DB error checking admin role:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  });
}

module.exports = adminCheck;
