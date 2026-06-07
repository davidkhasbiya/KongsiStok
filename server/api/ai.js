const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Sesuaikan model
        const result = await model.generateContent(`Ekstrak data dari cerita ini: "${text}"`);
        res.json(JSON.parse(result.response.text()));
    } catch (err) {
        res.status(500).json({ error: 'Gagal memproses AI' });
    }
};