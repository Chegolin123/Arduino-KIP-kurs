// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Catalog.jsx
// Каталог элементов (только для авторизованных)

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';

const Catalog = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [loadError, setLoadError] = useState('');

  const categories = ['Микроконтроллеры', 'Датчики', 'Дисплеи', 'Моторы', 'Коммуникация', 'Питание'];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProducts();
  }, [category, isAuthenticated]);

  const loadProducts = async (searchQuery) => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    const query = searchQuery !== undefined ? searchQuery : searchInput;
    if (query) params.search = query;
    
    try {
      const res = await API.get('/products', { params });
      setProducts(res.data.products || []);
    } catch (error) {
      setLoadError('Не удалось загрузить товары. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(searchInput);
  };

  const handleCategoryClick = (cat) => {
    setSearchInput('');
    if (category === cat) {
      navigate('/catalog');
    } else {
      navigate(`/catalog?category=${cat}`);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    navigate('/catalog');
    setTimeout(() => loadProducts(''), 100);
  };

  if (!isAuthenticated) return null;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `
          linear-gradient(rgba(191, 219, 254, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(191, 219, 254, 0.4) 1px, transparent 1px),
          radial-gradient(circle at 0px 0px, rgba(147, 197, 253, 0.8) 2px, transparent 0),
          url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmZkYmZlIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIGQ9Ik00MCAwIHY0MCBoNDAgdjQwIGg0MCB2NDAgSDQwIi8+PHBhdGggZD0iTTEyMCAwIHY4MCBoLTQwIi8+PHBhdGggZD0iTTAgMTIwaDQwIHY0MCIvPjwvZz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzIiBmaWxsPSIjOTNjNWZkIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyMCIgcj0iMyIgZmlsbD0iIzkzYzVmZCIgZmlsbC1vcGFjaXR5PSIwLjUiLz48L3N2Zz4")
        `,
        backgroundSize: '80px 80px, 80px 80px, 80px 80px, 160px 160px',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Каталог</p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2">Каталог элементов</h1>
        <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl">Датчики, моторы, дисплеи, модули связи и другие компоненты для практики и сборки схем.</p>
      </div>

      <div className="bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 mb-8 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по названию или описанию..."
              className="w-full px-4 py-3 pr-24 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              {(category || searchInput) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Сброс
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-900 text-white text-sm rounded-xl hover:bg-blue-950 transition-colors"
              >
                Найти
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`min-h-[44px] px-4 py-2 text-sm rounded-full transition-colors ${
                category === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-72 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl text-center py-12 px-6 shadow-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-700">{loadError}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm text-center py-20 text-slate-400">Ничего не найдено</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Link key={product.id} to={`/catalog/${product.id}`}
              className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all overflow-hidden group shadow-sm">
              <div className="aspect-square relative overflow-hidden bg-gray-900">
                {product.image_url ? (
                  <>
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
                         style={{backgroundImage: `url(${product.image_url})`}} />
                    <img src={`${product.image_url}`} alt={product.name}
                         className="relative z-10 w-full h-full object-contain" />
                  </>
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-4xl text-slate-300">📦</span>
                )}
                {product.category && (
                  <span className="absolute top-3 right-3 bg-blue-900 text-white text-xs px-2.5 py-1 rounded-full">{product.category}</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-800">{product.name}</h3>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-6">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  {product.price ? <span className="font-bold text-slate-900">{product.price} ₽</span> : <span className="text-sm text-slate-400">—</span>}
                  <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stock > 0 ? 'В наличии' : 'Нет'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Catalog;
