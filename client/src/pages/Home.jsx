// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Home.jsx
// Главная страница КИП ФИН

import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <span className="text-blue-800">КИП ФИН</span> — изучайте Arduino с нуля
            </h1>
            <p className="text-lg text-gray-500 mb-2">
              Образовательная платформа колледжа КИП ФИН
            </p>
            <p className="text-base text-blue-800 font-medium mb-6">
              Знания для будущего
            </p>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  С возвращением, <span className="font-semibold text-gray-900">{user?.username}</span>
                </p>
                <Link to="/learn" className="px-5 py-2.5 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors">
                  Продолжить обучение
                </Link>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/register" className="px-5 py-2.5 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors">
                  Начать обучение
                </Link>
                <Link to="/login" className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Войти
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Возможности */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Учебные материалы</h3>
              <p className="text-sm text-gray-500">Структурированные уроки от основ до продвинутых тем Arduino.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Каталог компонентов</h3>
              <p className="text-sm text-gray-500">Характеристики и примеры использования элементов Arduino.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Практические проекты</h3>
              <p className="text-sm text-gray-500">Готовые проекты для закрепления знаний на практике.</p>
            </div>
          </div>
        </div>
      </section>

      {/* О колледже */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Колледж информатики и программирования</h2>
            <p className="text-gray-600 mb-4">
              КИП ФИН — современное образовательное учреждение, готовящее специалистов в области IT, электроники и программирования.
            </p>
            <p className="text-blue-800 font-medium">Знания для будущего</p>
          </div>
        </div>
      </section>

      {/* Каталог */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Каталог элементов</h2>
          <p className="text-gray-500 mb-6 max-w-xl mx-auto">
            Датчики, моторы, дисплеи и другие компоненты для изучения Arduino
          </p>
          <Link to="/catalog" className="inline-flex items-center px-5 py-2.5 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors">
            Перейти в каталог
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;