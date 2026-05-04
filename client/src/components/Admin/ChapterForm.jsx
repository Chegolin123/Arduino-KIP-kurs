// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ChapterForm.jsx

import React from 'react';

const ChapterForm = ({ form, onChange, onSubmit, onCancel, isEditing, courses = [], selectedCourseId }) => {
  // При создании новой главы автоматом подставляем выбранный курс
  const courseId = form.course_id || selectedCourseId || '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        {isEditing ? 'Редактировать главу' : 'Новая глава'}
      </h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Курс *</label>
          <select
            value={courseId}
            onChange={(e) => onChange({ ...form, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Выберите курс</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Название главы</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Введение в Arduino"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows="2"
            placeholder="Краткое описание главы"
          />
        </div>
        
        {!isEditing && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Количество разделов</label>
            <input
              type="number" min="0" max="20"
              value={form.sectionsCount}
              onChange={(e) => onChange({ ...form, sectionsCount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0"
            />
          </div>
        )}

        <div className="flex space-x-2">
          <button type="submit" className="flex-1 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900">
            {isEditing ? 'Сохранить' : 'Добавить главу'}
          </button>
          {(isEditing || form.title) && (
            <button type="button" onClick={onCancel} className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              Отмена
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChapterForm;