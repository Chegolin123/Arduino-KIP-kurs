// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\SectionList.jsx
// Список разделов

import React from 'react';

const SectionList = ({ sections, onExportWord, onEdit, onDelete }) => {
  if (!sections || sections.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400">Разделов пока нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sections
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .map((section) => (
          <div key={section.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
                {section.content && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {section.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {section.media?.video && (
                    <span className="inline-block text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">🎬 Видео</span>
                  )}
                  {section.media?.images?.length > 0 && (
                    <span className="inline-block text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">🖼️ {section.media.images.length} фото</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                <button onClick={() => onExportWord(section.id)} className="text-sm" title="Экспорт в Word">📥</button>
                <button onClick={() => onEdit(section)} className="text-sm" title="Редактировать">✏️</button>
                <button onClick={() => onDelete(section.id)} className="text-sm" title="Удалить">🗑️</button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SectionList;