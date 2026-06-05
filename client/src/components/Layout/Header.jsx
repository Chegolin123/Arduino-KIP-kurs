// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Layout\Header.jsx

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const isActive = (path) => location.pathname === path;
  const isCatalog = location.pathname.startsWith('/catalog');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src="/logo.png" alt="MicroMiR" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-semibold text-[18px] text-primary">MicroMiR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link className={`text-sm font-medium transition-colors ${isActive('/library') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`} to="/library">Библиотека</Link>
          <Link className={`text-sm font-medium transition-colors ${isCatalog ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`} to="/catalog">Каталог</Link>
          {isAdmin && <Link className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" to="/admin">Админ</Link>}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-surface-container-low transition-colors text-sm text-primary font-semibold">
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                <span className="hidden md:inline">{user?.username || 'Профиль'}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant" aria-label="Выйти">
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors">Вход</Link>
              <Link to="/register" className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
