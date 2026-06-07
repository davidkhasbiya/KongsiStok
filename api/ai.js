const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Cerita kendala stok tidak boleh kosong!' });

    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.1-flash-lite',
            generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = `Kamu adalah asisten AI untuk aplikasi manajemen stok warung tetangga bernama KongsiStok.
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
    } catch (err) {
        res.status(500).json({ error: 'Gagal memproses data menggunakan AI Studio' });
    }
};