// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const adminCheck = require('../middleware/adminCheck');

// POST: Create a new request (any logged-in user)
router.post('/', (req, res) => {
  const { item_id, requester_id, duration } = req.body;

  const priceQuery = 'SELECT rental_price, is_rental FROM items WHERE id = ?';
  db.query(priceQuery, [item_id], (err, priceResult) => {
    if (err) {
      console.error('DB error fetching rental price:', err);
      return res.status(500).json({ message: 'Database error fetching item' });
    }
    if (priceResult.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { rental_price, is_rental } = priceResult[0];
    let rentalAmount = 0;

    if (is_rental) {
      rentalAmount = Math.ceil((rental_price / 3) * duration);
    }

    const insertSql = `
      INSERT INTO requests (item_id, requester_id, duration, status, created_at, rental_amount)
      VALUES (?, ?, ?, 'pending', NOW(), ?)
    `;

    db.query(insertSql, [item_id, requester_id, duration, rentalAmount], (err) => {
      if (err) {
        console.error('DB error inserting request:', err);
        return res.status(500).json({ message: 'Database error inserting request' });
      }

      res.status(201).json({
        message: 'Request submitted successfully!',
        rental_amount: rentalAmount,
      });
    });
  });
});

// GET: Requests (admin gets all, user gets only theirs)
router.get('/', (req, res) => {
  const { user_id } = req.query;

  // If user_id is provided → filter by user (for dashboard payment notification)
  if (user_id) {
    const sql = `
      SELECT
        r.*, 
        u.name AS requester_name, 
        i.title AS item_title, 
        i.is_rental, 
        i.rental_price
      FROM requests r
      JOIN users u ON r.requester_id = u.id
      JOIN items i ON r.item_id = i.id
      WHERE r.requester_id = ?
      ORDER BY r.created_at DESC
    `;
    db.query(sql, [user_id], (err, results) => {
      if (err) {
        console.error('Error fetching user requests:', err);
        return res.status(500).json({ message: 'Database error fetching requests' });
      }
      res.status(200).json(results);
    });
  } 
  // If no user_id → must be admin
  else {
    const sql = `
      SELECT
        r.*, 
        u.name AS requester_name, 
        i.title AS item_title, 
        i.is_rental, 
        i.rental_price,
        a.name AS approved_by_name
      FROM requests r
      JOIN users u ON r.requester_id = u.id
      JOIN items i ON r.item_id = i.id
      LEFT JOIN users a ON r.approved_by = a.id
      ORDER BY r.created_at DESC
    `;
    adminCheck(req, res, () => {
      db.query(sql, (err, results) => {
        if (err) {
          console.error('Error fetching all requests:', err);
          return res.status(500).json({ message: 'Database error fetching requests' });
        }
        res.status(200).json(results);
      });
    });
  }
});

// PUT: Update request status (admin only)
router.put('/:id', adminCheck, (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;
  const adminId = req.userId; // from auth middleware

  if (status === 'approved') {
    const getRequestSql = 'SELECT requester_id, rental_amount FROM requests WHERE id = ?';
    db.query(getRequestSql, [requestId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error fetching request' });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const { requester_id, rental_amount } = result[0];

      // Update status and approved_by admin
      const updateStatusSql = `
        UPDATE requests 
        SET status = ?, approved_by = ? 
        WHERE id = ?
      `;
      db.query(updateStatusSql, [status, adminId, requestId], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to update status' });
        }

        // Here we could send a notification to the user
        // E.g., send email or push notification about payment

        res.status(200).json({ message: 'Request approved. User notified for payment.' });
      });
    });
  } else {
    // Just update status for rejected/cancelled
    const updateStatusSql = 'UPDATE requests SET status = ? WHERE id = ?';
    db.query(updateStatusSql, [status, requestId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update request status' });
      }

      res.status(200).json({ message: `Request ${status}` });
    });
  }
});

module.exports = router;
