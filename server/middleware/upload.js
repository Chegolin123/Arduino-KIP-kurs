// Расположение: C:\OSPanel\domains\Arduino\server\middleware\upload.js
// Конфигурация загрузки файлов

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Фильтр файлов (только изображения)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WEBP.'), false);
    }
};

// Настройка multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB максимум
    }
});

module.exports = upload;