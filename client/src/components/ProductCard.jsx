// Расположение: C:\OSPanel\domains\Arduino\client\src\components\ProductCard.jsx
// Карточка товара

import React, { useState } from 'react';

const ProductCard = ({ product }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = product.image_url 
    ? `http://localhost:5000${product.image_url}` 
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
      {/* Изображение */}
      <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden flex items-center justify-center relative">
        {imageUrl && !imageError ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
                 style={{backgroundImage: `url(${imageUrl})`}} />
            <img
              src={imageUrl}
              alt={product.name}
              className="relative z-10 w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">{product.name}</p>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-5">
        {/* Категория */}
        {product.category && (
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded mb-2">
            {product.category}
          </span>
        )}
        
        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {product.description || 'Описание отсутствует'}
        </p>

        {/* Характеристики */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {showDetails ? 'Скрыть ▲' : 'Характеристики ▼'}
            </button>
            
            {showDetails && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Цена */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {product.price ? (
            <span className="text-lg font-bold text-gray-900">{product.price} ₽</span>
          ) : (
            <span className="text-sm text-gray-400">Цена не указана</span>
          )}
          
          {product.stock > 0 ? (
            <span className="text-xs text-green-600 font-medium">В наличии</span>
          ) : (
            <span className="text-xs text-red-500">Нет в наличии</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;