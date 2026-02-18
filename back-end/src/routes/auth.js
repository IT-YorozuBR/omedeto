const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'rh.admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: { email, role: 'admin' }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
});

// GET /api/verify-token
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
