// Расположение: C:\OSPanel\domains\Arduino\server\routes\sections.js
// Роуты разделов с поддержкой медиа, экспорта и импорта

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');
const ExcelJS = require('exceljs');
const fs = require('fs');

const uploadExcel = multer({ dest: 'uploads/excel/' });

// Получение раздела по ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [sections] = await connection.query(
                'SELECT * FROM sections WHERE id = ?',
                [req.params.id]
            );

            if (sections.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Раздел не найден' 
                });
            }

            const section = sections[0];
            
            if (section.media && typeof section.media === 'string') {
                try {
                    section.media = JSON.parse(section.media);
                } catch (e) {
                    section.media = { video: null, images: [] };
                }
            } else if (!section.media) {
                section.media = { video: null, images: [] };
            }

            res.json({
                success: true,
                section
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка получения раздела:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

// Создание раздела (админ)
router.post('/', authenticateToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const { chapter_id, title, content, order_index, video_url } = req.body;
        
        if (!chapter_id || !title) {
            return res.status(400).json({ 
                success: false, 
                message: 'chapter_id и title обязательны' 
            });
        }

        const connection = await pool.getConnection();
        
        try {
            const media = {
                video: video_url || null,
                images: []
            };

            if (req.files && req.files.length > 0) {
                media.images = req.files.map(file => `/uploads/${file.filename}`);
            }

            const [result] = await connection.query(
                'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                [chapter_id, title, content || '', JSON.stringify(media), order_index || 0]
            );

            res.status(201).json({
                success: true,
                message: 'Раздел создан',
                section: {
                    id: result.insertId,
                    chapter_id,
                    title,
                    content,
                    media,
                    order_index
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка создания раздела:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

// Обновление раздела (админ)
router.put('/:id', authenticateToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const { title, content, order_index, video_url, clear_video, keep_existing_images } = req.body;
        const connection = await pool.getConnection();
        
        try {
            const [sections] = await connection.query('SELECT media FROM sections WHERE id = ?', [req.params.id]);
            if (sections.length === 0) {
                return res.status(404).json({ success: false, message: 'Раздел не найден' });
            }

            let media = { video: null, images: [] };
            
            if (sections[0].media) {
                try {
                    const parsed = typeof sections[0].media === 'string' 
                        ? JSON.parse(sections[0].media) 
                        : sections[0].media;
                    media = { ...media, ...parsed };
                } catch (e) {
                    console.error('Ошибка парсинга media:', e);
                }
            }

            if (clear_video === 'true') {
                media.video = null;
            } else if (video_url !== undefined && video_url !== '') {
                media.video = video_url;
            }

            if (keep_existing_images === 'true') {
                if (req.files && req.files.length > 0) {
                    media.images = [
                        ...(media.images || []),
                        ...req.files.map(file => `/uploads/${file.filename}`)
                    ];
                }
            } else if (req.files && req.files.length > 0) {
                media.images = req.files.map(file => `/uploads/${file.filename}`);
            }

            const [result] = await connection.query(
                'UPDATE sections SET title = ?, content = ?, media = ?, order_index = ? WHERE id = ?',
                [title, content, JSON.stringify(media), order_index, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Раздел не найден' });
            }

            res.json({
                success: true,
                message: 'Раздел обновлён',
                media: media
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка обновления раздела:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удаление изображения из раздела (админ)
router.delete('/:id/images/:imageIndex', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const { id, imageIndex } = req.params;
        
        try {
            const [sections] = await connection.query('SELECT media FROM sections WHERE id = ?', [id]);
            if (sections.length === 0) {
                return res.status(404).json({ success: false, message: 'Раздел не найден' });
            }

            let media = { video: null, images: [] };
            if (sections[0].media) {
                try {
                    media = typeof sections[0].media === 'string' 
                        ? JSON.parse(sections[0].media) 
                        : sections[0].media;
                } catch (e) {
                    media = { video: null, images: [] };
                }
            }

            const idx = parseInt(imageIndex);
            if (media.images && idx >= 0 && idx < media.images.length) {
                media.images.splice(idx, 1);
                await connection.query(
                    'UPDATE sections SET media = ? WHERE id = ?',
                    [JSON.stringify(media), id]
                );
            }

            res.json({ success: true, message: 'Изображение удалено', media });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удаление раздела (админ)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.query('DELETE FROM sections WHERE id = ?', [req.params.id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Раздел не найден' });
            }

            res.json({ success: true, message: 'Раздел удалён' });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка удаления раздела:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// ============================================
// ЭКСПОРТ И ИМПОРТ
// ============================================

// Экспорт разделов главы в Excel
router.get('/export/excel/:chapterId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [chapters] = await connection.query('SELECT title FROM chapters WHERE id = ?', [req.params.chapterId]);
            if (chapters.length === 0) {
                return res.status(404).json({ success: false, message: 'Глава не найдена' });
            }

            const [sections] = await connection.query(
                'SELECT id, title, content, order_index, media FROM sections WHERE chapter_id = ? ORDER BY order_index',
                [req.params.chapterId]
            );

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(chapters[0].title.substring(0, 31));

            worksheet.columns = [
                { header: 'ID', key: 'id', width: 8 },
                { header: 'Порядок', key: 'order_index', width: 10 },
                { header: 'Название', key: 'title', width: 40 },
                { header: 'Содержание (HTML)', key: 'content', width: 80 },
                { header: 'Видео URL', key: 'video_url', width: 40 },
            ];

            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            sections.forEach((section) => {
                let videoUrl = '';
                if (section.media) {
                    try {
                        const media = typeof section.media === 'string' ? JSON.parse(section.media) : section.media;
                        videoUrl = media.video || '';
                    } catch (e) {}
                }

                worksheet.addRow({
                    id: section.id,
                    order_index: section.order_index,
                    title: section.title,
                    content: section.content || '',
                    video_url: videoUrl,
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=chapter_${req.params.chapterId}.xlsx`);
            
            await workbook.xlsx.write(res);
            res.end();

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка экспорта в Excel:', error);
        res.status(500).json({ success: false, message: 'Ошибка экспорта' });
    }
});

// Экспорт раздела в Word
router.get('/export/word/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [sections] = await connection.query('SELECT * FROM sections WHERE id = ?', [req.params.id]);
            if (sections.length === 0) {
                return res.status(404).json({ success: false, message: 'Раздел не найден' });
            }

            const section = sections[0];
            let videoHtml = '';
            
            if (section.media) {
                try {
                    const media = typeof section.media === 'string' ? JSON.parse(section.media) : section.media;
                    if (media.video) {
                        videoHtml = `<p><strong>Видео:</strong> <a href="${media.video}">${media.video}</a></p>`;
                    }
                } catch (e) {}
            }

            const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <title>${section.title}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; }
        h1 { font-size: 18pt; color: #1E40AF; }
        h2 { font-size: 16pt; color: #1F2937; }
        h3 { font-size: 14pt; color: #374151; }
        p { margin-bottom: 6pt; text-indent: 1.25cm; }
        ul, ol { margin-left: 1.25cm; }
        li { margin-bottom: 3pt; }
        img { max-width: 100%; height: auto; }
        pre { background: #F3F4F6; padding: 10pt; border-radius: 4pt; font-family: 'Courier New', monospace; font-size: 11pt; }
        code { font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <h1>${section.title}</h1>
    ${videoHtml}
    ${section.content || ''}
</body>
</html>`;

            res.setHeader('Content-Type', 'application/msword');
            res.setHeader('Content-Disposition', `attachment; filename=section_${section.id}.doc`);
            res.send(wordHtml);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка экспорта в Word:', error);
        res.status(500).json({ success: false, message: 'Ошибка экспорта' });
    }
});

// Экспорт разделов главы в JSON
router.get('/export/json/:chapterId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [sections] = await connection.query(
                'SELECT id, title, content, order_index, media FROM sections WHERE chapter_id = ? ORDER BY order_index',
                [req.params.chapterId]
            );

            const exportData = sections.map(s => ({
                ...s,
                media: s.media ? (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) : null
            }));

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=chapter_${req.params.chapterId}.json`);
            res.json(exportData);

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка экспорта JSON:', error);
        res.status(500).json({ success: false, message: 'Ошибка экспорта' });
    }
});

// Импорт разделов из Excel
router.post('/import/excel/:chapterId', authenticateToken, isAdmin, uploadExcel.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Файл не загружен' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);

        const worksheet = workbook.worksheets[0];
        const connection = await pool.getConnection();

        try {
            let imported = 0;
            const promises = [];
            
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const title = row.getCell(3).value;
                const content = row.getCell(4).value;
                const orderIndex = row.getCell(2).value || rowNumber - 1;
                const videoUrl = row.getCell(5).value;

                if (title) {
                    const media = { video: videoUrl || null, images: [] };
                    
                    promises.push(
                        connection.query(
                            'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                            [req.params.chapterId, String(title), content ? String(content) : '', JSON.stringify(media), parseInt(orderIndex) || 0]
                        )
                    );
                    imported++;
                }
            });

            await Promise.all(promises);

            // Удаляем временный файл
            fs.unlink(req.file.path, () => {});

            res.json({
                success: true,
                message: `Импортировано ${imported} разделов`,
                imported
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка импорта Excel:', error);
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ success: false, message: 'Ошибка импорта: ' + error.message });
    }
});

module.exports = router;