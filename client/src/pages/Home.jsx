// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Home.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Home = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface">
      {/* Top Nav */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white border-b border-slate-200 shadow-sm'
            : 'bg-white border-b border-slate-200 shadow-sm'
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.png" alt="MicroMiR" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-semibold text-[18px] text-primary transition-colors">MicroMiR</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-sm font-medium text-slate-600 hover:text-primary transition-colors" to="/library">Библиотека</Link>
            <Link className="text-sm font-medium text-slate-600 hover:text-primary transition-colors" to="/catalog">Каталог</Link>
            {isAdmin && <Link className="text-sm font-medium text-slate-600 hover:text-primary transition-colors" to="/admin">Админ</Link>}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full transition-colors text-sm font-semibold text-primary hover:bg-slate-50">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                  <span className="hidden md:inline">{user?.username || 'Профиль'}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-full transition-colors text-slate-500 hover:bg-slate-100" aria-label="Выйти">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors">Вход</Link>
                <Link to="/register" className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section
          className="relative overflow-hidden min-h-[600px] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 35, 111, 0.62), rgba(0, 35, 111, 0.62)), url('https://lh3.googleusercontent.com/aida/AP1WRLtUUjd6FygbZYv2Q7JhxUVAIvebVb7L1n3UZgm-B5wdvGBpw2uB2sAxO4XSYH1DSY6Y3aFYbzo2KpLf5UIYSARUE19ZB2MGwdAd2qH_bBZchWCtvt9mjTQu_8N9P_lf3hSOoW4muCll9rg0VSa7M0Z6FId6QQ1IbWUDH7chbYNQQ5IRk9NaHmfAts8rLrUN0-NWyDuoFj-XDvOCqE-pMNzHtOS1HgDo8TjE3JlOazYvap0B5eoTh5uWHjg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-secondary-container opacity-20 blur-[120px] rounded-full" />
          <div className="absolute -left-20 bottom-0 w-64 h-64 bg-tertiary-container opacity-20 blur-[100px] rounded-full" />

          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 text-white bg-white/10 mb-6 backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm mr-2 text-white">memory</span>
                  <span className="text-xs font-semibold tracking-[0.12em] uppercase text-white">Arduino · курсы · каталог · тесты</span>
                </div>

                <h1 className="text-[40px] sm:text-[56px] lg:text-[64px] leading-[1.05] tracking-[-0.02em] font-bold text-white max-w-3xl">
                  Изучайте Arduino с нуля до уверенной практики
                </h1>

                <p className="mt-5 text-[18px] leading-8 text-white/90 max-w-2xl">
                  Структурированные уроки, тестирование, каталог компонентов и понятная навигация — всё, чтобы студент мог учиться, а преподаватель мог удобно управлять контентом.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                  {isAuthenticated ? (
                      <Link to="/learn" className="inline-flex items-center justify-center gap-2 bg-white/90 text-primary px-7 py-4 rounded-full font-medium shadow-md shadow-black/8 ring-1 ring-white/50 hover:bg-white hover:shadow-lg hover:shadow-black/10 transition-all duration-300 active:scale-[0.99]">
                        <span className="material-symbols-outlined text-primary/80">play_circle</span>
                        Продолжить обучение
                      </Link>
                  ) : (
                    <>
                      <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white/90 text-primary px-7 py-4 rounded-full font-medium shadow-md shadow-black/8 ring-1 ring-white/50 hover:bg-white hover:shadow-lg hover:shadow-black/10 transition-all duration-300 active:scale-[0.99]">
                        <span className="material-symbols-outlined text-primary/80">school</span>
                        Начать обучение
                      </Link>
                      <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white/90 text-primary px-7 py-4 rounded-full font-medium shadow-md shadow-black/8 ring-1 ring-white/50 hover:bg-white hover:shadow-lg hover:shadow-black/10 transition-all duration-300 active:scale-[0.99]">
                        <span className="material-symbols-outlined text-primary/80">login</span>
                        Войти
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:block">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-secondary-container to-primary-container rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                  <div className="relative bg-slate-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-300 font-semibold">System.Log_</span>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-error/20" />
                        <div className="w-3 h-3 rounded-full bg-secondary-container/40" />
                        <div className="w-3 h-3 rounded-full bg-primary/40" />
                      </div>
                    </div>
                    <div className="font-mono text-[14px] leading-[22px] text-slate-200">
                      {[
                        { n: '01', code: 'void setup() {' },
                        { n: '02', code: 'Serial.begin(9600);', indent: true },
                        { n: '03', code: 'Serial.println("Hello World");', indent: true },
                        { n: '04', code: '}' },
                        { n: '05', code: 'void loop() {' },
                        { n: '06', code: '// Main code here', indent: true },
                        { n: '07', code: '}' },
                      ].map((line) => (
                        <div key={line.n} className="grid grid-cols-[48px_1fr] gap-3 items-start">
                          <span className="text-slate-500 text-right select-none">{line.n}</span>
                          <span className={`${line.indent ? 'pl-4' : ''} ${line.code.includes('{') || line.code === '}' ? 'text-sky-300' : 'text-slate-200'}`}>
                            {line.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
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
          }}
        >
        {/* Feature cards */}
        <section className="py-16 px-4 sm:px-6 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/85 backdrop-blur-sm border border-outline-variant p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary transition-all">
              <div className="w-12 h-12 bg-secondary-container/10 text-secondary rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <h3 className="text-[24px] leading-8 font-semibold text-on-surface mb-2">Учебные материалы</h3>
              <p className="text-sm text-on-surface-variant leading-6">Структурированные уроки от основ до продвинутых тем Arduino. Схемы, код и пояснения.</p>
            </div>

            <div className="bg-white/85 backdrop-blur-sm border border-outline-variant p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary transition-all">
              <div className="w-12 h-12 bg-tertiary-container/10 text-tertiary rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">settings_input_component</span>
              </div>
              <h3 className="text-[24px] leading-8 font-semibold text-on-surface mb-2">Каталог компонентов</h3>
              <p className="text-sm text-on-surface-variant leading-6">Характеристики и примеры использования элементов Arduino: датчики, моторы, модули.</p>
            </div>

            <div className="bg-white/85 backdrop-blur-sm border border-outline-variant p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary transition-all">
              <div className="w-12 h-12 bg-primary-container/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">lightbulb</span>
              </div>
              <h3 className="text-[24px] leading-8 font-semibold text-on-surface mb-2">Практические проекты</h3>
              <p className="text-sm text-on-surface-variant leading-6">Готовые проекты для закрепления знаний на практике. От умного дома до робототехники.</p>
            </div>
          </div>
        </section>

        {/* Informational section */}
        <section className="py-16 border-y border-outline-variant relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent absolute top-1/4" />
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent absolute bottom-1/4" />
          </div>
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6">
              <h2 className="text-[32px] leading-[40px] font-semibold text-on-surface mb-4">Учебная платформа для практики и роста</h2>
              <p className="text-[16px] leading-7 text-on-surface-variant mb-8 max-w-xl">
                Платформа помогает студентам изучать Arduino по понятной структуре: от первой схемы до проверки знаний и работы с компонентами.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">format_list_numbered</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Пошаговые руководства</h4>
                    <p className="text-sm leading-6 text-on-surface-variant">От простых мигающих светодиодов до сложных систем автоматизации.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[20px]">terminal</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Интерактивный симулятор</h4>
                    <p className="text-sm leading-6 text-on-surface-variant">Проверяйте свой код и схемы в виртуальной среде перед сборкой.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">groups</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Поддержка сообщества</h4>
                    <p className="text-sm leading-6 text-on-surface-variant">Обменивайтесь опытом и получайте помощь от экспертов и студентов.</p>
                  </div>
                </div>
              </div>

              <Link
                to="/library"
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-7 py-4 rounded-full font-medium shadow-md shadow-blue-900/20 hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-900/25 transition-all duration-300 active:scale-[0.99] group"
              >
                Знания для будущего
                <span className="material-symbols-outlined text-[18px] text-white/90 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            <div className="lg:col-span-6 relative h-[400px] mt-12 lg:mt-0">
              <div className="absolute top-0 right-0 w-64 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-lg z-30 transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">code</span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Code Editor</span>
                </div>
                <div className="h-24 bg-surface-container-low rounded font-mono text-[10px] leading-4 p-2 text-on-surface-variant">
                  void loop() {'{'}<br />
                  &nbsp;&nbsp;digitalWrite(13, HIGH);<br />
                  &nbsp;&nbsp;delay(1000);<br />
                  {'}'}
                </div>
              </div>

              <div className="absolute top-1/4 left-1/4 w-64 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-lg z-20 transform rotate-6 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary text-sm">schema</span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Schematics</span>
                </div>
                <div className="h-32 bg-secondary-container/10 rounded flex items-center justify-center overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdSnrkxRSq9_GpNp3zl1V-d458Koqqf3YR1OBOoPxWqGvX7RuC14zAj0eOSrq6wpLuCmhrV_0arOvoXIVhNTKEAHOuXofmvYMAtpnZWmA17v1BKECx7B4eTNMkfDENz7QBjav9T9hiaH51Mm5ir6qkEYYh4uZj4s3emoewpsBDeksD9ZD98jUDsyhnE1cxl10RgdZ6X8zZR0lSb7OGDE1WoWA3e-r31gKTc0krV4ftzv-4Lvnh2Zntsp-nBf9ziRT4u7Fc6k6wPNs"
                    alt="Arduino Technical Schematic"
                    className="w-full h-full object-contain p-2 rounded"
                  />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-64 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-lg z-10 transform -rotate-6 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary text-sm">menu_book</span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">Theory</span>
                </div>
                <p className="text-[10px] leading-4 text-on-surface-variant">
                  Методика Learn by Doing помогает сразу связывать теорию, код и практическую сборку схем.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 text-center max-w-[1280px] mx-auto">
          <h2 className="text-[32px] leading-[40px] font-semibold text-on-surface mb-3">Каталог элементов</h2>
          <p className="text-[16px] leading-7 text-on-surface-variant mb-8 max-w-2xl mx-auto">
            Датчики, моторы, дисплеи и другие компоненты для изучения Arduino. Все в одном месте с примерами кода.
          </p>
          <div className="inline-block bg-white/85 backdrop-blur-sm border border-outline-variant rounded-3xl px-8 py-8 shadow-lg">
          <Link to="/catalog" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-container transition-all">
            Перейти в каталог
            <span className="material-symbols-outlined text-[18px]">trending_flat</span>
          </Link>
          </div>
        </section>
        </div>

        <footer className="bg-surface-container-lowest border-t border-outline-variant">
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
                <a className="hover:text-primary transition-colors" href="#">Политика конфиденциальности</a>
                <a className="hover:text-primary transition-colors" href="#">Условия использования</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
