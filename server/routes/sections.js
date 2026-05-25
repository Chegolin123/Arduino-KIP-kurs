// Расположение: C:\OSPanel\domains\Arduino\server\routes\sections.js
// Роуты разделов с поддержкой медиа, экспорта, импорта Excel и Word

const express = require('express');
const router = express.Router();
const path = require('path');
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');
const ExcelJS = require('exceljs');
const mammoth = require('mammoth');
const fs = require('fs');

const uploadExcel = multer({ dest: 'uploads/excel/' });
const uploadWord = multer({ dest: 'uploads/word/' });

// Получение раздела по ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        try {
            const [sections] = await connection.query('SELECT * FROM sections WHERE id = ?', [req.params.id]);
            if (sections.length === 0) {
                return res.status(404).json({ success: false, message: 'Раздел не найден' });
            }
            const section = sections[0];
            if (section.media && typeof section.media === 'string') {
                try { section.media = JSON.parse(section.media); } catch (e) { section.media = { video: null, images: [] }; }
            } else if (!section.media) {
                section.media = { video: null, images: [] };
            }
            res.json({ success: true, section });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка получения раздела:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Создание раздела (админ)
router.post('/', authenticateToken, isAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const { chapter_id, title, content, order_index, video_url } = req.body;
        if (!chapter_id || !title) {
            return res.status(400).json({ success: false, message: 'chapter_id и title обязательны' });
        }
        const connection = await pool.getConnection();
        try {
            const media = { video: video_url || null, images: [] };
            if (req.files && req.files.length > 0) {
                media.images = req.files.map(file => `/uploads/${file.filename}`);
            }
            const [result] = await connection.query(
                'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                [chapter_id, title, content || '', JSON.stringify(media), order_index || 0]
            );
            res.status(201).json({
                success: true, message: 'Раздел создан',
                section: { id: result.insertId, chapter_id, title, content, media, order_index }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка создания раздела:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
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
                    const parsed = typeof sections[0].media === 'string' ? JSON.parse(sections[0].media) : sections[0].media;
                    media = { ...media, ...parsed };
                } catch (e) {}
            }
            if (clear_video === 'true') {
                media.video = null;
            } else if (video_url !== undefined && video_url !== '') {
                media.video = video_url;
            }
            if (keep_existing_images === 'true') {
                if (req.files && req.files.length > 0) {
                    media.images = [...(media.images || []), ...req.files.map(file => `/uploads/${file.filename}`)];
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
            res.json({ success: true, message: 'Раздел обновлён', media });
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
                try { media = typeof sections[0].media === 'string' ? JSON.parse(sections[0].media) : sections[0].media; } catch (e) {}
            }
            const idx = parseInt(imageIndex);
            if (media.images && idx >= 0 && idx < media.images.length) {
                media.images.splice(idx, 1);
                await connection.query('UPDATE sections SET media = ? WHERE id = ?', [JSON.stringify(media), id]);
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
// ЭКСПОРТ
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
                    try { videoUrl = (typeof section.media === 'string' ? JSON.parse(section.media) : section.media).video || ''; } catch (e) {}
                }
                worksheet.addRow({ id: section.id, order_index: section.order_index, title: section.title, content: section.content || '', video_url: videoUrl });
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
                    if (media.video) videoHtml = `<p><strong>Видео:</strong> ${media.video}</p>`;
                } catch (e) {}
            }
            const wordHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${section.title}</title><style>body{font-family:'Times New Roman',serif;font-size:14pt;line-height:1.5}h1{font-size:18pt;color:#1E40AF}h2{font-size:16pt}h3{font-size:14pt}p{margin-bottom:6pt}</style></head><body><h1>${section.title}</h1>${videoHtml}${section.content||''}</body></html>`;
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

// ============================================
// ИМПОРТ
// ============================================

// Импорт разделов из Excel
router.post('/import/excel/:chapterId', authenticateToken, isAdmin, uploadExcel.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Файл не загружен' });
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
                    promises.push(connection.query(
                        'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                        [req.params.chapterId, String(title), content ? String(content) : '', JSON.stringify(media), parseInt(orderIndex) || 0]
                    ));
                    imported++;
                }
            });
            await Promise.all(promises);
            fs.unlink(req.file.path, () => {});
            res.json({ success: true, message: `Импортировано ${imported} разделов`, imported });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка импорта Excel:', error);
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(500).json({ success: false, message: 'Ошибка импорта' });
    }
});

// Импорт раздела из Word
router.post('/import/word', authenticateToken, isAdmin, uploadWord.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Файл не загружен' });
        const { chapter_id, order_index, title } = req.body;
        if (!chapter_id) return res.status(400).json({ success: false, message: 'Укажите chapter_id' });
        const result = await mammoth.convertToHtml({ path: req.file.path });
        const html = result.value;
        const sectionTitle = title || req.file.originalname.replace(/\.(docx?|doc)$/i, '');
        const connection = await pool.getConnection();
        try {
            const media = { video: null, images: [] };
            const [insertResult] = await connection.query(
                'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                [chapter_id, sectionTitle, html, JSON.stringify(media), order_index || 0]
            );
            fs.unlink(req.file.path, () => {});
            res.json({ success: true, message: 'Раздел импортирован из Word', section: { id: insertResult.insertId, chapter_id, title: sectionTitle, content: html } });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка импорта Word:', error);
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(500).json({ success: false, message: 'Ошибка импорта' });
    }
});

// Пакетный импорт разделов из Word
router.post('/import/word/batch', authenticateToken, isAdmin, uploadWord.array('files', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'Файлы не загружены' });
        const { chapter_id } = req.body;
        if (!chapter_id) return res.status(400).json({ success: false, message: 'Укажите chapter_id' });
        const connection = await pool.getConnection();
        const imported = [];
        try {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const result = await mammoth.convertToHtml({ path: file.path });
                const html = result.value;
                const sectionTitle = file.originalname.replace(/\.(docx?|doc)$/i, '');
                const media = { video: null, images: [] };
                const [insertResult] = await connection.query(
                    'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                    [chapter_id, sectionTitle, html, JSON.stringify(media), i + 1]
                );
                imported.push({ id: insertResult.insertId, title: sectionTitle, filename: file.originalname });
                fs.unlink(file.path, () => {});
            }
            res.json({ success: true, message: `Импортировано ${imported.length} разделов`, sections: imported });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка пакетного импорта Word:', error);
        if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
        res.status(500).json({ success: false, message: 'Ошибка импорта' });
    }
});

// Импорт DOCX с полным сохранением форматирования
router.post('/import/docx/full', authenticateToken, isAdmin, uploadWord.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Файл не загружен' });
        }
        const { chapter_id, order_index, title } = req.body;
        if (!chapter_id) {
            return res.status(400).json({ success: false, message: 'Укажите chapter_id' });
        }
        const options = {
            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "p[style-name='Title'] => h1.title:fresh",
                "p[style-name='Subtitle'] => h2.subtitle:fresh",
                "r[style-name='Strong'] => strong",
                "r[style-name='Emphasis'] => em",
                "p[style-name='List Paragraph'] => li:fresh",
            ],
            convertImage: mammoth.images.imgElement(async (image) => {
                const imageBuffer = await image.read();
                const extension = image.contentType.split('/')[1] || 'png';
                const filename = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
                const imagePath = path.join(__dirname, '..', 'uploads', filename);
                await fs.promises.writeFile(imagePath, imageBuffer);
                return { src: `/uploads/${filename}` };
            })
        };
        const result = await mammoth.convertToHtml(options, { path: req.file.path });
        let html = result.value;
        const wordStyles = `<style>.doc-content{font-family:'Times New Roman',serif;font-size:14pt;line-height:1.5;color:#333}.doc-content h1{font-size:18pt;font-weight:bold;margin:12pt 0 6pt 0;color:#1a1a1a}.doc-content h2{font-size:16pt;font-weight:bold;margin:10pt 0 4pt 0;color:#2d2d2d}.doc-content h3{font-size:14pt;font-weight:bold;margin:8pt 0 3pt 0;color:#404040}.doc-content p{margin:0 0 6pt 0;text-align:justify}.doc-content table{border-collapse:collapse;width:100%;margin:12pt 0}.doc-content td,.doc-content th{border:1px solid #ddd;padding:8px}.doc-content th{background-color:#f5f5f5;font-weight:bold}.doc-content ul,.doc-content ol{margin:6pt 0 6pt 20pt}.doc-content li{margin-bottom:3pt}.doc-content img{max-width:100%;height:auto;margin:8pt 0}.doc-content strong{font-weight:bold}.doc-content em{font-style:italic}.doc-content u{text-decoration:underline}.doc-content .indent{text-indent:1.25cm}</style>`;
        html = `<div class="doc-content">${wordStyles}${html}</div>`;
        if (result.messages.length > 0) {
            console.log('⚠️ Предупреждения конвертации:', result.messages);
        }
        const sectionTitle = title || req.file.originalname.replace(/\.(docx?|doc)$/i, '');
        const connection = await pool.getConnection();
        try {
            const media = { video: null, images: [] };
            const [insertResult] = await connection.query(
                'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                [chapter_id, sectionTitle, html, JSON.stringify(media), order_index || 0]
            );
            fs.unlink(req.file.path, () => {});
            res.json({
                success: true,
                message: 'Раздел импортирован из Word с полным форматированием',
                section: { id: insertResult.insertId, chapter_id, title: sectionTitle, content: html, warnings: result.messages }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка импорта DOCX:', error);
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(500).json({ success: false, message: 'Ошибка импорта: ' + error.message });
    }
});

// Пакетный импорт DOCX с полным форматированием
router.post('/import/docx/full/batch', authenticateToken, isAdmin, uploadWord.array('files', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Файлы не загружены' });
        }
        const { chapter_id } = req.body;
        if (!chapter_id) {
            return res.status(400).json({ success: false, message: 'Укажите chapter_id' });
        }
        const connection = await pool.getConnection();
        const imported = [];
        const errors = [];
        try {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                try {
                    const options = {
                        styleMap: [
                            "p[style-name='Heading 1'] => h1:fresh",
                            "p[style-name='Heading 2'] => h2:fresh",
                            "p[style-name='Heading 3'] => h3:fresh",
                            "r[style-name='Strong'] => strong",
                            "r[style-name='Emphasis'] => em",
                        ],
                        convertImage: mammoth.images.imgElement(async (image) => {
                            const imageBuffer = await image.read();
                            const extension = image.contentType.split('/')[1] || 'png';
                            const filename = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
                            await fs.promises.writeFile(path.join(__dirname, '..', 'uploads', filename), imageBuffer);
                            return { src: `/uploads/${filename}` };
                        })
                    };
                    const result = await mammoth.convertToHtml(options, { path: file.path });
                    const html = `<div class="doc-content"><style>.doc-content{font-family:'Times New Roman',serif;font-size:14pt;line-height:1.5;color:#333}.doc-content h1{font-size:18pt;font-weight:bold;margin:12pt 0 6pt 0}.doc-content h2{font-size:16pt;font-weight:bold;margin:10pt 0 4pt 0}.doc-content h3{font-size:14pt;font-weight:bold;margin:8pt 0 3pt 0}.doc-content p{margin:0 0 6pt 0;text-align:justify}.doc-content table{border-collapse:collapse;width:100%;margin:12pt 0}.doc-content td,.doc-content th{border:1px solid #ddd;padding:8px}.doc-content img{max-width:100%;height:auto;margin:8pt 0}</style>${result.value}</div>`;
                    const sectionTitle = file.originalname.replace(/\.(docx?|doc)$/i, '');
                    const media = { video: null, images: [] };
                    const [insertResult] = await connection.query(
                        'INSERT INTO sections (chapter_id, title, content, media, order_index) VALUES (?, ?, ?, ?, ?)',
                        [chapter_id, sectionTitle, html, JSON.stringify(media), i + 1]
                    );
                    imported.push({ id: insertResult.insertId, title: sectionTitle, filename: file.originalname });
                } catch (fileError) {
                    errors.push({ file: file.originalname, error: fileError.message });
                }
                fs.unlink(file.path, () => {});
            }
            res.json({
                success: true,
                message: `Импортировано ${imported.length} из ${req.files.length} разделов`,
                imported,
                errors: errors.length > 0 ? errors : undefined
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Ошибка пакетного импорта DOCX:', error);
        if (req.files) req.files.forEach(f => fs.unlink(f.path, () => {}));
        res.status(500).json({ success: false, message: 'Ошибка импорта: ' + error.message });
    }
});

module.exports = router;