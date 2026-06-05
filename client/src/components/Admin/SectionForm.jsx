// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\SectionForm.jsx
// Форма создания/редактирования раздела

import React from 'react';
import ContentEditor from './ContentEditor';

const SectionForm = ({ form, onChange, onSubmit, onCancel, isEditing, existingMedia, onDeleteImage, onAutoSave }) => {
  return (
    <form onSubmit={onSubmit} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Существующие медиа */}
      {existingMedia && (existingMedia.video || (existingMedia.images && existingMedia.images.length > 0)) && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-sm">
          <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">Текущие медиа</p>
          {existingMedia.video && (
            <div className="mb-3">
              <span className="text-slate-600">🎬 Видео:</span>{' '}
              <span className="text-blue-700 text-xs break-all">{existingMedia.video}</span>
            </div>
          )}
          {existingMedia.images && existingMedia.images.length > 0 && (
            <div>
              <span className="text-slate-600">🖼️ Изображений: {existingMedia.images.length}</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {existingMedia.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={`${img}`}
                      alt=""
                      className="w-full h-20 object-cover rounded-xl border border-slate-200"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteImage && onDeleteImage(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center shadow"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3">
            Очистите поле "Видео URL" и сохраните раздел, чтобы удалить видео.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Название раздела</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Порядок</label>
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => onChange({ ...form, order_index: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Видео URL</label>
          <input
            type="text"
            value={form.video_url || ''}
            onChange={(e) => onChange({ ...form, video_url: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="YouTube или Vimeo"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Изображения</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onChange({ ...form, images: e.target.files })}
          className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Содержание</label>
        <ContentEditor
          value={form.content}
          onChange={(newContent) => onChange({ ...form, content: newContent })}
          onAutoSave={onAutoSave}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
          {isEditing ? 'Сохранить раздел' : 'Добавить раздел'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm rounded-xl hover:bg-slate-50 transition-colors">
          Отмена
        </button>
      </div>
    </form>
  );
};

export default SectionForm;
