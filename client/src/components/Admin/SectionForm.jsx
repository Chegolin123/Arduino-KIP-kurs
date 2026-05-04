// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\SectionForm.jsx
// Форма создания/редактирования раздела

import React from 'react';
import ContentEditor from './ContentEditor';

const SectionForm = ({ form, onChange, onSubmit, onCancel, isEditing, existingMedia, onDeleteImage }) => {
  return (
    <form onSubmit={onSubmit} className="border-t border-gray-100 pt-4 space-y-3">
      {/* Существующие медиа */}
      {existingMedia && (existingMedia.video || (existingMedia.images && existingMedia.images.length > 0)) && (
        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <p className="text-xs font-medium text-blue-700 mb-2">Текущие медиа:</p>
          {existingMedia.video && (
            <div className="mb-2">
              <span className="text-gray-600">🎬 Видео:</span>{' '}
              <span className="text-blue-600 text-xs truncate">{existingMedia.video}</span>
            </div>
          )}
          {existingMedia.images && existingMedia.images.length > 0 && (
            <div>
              <span className="text-gray-600">🖼️ Изображений: {existingMedia.images.length}</span>
              <div className="flex gap-2 mt-2 flex-wrap">
                {existingMedia.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={`http://localhost:5000${img}`}
                      alt=""
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteImage && onDeleteImage(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Очистите поле "Видео URL" и сохраните раздел, чтобы удалить видео.
          </p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Название раздела</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Порядок</label>
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => onChange({ ...form, order_index: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Видео URL</label>
          <input
            type="text"
            value={form.video_url || ''}
            onChange={(e) => onChange({ ...form, video_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="YouTube"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Изображения</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onChange({ ...form, images: e.target.files })}
          className="w-full text-sm"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Содержание</label>
        <ContentEditor
          value={form.content}
          onChange={(newContent) => onChange({ ...form, content: newContent })}
          onImageInsert={(file) => {
            const currentImages = form.images ? Array.from(form.images) : [];
            const dt = new DataTransfer();
            [...currentImages, file].forEach(img => dt.items.add(img));
            onChange({ ...form, images: dt.files });
          }}
        />
      </div>
      
      <div className="flex space-x-2">
        <button type="submit" className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
          {isEditing ? 'Сохранить раздел' : 'Добавить раздел'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
          Отмена
        </button>
      </div>
    </form>
  );
};

export default SectionForm;