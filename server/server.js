const express = require('express');
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sql = require('mssql');
require('dotenv').config();

const app = express()
app.use(cors())
app.use(express.json())

console.log("Kunci Gemini Terdeteksi:", process.env.GEMINI_API_KEY ? "YA, AMAN ✅" : "BELUM TERBACA ❌");

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // Set false untuk local development (SSMS)
        trustServerCertificate: true // Wajib true agar tidak error sertifikat SSL di lokal
    }
}

async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log("Database KongsiStok Terhubung Sukses! 🛢️✅");
    } catch (err) {
        console.error("Gagal Koneksi ke Database SQL Server: ❌\n", err.message);
    }
}
connectDB();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

app.post('/api/ai/parse', async (req, res) => {
    const { text } = req.body

    if (!text) {
        return res.status(400).json({ error: 'Cerita kendala stok tidak boleh kosong!' })
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
        "nama_barang": "Nama barang yang jelas dan rapi (kapitalisasi sewajarnya)",
        "jumlah": angka_bulat_saja,
        "satuan": "Satuan barang (contoh: Kg, Tabung, Pcs, Liter, Bungkus, Dus, Bal, Karton)"
        }
        
        Aturan Tambahan:
        1. Jika satuan tidak disebutkan secara eksplisit di teks cerita, tebak satuan yang paling umum/masuk akal (Misal: telur -> Kg, gas -> Tabung, minyak -> Liter, mie -> Dus/Bungkus).
        2. Jika jumlah tidak terdeteksi, berikan nilai default 1.`;

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        const parsedData = JSON.parse(responseText)
        res.json(parsedData)
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Gagal memproses data menggunakan AI Studio' });
    }
});

app.post('/api/stok/add', async (req, res) => {
    // 1. Ambil data dari req.body (Tambahkan 'status' agar bisa menangkap tipe stok dari frontend)
    const { user_id, nama_barang, jumlah, satuan, keterangan, status } = req.body;

    if (!nama_barang || !jumlah) {
        return res.status(400).json({ error: 'Nama barang dan jumlah wajib diisi!' });
    }

    try {
        // 2. Hapus 'transaction' dari kurung jika koneksi biasa
        const request = new sql.Request();

        // 3. Pastikan parameter ketiga KONSISTEN dengan variabel di atas (gunakan nama_barang, bukan namaBarang)
        request.input('user_id', sql.Int, user_id || 1); // fallback ke 1 jika kosong
        request.input('nama_barang', sql.VarChar, nama_barang);
        request.input('jumlah', sql.Int, jumlah);
        request.input('satuan', sql.VarChar, satuan || 'Pcs');
        request.input('status', sql.VarChar, status || 'BUTUH_STOK'); // Nilai default jika dari UI tidak mengirim
        request.input('keterangan', sql.NVarChar, keterangan || null);

        // 4. Eksekusi query T-SQL standar
        await request.query(`
            INSERT INTO stok_requests (user_id, nama_barang, jumlah, satuan, status, keterangan) 
            VALUES (@user_id, @nama_barang, @jumlah, @satuan, @status, @keterangan)
        `);

        res.json({ success: true, message: 'Data stok berhasil disimpan ke database!' });
    } catch (error) {
        console.error('SQL Server Error:', error);
        res.status(500).json({ error: 'Gagal menyimpan data ke database' });
    }
});

app.post('/api/users/register', async (req, res) => {
    const { nama_warung, komunitas, no_wa, password } = req.body;

    if (!nama_warung || !no_wa || !password) {
        return res.status(400).json({ error: 'Nama warung, No WA, dan Password wajib diisi!' });
    }

    try {
        const request = new sql.Request();
        request.input('nama_warung', sql.VarChar, nama_warung);
        request.input('komunitas', sql.VarChar, komunitas || null);
        request.input('no_wa', sql.VarChar, no_wa);
        request.input('password', sql.VarChar, password); // Ingat: di dunia nyata password harus di-hash (misal pakai bcrypt)

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server KongsiStok Backend berjalan di http://localhost:${PORT}`);
});