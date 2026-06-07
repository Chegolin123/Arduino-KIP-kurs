// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Dashboard.jsx
// Дашборд админ-панели КИП ФИН

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../api/axios';
import { showAlert } from '../../components/Modal';

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
      await showAlert('Ошибка обновления настройки');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const cards = [
    { title: 'Управление курсами', desc: 'Создание и редактирование курсов', link: '/admin/courses', icon: 'menu_book', bg: 'bg-blue-500/10', text: 'text-blue-600' },
    { title: 'Управление главами', desc: 'Добавление глав и разделов', link: '/admin/chapters', icon: 'list_alt', bg: 'bg-indigo-500/10', text: 'text-indigo-600' },
    { title: 'Управление тестами', desc: 'Создание тестов для глав', link: '/admin/tests', icon: 'quiz', bg: 'bg-purple-500/10', text: 'text-purple-600' },
    { title: 'Управление каталогом', desc: 'Добавление и редактирование товаров', link: '/admin/products', icon: 'settings_input_component', bg: 'bg-orange-500/10', text: 'text-orange-600' },
    { title: 'Студенты', desc: 'Просмотр профилей и статистики', link: '/admin/users', icon: 'people', bg: 'bg-green-500/10', text: 'text-green-600' },
  ];

  return (
    <div className="flex-1 min-h-screen" style={{
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
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Админка</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Обзор системы</h1>
          <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl">Статистика платформы, быстрые переходы и управление ключевыми настройками.</p>
        </div>
        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Глав</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.chapters}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Разделов</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.sections}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Товаров</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.products}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Пользователей</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.users}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Студентов</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.students}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Админов</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{stats.admins}</p>
          </div>
        </div>

        {/* Карточка настройки верификации */}
        <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-teal-600">mail</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Подтверждение почты</h3>
                <p className="text-sm text-slate-500 mt-1">
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
                  : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
              }`}
            >
              {requireVerification ? 'Включено' : 'Отключено'}
            </button>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <Link
              key={idx}
              to={card.link}
              className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 hover:border-blue-300 hover:shadow-xl transition-all group shadow-sm"
            >
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                <span className={`material-symbols-outlined ${card.text}`}>{card.icon}</span>
              </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-800">{card.title}</h3>
                <p className="text-sm text-slate-500">{card.desc}</p>
              </Link>
            ))}
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
