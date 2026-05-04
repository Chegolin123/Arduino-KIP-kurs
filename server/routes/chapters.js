// Расположение: C:\OSPanel\domains\Arduino\server\routes\chapters.js
// Роуты для управления главами

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Получение всех глав с разделами
router.get('/', async (req, res) => {
    try {
        const { course_id } = req.query;
        const connection = await pool.getConnection();
        
        try {
            let query = 'SELECT id, title, description, order_index, course_id FROM chapters';
            const params = [];
            
            if (course_id) {
                query += ' WHERE course_id = ?';
                params.push(course_id);
            }
            
            query += ' ORDER BY order_index ASC';
            
            const [chapters] = await connection.query(query, params);

            for (let chapter of chapters) {
                const [sections] = await connection.query(
                    'SELECT id, title, order_index FROM sections WHERE chapter_id = ? ORDER BY order_index ASC',
                    [chapter.id]
                );
                chapter.sections = sections;
            }

            res.json({ success: true, chapters });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка получения глав:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение конкретной главы
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [chapters] = await connection.query(
                'SELECT * FROM chapters WHERE id = ?',
                [req.params.id]
            );

            if (chapters.length === 0) {
                return res.status(404).json({ success: false, message: 'Глава не найдена' });
            }

            const [sections] = await connection.query(
                'SELECT id, title, order_index FROM sections WHERE chapter_id = ? ORDER BY order_index ASC',
                [req.params.id]
            );

            const chapter = chapters[0];
            chapter.sections = sections;

            res.json({ success: true, chapter });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка получения главы:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Создание новой главы (админ)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, order_index } = req.body;
        
        if (!title) {
            return res.status(400).json({ success: false, message: 'Название главы обязательно' });
        }

        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.query(
                'INSERT INTO chapters (title, description, order_index) VALUES (?, ?, ?)',
                [title, description || '', order_index || 0]
            );

            res.status(201).json({
                success: true,
                message: 'Глава создана',
                chapter: { id: result.insertId, title, description, order_index }
            });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка создания главы:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Обновление главы (админ)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, order_index } = req.body;
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.query(
                'UPDATE chapters SET title = ?, description = ?, order_index = ? WHERE id = ?',
                [title, description, order_index, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Глава не найдена' });
            }

            res.json({ success: true, message: 'Глава обновлена' });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка обновления главы:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удаление главы (админ)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.query('DELETE FROM chapters WHERE id = ?', [req.params.id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Глава не найдена' });
            }

            res.json({ success: true, message: 'Глава удалена' });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка удаления главы:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;