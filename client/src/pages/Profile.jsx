// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Profile.jsx
// Профиль студента с метриками успеваемости

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../store/authSlice';
import API from '../api/axios';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(fetchProfile());
    loadStats();
  }, [isAuthenticated, navigate, dispatch]);

  const loadStats = async () => {
    try {
      const [coursesRes, resultsRes] = await Promise.all([
        API.get('/courses'),
        API.get('/tests/results/all')
      ]);
      setCourses(coursesRes.data.courses || []);
      setTestResults(resultsRes.data.results || []);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-6xl mx-auto p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Подсчёт статистики
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const averageScore = totalTests > 0
    ? Math.round(testResults.reduce((sum, r) => sum + r.percent, 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0
    ? Math.max(...testResults.map(r => r.percent))
    : 0;

  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      {/* Верхняя карточка профиля */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Аватар */}
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}>
            <span className="text-3xl lg:text-4xl text-white font-bold">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Администратор' : 'Студент'}
                </span>
                {user.institution && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {user.institution}
                  </span>
                )}
              </div>
            </div>

            {user.student_group && (
              <p className="text-sm text-blue-700 font-medium mt-2">
                Группа: {user.student_group}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-2">
              На платформе с {new Date(user.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">📝</div>
            <p className="text-xs text-gray-500 font-medium">Пройдено тестов</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalTests}</p>
          <p className="text-xs text-gray-400 mt-1">{passedTests} успешно</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">✅</div>
            <p className="text-xs text-gray-500 font-medium">Успеваемость</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{passRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${passRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">⭐</div>
            <p className="text-xs text-gray-500 font-medium">Средний балл</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
          <p className="text-xs text-gray-400 mt-1">из 100%</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">🏆</div>
            <p className="text-xs text-gray-500 font-medium">Лучший результат</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{bestScore}%</p>
          <p className="text-xs text-gray-400 mt-1">максимум</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-lg">📚</div>
            <p className="text-xs text-gray-500 font-medium">Курсов доступно</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
          <p className="text-xs text-gray-400 mt-1">в библиотеке</p>
        </div>
      </div>

      {/* Курсы и прогресс */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Мои курсы</h2>
        
        {statsLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(n => <div key={n} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-500">Курсы пока не добавлены</p>
            <Link to="/library" className="text-blue-600 text-sm hover:text-blue-800 mt-2 inline-block">
              Перейти в библиотеку
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map(course => {
              const courseTests = testResults.filter(r => {
                // Здесь нужна привязка тестов к курсам, пока показываем общий прогресс
                return true;
              });
              const progress = totalTests > 0 ? passRate : 0;

              return (
                <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-800 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">
                    📖
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                      <span className="text-sm font-bold text-blue-800 ml-2">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{course.duration || ''}</span>
                      <span className="text-xs text-gray-400">
                        {courseTests.length > 0 ? `${courseTests.length} тест(ов)` : 'Нет тестов'}
                      </span>
                    </div>
                  </div>
                  <Link to={`/learn?course_id=${course.id}`}
                    className="px-3 py-1.5 text-xs bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors flex-shrink-0">
                    Открыть
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Последние результаты тестов */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Последние результаты</h2>
        
        {testResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">Вы ещё не проходили тесты</p>
            <Link to="/learn" className="text-blue-600 text-sm hover:text-blue-800 mt-2 inline-block">
              Перейти к обучению
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {testResults.slice(0, 5).map((result, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {result.passed ? '✓' : '✗'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Тест #{result.test_id}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(result.completed_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {result.percent}%
                  </p>
                  <p className="text-xs text-gray-400">{result.score}/{result.total_questions}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Информация об аккаунте */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Информация об аккаунте</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">ID</span>
            <span className="text-sm font-medium text-gray-900">{user.id}</span>
          </div>
          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Имя пользователя</span>
            <span className="text-sm font-medium text-gray-900">{user.username}</span>
          </div>
          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Роль</span>
            <span className="text-sm font-medium text-gray-900">{user.role === 'admin' ? 'Администратор' : 'Студент'}</span>
          </div>
          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-500">Учебное заведение</span>
            <span className="text-sm font-medium text-gray-900">{user.institution || '—'}</span>
          </div>
          {user.student_group && (
            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-500">Группа</span>
              <span className="text-sm font-medium text-gray-900">{user.student_group}</span>
            </div>
          )}
          <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg sm:col-span-2">
            <span className="text-sm text-gray-500">Дата регистрации</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(user.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;