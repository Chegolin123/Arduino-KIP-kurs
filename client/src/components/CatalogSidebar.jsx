// Расположение: C:\OSPanel\domains\Arduino\client\src\components\CatalogSidebar.jsx
// Боковая панель каталога с категориями

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios';

const CatalogSidebar = () => {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await API.get('/products');
      const products = response.data.products || [];
      
      // Собираем категории и количество товаров в каждой
      const cats = {};
      products.forEach(p => {
        if (p.category) {
          cats[p.category] = (cats[p.category] || 0) + 1;
        }
      });

      const categoryList = Object.entries(cats).map(([name, count]) => ({ name, count }));
      categoryList.sort((a, b) => a.name.localeCompare(b.name));
      
      setCategories(categoryList);
      setCounts(cats);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  return (
    <aside className="w-72 bg-white/82 backdrop-blur-sm border-r border-slate-200 p-6 overflow-y-auto shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Категории</h3>
        <p className="text-xs text-slate-400 mt-1">Фильтр по типу компонентов</p>
      </div>
      
      <nav className="space-y-1">
        <Link
          to="/catalog"
          className={`block text-sm py-2.5 px-3 rounded-xl transition-colors ${
            !currentCategory
              ? 'text-blue-700 bg-blue-50 border border-blue-100 font-medium'
              : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
          }`}
        >
          Все категории
        </Link>
        
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/catalog?category=${cat.name}`}
            className={`block text-sm py-2.5 px-3 rounded-xl transition-colors ${
              currentCategory === cat.name
                ? 'text-blue-700 bg-blue-50 border border-blue-100 font-medium'
                : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{cat.name}</span>
              <span className="text-xs text-slate-400">{cat.count}</span>
            </div>
          </Link>
        ))}
        
        {categories.length === 0 && (
          <p className="text-sm text-slate-400 px-3 py-2">Нет категорий</p>
        )}
      </nav>
    </aside>
  );
};

export default CatalogSidebar;
