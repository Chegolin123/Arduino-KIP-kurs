// Расположение: C:\OSPanel\domains\Arduino\server\routes\auth.js
// Роуты для аутентификации, профиля и управления пользователями

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, isAdmin, generateToken } = require('../middleware/auth');
const { sendVerificationEmail } = require('../config/mailer');

// Регистрация
router.post('/register', [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Имя пользователя должно быть от 3 до 50 символов'),
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, email, password, institution, student_group } = req.body;
        const connection = await pool.getConnection();

        try {
            const [existingUsers] = await connection.query(
                'SELECT id FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Пользователь с таким email или именем уже существует' 
                });
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Проверяем настройку верификации
            const [settings] = await connection.query(
                'SELECT setting_value FROM settings WHERE setting_key = ?',
                ['require_email_verification']
            );
            const requireVerification = settings.length > 0 ? settings[0].setting_value === 'true' : true;

            const [result] = await connection.query(
                'INSERT INTO users (username, email, password_hash, role, institution, student_group, verification_token, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [username, email, passwordHash, 'user', institution || null, student_group || null, requireVerification ? verificationToken : null, !requireVerification]
            );

            console.log('✅ Пользователь создан, верификация:', requireVerification ? 'требуется' : 'отключена');

            if (requireVerification) {
                try {
                    await sendVerificationEmail(email, username, verificationToken);
                } catch (emailError) {
                    console.error('Ошибка отправки письма:', emailError);
                }
            }

            res.status(201).json({
                success: true,
                message: requireVerification 
                    ? 'Регистрация успешна. Проверьте почту для подтверждения email.' 
                    : 'Регистрация успешна. Можете войти.',
                userId: result.insertId,
                requireVerification
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
    }
});

// Подтверждение email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        
        console.log('🔑 Токен для проверки:', token);

        if (!token) {
            return res.status(400).json({ success: false, message: 'Токен не предоставлен' });
        }

        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.query(
                'SELECT id, email, verification_token, email_verified FROM users WHERE verification_token = ?',
                [token]
            );

            console.log('👤 Найдено пользователей:', users.length);

            if (users.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Недействительный токен. Возможно, он уже был использован.' 
                });
            }

            const user = users[0];

            if (user.email_verified) {
                return res.json({ success: true, message: 'Email уже подтверждён ранее' });
            }

            await connection.query(
                'UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?',
                [user.id]
            );

            console.log('✅ Email подтверждён для:', user.email);

            res.json({ success: true, message: 'Email подтверждён!' });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка подтверждения email:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Повторная отправка письма
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email обязателен' });
        }

        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.query(
                'SELECT id, username FROM users WHERE email = ? AND email_verified = FALSE',
                [email]
            );

            if (users.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Пользователь не найден или email уже подтверждён' 
                });
            }

            const user = users[0];
            const verificationToken = crypto.randomBytes(32).toString('hex');
            
            await connection.query(
                'UPDATE users SET verification_token = ? WHERE id = ?',
                [verificationToken, user.id]
            );

            console.log('📧 Новый токен:', verificationToken);

            await sendVerificationEmail(email, user.username, verificationToken);

            res.json({ success: true, message: 'Письмо отправлено повторно' });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка повторной отправки:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Вход
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
            }

            const user = users[0];
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
            }

            // Проверяем настройку верификации
            const [settings] = await connection.query(
                'SELECT setting_value FROM settings WHERE setting_key = ?',
                ['require_email_verification']
            );
            const requireVerification = settings.length > 0 ? settings[0].setting_value === 'true' : true;

            if (requireVerification && !user.email_verified) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Email не подтверждён. Проверьте почту.',
                    needVerification: true,
                    email: user.email
                });
            }

            const token = generateToken(user);

            res.json({
                success: true,
                message: 'Вход выполнен успешно',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    institution: user.institution,
                    student_group: user.student_group
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
    }
});

// Получение профиля
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.query(
                'SELECT id, username, email, role, institution, student_group, created_at FROM users WHERE id = ?',
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
            }

            res.json({ success: true, user: users[0] });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
    }
});

// Получение списка всех пользователей (админ)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query(
            'SELECT id, username, email, role, institution, student_group, created_at FROM users ORDER BY created_at DESC'
        );
        connection.release();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение статистики пользователя (админ)
router.get('/users/:id/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [users] = await connection.query(
                'SELECT id, username, email, role, institution, student_group, created_at FROM users WHERE id = ?',
                [req.params.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'Пользователь не найден' });
            }

            const [chaptersCount] = await connection.query('SELECT COUNT(*) as count FROM chapters');
            const [sectionsCount] = await connection.query('SELECT COUNT(*) as count FROM sections');

            res.json({
                success: true,
                user: users[0],
                stats: {
                    totalChapters: chaptersCount[0].count,
                    totalSections: sectionsCount[0].count,
                    completedSections: 0,
                    completedChapters: 0,
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Изменение роли пользователя (админ)
router.put('/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Некорректная роль' });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        res.json({ success: true, message: 'Роль обновлена' });

    } catch (error) {
        console.error('Ошибка обновления роли:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;