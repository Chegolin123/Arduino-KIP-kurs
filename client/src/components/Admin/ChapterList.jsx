// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ChapterList.jsx
// Список глав

import React from 'react';

const ChapterList = ({ chapters, selectedId, loading, onSelect, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-3">Главы курса</h3>
      {loading ? (
        <p className="text-sm text-gray-400">Загрузка...</p>
      ) : chapters.length === 0 ? (
        <p className="text-sm text-gray-400">Нет глав. Создайте первую главу.</p>
      ) : (
        <div className="space-y-1">
          {chapters
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => onSelect(chapter)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedId === chapter.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{chapter.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{chapter.sections?.length || 0} разделов</p>
                  </div>
                  <div className="flex space-x-1 ml-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(chapter); }}
                      className="text-xs p-1"
                      title="Редактировать"
                    >✏️</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
                      className="text-xs p-1"
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