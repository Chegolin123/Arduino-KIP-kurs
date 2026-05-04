// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Layout\Header.jsx
// Компонент Header в воздушном стиле

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="glass sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Логотип */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Arduino Learn
            </span>
          </Link>

          {/* Мобильное меню */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Навигация */}
          <nav className={`lg:flex items-center space-x-8 ${isMenuOpen ? 'block' : 'hidden'} absolute lg:relative top-full left-0 right-0 lg:top-auto glass lg:bg-transparent lg:backdrop-filter-none p-4 lg:p-0 mt-2 lg:mt-0`}>
            <Link 
              to="/learn" 
              className="block lg:inline-block text-white hover:text-blue-200 transition-colors py-2 lg:py-0 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              📚 Обучение
            </Link>
            
            <Link 
              to="/catalog" 
              className="block lg:inline-block text-white hover:text-blue-200 transition-colors py-2 lg:py-0 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              🔧 Каталог
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user?.username}</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-6 py-2 text-white hover:text-blue-200 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Вход
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 hover:shadow-lg backdrop-blur-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;