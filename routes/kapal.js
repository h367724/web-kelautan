const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
}

router.get('/', authenticateJWT, async (req, res) => {
  const db = req.app.locals.db;
  const result = await db.query('SELECT * FROM kapal');
  res.json(result.rows);
});

router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  const { nama_kapal, jenis_kapal, kapasitas_muatan } = req.body;
  const db = req.app.locals.db;

  if (!nama_kapal || !jenis_kapal || kapasitas_muatan <= 0) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    await db.query(
      'INSERT INTO kapal (nama_kapal, jenis_kapal, kapasitas_muatan) VALUES ($1, $2, $3)',
      [nama_kapal, jenis_kapal, kapasitas_muatan]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error inserting kapal into database' });
  }
});

router.put('/:id_kapal', authenticateJWT, isAdmin, async (req, res) => {
  const { id_kapal } = req.params;
  const { nama_kapal, jenis_kapal, kapasitas_muatan } = req.body;
  const db = req.app.locals.db;

  if (!nama_kapal || !jenis_kapal || kapasitas_muatan <= 0) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    const result = await db.query(
      'UPDATE kapal SET nama_kapal = $1, jenis_kapal = $2, kapasitas_muatan = $3 WHERE id_kapal = $4',
      [nama_kapal, jenis_kapal, kapasitas_muatan, id_kapal]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Kapal not found' });
    }

    res.status(200).json({ message: 'Kapal updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating kapal' });
  }
});

router.delete('/:id_kapal', authenticateJWT, isAdmin, async (req, res) => {
  const { id_kapal } = req.params;
  const db = req.app.locals.db;

  try {
    const result = await db.query('DELETE FROM kapal WHERE id_kapal = $1', [id_kapal]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Kapal not found' });
    }

    res.status(200).json({ message: 'Kapal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting kapal' });
  }
});

module.exports = router;