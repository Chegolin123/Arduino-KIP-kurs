// Расположение: C:\OSPanel\domains\Arduino\server\middleware\auth.js
// Middleware для аутентификации и авторизации

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Проверка JWT токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Требуется авторизация' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Токен истёк или недействителен' 
        });
    }
};

// Проверка роли администратора
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Доступ запрещён. Требуются права администратора.' 
        });
    }
};

// Генерация JWT токена
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = { authenticateToken, isAdmin, generateToken };