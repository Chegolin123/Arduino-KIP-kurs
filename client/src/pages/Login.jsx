// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Login.jsx
// Страница входа с подтверждением email

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import API from '../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const verifyToken = searchParams.get('token');
  const message = searchParams.get('message');

  // Автоматическая верификация при переходе по ссылке из письма
  useEffect(() => {
    if (verifyToken) {
      // Проверяем, не обработан ли уже этот токен
      const processed = sessionStorage.getItem(`verify_${verifyToken}`);
      if (processed) {
        console.log('Токен уже обработан, пропускаем');
        return;
      }

      // Помечаем токен как обработанный
      sessionStorage.setItem(`verify_${verifyToken}`, 'true');

      setVerifying(true);
      console.log('Отправляю токен на сервер:', verifyToken);

      API.get(`/auth/verify-email?token=${verifyToken}`)
        .then((response) => {
          console.log('Ответ сервера:', response.data);
          if (response.data.success) {
            setVerifyStatus('success');
            setVerifyMessage('Email успешно подтверждён! Теперь вы можете войти.');
            window.history.replaceState({}, '', '/login?verified=true');
          } else {
            setVerifyStatus('error');
            setVerifyMessage(response.data.message || 'Ошибка подтверждения');
          }
        })
        .catch((error) => {
          console.error('Ошибка верификации:', error.response?.data || error);
          setVerifyStatus('error');
          const msg = error.response?.data?.message || 'Ошибка подтверждения email';
          setVerifyMessage(msg);
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  }, [verifyToken]);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (message) {
      setVerifyMessage(message.replace(/\+/g, ' '));
      setVerifyStatus('error');
    }
  }, [message]);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Введите email';
    if (!formData.password) errs.password = 'Введите пароль';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) dispatch(loginUser(formData));
  };

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    try {
      await API.post('/auth/resend-verification', { email: resendEmail });
      setResendSent(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка отправки');
    }
  };

  const needVerification = error && typeof error === 'object' && error.needVerification;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4"
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
      }}>
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Доступ к платформе</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Вход</h2>
          <p className="text-sm text-slate-500 mt-1">Войдите, чтобы продолжить обучение и открыть библиотеку.</p>
        </div>

        {/* Индикатор верификации */}
        {verifying && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl mb-4 text-sm text-center border border-blue-100">
            ⏳ Подтверждение email...
          </div>
        )}

        {/* Сообщение о подтверждении */}
        {verifyStatus === 'success' && (
          <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm border border-emerald-100">
            ✅ {verifyMessage}
          </div>
        )}

        {verifyStatus === 'error' && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100">
            ❌ {verifyMessage}
          </div>
        )}

        {/* Ошибка входа */}
        {error && !needVerification && typeof error === 'string' && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Нужно подтвердить email */}
        {needVerification && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-yellow-800 mb-2">📧 Email не подтверждён. Проверьте почту.</p>
            {!resendSent ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Введите email"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleResendVerification}
                  className="px-3 py-2 text-sm bg-blue-900 text-white rounded-xl hover:bg-blue-950"
                >
                  Отправить повторно
                </button>
              </div>
            ) : (
              <p className="text-sm text-green-700">✅ Письмо отправлено! Проверьте почту.</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
            <input
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Введите пароль"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 text-white font-medium rounded-xl hover:bg-blue-950 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-blue-700 hover:text-blue-900 font-medium">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
