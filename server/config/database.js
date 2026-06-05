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

        // Черновики контента разделов
        await connection.query(`
            CREATE TABLE IF NOT EXISTS section_drafts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                section_id INT NOT NULL UNIQUE,
                content LONGTEXT,
                updated_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
                FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Таблица тестов по главам
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chapter_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                pass_percent INT NOT NULL DEFAULT 70,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Нормализуем данные: у одной главы должен быть только один тест.
        await connection.query(`
            DELETE t1 FROM tests t1
            INNER JOIN tests t2
              ON t1.chapter_id = t2.chapter_id AND t1.id > t2.id
        `);

        const [testChapterIndex] = await connection.query(`
            SELECT INDEX_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'tests'
              AND INDEX_NAME = 'uniq_tests_chapter_id'
        `);

        if (testChapterIndex.length === 0) {
            await connection.query('ALTER TABLE tests ADD UNIQUE KEY uniq_tests_chapter_id (chapter_id)');
        }

        // Вопросы тестов
        await connection.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                test_id INT NOT NULL,
                question TEXT NOT NULL,
                type ENUM('single', 'multiple') NOT NULL DEFAULT 'single',
                order_index INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Ответы на вопросы тестов
        await connection.query(`
            CREATE TABLE IF NOT EXISTS answers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question_id INT NOT NULL,
                answer TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL DEFAULT FALSE,
                order_index INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Результаты прохождения тестов
        await connection.query(`
            CREATE TABLE IF NOT EXISTS test_results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                test_id INT NOT NULL,
                score INT NOT NULL DEFAULT 0,
                total_questions INT NOT NULL DEFAULT 0,
                percent INT NOT NULL DEFAULT 0,
                passed BOOLEAN NOT NULL DEFAULT FALSE,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Миграция: полностью убираем поддержку section_id у тестов, если старый столбец ещё есть.
        const [testSectionColumn] = await connection.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tests' AND COLUMN_NAME = 'section_id'
        `);

        if (testSectionColumn.length > 0) {
            await connection.query('DELETE FROM tests WHERE chapter_id IS NULL');
            const [sectionForeignKeys] = await connection.query(`
                SELECT CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'tests'
                  AND COLUMN_NAME = 'section_id'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
            `);

            for (const foreignKey of sectionForeignKeys) {
                await connection.query(`ALTER TABLE tests DROP FOREIGN KEY \`${foreignKey.CONSTRAINT_NAME}\``);
            }

            await connection.query('ALTER TABLE tests DROP COLUMN section_id');
        }

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
