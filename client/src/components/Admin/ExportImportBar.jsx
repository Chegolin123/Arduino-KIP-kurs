// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ExportImportBar.jsx
// Панель экспорта/импорта

import React from 'react';

const ExportImportBar = ({ onExportExcel, onExportJson, onImportExcel }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExportExcel}
        className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        title="Экспорт в Excel"
      >📥 Excel</button>
      <button
        onClick={onExportJson}
        className="px-3 py-2 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        title="Экспорт в JSON"
      >📥 JSON</button>
      <label className="px-3 py-2 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer">
        📤 Импорт
        <input type="file" accept=".xlsx,.xls" onChange={onImportExcel} className="hidden" />
      </label>
    </div>
  );
};

export default ExportImportBar;