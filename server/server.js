const express = require('express');
const cors = require('cors')
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express()
// Tambah baris ini buat ngecek rahasia dapur
console.log("Kunci Gemini Terdeteksi:", process.env.GEMINI_API_KEY ? "YA, AMAN ✅" : "BELUM TERBACA ❌");
app.use(cors())
app.use(express.json())

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server KongsiStok Backend berjalan di http://localhost:${PORT}`);
});