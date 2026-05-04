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
    <aside className="w-72 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Категории
      </h3>
      
      <nav className="space-y-1">
        <Link
          to="/catalog"
          className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
            !currentCategory
              ? 'text-blue-600 bg-blue-50 font-medium'
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
          }`}
        >
          Все категории
        </Link>
        
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/catalog?category=${cat.name}`}
            className={`block text-sm py-2 px-3 rounded-lg transition-colors ${
              currentCategory === cat.name
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </div>
          </Link>
        ))}
        
        {categories.length === 0 && (
          <p className="text-sm text-gray-400 px-3 py-2">Нет категорий</p>
        )}
      </nav>
    </aside>
  );
};

export default CatalogSidebar;