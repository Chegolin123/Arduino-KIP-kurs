// Расположение: C:\OSPanel\domains\Arduino\server\server.js
// Главный файл сервера КИП ФИН

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');

const authRoutes = require('./routes/auth');
const chaptersRoutes = require('./routes/chapters');
const sectionsRoutes = require('./routes/sections');
const productsRoutes = require('./routes/products');
const testsRoutes = require('./routes/tests');
const coursesRoutes = require('./routes/courses');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/courses', coursesRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'КИП ФИН API работает',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            chapters: '/api/chapters',
            sections: '/api/sections',
            products: '/api/products',
            tests: '/api/tests',
            courses: '/api/courses'
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
});

async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 Сервер запущен на порту ${PORT}`);
            console.log(`📚 API: http://localhost:${PORT}/api`);
            console.log(`💾 База данных: ${process.env.DB_NAME || 'arduino_learning'}`);
        });
    } catch (error) {
        console.error('❌ Не удалось запустить сервер:', error);
        process.exit(1);
    }
}

startServer();