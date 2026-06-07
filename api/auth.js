const jwt = require('jsonwebtoken');

const verifyToken = (req) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'rahasia_kongsi_stok');
    } catch (e) {
        return null;
    }
};

module.exports = { verifyToken };