// Расположение: C:\OSPanel\domains\Arduino\server\routes\tests.js

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Получение теста для раздела
router.get('/section/:sectionId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tests] = await connection.query('SELECT * FROM tests WHERE section_id = ?', [req.params.sectionId]);
        connection.release();

        if (tests.length === 0) return res.json({ success: true, test: null });
        
        const test = await getFullTest(tests[0].id);
        res.json({ success: true, test });
    } catch (error) {
        console.error('Ошибка получения теста:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение теста для главы
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tests] = await connection.query('SELECT * FROM tests WHERE chapter_id = ?', [req.params.chapterId]);
        connection.release();

        if (tests.length === 0) return res.json({ success: true, test: null });
        
        const test = await getFullTest(tests[0].id);
        res.json({ success: true, test });
    } catch (error) {
        console.error('Ошибка получения теста:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Вспомогательная функция для получения полного теста
async function getFullTest(testId) {
    const connection = await pool.getConnection();
    try {
        const [tests] = await connection.query('SELECT * FROM tests WHERE id = ?', [testId]);
        if (tests.length === 0) return null;

        const test = tests[0];
        const [questions] = await connection.query(
            'SELECT * FROM questions WHERE test_id = ? ORDER BY order_index',
            [test.id]
        );

        for (let question of questions) {
            const [answers] = await connection.query(
                'SELECT id, answer, order_index FROM answers WHERE question_id = ? ORDER BY order_index',
                [question.id]
            );
            question.answers = answers;
        }

        test.questions = questions;
        return test;
    } finally {
        connection.release();
    }
}

// Проверка ответов и сохранение результата
router.post('/check', authenticateToken, async (req, res) => {
    try {
        const { test_id, answers: userAnswers } = req.body;
        const userId = req.user.id;

        if (!test_id || !userAnswers) {
            return res.status(400).json({ success: false, message: 'Нет данных для проверки' });
        }

        const connection = await pool.getConnection();
        
        try {
            const [tests] = await connection.query('SELECT * FROM tests WHERE id = ?', [test_id]);
            if (tests.length === 0) {
                return res.status(404).json({ success: false, message: 'Тест не найден' });
            }

            const test = tests[0];
            const [questions] = await connection.query('SELECT id FROM questions WHERE test_id = ?', [test_id]);

            let correctCount = 0;
            const totalQuestions = questions.length;

            for (let question of questions) {
                const [correctAnswers] = await connection.query(
                    'SELECT id FROM answers WHERE question_id = ? AND is_correct = TRUE',
                    [question.id]
                );

                const correctIds = correctAnswers.map(a => a.id);
                const userAnswer = userAnswers[question.id];

                if (userAnswer) {
                    const userAnswerIds = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                    const isCorrect = correctIds.length === userAnswerIds.length &&
                        correctIds.every(id => userAnswerIds.includes(id));
                    if (isCorrect) correctCount++;
                }
            }

            const percent = Math.round((correctCount / totalQuestions) * 100);
            const passed = percent >= test.pass_percent;

            await connection.query(
                'INSERT INTO test_results (user_id, test_id, score, total_questions, percent, passed) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, test_id, correctCount, totalQuestions, percent, passed]
            );

            res.json({
                success: true,
                result: {
                    score: correctCount,
                    total: totalQuestions,
                    percent,
                    passed,
                    message: passed 
                        ? '🎉 Поздравляем! Тест пройден успешно!' 
                        : `Тест не пройден. Набрано ${percent}%, необходимо ${test.pass_percent}%`
                }
            });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка проверки теста:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение результатов пользователя по разделу
router.get('/results/:sectionId', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [tests] = await connection.query('SELECT id FROM tests WHERE section_id = ?', [req.params.sectionId]);
        
        if (tests.length === 0) {
            connection.release();
            return res.json({ success: true, results: [] });
        }

        const [results] = await connection.query(
            'SELECT * FROM test_results WHERE test_id = ? AND user_id = ? ORDER BY completed_at DESC',
            [tests[0].id, req.user.id]
        );
        connection.release();

        res.json({ success: true, results });
    } catch (error) {
        console.error('Ошибка получения результатов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение всех результатов текущего пользователя
router.get('/results/all', authenticateToken, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [results] = await connection.query(
            'SELECT tr.*, t.title as test_title, t.section_id, t.chapter_id FROM test_results tr ' +
            'LEFT JOIN tests t ON tr.test_id = t.id ' +
            'WHERE tr.user_id = ? ORDER BY tr.completed_at DESC',
            [req.user.id]
        );
        connection.release();

        res.json({ success: true, results });
    } catch (error) {
        console.error('Ошибка получения результатов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Создание/обновление теста
router.post('/manage', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { section_id, chapter_id, title, description, pass_percent, questions } = req.body;
        const connection = await pool.getConnection();
        
        try {
            let query = 'SELECT id FROM tests WHERE ';
            let params = [];
            
            if (section_id) {
                query += 'section_id = ?';
                params = [section_id];
            } else if (chapter_id) {
                query += 'chapter_id = ?';
                params = [chapter_id];
            } else {
                return res.status(400).json({ success: false, message: 'Укажите section_id или chapter_id' });
            }
            
            const [existing] = await connection.query(query, params);
            
            let testId;
            
            if (existing.length > 0) {
                testId = existing[0].id;
                await connection.query(
                    'UPDATE tests SET title = ?, description = ?, pass_percent = ?, section_id = ?, chapter_id = ? WHERE id = ?',
                    [title, description, pass_percent, section_id || null, chapter_id || null, testId]
                );
                await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
            } else {
                const [result] = await connection.query(
                    'INSERT INTO tests (section_id, chapter_id, title, description, pass_percent) VALUES (?, ?, ?, ?, ?)',
                    [section_id || null, chapter_id || null, title, description, pass_percent || 70]
                );
                testId = result.insertId;
            }

            if (questions && Array.isArray(questions)) {
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const [qResult] = await connection.query(
                        'INSERT INTO questions (test_id, question, type, order_index) VALUES (?, ?, ?, ?)',
                        [testId, q.question, q.type || 'single', i]
                    );

                    if (q.answers && Array.isArray(q.answers)) {
                        for (let j = 0; j < q.answers.length; j++) {
                            const a = q.answers[j];
                            await connection.query(
                                'INSERT INTO answers (question_id, answer, is_correct, order_index) VALUES (?, ?, ?, ?)',
                                [qResult.insertId, a.answer, a.is_correct || false, j]
                            );
                        }
                    }
                }
            }

            res.json({ success: true, message: 'Тест сохранён', test_id: testId });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка сохранения теста:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удаление теста по section_id
router.delete('/manage/section/:sectionId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM tests WHERE section_id = ?', [req.params.sectionId]);
        connection.release();
        res.json({ success: true, message: 'Тест удалён' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удаление теста по chapter_id
router.delete('/manage/chapter/:chapterId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM tests WHERE chapter_id = ?', [req.params.chapterId]);
        connection.release();
        res.json({ success: true, message: 'Тест удалён' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получение результатов всех пользователей (админ)
router.get('/results/admin/all', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [results] = await connection.query(
            'SELECT tr.*, t.title as test_title, t.section_id, t.chapter_id, u.username, u.email, u.student_group ' +
            'FROM test_results tr ' +
            'LEFT JOIN tests t ON tr.test_id = t.id ' +
            'LEFT JOIN users u ON tr.user_id = u.id ' +
            'ORDER BY tr.completed_at DESC LIMIT 100'
        );
        connection.release();

        res.json({ success: true, results });
    } catch (error) {
        console.error('Ошибка получения результатов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;