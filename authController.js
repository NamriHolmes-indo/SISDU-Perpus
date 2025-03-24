const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./User');

const router = express.Router();

router.post('/login-session', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        req.session.user = user;
        res.json({ message: 'Login berhasil dengan sesi!', user });
    } catch (err) {
        res.status(400).json({ message: 'Login gagal!', error: err.message });
    }
});

router.post('/login-jwt', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = jwt.sign({ id: user.id_pengguna, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login berhasil dengan JWT!', token, user });
    } catch (err) {
        res.status(400).json({ message: 'Login gagal!', error: err.message });
    }
});

function verifyJWT(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token tidak valid!' });

        req.user = decoded;
        next();
    });
}

router.get('/profile', verifyJWT, (req, res) => {
    res.json({ message: 'Akses berhasil!', user: req.user });
});

module.exports = router;
