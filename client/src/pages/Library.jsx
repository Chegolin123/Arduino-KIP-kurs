// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Library.jsx
// Библиотека курсов (только для авторизованных)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';

const Library = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCourses();
  }, [isAuthenticated, navigate]);

  const loadCourses = async () => {
    try {
      const response = await API.get('/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      setLoadError('Не удалось загрузить курсы. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const openCourse = (course) => {
    setSelectedCourse(null);
    navigate(`/learn?course_id=${course.id}`);
  };

  const difficultyLabels = {
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div
        className="min-h-screen"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
            <div className="h-7 bg-white/10 rounded w-64 mb-3" />
            <div className="h-4 bg-white/10 rounded w-80 max-w-full" />
          </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-72 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl"></div>
            ))}
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Библиотека</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Библиотека курсов</h1>
          <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl">Выберите курс, изучите описание и откройте обучение в один клик.</p>
        </div>

        {loadError ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl text-center py-12 px-6 shadow-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-700">{loadError}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm text-center py-20 px-6">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Курсов пока нет</h2>
            <p className="text-slate-400">Курсы появятся позже</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer overflow-hidden group shadow-sm"
              >
                <div className="aspect-square relative overflow-hidden bg-gray-900">
                  {course.image_url ? (
                    <>
                      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105"
                           style={{backgroundImage: `url(${course.image_url})`}} />
                      <img src={`${course.image_url}`}
                           alt={course.title}
                           className="relative z-10 w-full h-full object-contain" />
                    </>
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-5xl text-white bg-gradient-to-br from-blue-900 via-blue-700 to-slate-900">📖</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${difficultyColors[course.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                      {difficultyLabels[course.difficulty] || course.difficulty}
                    </span>
                    {course.duration && (
                      <span className="text-xs text-slate-400">{course.duration}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-800 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-6">
                    {course.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800">
                    Открыть курс
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedCourse(null)}></div>
            <div className="bg-white/95 backdrop-blur-md rounded-[2rem] max-w-lg w-full p-8 relative z-10 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedCourse(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-900 via-blue-700 to-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl text-white">📖</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedCourse.title}</h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${difficultyColors[selectedCourse.difficulty] || ''}`}>
                    {difficultyLabels[selectedCourse.difficulty]}
                  </span>
                  {selectedCourse.duration && <span className="text-xs text-slate-400">{selectedCourse.duration}</span>}
                </div>
              </div>

              <p className="text-slate-600 text-center mb-6 leading-7">{selectedCourse.description}</p>

              <div className="flex justify-center">
                <button
                  onClick={() => openCourse(selectedCourse)}
                  className="px-8 py-3 bg-blue-900 text-white font-medium rounded-full hover:bg-blue-950 transition-colors shadow-sm"
                >
                  Начать обучение
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
