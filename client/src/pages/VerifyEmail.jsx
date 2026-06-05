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
      window.location.href = `/api/auth/verify-email?token=${token}`;
    } catch (error) {
      setStatus('error');
      setMessage('Ошибка подтверждения');
    }
  };

  if (status === 'loading') {
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
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Подтверждение email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `
          linear-gradient(rgba(191, 219, 254, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(191, 219, 254, 0.4) 1px, transparent 1px),
          radial-gradient(circle at 0px 0px, rgba(147, 197, 253, 0.8) 2px, transparent 0),
          url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmZkYmZlIiBzdHJva2Utd2lkdGg9IjEiPjxwYXRoIGQ9Ik00MCAwIHY0MCBoNDAgdjQwIGg0MCB2NDAgSDQwIi8+PHBhdGggZD0iTTEyMCAwIHY4MCBoLTQwIi8+PHBhdGggZD0iTTAgMTIwaDQwIHY0MCIvPjwvZz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzIiBmaWxsPSIjOTNjNWZkIiBmaWxsLW9wYWNpdGk9IjAuNSIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyMCIgcj0iMyIgZmlsbD0iIzkzYzVmZCIgZmlsbC1vcGFjaXR5PSIwLjUiLz48L3N2Zz4")
        `,
        backgroundSize: '80px 80px, 80px 80px, 80px 80px, 160px 160px',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
      }}>
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