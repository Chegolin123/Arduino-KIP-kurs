// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\ProductDetail.jsx
// Детальная страница элемента каталога — контент строго по центру

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import CatalogSidebar from '../components/CatalogSidebar';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => { loadProduct(); }, [id]);

  const loadProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <CatalogSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-lg">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen">
        <CatalogSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-xl">Товар не найден</p>
            <Link to="/catalog" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">← Вернуться в каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <CatalogSidebar />

      <div className="flex-1 flex items-start justify-center pt-8 pb-16 px-4">
        <div className="w-full max-w-xl">
          {/* Хлебные крошки */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/catalog" className="hover:text-blue-600 transition-colors">Каталог</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/catalog?category=${product.category}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 truncate">{product.name}</span>
          </div>

          {/* Заголовок */}
          <h1 className="text-xl font-bold text-gray-900 mb-5">{product.name}</h1>

          {/* Изображение */}
          <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 flex items-center justify-center" style={{ minHeight: '250px' }}>
            {product.image_url && !imageError ? (
              <img src={`http://localhost:5000${product.image_url}`} alt={product.name} className="w-full max-h-[350px] object-contain" onError={() => setImageError(true)} />
            ) : (
              <div className="text-center p-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">{product.name}</p>
              </div>
            )}
          </div>

          {/* Описание + Цена */}
          <div className="flex flex-col sm:flex-row gap-5 mb-6">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Описание</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{product.description || 'Описание отсутствует'}</p>
            </div>
            <div className="sm:w-44">
              <div className="bg-gray-50 rounded-xl p-4">
                {product.price ? (
                  <>
                    <p className="text-xs text-gray-500 mb-1">Цена</p>
                    <p className="text-2xl font-bold text-gray-900">{product.price} ₽</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Цена не указана</p>
                )}
                <div className="mt-3">
                  {product.stock > 0 ? (
                    <span className="text-xs text-green-600 font-medium">✓ В наличии ({product.stock} шт.)</span>
                  ) : (
                    <span className="text-xs text-red-500 font-medium">✗ Нет в наличии</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Характеристики */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-gray-200 pt-5">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Характеристики</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2.5 text-gray-500 w-2/5">{key}</td>
                        <td className="px-4 py-2.5 text-gray-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Назад */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link to="/catalog" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← Вернуться в каталог</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;