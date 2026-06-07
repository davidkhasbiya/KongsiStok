const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { no_wa, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE no_wa = $1', [no_wa]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Nomor WhatsApp tidak terdaftar!' });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Kata sandi salah!' });

        const token = jwt.sign(
            { id: user.id, no_wa: user.no_wa },
            process.env.JWT_SECRET || 'rahasia_kongsi_stok',
            { expiresIn: '24h' }
        );

        // Kunci Perbaikan: Sertakan semua object user seperti di server.js lama
        res.json({
            token,
            user: {
                id: user.id,
                nama_warung: user.nama_warung,
                komunitas: user.komunitas,
                no_wa: user.no_wa
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server database' });
    }
};