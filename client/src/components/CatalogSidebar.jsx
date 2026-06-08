import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios';

const CatalogSidebar = () => {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await API.get('/products');
      const products = response.data.products || [];
      
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
      setLoadError('Не удалось загрузить категории.');
    }
  };

  const linkClass = (active) =>
    `block text-sm py-2.5 px-3 rounded-xl transition-colors min-h-[44px] flex items-center ${
      active
        ? 'text-blue-700 bg-blue-50 border border-blue-100 font-medium'
        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
    }`;

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Категории</h3>
          <p className="text-xs text-slate-400 mt-1">Фильтр по типу компонентов</p>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-slate-200 text-slate-500" aria-label="Закрыть">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <nav className="space-y-1">
        <Link
          to="/catalog"
          onClick={() => setSidebarOpen(false)}
          className={linkClass(!currentCategory)}
        >
          Все категории
        </Link>
        
        {loadError ? (
          <p className="text-sm text-red-500 px-3 py-2">{loadError}</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-400 px-3 py-2">Нет категорий</p>
        ) : (
          categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalog?category=${cat.name}`}
              onClick={() => setSidebarOpen(false)}
              className={linkClass(currentCategory === cat.name)}
            >
              <div className="flex justify-between items-center w-full">
                <span>{cat.name}</span>
                <span className="text-xs text-slate-400">{cat.count}</span>
              </div>
            </Link>
          ))
        )}
      </nav>
    </>
  );

  return (
    <>
      <button onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-20 left-4 z-30 w-12 h-12 bg-blue-900 text-white rounded-full shadow-lg flex items-center justify-center"
        aria-label="Категории">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      <aside className="hidden lg:block w-72 bg-white/82 backdrop-blur-sm border-r border-slate-200 p-6 overflow-y-auto shadow-sm">
        {content}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 p-6 overflow-y-auto shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogSidebar;
