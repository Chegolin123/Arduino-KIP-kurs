// Расположение: C:\OSPanel\domains\Arduino\server\config\database.js
// Конфигурация и подключение к MySQL

const mysql = require('mysql2/promise');
require('dotenv').config();

// Создание пула подключений
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'arduino_learning',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Функция для инициализации базы данных и создания таблиц
async function initializeDatabase() {
    try {
        // Создаём подключение без указания БД для создания самой БД
        const initPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            charset: 'utf8mb4'
        });

        const connection = await initPool.getConnection();
        
        // Создаём базу данных если не существует
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'arduino_learning'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        
        connection.release();
        await initPool.end();

        // Теперь создаём таблицы в нужной БД
        await createTables();
        
        console.log('✅ База данных и таблицы успешно инициализированы');
    } catch (error) {
        console.error('❌ Ошибка инициализации базы данных:', error.message);
        throw error;
    }
}

// Функция создания всех необходимых таблиц
async function createTables() {
    const connection = await pool.getConnection();
    
    try {
        // Таблица пользователей
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Таблица глав курса
        await connection.query(`
            CREATE TABLE IF NOT EXISTS chapters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                order_index INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Таблица разделов/пунктов глав
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chapter_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                content LONGTEXT,
                order_index INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Таблица товаров/элементов Arduino
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(500),
                specifications JSON,
                price DECIMAL(10, 2) DEFAULT 0.00,
                category VARCHAR(100),
                stock INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ Таблицы созданы успешно');
    } finally {
        connection.release();
    }
}

module.exports = { pool, initializeDatabase };