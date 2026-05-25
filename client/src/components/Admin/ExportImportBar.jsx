// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Admin\ExportImportBar.jsx
// Панель экспорта/импорта — только DOCX

import React, { useState, useRef, useEffect } from 'react';

const ExportImportBar = ({ 
    onExportExcel, 
    onExportJson, 
    onImportExcel, 
    onImportDocx,
    onImportDocxBatch 
}) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showImportMenu, setShowImportMenu] = useState(false);
    const exportRef = useRef(null);
    const importRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
            if (importRef.current && !importRef.current.contains(e.target)) setShowImportMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-1">
            {/* Экспорт */}
            <div className="relative" ref={exportRef}>
                <button
                    onClick={() => { setShowExportMenu(!showExportMenu); setShowImportMenu(false); }}
                    className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    📥 Экспорт ▾
                </button>
                {showExportMenu && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                        <button onClick={() => { onExportExcel(); setShowExportMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            📊 Excel
                        </button>
                        <button onClick={() => { onExportJson(); setShowExportMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            📋 JSON
                        </button>
                    </div>
                )}
            </div>

            {/* Импорт */}
            <div className="relative" ref={importRef}>
                <button
                    onClick={() => { setShowImportMenu(!showImportMenu); setShowExportMenu(false); }}
                    className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    📤 Импорт ▾
                </button>
                {showImportMenu && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                        <label className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2">
                            📊 Excel
                            <input type="file" accept=".xlsx,.xls" onChange={(e) => { onImportExcel(e); setShowImportMenu(false); }} className="hidden" />
                        </label>
                        
                        <label className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2">
                            📝 DOCX файл
                            <input 
                                type="file" 
                                accept=".docx" 
                                onChange={(e) => { onImportDocx(e); setShowImportMenu(false); }} 
                                className="hidden" 
                            />
                        </label>
                        
                        <label className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2">
                            📄📄 Несколько DOCX
                            <input 
                                type="file" 
                                accept=".docx" 
                                multiple 
                                onChange={(e) => { onImportDocxBatch(e); setShowImportMenu(false); }} 
                                className="hidden" 
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportImportBar;