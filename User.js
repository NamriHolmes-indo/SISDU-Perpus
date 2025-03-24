const bcrypt = require('bcryptjs');
const pool = require('./db');

class User {
    constructor(nama, email, password, jenis_pengguna, alamat, no_telepon) {
        this.nama = nama;
        this.email = email;
        this.password = password;
        this.jenis_pengguna = jenis_pengguna;
        this.alamat = alamat;
        this.no_telepon = no_telepon;
        this.foto = "-";
    }

    async hashPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    async save() {
        try {
            await this.hashPassword();
            const query = `
                INSERT INTO sisdu_perpus.pengguna 
                (nama, email, password, jenis_pengguna, alamat, no_telepon, foto) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id_pengguna;
            `;

            const values = [this.nama, this.email, this.password, this.jenis_pengguna, this.alamat, this.no_telepon, this.foto];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (err) {
            throw new Error(err.message);
        }
    }

    static async login(email, password) {
        try {
            const query = `SELECT * FROM sisdu_perpus.pengguna WHERE email = $1;`;
            const result = await pool.query(query, [email]);

            if (result.rows.length === 0) {
                throw new Error('Email tidak ditemukan!');
            }

            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                throw new Error('Password salah!');
            }

            return {
                id_pengguna: user.id_pengguna,
                nama: user.nama,
                email: user.email,
                jenis_pengguna: user.jenis_pengguna,
                alamat: user.alamat,
                no_telepon: user.no_telepon,
                foto: user.foto
            };
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = User;
