# КИП ФИН — Обучающая платформа по Arduino

[![КИП ФИН](https://img.shields.io/badge/КИП-ФИН-blue)](https://img.shields.io/badge/КИП-ФИН-blue)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)](https://mysql.com)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-764ABC?logo=redux)](https://redux-toolkit.js.org)

**Образовательная платформа колледжа КИП ФИН** — веб-приложение для изучения Arduino с системой курсов, тестированием, каталогом компонентов и администрированием.

---

## Содержание

- [Функциональность](#функциональность)
- [Стек технологий](#стек-технологий)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [API Endpoints](#api-endpoints)
- [Разработка](#разработка)

---

## Функциональность

### Для студентов

| Функция | Описание |
|---------|----------|
| **Библиотека курсов** | Выбор курса по уровню сложности |
| **Учебные материалы** | Главы и разделы с видео, изображениями, текстом и подсветкой кода |
| **Тестирование** | Прохождение тестов в конце каждой главы с подсчётом результата |
| **Профиль** | Прогресс, результаты тестов, успеваемость |
| **Каталог компонентов** | Карточки элементов Arduino с характеристиками и поиском |

### Для администраторов

| Функция | Описание |
|---------|----------|
| **Управление курсами** | CRUD курсов, привязка глав |
| **Управление главами** | Разделы с WYSIWYG-редактором контента (HTML, код, таблицы, изображения) |
| **Управление тестами** | Создание вопросов с вариантами ответов, указание правильных |
| **Управление пользователями** | Фильтрация по группам, смена ролей, статистика |
| **Каталог** | CRUD товаров (компоненты Arduino) с характеристиками |
| **Экспорт/Импорт** | Excel, Word, JSON — выгрузка разделов и контента |

---

## Стек технологий

### Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18 | UI библиотека |
| React Router | 7 | Маршрутизация |
| Redux Toolkit | 2 | Управление состоянием |
| Axios | 1 | HTTP клиент |
| Tailwind CSS | 3 | Стилизация |
| Highlight.js | 11 | Подсветка кода |
| emoji-picker-react | 4 | Выбор эмодзи |
| xlsx | 0.18 | Работа с Excel |

### Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| Node.js | 18+ | Среда выполнения |
| Express | 5 | Веб-фреймворк |
| MySQL2 | 3 | Драйвер MySQL |
| JWT | 9 | Аутентификация |
| bcryptjs | 3 | Хеширование паролей |
| Multer | 2 | Загрузка файлов |
| Nodemailer | 8 | Отправка писем (SMTP Mail.ru) |
| ExcelJS | 4 | Генерация Excel |
| Mammoth | 1 | Парсинг Word |
| express-validator | 7 | Валидация |
| UUID | 14 | Генерация ID |

---

## Структура проекта

```
Arduino/
├── client/                         # React-приложение
│   ├── public/                     # Статические файлы
│   └── src/
│       ├── api/
│       │   └── axios.js            # Настройка Axios
│       ├── components/
│       │   ├── Admin/              # Админ-компоненты
│       │   │   ├── ChapterForm.jsx
│       │   │   ├── ChapterList.jsx
│       │   │   ├── ContentEditor.jsx
│       │   │   ├── ExportImportBar.jsx
│       │   │   ├── SectionForm.jsx
│       │   │   └── SectionList.jsx
│       │   ├── Layout/             # Компоненты макета
│       │   │   ├── AdminHeader.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Header.jsx
│       │   │   └── Sidebar.jsx
│       │   ├── CatalogSidebar.jsx
│       │   ├── Modal.jsx           # Кастомное модальное окно
│       │   ├── ProductCard.jsx
│       │   └── TestPlayer.jsx      # Прохождение тестов
│       ├── pages/                  # Страницы
│       │   ├── Admin/
│       │   │   ├── Chapters.jsx
│       │   │   ├── Courses.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Products.jsx
│       │   │   ├── Tests.jsx
│       │   │   └── Users.jsx
│       │   ├── Catalog.jsx
│       │   ├── Home.jsx
│       │   ├── Learn.jsx
│       │   ├── Library.jsx
│       │   ├── Login.jsx
│       │   ├── ProductDetail.jsx
│       │   ├── Profile.jsx
│       │   ├── Register.jsx
│       │   └── VerifyEmail.jsx
│       ├── store/                  # Redux store
│       │   ├── authSlice.js
│       │   ├── chaptersSlice.js
│       │   ├── index.js
│       │   └── productsSlice.js
│       ├── App.jsx
│       ├── index.css
│       └── index.js
├── server/                         # Express-сервер
│   ├── config/
│   │   ├── database.js             # Подключение к MySQL + схема
│   │   └── mailer.js               # Настройка Nodemailer (Mail.ru)
│   ├── middleware/
│   │   ├── auth.js                 # JWT middleware
│   │   └── upload.js               # Multer конфиг
│   ├── routes/
│   │   ├── auth.js                 # Регистрация, логин, верификация email
│   │   ├── chapters.js             # CRUD глав
│   │   ├── courses.js              # CRUD курсов
│   │   ├── products.js             # Каталог компонентов
│   │   ├── sections.js             # Разделы глав
│   │   ├── settings.js             # Настройки
│   │   └── tests.js                # Тестирование
│   ├── uploads/                    # Загруженные файлы
│   ├── .env                        # Переменные окружения
│   ├── package.json
│   └── server.js                   # Точка входа
├── .env.example                    # Пример .env
├── .gitignore
├── .gitattributes
└── README.md
```

---

## Установка и запуск

### Требования

- **Node.js** 18+
- **MySQL** 8+
- **npm** 9+

### 1. Клонирование репозитория

```bash
git clone https://github.com/Chegolin123/Arduino-KIP-kurs
cd Arduino
```

### 2. Настройка базы данных

Создайте базу данных MySQL и настройте подключение в `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=arduino_learning
JWT_SECRET=your_jwt_secret_key
MAIL_USER=your_email@mail.ru
MAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

### 3. Установка зависимостей

```bash
# Сервер
cd server
npm install

# Клиент
cd ../client
npm install
```

### 4. Запуск

```bash
# Сервер (порт 5000)
cd server
npm start          # или npm run dev (с nodemon)

# Клиент (порт 3000)
cd client
npm start
```

Приложение будет доступно по адресу: `http://localhost:3000`

---

## API Endpoints

### Аутентификация (`/api/auth`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/login` | Вход в систему |
| POST | `/register` | Регистрация с подтверждением email |
| GET | `/verify-email?token=` | Подтверждение email |
| POST | `/resend-verification` | Повторная отправка письма |
| GET | `/profile` | Профиль пользователя |
| PUT | `/profile` | Обновление профиля |

### Курсы (`/api/courses`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/` | Все курсы |
| GET | `/admin` | Курсы с главами (админ) |
| GET | `/:id` | Курс по ID |
| POST | `/` | Создать курс |
| PUT | `/:id` | Обновить курс |
| DELETE | `/:id` | Удалить курс |
| POST | `/:courseId/chapters/:chapterId` | Привязать главу |
| DELETE | `/:courseId/chapters/:chapterId` | Отвязать главу |

### Главы (`/api/chapters`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/course/:courseId` | Главы курса |
| GET | `/:id` | Глава по ID |
| POST | `/` | Создать главу |
| PUT | `/:id` | Обновить главу |
| DELETE | `/:id` | Удалить главу |

### Разделы (`/api/sections`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/chapter/:chapterId` | Разделы главы |
| GET | `/:id` | Раздел по ID (c медиа) |
| POST | `/` | Создать раздел |
| PUT | `/:id` | Обновить раздел |
| DELETE | `/:id` | Удалить раздел |
| GET | `/export/excel/:chapterId` | Экспорт в Excel |
| GET | `/export/json/:chapterId` | Экспорт в JSON |
| POST | `/import/word` | Импорт из Word |
| POST | `/upload/images` | Загрузка изображений |

### Тесты (`/api/tests`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/chapter/:chapterId` | Тест главы (публичный) |
| GET | `/manage/chapter/:chapterId` | Тест главы (админ) |
| POST | `/manage` | Создать/обновить тест |
| DELETE | `/manage/chapter/:chapterId` | Удалить тест главы |
| POST | `/check` | Проверка ответов |
| GET | `/results` | Результаты тестов пользователя |

### Каталог (`/api/products`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/` | Все товары |
| GET | `/:id` | Товар по ID |
| POST | `/` | Создать товар |
| PUT | `/:id` | Обновить товар |
| DELETE | `/:id` | Удалить товар |

### Настройки (`/api/settings`)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/` | Получить настройки |
| PUT | `/` | Обновить настройки |

---

## Разработка

### Команды

| Команда | Описание |
|---------|----------|
| `npm start` (client) | Запуск фронтенда (порт 3000) |
| `npm start` (server) | Запуск сервера (порт 5000) |
| `npm run dev` (server) | Запуск с nodemon |
| `npm run build` (client) | Сборка фронтенда в `client/build/` |

### Роутинг

```
/                          — Главная
/library                   — Библиотека курсов
/learn                     — Обучение
/learn/:chapterId          — Информация о главе
/learn/:chapterId/:section — Раздел главы
/catalog                   — Каталог компонентов
/catalog/:id               — Детальная карточка товара
/login                     — Вход
/register                  — Регистрация
/profile                   — Профиль пользователя
/admin                     — Админ-панель (дашборд)
/admin/courses             — Управление курсами
/admin/chapters            — Управление главами
/admin/tests               — Управление тестами
/admin/products            — Управление каталогом
/admin/users               — Управление пользователями
/verify-email              — Подтверждение email
```
