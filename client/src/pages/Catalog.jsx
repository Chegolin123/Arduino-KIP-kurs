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
      console.error('Ошибка загрузки товаров:', error);
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
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Каталог элементов</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по названию или описанию..."
              className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              {(category || searchInput) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Сброс
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
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
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(n => <div key={n} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Ничего не найдено</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Link key={product.id} to={`/catalog/${product.id}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden group">
              <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                {product.image_url ? (
                  <img src={`http://localhost:5000${product.image_url}`} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-gray-300">📦</span>
                )}
                {product.category && (
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">{product.category}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-3">
                  {product.price ? <span className="font-bold text-gray-900">{product.price} ₽</span> : <span className="text-sm text-gray-400">—</span>}
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
  );
};

export default Catalog;