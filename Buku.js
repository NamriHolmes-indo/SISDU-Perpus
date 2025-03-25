const pool = require ('./db');

class Buku {
  constructor (
    id,
    judul,
    penulis,
    penerbit,
    tahunTerbit,
    stok,
    sampul,
    deskripsi,
    idKategori
  ) {
    console.log ('Data sebelum di-set dalam konstruktor:', {
      tahunTerbit,
      stok,
      idKategori,
    });

    this.id = parseInt (id);
    this.judul = judul;
    this.penulis = penulis;
    this.penerbit = penerbit;

    this.tahunTerbit = tahunTerbit !== undefined && tahunTerbit !== ''
      ? parseInt (tahunTerbit)
      : null;
    this.stok = stok !== undefined && stok !== '' ? parseInt (stok) : null;
    this.idKategori = idKategori !== undefined && idKategori !== ''
      ? parseInt (idKategori)
      : null;

    this.sampul = sampul;
    this.deskripsi = deskripsi;

    console.log ('Data setelah di-set dalam konstruktor:', {
      tahunTerbit: this.tahunTerbit,
      stok: this.stok,
      idKategori: this.idKategori,
    });
  }

  async addBook () {
    try {
      const query = `
                INSERT INTO sisdu_perpus.buku 
                (judul, penulis, penerbit, tahun_terbit, stok, id_kategori, sampul, deskripsi) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id_buku;
            `;
      const values = [
        this.judul,
        this.penulis,
        this.penerbit,
        this.tahun_terbit,
        this.stok,
        this.id_kategori,
        this.sampul,
        this.deskripsi,
      ];
      const result = await pool.query (query, values);
      return result.rows[0];
    } catch (err) {
      throw new Error (err.message);
    }
  }

  async getExistingData () {
    const query = `SELECT * FROM sisdu_perpus.buku WHERE id_buku = $1`;
    const result = await pool.query (query, [parseInt (this.id)]);

    console.log ('Result dari database:', result);
    console.log ('Stok yang diterima:', result.rows.stok);

    console.log ('Hasil Query:', result.rows);

    if (result.rowCount === 0) {
      throw new Error ('Buku tidak ditemukan!');
    }

    return result.rows[0];
  }

  async update () {
    console.log ('Stok yang diterima:', this.stok);
    try {
      const existingData = await this.getExistingData ();
      console.log ('data yang ada:', existingData.stok);

      const newData = {
        judul: this.judul || existingData.judul,
        penulis: this.penulis || existingData.penulis,
        penerbit: this.penerbit || existingData.penerbit,
        tahun_terbit: !isNaN (this.tahun_terbit)
          ? parseInt (this.tahun_terbit)
          : existingData.tahun_terbit,
        stok: parseInt (this.stok) || existingData.stok,
        sampul: this.sampul || existingData.sampul,
        deskripsi: this.deskripsi || existingData.deskripsi,
        id_kategori: !isNaN (this.id_kategori)
          ? parseInt (this.id_kategori)
          : existingData.id_kategori,
      };

      console.log ('Data yang akan diperbarui:', newData);

      const query = `
        UPDATE sisdu_perpus.buku 
        SET judul = $1, penulis = $2, penerbit = $3, tahun_terbit = $4, stok = $5, sampul = $6, deskripsi = $7, id_kategori = $8
        WHERE id_buku = $9
        RETURNING *;
      `;

      const values = [
        newData.judul,
        newData.penulis,
        newData.penerbit,
        newData.tahun_terbit,
        newData.stok,
        newData.sampul,
        newData.deskripsi,
        newData.id_kategori,
        this.id,
      ];

      const result = await pool.query (query, values);
      return result.rows[0];
    } catch (error) {
      console.log (error.message);
      throw new Error ('Gagal memperbarui buku! ' + error.message);
    }
  }

  static async borrowBook (id_buku, id_pengguna) {
    try {
      const query = 'SELECT sisdu_perpus.pinjam($1, $2) AS id_peminjaman';
      const result = await pool.query (query, [id_buku, id_pengguna]);
      return result.rows[0];
    } catch (err) {
      throw new Error (err.message);
    }
  }

  static async returnBook (id_peminjaman) {
    try {
      const query = 'SELECT sisdu_perpus.pengembalian($1)';
      await pool.query (query, [id_peminjaman]);
      return {message: 'Buku berhasil dikembalikan!'};
    } catch (err) {
      throw new Error (err.message);
    }
  }

  static async extendLoan (id_pengguna, id_buku) {
    try {
      const query = 'SELECT sisdu_perpus.perpanjangan($1, $2)';
      await pool.query (query, [id_pengguna, id_buku]);
      return {message: 'Peminjaman berhasil diperpanjang!'};
    } catch (err) {
      throw new Error (err.message);
    }
  }
}

module.exports = Buku;
