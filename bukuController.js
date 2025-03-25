const express = require ('express');
const Book = require ('./Buku');

const router = express.Router ();

router.post ('/add', async (req, res) => {
  try {
    const book = new Book (
      req.body.judul,
      req.body.penulis,
      req.body.penerbit,
      req.body.tahun_terbit,
      req.body.stok,
      req.body.id_kategori,
      req.body.sampul || '-',
      req.body.deskripsi || ''
    );
    const result = await book.addBook ();
    res.json ({message: 'Buku berhasil ditambahkan!', book: result});
  } catch (err) {
    res
      .status (400)
      .json ({message: 'Gagal menambahkan buku!', error: err.message});
  }
});

router.post ('/borrow', async (req, res) => {
  try {
    const result = await Book.borrowBook (
      req.body.id_buku,
      req.body.id_pengguna
    );
    res.json ({message: 'Buku berhasil dipinjam!', peminjaman: result});
  } catch (err) {
    res
      .status (400)
      .json ({message: 'Gagal meminjam buku!', error: err.message});
  }
});

router.post ('/return', async (req, res) => {
  try {
    const result = await Book.returnBook (req.body.id_peminjaman);
    res.json (result);
  } catch (err) {
    res
      .status (400)
      .json ({message: 'Gagal mengembalikan buku!', error: err.message});
  }
});

router.post ('/extend', async (req, res) => {
  try {
    const result = await Book.extendLoan (req.body.id_peminjaman);
    res.json (result);
  } catch (err) {
    res
      .status (400)
      .json ({message: 'Gagal memperpanjang peminjaman!', error: err.message});
  }
});

router.put ('/update/:id', async (req, res) => {
  try {
    console.log ('Request body yang diterima:', req.body); // Debugging

    const {id} = req.params;
    const {
      judul,
      penulis,
      penerbit,
      tahunTerbit,
      stok,
      sampul,
      deskripsi,
      idKategori,
    } = req.body;

    console.log ('Data sebelum dikirim ke Book:', {
      tahunTerbit,
      stok,
      idKategori,
    });

    const buku = new Book (
      id,
      judul,
      penulis,
      penerbit,
      tahunTerbit,
      stok,
      sampul,
      deskripsi,
      idKategori
    );

    const updatedBuku = await buku.update ();

    res.json ({message: 'Buku berhasil diperbarui!', data: updatedBuku});
  } catch (error) {
    res
      .status (400)
      .json ({message: 'Gagal memperbarui buku!', error: error.message});
  }
});

module.exports = router;
