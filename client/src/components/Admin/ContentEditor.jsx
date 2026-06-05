// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ContentEditor.jsx
// Визуальный редактор контента — КИП ФИН

import React, { useEffect, useMemo, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

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

const TEMPLATES = [
  {
    key: 'theory',
    title: 'Теория + код',
    description: 'Заголовок, пояснение и пример кода',
    html: `<h2>Теория</h2><p>Краткое теоретическое объяснение темы.</p><h3>Пример кода</h3><pre><code class="language-arduino">void setup() {
  // Ваш код
}

void loop() {
  // Ваш код
}</code></pre>`,
  },
  {
    key: 'steps',
    title: 'Пошагово',
    description: 'Список шагов и инструкций',
    html: `<h2>Пошаговая инструкция</h2><ol><li>Подготовьте компоненты.</li><li>Соберите схему.</li><li>Загрузите скетч.</li><li>Проверьте результат.</li></ol>`,
  },
  {
    key: 'scheme',
    title: 'Схема подключения',
    description: 'Описание подключения и пояснение',
    html: `<h2>Схема подключения</h2><p>Опишите подключение компонентов и укажите важные нюансы.</p>`,
  },
  {
    key: 'task',
    title: 'Задание',
    description: 'Структурированное учебное задание',
    html: `<h2>Задание</h2><p>Опишите, что должен сделать студент.</p><h3>Что нужно сделать</h3><ul><li>Пункт 1</li><li>Пункт 2</li></ul><h3>Критерии проверки</h3><p>Опишите, что считается правильным результатом.</p>`,
  },
];

const ContentEditor = ({ value, onChange, onAutoSave }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const isApplyingHistoryRef = useRef(false);
  const lastValueRef = useRef('');

  const [isFocused, setIsFocused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [codeText, setCodeText] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const plainText = useMemo(() => value?.replace(/<[^>]*>/g, '') || '', [value]);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const charCount = plainText.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const syncEditor = (html) => {
    if (!editorRef.current) return;
    if (html === lastValueRef.current && editorRef.current.innerHTML === html) return;
    isApplyingHistoryRef.current = true;
    editorRef.current.innerHTML = html || '';
    const initial = html || '';
    setHistory(initial ? [initial] : []);
    setHistoryIndex(initial ? 0 : -1);
    lastValueRef.current = initial;
    queueMicrotask(() => {
      isApplyingHistoryRef.current = false;
    });
  };

  useEffect(() => {
    const nextValue = value || '';
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== nextValue) {
      syncEditor(nextValue);
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
  }, [value]);

  useEffect(() => {
    if (!onAutoSave) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => onAutoSave(editorRef.current?.innerHTML || ''), 30000);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [value, onAutoSave]);

  useEffect(() => {
    if (!onAutoSave) return;
    const onBeforeUnload = () => onAutoSave(editorRef.current?.innerHTML || '');
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [onAutoSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocused) return;

      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;
      const anchorElement = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
      const codeBlock = anchorElement?.closest?.('pre');

      if (codeBlock && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        codeBlock.insertAdjacentElement('afterend', paragraph);
        const range = document.createRange();
        range.selectNodeContents(paragraph);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput();
        return;
      }

      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (onAutoSave) onAutoSave(editorRef.current?.innerHTML || '');
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

  const saveToHistory = (html) => {
    if (history[historyIndex] === html) return;
    const next = history.slice(0, historyIndex + 1);
    next.push(html);
    if (next.length > 120) next.shift();
    setHistory(next);
    setHistoryIndex(next.length - 1);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (!isApplyingHistoryRef.current) saveToHistory(html);
    lastValueRef.current = html;
    onChange(html);
  };

  const applyHistory = (html) => {
    isApplyingHistoryRef.current = true;
    if (editorRef.current) editorRef.current.innerHTML = html;
    queueMicrotask(() => {
      isApplyingHistoryRef.current = false;
    });
    lastValueRef.current = html;
    onChange(html);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    applyHistory(history[nextIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    applyHistory(history[nextIndex]);
  };

  const focusEditor = () => editorRef.current?.focus();

  const execCommand = (command, commandValue = null) => {
    focusEditor();
    document.execCommand(command, false, commandValue);
    handleInput();
  };

  const insertHtml = (html) => {
    focusEditor();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const insertImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      insertHtml(`<img src="${event.target.result}" alt="Изображение" data-editor-image="true" style="max-width:100%;height:auto;border-radius:12px;margin:16px 0;display:block" />`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) insertImageFile(file);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) insertImageFile(file);
    e.target.value = '';
  };

  const insertImageByUrl = () => {
    if (!imageUrl.trim()) return;
    insertHtml(`<img src="${imageUrl.trim()}" alt="Изображение" data-editor-image="true" style="max-width:100%;height:auto;border-radius:12px;margin:16px 0;display:block" />`);
    setImageUrl('');
    setShowUrlInput(false);
  };

  const insertDivider = () => insertHtml('<hr data-editor-divider="true" style="border:none;border-top:1px solid #e5e7eb;margin:28px 0" />');

  const insertCodeBlock = () => {
    if (!codeText.trim()) return;
    const escaped = codeText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    insertHtml(`<pre><code class="language-arduino">${escaped}</code></pre><p><br></p>`);
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const paragraphs = editor.querySelectorAll('p');
      const target = paragraphs[paragraphs.length - 1];
      if (!target) return;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      focusEditor();
    });
    setCodeText('');
    setShowCodeInput(false);
  };

  const insertTemplate = (html) => {
    insertHtml(html);
    setShowTemplates(false);
  };

  const insertEmoji = (emoji) => insertHtml(emoji);

  const clearFormat = () => {
    focusEditor();
    document.execCommand('removeFormat', false, null);
    handleInput();
  };

  const closePopovers = () => {
    setShowUrlInput(false);
    setShowCodeInput(false);
    setShowEmojiPicker(false);
    setShowTemplates(false);
  };

  const toolbarButton = (label, title, onClick, variant = 'neutral', active = false) => {
    const colors = {
      neutral: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      blue: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
      green: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700',
      amber: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600',
      red: 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600',
      violet: 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700',
      slate: 'bg-slate-600 text-white border-slate-600 hover:bg-slate-700',
    };

    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        title={title}
        className={`h-9 px-3 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${colors[variant]} ${active ? 'ring-2 ring-offset-1 ring-blue-300' : ''}`}
      >
        {label}
      </button>
    );
  };

  const statusLabel = useMemo(() => {
    if (!onAutoSave) return 'Автосохранение выключено';
    return 'Автосохранение включено';
  }, [onAutoSave]);

  const editorArea = (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Редактор контента</div>
          <div className="text-xs text-slate-500">Ctrl+S — сохранить черновик · Ctrl+Z/Y — история · перетащите изображение в текст</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{statusLabel}</span>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            {isFullscreen ? 'Свернуть' : 'На весь экран'}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {toolbarButton('↩', 'Отменить', undo, 'neutral', false)}
          {toolbarButton('↪', 'Повторить', redo, 'neutral', false)}
          <div className="w-px h-8 bg-slate-200 mx-1" />
          {toolbarButton('H2', 'Заголовок', () => execCommand('formatBlock', 'h2'))}
          {toolbarButton('B', 'Жирный', () => execCommand('bold'))}
          {toolbarButton('I', 'Курсив', () => execCommand('italic'))}
          {toolbarButton('U', 'Подчёркнутый', () => execCommand('underline'))}
          <div className="w-px h-8 bg-slate-200 mx-1" />
          {toolbarButton('•', 'Маркированный список', () => execCommand('insertUnorderedList'))}
          {toolbarButton('1.', 'Нумерованный список', () => execCommand('insertOrderedList'))}
          {toolbarButton('↳', 'Отступ', () => execCommand('indent'))}
          {toolbarButton('↲', 'Убрать отступ', () => execCommand('outdent'))}
          <div className="w-px h-8 bg-slate-200 mx-1" />
          {toolbarButton('📷', 'Фото с компьютера', () => fileInputRef.current?.click(), 'green')}
          {toolbarButton('🔗', 'Фото по ссылке', () => { closePopovers(); setShowUrlInput((v) => !v); }, 'blue', showUrlInput)}
          {toolbarButton('—', 'Разделитель', insertDivider, 'slate')}
          {toolbarButton('<>', 'Блок кода', () => { closePopovers(); setShowCodeInput((v) => !v); }, 'violet', showCodeInput)}
          {toolbarButton('😊', 'Эмодзи', () => { closePopovers(); setShowEmojiPicker((v) => !v); }, 'amber', showEmojiPicker)}
          {toolbarButton('📋', 'Шаблоны', () => { closePopovers(); setShowTemplates((v) => !v); }, 'blue', showTemplates)}
          {toolbarButton('✕', 'Очистить форматирование', clearFormat, 'red')}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

        {showUrlInput && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Вставьте ссылку на изображение"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && insertImageByUrl()}
            />
            <div className="flex gap-2">
              <button type="button" onClick={insertImageByUrl} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Вставить</button>
              <button type="button" onClick={() => { setShowUrlInput(false); setImageUrl(''); }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-white">Отмена</button>
            </div>
          </div>
        )}

        {showCodeInput && (
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              placeholder="Вставьте код Arduino"
              rows={5}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none resize-y"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={insertCodeBlock} className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700">Вставить код</button>
              <button type="button" onClick={() => { setShowCodeInput(false); setCodeText(''); }} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-white">Отмена</button>
            </div>
          </div>
        )}

        {showEmojiPicker && (
          <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-64 overflow-y-auto">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="h-10 rounded-lg text-xl hover:bg-slate-100 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {showTemplates && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.key}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertTemplate(template.html)}
                className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-semibold text-slate-900">{template.title}</div>
                <div className="text-xs text-slate-500 mt-1">{template.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        data-placeholder="Начните писать текст..."
        className="min-h-[420px] px-6 py-5 focus:outline-none text-slate-800 prose max-w-none"
        suppressContentEditableWarning
        style={{
          fontSize: '16px',
          lineHeight: '1.8',
          minHeight: isFullscreen ? 'calc(100vh - 220px)' : '420px',
        }}
      />

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
        <div className="flex flex-wrap gap-3">
          <span>💡 Выделите текст и примените форматирование сверху</span>
          <span>📷 Можно перетаскивать изображения прямо в редактор</span>
        </div>
        <div className="flex flex-wrap gap-3 font-medium text-slate-700">
          <span>{wordCount} слов</span>
          <span>{charCount} зн.</span>
          <span>~{readTime} мин</span>
        </div>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          font-style: italic;
        }
        [contenteditable] h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 24px 0 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        [contenteditable] h3 {
          font-size: 20px;
          font-weight: 600;
          color: #334155;
          margin: 20px 0 10px;
        }
        [contenteditable] p {
          margin-bottom: 12px;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 24px;
          margin-bottom: 12px;
        }
        [contenteditable] ul { list-style-type: disc; }
        [contenteditable] ol { list-style-type: decimal; }
        [contenteditable] li { margin-bottom: 4px; }
        [contenteditable] img {
          max-width: 100%;
          border-radius: 12px;
          margin: 16px 0;
        }
        [contenteditable] pre {
          background: #0f172a;
          color: #cbd5e1;
          padding: 18px;
          border-radius: 12px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin: 16px 0;
        }
        [contenteditable] pre code { color: inherit; background: none; padding: 0; }
        [contenteditable] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          color: #64748b;
          font-style: italic;
          margin: 16px 0;
        }
        [contenteditable] hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 28px 0;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );

  return (
    <div className={`transition-colors ${isFocused ? 'ring-2 ring-blue-400 ring-offset-2 rounded-2xl' : ''}`}>
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Редактор контента</div>
              <div className="text-xs text-slate-500">Полноэкранный режим</div>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
            >
              Свернуть
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {editorArea}
          </div>
        </div>
      ) : editorArea}
    </div>
  );
};

export default ContentEditor;
