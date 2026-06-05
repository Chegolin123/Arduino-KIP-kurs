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
      <div
        className="flex min-h-screen"
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
        <CatalogSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-lg bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="flex min-h-screen"
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
        <CatalogSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500 bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm px-8 py-12">
            <p className="text-xl text-slate-700">Товар не найден</p>
            <Link to="/catalog" className="text-blue-700 hover:text-blue-900 mt-4 inline-block">← Вернуться в каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
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
      <CatalogSidebar />

      <div className="flex-1 flex items-start justify-center pt-8 pb-16 px-4">
        <div className="w-full max-w-xl">
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Каталог</p>
            <h1 className="text-3xl sm:text-4xl font-bold mt-2">{product.name}</h1>
            <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl">Подробная информация, характеристики и наличие компонента.</p>
          </div>

          {/* Хлебные крошки */}
          <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <Link to="/catalog" className="hover:text-blue-600 transition-colors">Каталог</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/catalog?category=${product.category}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-900 truncate">{product.name}</span>
          </div>

          {/* Изображение */}
          <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden mb-6 flex items-center justify-center shadow-sm" style={{ minHeight: '250px' }}>
            {product.image_url && !imageError ? (
              <img src={`${product.image_url}`} alt={product.name} className="w-full max-h-[350px] object-contain" onError={() => setImageError(true)} />
            ) : (
              <div className="text-center p-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">{product.name}</p>
              </div>
            )}
          </div>

          {/* Описание + Цена */}
          <div className="flex flex-col sm:flex-row gap-5 mb-6">
            <div className="flex-1 bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-2">Описание</h2>
              <p className="text-slate-700 text-sm leading-7">{product.description || 'Описание отсутствует'}</p>
            </div>
            <div className="sm:w-44">
              <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-5 shadow-sm">
                {product.price ? (
                  <>
                    <p className="text-xs text-slate-500 mb-1">Цена</p>
                    <p className="text-2xl font-bold text-slate-900">{product.price} ₽</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Цена не указана</p>
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
            <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Характеристики</h2>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="px-4 py-3 text-slate-500 w-2/5">{key}</td>
                        <td className="px-4 py-3 text-slate-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Назад */}
          <div className="mt-6 pt-4 border-t border-slate-200 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-4">
            <Link to="/catalog" className="text-sm text-blue-700 hover:text-blue-900 font-medium">← Вернуться в каталог</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
