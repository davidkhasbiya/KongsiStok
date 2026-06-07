const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg'); // 1. Menggunakan Pool dari library 'pg'
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Terlalu banyak permintaan dari IP ini, coba lagi nanti." }
});
app.use('/api/users/login', limiter);
app.use('/api/users/register', limiter);

console.log("Kunci Gemini Terdeteksi:", process.env.GEMINI_API_KEY ? "YA, AMAN 🚀" : "BELUM TERBACA ⚠️");

// KONEKSI POSTGRESQL (Menggunakan Connection String)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function connectDB() {
    try {
        await pool.connect();
        console.log("Database KongsiStok Terhubung Sukses (PostgreSQL)! 🐘");
    } catch (err) {
        console.error("Gagal Koneksi ke Database PostgreSQL: \n", err.message);
    }
}
connectDB();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function verifikasiToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn("⚠️ Keamanan: Ada request ke API terproteksi TANPA membawa Token!");
        return res.status(401).json({ error: 'Akses ditolak! Anda harus login terlebih dahulu.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'rahasia_kongsi_stok', (err, user) => {
        if (err) {
            console.warn("⚠️ Keamanan: Mencoba akses dengan Token yang TIDAK VALID atau KEDALUWARSA!");
            return res.status(403).json({ error: 'Token tidak valid atau sudah kedaluwarsa!' });
        }
        req.user = user;
        next();
    });
}

app.post('/api/users/register', async (req, res) => {
    const { nama_warung, komunitas, no_wa, password } = req.body;

    if (!nama_warung || !no_wa || !password) {
        return res.status(400).json({ error: 'Nama warung, No WA, dan Password wajib diisi!' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Menggunakan parameter $1, $2, dst. untuk PostgreSQL
        const queryStr = `
            INSERT INTO users (nama_warung, komunitas, no_wa, password) 
            VALUES ($1, $2, $3, $4)
        `;
        const values = [nama_warung, komunitas || null, no_wa, hashedPassword];

        await pool.query(queryStr, values);

        res.json({ success: true, message: 'User berhasil didaftarkan!' });
    } catch (error) {
        console.error('PostgreSQL Error (Users Register):', error);
        res.status(500).json({ error: 'Gagal menyimpan data user ke database' });
    }
});

app.post('/api/users/login', async (req, res) => {
    const { no_wa, password } = req.body;

    try {
        // 4. Query select menggunakan pg pool
        const result = await pool.query('SELECT * FROM users WHERE no_wa = $1', [no_wa]);

        // PostgreSQL mengembalikan data lewat properti .rows
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nomor WhatsApp tidak terdaftar!' });
        }

        const user = result.rows[0];

        const passwordCocok = await bcrypt.compare(password, user.password);
        if (!passwordCocok) {
            return res.status(401).json({ error: 'Kata sandi salah!' });
        }

        const token = jwt.sign(
            { id: user.id, no_wa: user.no_wa },
            process.env.JWT_SECRET || 'rahasia_kongsi_stok',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login berhasil',
            token: token,
            user: {
                id: user.id,
                nama_warung: user.nama_warung,
                komunitas: user.komunitas,
                no_wa: user.no_wa
            }
        });
    } catch (err) {
        console.error('PostgreSQL Error (Login):', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server database' });
    }
});

app.get('/api/stok', async (req, res) => {
    const { komunitas } = req.query;

    try {
        let queryStr = `
            SELECT 
                s.id, 
                s.user_id, 
                s.nama_barang, 
                s.jumlah, 
                s.satuan, 
                s.keterangan, 
                s.created_at,
                s.tipe,
                s.status,
                u.nama_warung, 
                u.komunitas,         
                u.no_wa AS whatsapp      
            FROM stok_requests s
            INNER JOIN users u ON s.user_id = u.id
        `;

        const values = [];

        // 5. Penanganan query dinamis untuk PostgreSQL
        if (komunitas) {
            queryStr += ` WHERE u.komunitas = $1`;
            values.push(komunitas);
        }

        queryStr += ` ORDER BY s.id DESC`;

        const result = await pool.query(queryStr, values);
        res.json(result.rows);
    } catch (error) {
        console.error('PostgreSQL GET Error:', error);
        res.status(500).json({ error: 'Gagal mengambil data stok dari database' });
    }
});

app.post('/api/stok/add', verifikasiToken, async (req, res) => {
    const user_id = req.user.id;
    const { nama_barang, jumlah, satuan, keterangan, tipe } = req.body;

    if (!nama_barang || !jumlah) {
        return res.status(400).json({ error: 'Nama barang dan jumlah wajib diisi!' });
    }

    try {
        const queryStr = `
            INSERT INTO stok_requests (user_id, nama_barang, jumlah, satuan, tipe, status, keterangan) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        const values = [
            user_id,
            nama_barang,
            jumlah,
            satuan || 'Pcs',
            tipe || 'BUTUH_STOK',
            'TERSEDIA',
            keterangan || null
        ];

        await pool.query(queryStr, values);

        res.json({ success: true, message: 'Data stok berhasil disimpan ke database!' });
    } catch (error) {
        console.error('PostgreSQL Insert Error:', error);
        res.status(500).json({ error: 'Gagal menyimpan data ke database' });
    }
});

app.put('/api/stok/:id/status', verifikasiToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const queryStr = 'UPDATE stok_requests SET status = $1 WHERE id = $2';
        await pool.query(queryStr, [status || 'SELESAI', id]);

        res.json({ success: true, message: 'Status kiriman stok berhasil diperbarui!' });
    } catch (error) {
        console.error('PostgreSQL Update Status Error:', error);
        res.status(500).json({ error: 'Gagal memperbarui status di database' });
    }
});

app.delete('/api/stok/:id', verifikasiToken, async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM stok_requests WHERE id = $1', [id]);

        res.json({ success: true, message: 'Kiriman stok berhasil dihapus dari database!' });
    } catch (error) {
        console.error('PostgreSQL Delete Error:', error);
        res.status(500).json({ error: 'Gagal menghapus data dari database' });
    }
});

app.post('/api/ai/parse', verifikasiToken, async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Cerita kendala stok tidak boleh kosong!' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = ` Kamu adalah asisten AI untuk aplikasi manajemen stok warung tetangga bernama KongsiStok.
        Tugasmu adalah menganalisis cerita/curhatan pemilik warung dan mengekstraknya menjadi data barang yang dicari atau ditawarkan.
        
        Cerita Pemilik Warung: "${text}"
        
        Ekstrak cerita tersebut menjadi objek JSON dengan struktur wajib seperti di bawah ini:
        {
        "nama_barang": "Nama barang yang jelas dan rapi",
        "jumlah": angka_bulat_saja,
        "satuan": "Satuan barang"
        }
        
        Aturan Tambahan:
        1. Jika satuan tidak disebutkan, tebak yang paling umum.
        2. Jika jumlah tidak terdeteksi, berikan nilai default 1.`;

        const result = await model.generateContent(prompt);
        res.json(JSON.parse(result.response.text()));
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Gagal memproses data menggunakan AI Studio' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server KongsiStok Backend berjalan di http://localhost:${PORT}`);
});