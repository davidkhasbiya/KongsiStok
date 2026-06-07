const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { nama_warung, komunitas, no_wa, password } = req.body;
    if (!nama_warung || !no_wa || !password) {
        return res.status(400).json({ error: 'Nama warung, No WA, dan Password wajib diisi!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (nama_warung, komunitas, no_wa, password) VALUES ($1, $2, $3, $4)',
            [nama_warung, komunitas || null, no_wa, hashedPassword]
        );
        res.json({ success: true, message: 'User berhasil didaftarkan!' });
    } catch (e) {
        res.status(500).json({ error: 'Gagal menyimpan data user ke database' });
    }
};