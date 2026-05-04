// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\VerifyEmail.jsx

import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState('loading');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Токен не найден');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      // Серверный роут делает редирект, поэтому проверяем через GET
      window.location.href = `http://localhost:5000/api/auth/verify-email?token=${token}`;
    } catch (error) {
      setStatus('error');
      setMessage('Ошибка подтверждения');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Подтверждение email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
        <div className="text-5xl mb-4">{status === 'success' ? '✅' : '❌'}</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {status === 'success' ? 'Email подтверждён!' : 'Ошибка'}
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
          Перейти ко входу
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;