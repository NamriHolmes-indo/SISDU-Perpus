require ('dotenv').config ();
const express = require ('express');
const cors = require ('cors');
const User = require ('./User');
const session = require ('express-session');
const authRoutes = require ('./authController');
const bukuRoutes = require ('./bukuController');

const app = express ();
const PORT = process.env.PORT || 3000;

app.use (cors ());
app.use (express.json ());

app.post ('/register', async (req, res) => {
  try {
    const {
      nama,
      email,
      password,
      jenis_pengguna,
      alamat,
      no_telepon,
    } = req.body;

    if (!nama || !email || !password || !jenis_pengguna) {
      return res.status (400).json ({message: 'Semua field wajib diisi!'});
    }

    const newUser = new User (
      nama,
      email,
      password,
      jenis_pengguna,
      alamat,
      no_telepon
    );
    const result = await newUser.save ();
    res
      .status (201)
      .json ({message: 'Registrasi berhasil!', userId: result.id_pengguna});
  } catch (error) {
    res
      .status (500)
      .json ({message: 'Registrasi gagal!', error: error.message});
  }
});

app.use (
  session ({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false},
  })
);

app.use ('/auth', authRoutes);
app.use ('/b', bukuRoutes);

app.listen (PORT, () => {
  console.log (`Server berjalan di http://localhost:${PORT}`);
});
