// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Dashboard.jsx
// Дашборд админ-панели КИП ФИН

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../api/axios';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    chapters: 0, sections: 0, products: 0, users: 0, students: 0, admins: 0
  });
  const [requireVerification, setRequireVerification] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    } else {
      loadStats();
      loadSettings();
    }
  }, [isAuthenticated, user, navigate]);

  const loadStats = async () => {
    try {
      const [chaptersRes, productsRes, usersRes] = await Promise.all([
        API.get('/chapters'),
        API.get('/products'),
        API.get('/auth/users')
      ]);
      
      const chapters = chaptersRes.data.chapters || [];
      const sectionsCount = chapters.reduce((acc, ch) => acc + (ch.sections?.length || 0), 0);
      const users = usersRes.data.users || [];

      setStats({
        chapters: chapters.length,
        sections: sectionsCount,
        products: productsRes.data.products?.length || 0,
        users: users.length,
        students: users.filter(u => u.role === 'user').length,
        admins: users.filter(u => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await API.get('/settings');
      setRequireVerification(res.data.settings.require_email_verification === 'true');
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const toggleVerification = async () => {
    const newValue = !requireVerification;
    try {
      await API.put('/settings/require_email_verification', { value: String(newValue) });
      setRequireVerification(newValue);
    } catch (error) {
      alert('Ошибка обновления настройки');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const cards = [
    { title: 'Управление курсами', desc: 'Создание и редактирование курсов', link: '/admin/courses', icon: '📚', color: 'bg-blue-500' },
    { title: 'Управление главами', desc: 'Добавление глав и разделов', link: '/admin/chapters', icon: '📝', color: 'bg-indigo-500' },
    { title: 'Управление тестами', desc: 'Создание тестов для глав', link: '/admin/tests', icon: '✅', color: 'bg-purple-500' },
    { title: 'Управление каталогом', desc: 'Добавление и редактирование товаров', link: '/admin/products', icon: '🔧', color: 'bg-orange-500' },
    { title: 'Студенты', desc: 'Просмотр профилей и статистики', link: '/admin/users', icon: '👥', color: 'bg-green-500' },
  ];

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Глав</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.chapters}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Разделов</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sections}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Товаров</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.products}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Пользователей</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.users}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Студентов</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.students}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">Админов</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{stats.admins}</p>
          </div>
        </div>

        {/* Карточка настройки верификации */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">📧</div>
              <div>
                <h3 className="font-semibold text-gray-900">Подтверждение почты</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {requireVerification 
                    ? 'Новые пользователи должны подтверждать email перед входом' 
                    : 'Пользователи могут входить сразу после регистрации'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleVerification}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                requireVerification 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {requireVerification ? '✅ Включено' : '⏸️ Отключено'}
            </button>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className="bg-white rounded-xl border border-gray-200 p-8 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-800">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;