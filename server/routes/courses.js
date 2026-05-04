// Расположение: C:\OSPanel\domains\Arduino\server\routes\courses.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Получение всех курсов
router.get('/', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [courses] = await connection.query(
            'SELECT * FROM courses WHERE is_published = TRUE ORDER BY order_index'
        );
        connection.release();
        res.json({ success: true, courses });
    } catch (error) {
        console.error('Ошибка получения курсов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение всех курсов (админ)
router.get('/admin', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [courses] = await connection.query('SELECT * FROM courses ORDER BY order_index');
        connection.release();
        res.json({ success: true, courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение курса по ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [courses] = await connection.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        
        if (courses.length === 0) {
            connection.release();
            return res.status(404).json({ success: false, message: 'Курс не найден' });
        }

        const [chapters] = await connection.query(
            'SELECT id, title, order_index FROM chapters WHERE course_id = ? ORDER BY order_index',
            [req.params.id]
        );

        const course = courses[0];
        course.chapters = chapters;
        connection.release();
        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Создание курса (админ)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, duration, difficulty, order_index } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Название обязательно' });

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO courses (title, description, image_url, duration, difficulty, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || '', imageUrl, duration || '', difficulty || 'beginner', order_index || 0]
        );
        connection.release();
        res.status(201).json({ success: true, course: { id: result.insertId, title, description, image_url: imageUrl } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Обновление курса (админ)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, description, duration, difficulty, order_index, is_published } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

        const connection = await pool.getConnection();
        let query = 'UPDATE courses SET ';
        const updates = [];
        const params = [];

        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (duration !== undefined) { updates.push('duration = ?'); params.push(duration); }
        if (difficulty !== undefined) { updates.push('difficulty = ?'); params.push(difficulty); }
        if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }
        if (is_published !== undefined) { updates.push('is_published = ?'); params.push(is_published === 'true' || is_published === true); }
        if (imageUrl) { updates.push('image_url = ?'); params.push(imageUrl); }

        if (updates.length === 0) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Нет данных' });
        }

        query += updates.join(', ') + ' WHERE id = ?';
        params.push(req.params.id);
        await connection.query(query, params);
        connection.release();
        res.json({ success: true, message: 'Курс обновлён' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удаление курса (админ)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('UPDATE chapters SET course_id = NULL WHERE course_id = ?', [req.params.id]);
        await connection.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
        connection.release();
        res.json({ success: true, message: 'Курс удалён' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Привязка главы к курсу (админ)
router.post('/:courseId/chapters/:chapterId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('UPDATE chapters SET course_id = ? WHERE id = ?', [req.params.courseId, req.params.chapterId]);
        connection.release();
        res.json({ success: true, message: 'Глава привязана к курсу' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Отвязка главы от курса (админ)
router.delete('/:courseId/chapters/:chapterId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('UPDATE chapters SET course_id = NULL WHERE id = ? AND course_id = ?', [req.params.chapterId, req.params.courseId]);
        connection.release();
        res.json({ success: true, message: 'Глава отвязана' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;