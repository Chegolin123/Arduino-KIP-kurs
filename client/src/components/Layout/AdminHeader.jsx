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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src="/logo.png" alt="MicroMiR" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-semibold text-[18px] text-primary">MicroMiR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">← На сайт</Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm text-primary font-semibold">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            <span className="hidden md:inline">{user?.username}</span>
          </span>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant" aria-label="Выйти">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
