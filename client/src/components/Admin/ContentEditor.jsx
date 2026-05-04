// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ContentEditor.jsx
// Визуальный редактор контента — КИП ФИН

import React, { useState, useRef, useEffect } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// Встроенный набор эмодзи (без внешних зависимостей)
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
  '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😜', '🤪', '😝',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😒', '😬', '😔',
  '😪', '😴', '😷', '🤒', '🤕', '😵', '🥴', '😎', '🤓', '🧐',
  '😟', '😕', '🙁', '😮', '😯', '😲', '😳', '🥺', '😢', '😭',
  '😤', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👻',
  '👍', '👎', '👏', '🙌', '🤝', '💪', '✍️', '🙏', '💅', '🎓',
  '📚', '✏️', '💡', '🔧', '⚡', '🔥', '💻', '📱', '🖥️', '⌨️',
  '🖱️', '💾', '📷', '🎥', '🎬', '📌', '📎', '🔗', '⚠️', '✅',
  '❌', '➕', '➖', '➡️', '⬅️', '⬆️', '⬇️', '🔴', '🟢', '🔵',
  '🟡', '🟠', '🟣', '⭐', '🌟', '💫', '✨', '🎯', '🏆', '💯',
];

const ContentEditor = ({ value, onChange, onImageInsert, onAutoSave }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isFocused, setIsFocused] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [codeText, setCodeText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // История изменений
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const autoSaveTimerRef = useRef(null);

  // Статистика
  const plainText = value?.replace(/<[^>]*>/g, '') || '';
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const charCount = plainText.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Инициализация содержимого
  useEffect(() => {
    if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  // Подсветка синтаксиса
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [value]);

  // Автосохранение
  useEffect(() => {
    if (!onAutoSave) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(onAutoSave, 30000);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [value, onAutoSave]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocused) return;

      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (onAutoSave) onAutoSave();
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        document.execCommand('indent', false, null);
        handleInput();
      }

      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, history, historyIndex]);

  // Обработка ввода
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      saveToHistory(html);
      onChange(html);
    }
  };

  // История
  const saveToHistory = (html) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(html);
    if (newHistory.length > 100) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const html = history[newIndex];
      if (editorRef.current) editorRef.current.innerHTML = html;
      onChange(html);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const html = history[newIndex];
      if (editorRef.current) editorRef.current.innerHTML = html;
      onChange(html);
    }
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const execCommand = (command, value = null) => {
    focusEditor();
    document.execCommand(command, false, value);
    handleInput();
  };

  // Drag & Drop изображений
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (onImageInsert) onImageInsert(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        document.execCommand('insertHTML', false,
          `<img src="${event.target.result}" alt="Изображение" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;display:block" />`
        );
        handleInput();
      };
      reader.readAsDataURL(file);
    }
  };

  // Загрузка фото
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (onImageInsert) onImageInsert(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        focusEditor();
        document.execCommand('insertHTML', false,
          `<img src="${event.target.result}" alt="Изображение" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;display:block" />`
        );
        handleInput();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Вставка изображения по URL
  const insertImageByUrl = () => {
    if (imageUrl.trim()) {
      focusEditor();
      document.execCommand('insertHTML', false,
        `<img src="${imageUrl}" alt="Изображение" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;display:block" />`
      );
      handleInput();
      setImageUrl('');
      setShowUrlInput(false);
    }
  };

  // Разделитель
  const insertDivider = () => {
    focusEditor();
    document.execCommand('insertHTML', false,
      '<hr style="border:none;border-top:2px dashed #d1d5db;margin:32px 0" />'
    );
    handleInput();
  };

  // Блок кода
  const insertCodeBlock = () => {
    if (codeText.trim()) {
      focusEditor();
      const escaped = codeText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      document.execCommand('insertHTML', false,
        `<pre><code class="language-arduino">${escaped}</code></pre>`
      );
      handleInput();
      setCodeText('');
      setShowCodeInput(false);
    }
  };

  // Очистка форматирования
  const clearFormat = () => {
    focusEditor();
    document.execCommand('removeFormat', false, null);
    handleInput();
  };

  // Шаблоны
  const insertTemplate = (type) => {
    focusEditor();
    let html = '';

    switch (type) {
      case 'theory':
        html = `<h2>Теория</h2><p>Теоретический материал...</p><h3>Пример кода</h3><pre><code class="language-arduino">void setup() {\n  // Ваш код\n}</code></pre>`;
        break;
      case 'steps':
        html = `<h2>Пошаговая инструкция</h2><ol><li>Шаг первый</li><li>Шаг второй</li><li>Шаг третий</li></ol>`;
        break;
      case 'scheme':
        html = `<h2>Схема подключения</h2><p>Описание схемы подключения компонентов...</p>`;
        break;
      case 'task':
        html = `<h2>Задание</h2><p>Описание задания...</p><h3>Что нужно сделать</h3><ul><li>Пункт 1</li><li>Пункт 2</li></ul><h3>Проверка</h3><p>Критерии оценки...</p>`;
        break;
      default:
        break;
    }

    document.execCommand('insertHTML', false, html);
    handleInput();
    setShowTemplates(false);
  };

  // Вставка эмодзи
  const insertEmoji = (emoji) => {
    focusEditor();
    document.execCommand('insertText', false, emoji);
    handleInput();
  };

  // Синхронизация при внешнем изменении value
  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Закрытие всех всплывающих панелей
  const closeAll = () => {
    setShowUrlInput(false);
    setShowCodeInput(false);
    setShowEmojiPicker(false);
    setShowTemplates(false);
  };

  // Контент редактора
  const editorContent = (
    <>
      {/* Панель инструментов */}
      <div className="bg-gray-50 border-b border-gray-200 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* История */}
          <button
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-700"
            title="Отменить (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 text-gray-700"
            title="Повторить (Ctrl+Y)"
          >
            ↪
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Заголовок */}
          <button
            type="button"
            onClick={() => {
              focusEditor();
              document.execCommand('formatBlock', false, 'h2');
              handleInput();
            }}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold text-gray-700 text-xs"
            title="Заголовок"
          >
            H
          </button>

          {/* Жирный, курсив, подчёркнутый */}
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 font-bold text-gray-700"
            title="Жирный (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 italic text-gray-700"
            title="Курсив (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 underline text-gray-700"
            title="Подчёркнутый (Ctrl+U)"
          >
            U
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Списки */}
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 text-lg"
            title="Маркированный список"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700 text-xs font-bold"
            title="Нумерованный список"
          >
            1.
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Вставки */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 text-xs text-white bg-green-500 hover:bg-green-600 rounded font-medium whitespace-nowrap"
            title="Загрузить фото с компьютера"
          >
            📷 Фото
          </button>
          <button
            type="button"
            onClick={() => { closeAll(); setShowUrlInput(!showUrlInput); }}
            className="px-2.5 py-1.5 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded font-medium whitespace-nowrap"
            title="Вставить фото по ссылке"
          >
            🌐 URL
          </button>
          <button
            type="button"
            onClick={insertDivider}
            className="px-2.5 py-1.5 text-xs text-white bg-gray-500 hover:bg-gray-600 rounded font-medium whitespace-nowrap"
            title="Горизонтальная линия"
          >
            —
          </button>
          <button
            type="button"
            onClick={() => { closeAll(); setShowCodeInput(!showCodeInput); }}
            className="px-2.5 py-1.5 text-xs text-white bg-purple-500 hover:bg-purple-600 rounded font-medium whitespace-nowrap"
            title="Вставить блок кода"
          >
            {'<>'} Код
          </button>
          <button
            type="button"
            onClick={() => { closeAll(); setShowEmojiPicker(!showEmojiPicker); }}
            className="px-2.5 py-1.5 text-xs text-white bg-yellow-500 hover:bg-yellow-600 rounded font-medium whitespace-nowrap"
            title="Вставить эмодзи"
          >
            😊
          </button>
          <button
            type="button"
            onClick={() => { closeAll(); setShowTemplates(!showTemplates); }}
            className="px-2.5 py-1.5 text-xs text-white bg-indigo-500 hover:bg-indigo-600 rounded font-medium whitespace-nowrap"
            title="Шаблоны контента"
          >
            📋
          </button>
          <button
            type="button"
            onClick={clearFormat}
            className="px-2.5 py-1.5 text-xs text-white bg-red-400 hover:bg-red-500 rounded font-medium whitespace-nowrap"
            title="Очистить форматирование"
          >
            ✕
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          {/* Полный экран */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
            title="На весь экран"
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
        </div>

        {/* Поле ввода URL */}
        {showUrlInput && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Ссылка на изображение → Enter"
              autoFocus
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && insertImageByUrl()}
            />
            <button
              type="button"
              onClick={insertImageByUrl}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => { setShowUrlInput(false); setImageUrl(''); }}
              className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            >
              ×
            </button>
          </div>
        )}

        {/* Поле ввода кода */}
        {showCodeInput && (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              placeholder="Вставьте код Arduino..."
              rows={4}
              autoFocus
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={insertCodeBlock}
                className="px-4 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Вставить
              </button>
              <button
                type="button"
                onClick={() => { setShowCodeInput(false); setCodeText(''); }}
                className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Панель эмодзи */}
        {showEmojiPicker && (
          <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="grid grid-cols-10 gap-1 max-h-[250px] overflow-y-auto">
              {EMOJI_LIST.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { insertEmoji(emoji); setShowEmojiPicker(false); }}
                  className="w-9 h-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Шаблоны */}
        {showTemplates && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => insertTemplate('theory')}
              className="p-3 text-left text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium">📖 Теория + код</div>
              <div className="text-xs text-gray-500">Заголовок, текст и пример кода</div>
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('steps')}
              className="p-3 text-left text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium">📝 Инструкция</div>
              <div className="text-xs text-gray-500">Пошаговое руководство</div>
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('scheme')}
              className="p-3 text-left text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium">🔌 Схема</div>
              <div className="text-xs text-gray-500">Описание подключения</div>
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('task')}
              className="p-3 text-left text-sm border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="font-medium">✅ Задание</div>
              <div className="text-xs text-gray-500">С критериями проверки</div>
            </button>
          </div>
        )}
      </div>

      {/* Область редактирования */}
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="p-6 bg-white focus:outline-none text-gray-800"
        data-placeholder="Начните писать текст... Ctrl+K — ссылка | Ctrl+S — сохранить | 🖼️ Перетащите фото"
        style={{
          fontSize: '16px',
          lineHeight: '1.8',
          minHeight: isFullscreen ? 'calc(100vh - 200px)' : '400px',
        }}
        suppressContentEditableWarning={true}
      />

      {/* Статистика */}
      <div className="bg-blue-50 border-t border-blue-100 p-3">
        <div className="flex flex-wrap items-center justify-between text-xs text-blue-700 gap-2">
          <div className="flex items-center gap-3">
            <span>💡 <strong>Выделите текст</strong> — форматируйте кнопками</span>
            <span className="hidden sm:inline">📋 Шаблоны для быстрой вставки</span>
          </div>
          <div className="flex items-center gap-3 font-medium">
            <span>{wordCount} слов</span>
            <span>{charCount} зн.</span>
            <span>~{readTime} мин чтения</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`border-2 rounded-lg transition-colors ${isFocused ? 'border-blue-400' : 'border-gray-300'}`}>
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
            <span className="font-medium text-gray-700">Редактор контента — КИП ФИН</span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Свернуть
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {editorContent}
          </div>
        </div>
      ) : (
        editorContent
      )}

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        [contenteditable]:focus:empty:before {
          content: attr(data-placeholder);
          color: #cbd5e1;
        }
        [contenteditable] h2 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 24px 0 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        [contenteditable] h3 {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin: 20px 0 10px;
        }
        [contenteditable] p {
          margin-bottom: 12px;
        }
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 24px;
          margin-bottom: 12px;
        }
        [contenteditable] ol {
          list-style-type: decimal;
          margin-left: 24px;
          margin-bottom: 12px;
        }
        [contenteditable] ul ul {
          list-style-type: circle;
        }
        [contenteditable] li {
          margin-bottom: 4px;
          padding-left: 4px;
        }
        [contenteditable] img {
          max-width: 100%;
          border-radius: 8px;
          margin: 16px 0;
        }
        [contenteditable] pre {
          background: #282c34;
          color: #abb2bf;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin: 16px 0;
        }
        [contenteditable] pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          color: #6b7280;
          font-style: italic;
          margin: 16px 0;
        }
        [contenteditable] hr {
          border: none;
          border-top: 2px dashed #d1d5db;
          margin: 32px 0;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default ContentEditor;