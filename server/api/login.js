const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { no_wa, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE no_wa = $1', [no_wa]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tidak terdaftar!' });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Sandi salah!' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'rahasia', { expiresIn: '24h' });
        res.json({ token, user: { nama_warung: user.nama_warung } });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};