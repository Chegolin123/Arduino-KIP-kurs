// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ChapterForm.jsx

import React from 'react';

const ChapterForm = ({ form, onChange, onSubmit, onCancel, isEditing }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {isEditing ? 'Редактирование главы' : 'Новая глава'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {isEditing ? 'Обновите название или описание.' : 'Создайте новую главу и сразу добавьте стартовые разделы.'}
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Название главы</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Например: Введение в Arduino"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[84px]"
            rows="2"
            placeholder="Кратко опишите, чему посвящена глава"
          />
        </div>
        
        {!isEditing && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Стартовых разделов</label>
            <input
              type="number" min="0" max="20"
              value={form.sectionsCount}
              onChange={(e) => onChange({ ...form, sectionsCount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0"
            />
            <p className="mt-1 text-[11px] text-slate-500">Если нужно, разделы будут созданы автоматически сразу после главы.</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 py-2.5 bg-blue-800 text-white text-sm font-medium rounded-xl hover:bg-blue-900 transition-colors">
            {isEditing ? 'Сохранить главу' : 'Создать главу'}
          </button>
          {(isEditing || form.title) && (
            <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-xl hover:bg-slate-50 transition-colors">
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChapterForm;
