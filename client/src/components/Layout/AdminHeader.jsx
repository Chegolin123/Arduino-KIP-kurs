// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Layout\AdminHeader.jsx
// Хедер для админ-панели

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const AdminHeader = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navLinks = [
    { path: '/admin', label: 'Обзор' },
    { path: '/admin/courses', label: 'Курсы' },
    { path: '/admin/chapters', label: 'Главы' },
    { path: '/admin/tests', label: 'Тесты' },
    { path: '/admin/products', label: 'Каталог' },
    { path: '/admin/users', label: 'Студенты' },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-xl font-bold text-blue-800">КИП</span>
              <span className="text-xl font-light text-gray-700">ФИН</span>
            </Link>
            
            <nav className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-800 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/" className="text-sm text-gray-500 hover:text-blue-800 transition-colors">
              ← На сайт
            </Link>
            <span className="text-sm text-gray-400">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;