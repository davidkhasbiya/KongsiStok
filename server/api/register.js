const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send();
    const { nama_warung, no_wa, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (nama_warung, no_wa, password) VALUES ($1, $2, $3)', [nama_warung, no_wa, hashedPassword]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Gagal register' }); }
};