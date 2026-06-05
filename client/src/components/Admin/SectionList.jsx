// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\SectionList.jsx
// Список разделов

import React from 'react';

const SectionList = ({ sections, onExportWord, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
        <div className="text-4xl mb-3">🧩</div>
        <p className="text-slate-600 font-medium">В этой главе пока нет разделов</p>
        <p className="text-sm text-slate-400 mt-1">Нажмите «+ Раздел», чтобы добавить первый материал.</p>
      </div>
    );
  }

  const sorted = [...sections].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <div className="space-y-3 lg:sticky lg:top-4">
      {sorted.map((section, index) => (
        <div key={section.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className="w-7 h-7 rounded-lg border border-slate-200 text-xs leading-none text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Выше"
                >▲</button>
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={index === sorted.length - 1}
                  className="w-7 h-7 rounded-lg border border-slate-200 text-xs leading-none text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Ниже"
                >▼</button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">#{index + 1}</span>
                </div>
                {section.content && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-6">
                    {section.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {section.media?.video && (
                    <span className="inline-block text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">🎬 Видео</span>
                  )}
                  {section.media?.images?.length > 0 && (
                    <span className="inline-block text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">🖼️ {section.media.images.length} фото</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
              <button onClick={() => onExportWord(section.id)} className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50" title="Экспорт в Word">📥</button>
              <button onClick={() => onEdit(section)} className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50" title="Редактировать">✏️</button>
              <button onClick={() => onDelete(section.id)} className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50" title="Удалить">🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SectionList;
