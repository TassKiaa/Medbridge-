// File: routes/fundRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST fund transaction
router.post('/', (req, res) => {
  const { user_id, amount, description } = req.body;

  const sql = `
    INSERT INTO fund_transactions (user_id, amount, description, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sql, [user_id, amount, description], (err, result) => {
    if (err) {
      console.error('❌ Fund insert error:', err);
      return res.status(500).json({ message: 'Failed to create fund transaction.' });
    }

    res.status(201).json({ message: '✅ Fund transaction created!' });
  });
});

// GET all fund transactions
router.get('/', (req, res) => {
  const sql = `
    SELECT f.*, u.name AS user_name
    FROM fund_transactions f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching fund data:', err);
      return res.status(500).json({ message: 'Failed to fetch fund data.' });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
