// Расположение: C:\OSPanel\domains\Arduino\server\routes\products.js
// Роуты для управления товарами

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Получение всех товаров с фильтрацией
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        const connection = await pool.getConnection();
        
        try {
            let query = 'SELECT * FROM products WHERE 1=1';
            const params = [];

            if (category) {
                query += ' AND category = ?';
                params.push(category);
            }

            if (search) {
                query += ' AND (name LIKE ? OR description LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY created_at DESC';

            const [products] = await connection.query(query, params);

            // Парсим JSON спецификации (если это строка) - mysql2 может вернуть уже объект
            const parsedProducts = products.map(product => {
                let specs = product.specifications;
                
                // Если это строка - парсим, если объект - оставляем как есть
                if (typeof specs === 'string') {
                    try {
                        specs = JSON.parse(specs);
                    } catch (e) {
                        specs = {};
                    }
                }
                
                // Если null или undefined
                if (!specs) {
                    specs = {};
                }
                
                return {
                    ...product,
                    specifications: specs
                };
            });

            res.json({
                success: true,
                products: parsedProducts
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера при получении товаров' 
        });
    }
});

// Получение товара по ID
router.get('/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [products] = await connection.query(
                'SELECT * FROM products WHERE id = ?',
                [req.params.id]
            );

            if (products.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Товар не найден' 
                });
            }

            const product = products[0];
            
            // Парсим спецификации
            let specs = product.specifications;
            if (typeof specs === 'string') {
                try {
                    specs = JSON.parse(specs);
                } catch (e) {
                    specs = {};
                }
            }
            if (!specs) specs = {};
            
            product.specifications = specs;

            res.json({
                success: true,
                product
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

// Создание товара (админ)
router.post('/', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, specifications, price, category, stock } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Название товара обязательно' 
            });
        }

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        const connection = await pool.getConnection();
        
        try {
            // Сохраняем спецификации как строку JSON
            let specsJson = null;
            if (specifications) {
                if (typeof specifications === 'string') {
                    // Проверяем, валидный ли JSON
                    try {
                        JSON.parse(specifications);
                        specsJson = specifications;
                    } catch (e) {
                        specsJson = JSON.stringify(specifications);
                    }
                } else {
                    specsJson = JSON.stringify(specifications);
                }
            }

            const [result] = await connection.query(
                'INSERT INTO products (name, description, image_url, specifications, price, category, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    name, 
                    description || '', 
                    imageUrl, 
                    specsJson, 
                    price || 0, 
                    category || '', 
                    stock || 0
                ]
            );

            res.status(201).json({
                success: true,
                message: 'Товар создан',
                product: {
                    id: result.insertId,
                    name,
                    description,
                    image_url: imageUrl,
                    specifications: specifications,
                    price,
                    category,
                    stock
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

// Обновление товара (админ)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, specifications, price, category, stock } = req.body;
        const connection = await pool.getConnection();
        
        try {
            let imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
            
            let query = 'UPDATE products SET ';
            const params = [];
            const updates = [];

            if (name !== undefined) {
                updates.push('name = ?');
                params.push(name);
            }
            if (description !== undefined) {
                updates.push('description = ?');
                params.push(description);
            }
            if (imageUrl) {
                updates.push('image_url = ?');
                params.push(imageUrl);
            }
            if (specifications !== undefined) {
                updates.push('specifications = ?');
                if (typeof specifications === 'string') {
                    params.push(specifications);
                } else {
                    params.push(JSON.stringify(specifications));
                }
            }
            if (price !== undefined) {
                updates.push('price = ?');
                params.push(price);
            }
            if (category !== undefined) {
                updates.push('category = ?');
                params.push(category);
            }
            if (stock !== undefined) {
                updates.push('stock = ?');
                params.push(stock);
            }

            if (updates.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Нет данных для обновления' 
                });
            }

            query += updates.join(', ') + ' WHERE id = ?';
            params.push(req.params.id);

            const [result] = await connection.query(query, params);

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Товар не найден' 
                });
            }

            res.json({
                success: true,
                message: 'Товар обновлён'
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

// Удаление товара (админ)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        try {
            const [result] = await connection.query(
                'DELETE FROM products WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Товар не найден' 
                });
            }

            res.json({
                success: true,
                message: 'Товар удалён'
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Ошибка сервера' 
        });
    }
});

module.exports = router;