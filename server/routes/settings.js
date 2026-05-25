// Расположение: C:\OSPanel\domains\Arduino\server\routes\settings.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Получение всех настроек (публичный)
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [settings] = await connection.query('SELECT * FROM settings');
        connection.release();
        
        const result = {};
        settings.forEach(s => { result[s.setting_key] = s.setting_value; });
        
        res.json({ success: true, settings: result });
    } catch (error) {
        console.error('Ошибка получения настроек:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Обновление настройки (только админ)
router.put('/:key', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { value } = req.body;
        const connection = await pool.getConnection();
        
        await connection.query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [req.params.key, value, value]
        );
        connection.release();
        
        res.json({ success: true, message: 'Настройка обновлена' });
    } catch (error) {
        console.error('Ошибка обновления настройки:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;