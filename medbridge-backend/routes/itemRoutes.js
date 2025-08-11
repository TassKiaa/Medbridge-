// File: routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// =============================
// GET all items (for dashboard)
// =============================
router.get('/', (req, res) => {
  const sql = `
    SELECT id, title, description, type, is_rental, rental_price
    FROM items
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching items:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json(results);
  });
});

// ============================
// GET all items (admin view)
// ============================
router.get('/all', (req, res) => {
  const sql = `
    SELECT i.*, u.name AS user_name
    FROM items i
    JOIN users u ON i.user_id = u.id
    ORDER BY i.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching all items:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json(results);
  });
});

// ========================
// GET single item by ID
// ========================
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM items WHERE id = ?';
  const itemId = req.params.id;

  db.query(sql, [itemId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching item:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(results[0]);
  });
});

// =====================
// CREATE a new item
// =====================
router.post('/', (req, res) => {
  const {
    user_id,
    title,
    description,
    type,
    image_url,
    is_rental,
    rental_price,
    status
  } = req.body;

  const sql = `
    INSERT INTO items (
      user_id, title, description, type, image_url,
      is_rental, rental_price, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [
      user_id,
      title,
      description,
      type,
      image_url || '',
      is_rental,
      rental_price || null,
      status || 'available'
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error inserting item:', err);
        return res.status(500).json({ message: 'Failed to post item.' });
      }

      res.status(201).json({ message: '✅ Item posted successfully!' });
    }
  );
});

// ===================
// DELETE an item
// ===================
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM items WHERE id = ?';
  const itemId = req.params.id;

  db.query(sql, [itemId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting item:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({ message: '✅ Item deleted successfully' });
  });
});

// ==========================
// UPDATE an item by ID
// ==========================
router.put('/:id', (req, res) => {
  const { title, description, rental_price } = req.body;
  const itemId = req.params.id;

  const sql = `
    UPDATE items
    SET title = ?, description = ?, rental_price = ?
    WHERE id = ?
  `;

  db.query(sql, [title, description, rental_price, itemId], (err, result) => {
    if (err) {
      console.error('❌ Error updating item:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json({ message: '✅ Item updated successfully' });
  });
});

module.exports = router;
