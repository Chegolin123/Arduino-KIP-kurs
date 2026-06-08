// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Layout\Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 sm:px-6 py-12 max-w-[1280px] mx-auto">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="MicroMiR" className="w-6 h-6 rounded-md" />
            <span className="font-semibold text-primary">MicroMiR</span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-sm leading-6">
            Курсы по Arduino, тесты, каталог компонентов и редактор учебных материалов.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-on-surface mb-4 font-semibold">Разделы</h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link className="hover:text-primary hover:underline transition-colors" to="/library">Библиотека</Link></li>
            <li><Link className="hover:text-primary hover:underline transition-colors" to="/catalog">Каталог</Link></li>
            <li><a className="hover:text-primary hover:underline transition-colors" href="mailto:support@example.com">Поддержка</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-on-surface mb-4 font-semibold">Связь</h4>
          <div className="flex flex-col gap-3">
            <a
              className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
              href="https://t.me/NoWayWhile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.5 4.5 18.2 20c-.2 1.1-.8 1.4-1.7.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.4-8.5c.4-.4-.1-.6-.6-.3L5.7 13.4l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.1 3c.9-.3 1.7.2 1.4 1.5Z" />
              </svg>
              <span>@NoWayWhile</span>
            </a>
            <a
              className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
              href="mailto:finnik142@gmail.com"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5C20.22 5 21 5.78 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
              </svg>
              <span>finnik142@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant py-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center text-on-surface-variant text-xs uppercase tracking-[0.12em] gap-2">
          <p>© {new Date().getFullYear()} MicroMiR. Все права защищены.</p>
          <div className="flex gap-6">
            <span className="text-on-surface-variant">Политика конфиденциальности</span>
            <span className="text-on-surface-variant">Условия использования</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
