// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Layout\Footer.jsx
// Footer КИП ФИН

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-gray-900 font-bold">
              <span className="text-blue-800">КИП</span> ФИН
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Обучающая платформа по Arduino — знания для будущего
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/learn" className="text-sm text-gray-500 hover:text-blue-800 transition-colors">
              Обучение
            </Link>
            <Link to="/catalog" className="text-sm text-gray-500 hover:text-blue-800 transition-colors">
              Каталог
            </Link>
            <a href="mailto:support@kip-fin.ru" className="text-sm text-gray-500 hover:text-blue-800 transition-colors">
              Поддержка
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} КИП ФИН. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;