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

  const isActive = (path) => location.pathname === path;
  const isAdminSection = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xl font-bold text-blue-800">КИП</span>
            <span className="text-xl font-light text-gray-700">ФИН</span>
            <span className="hidden sm:inline text-sm text-gray-400 ml-2">| знания для будущего</span>
          </Link>

          <nav className="flex items-center space-x-1">
            <Link 
              to="/library" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/library') ? 'text-blue-800 bg-blue-50' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
            >
              Библиотека
            </Link>
            
            <Link 
              to="/catalog" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname.startsWith('/catalog') ? 'text-blue-800 bg-blue-50' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
              }`}
            >
              Каталог
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isAdminSection ? 'text-blue-800 bg-blue-50' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}>
                    Админ
                  </Link>
                )}
                <Link to="/profile" className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/profile') ? 'text-blue-800 bg-blue-50' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}>
                  {user?.username || 'Профиль'}
                </Link>
                <button onClick={handleLogout} className="ml-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/login') ? 'text-blue-800 bg-blue-50' : 'text-gray-600 hover:text-blue-800 hover:bg-blue-50'
                }`}>
                  Вход
                </Link>
                <Link to="/register" className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors">
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;