const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.register = (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role],
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: 'User registered' });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (!results.length) return res.status(404).send({ message: 'User not found' });

    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) return res.status(401).send({ message: 'Invalid credentials' });

    res.status(200).send({ message: 'Login successful', user });
  });
};