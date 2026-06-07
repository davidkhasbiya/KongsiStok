const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sql = require('mssql');
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

console.log("Kunci Gemini Terdeteksi:", process.env.GEMINI_API_KEY ? "YA, AMAN " : "BELUM TERBACA ");

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        useUTC: false
    }
};

async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log("Database KongsiStok Terhubung Sukses! ");
    } catch (err) {
        console.error("Gagal Koneksi ke Database SQL Server: \n", err.message);
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
        // Enkripsi password asli menjadi kode acak aman
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const request = new sql.Request();
        request.input('nama_warung', sql.VarChar, nama_warung);
        request.input('komunitas', sql.VarChar, komunitas || null);
        request.input('no_wa', sql.VarChar, no_wa);
        request.input('password', sql.VarChar, hashedPassword); // Simpan hasil enkripsi ke DB

        await request.query(`
            INSERT INTO users (nama_warung, komunitas, no_wa, password) 
            VALUES (@nama_warung, @komunitas, @no_wa, @password)
        `);

        res.json({ success: true, message: 'User berhasil didaftarkan!' });
    } catch (error) {
        console.error('SQL Server Error (Users):', error);
        res.status(500).json({ error: 'Gagal menyimpan data user ke database' });
    }
});

app.post('/api/users/login', async (req, res) => {
    const { no_wa, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('no_wa', sql.VarChar, no_wa)
            .query('SELECT * FROM users WHERE no_wa = @no_wa');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Nomor WhatsApp tidak terdaftar!' });
        }

        const user = result.recordset[0];

        // Membandingkan password teks biasa dari input dengan hash di DB
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
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server database' });
    }
});

app.get('/api/stok', async (req, res) => {
    const { komunitas } = req.query;

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();

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

        if (komunitas) {
            request.input('komunitas', sql.VarChar, komunitas);
            queryStr += ` WHERE u.komunitas = @komunitas`;
        }

        queryStr += ` ORDER BY s.id DESC`;

        const result = await request.query(queryStr);
        res.json(result.recordset);
    } catch (error) {
        console.error('SQL Server GET Error:', error);
        res.status(500).json({ error: 'Gagal mengambil data stok dari database' });
    }
});

app.post('/api/stok/add', verifikasiToken, async (req, res) => {
    // KEAMANAN TINGKAT TINGGI: id user langsung dibaca dari Token JWT yang sah, bukan tembakan manual!
    const user_id = req.user.id;
    const { nama_barang, jumlah, satuan, keterangan, tipe } = req.body;

    if (!nama_barang || !jumlah) {
        return res.status(400).json({ error: 'Nama barang dan jumlah wajib diisi!' });
    }

    try {
        const request = new sql.Request();
        request.input('user_id', sql.Int, user_id);
        request.input('nama_barang', sql.VarChar, nama_barang);
        request.input('jumlah', sql.Int, jumlah);
        request.input('satuan', sql.VarChar, satuan || 'Pcs');
        request.input('tipe', sql.VarChar, tipe || 'BUTUH_STOK');
        request.input('status', sql.VarChar, 'TERSEDIA');
        request.input('keterangan', sql.NVarChar, keterangan || null);

        await request.query(`
            INSERT INTO stok_requests (user_id, nama_barang, jumlah, satuan, tipe, status, keterangan) 
            VALUES (@user_id, @nama_barang, @jumlah, @satuan, @tipe, @status, @keterangan)
        `);

        res.json({ success: true, message: 'Data stok berhasil disimpan ke database!' });
    } catch (error) {
        console.error('SQL Server Error:', error);
        res.status(500).json({ error: 'Gagal menyimpan data ke database' });
    }
});

app.put('/api/stok/:id/status', verifikasiToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.VarChar, status || 'SELESAI')
            .query('UPDATE stok_requests SET status = @status WHERE id = @id');

        res.json({ success: true, message: 'Status kiriman stok berhasil diperbarui!' });
    } catch (error) {
        console.error('SQL Update Status Error:', error);
        res.status(500).json({ error: 'Gagal memperbarui status di database' });
    }
});

app.delete('/api/stok/:id', verifikasiToken, async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM stok_requests WHERE id = @id');

        res.json({ success: true, message: 'Kiriman stok berhasil dihapus dari database!' });
    } catch (error) {
        console.error('SQL Delete Error:', error);
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