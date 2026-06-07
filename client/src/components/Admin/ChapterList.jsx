// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ChapterList.jsx
// Список глав

import React, { useState } from 'react';

const ChapterList = ({ chapters, selectedId, loading, onSelect, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');

  const filtered = chapters
    .filter((ch) => ch.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Главы курса</h3>
          <p className="text-xs text-slate-500">Выберите главу, чтобы открыть её разделы</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{chapters.length}</span>
      </div>
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="w-full px-3 py-2 pl-9 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-14 bg-slate-100 rounded-xl" />
          <div className="h-14 bg-slate-100 rounded-xl" />
          <div className="h-14 bg-slate-100 rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 bg-slate-50">
          {search ? 'Ничего не найдено' : 'Нет глав в этом курсе. Создайте первую главу слева.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => onSelect(chapter)}
                className={`group p-3.5 rounded-xl cursor-pointer border transition-all ${
                  selectedId === chapter.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{chapter.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>{chapter.sections?.length || 0} разделов</span>
                      {selectedId === chapter.id && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Выбрана</span>}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
                      className="text-xs p-1.5 rounded-lg hover:bg-white"
                      title="Удалить"
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ChapterList;
