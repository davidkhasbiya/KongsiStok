const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Helper untuk verifikasi token (karena tidak ada middleware app.use)
const verifikasi = (token) => {
    try { return jwt.verify(token, process.env.JWT_SECRET || 'rahasia_kongsi_stok'); }
    catch (e) { return null; }
};

module.exports = async (req, res) => {
    const { method, headers } = req;
    const token = headers['authorization']?.split(' ')[1];
    const user = verifikasi(token);

    try {
        if (method === 'GET') {
            const { komunitas } = req.query;
            let q = `SELECT s.*, u.nama_warung, u.komunitas, u.no_wa AS whatsapp 
                     FROM stok_requests s JOIN users u ON s.user_id = u.id`;
            const v = [];
            if (komunitas) { q += ` WHERE u.komunitas = $1`; v.push(komunitas); }
            const result = await pool.query(q + ` ORDER BY s.id DESC`, v);
            res.json(result.rows);

        } else if (method === 'POST') {
            if (!user) return res.status(401).json({ error: 'Login dulu!' });
            const { nama_barang, jumlah, satuan, keterangan, tipe } = req.body;
            await pool.query('INSERT INTO stok_requests (user_id, nama_barang, jumlah, satuan, tipe, status, keterangan) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [user.id, nama_barang, jumlah, satuan || 'Pcs', tipe || 'BUTUH_STOK', 'TERSEDIA', keterangan || null]);
            res.json({ success: true });

        } else if (method === 'PUT') {
            const id = req.url.split('/')[2]; // Mengambil ID dari URL
            const { status } = req.body;
            await pool.query('UPDATE stok_requests SET status = $1 WHERE id = $2', [status, id]);
            res.json({ success: true });

        } else if (method === 'DELETE') {
            const id = req.url.split('/')[2];
            await pool.query('DELETE FROM stok_requests WHERE id = $1', [id]);
            res.json({ success: true });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
};