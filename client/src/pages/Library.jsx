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
      console.error('Ошибка загрузки курсов:', error);
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Библиотека курсов</h1>
      <p className="text-gray-500 mb-8">Выберите курс для обучения</p>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Курсов пока нет</h2>
          <p className="text-gray-400">Курсы появятся позже</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
            >
              <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center">
                {course.image_url ? (
                  <img
                    src={`http://localhost:5000${course.image_url}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-white">📖</span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[course.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                    {difficultyLabels[course.difficulty] || course.difficulty}
                  </span>
                  {course.duration && (
                    <span className="text-xs text-gray-400">{course.duration}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {course.description}
                </p>
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedCourse(null)}></div>
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative z-10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedCourse(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">📖</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[selectedCourse.difficulty] || ''}`}>
                  {difficultyLabels[selectedCourse.difficulty]}
                </span>
                {selectedCourse.duration && <span className="text-xs text-gray-400">{selectedCourse.duration}</span>}
              </div>
            </div>

            <p className="text-gray-600 text-center mb-6">{selectedCourse.description}</p>

            <div className="flex justify-center">
              <button
                onClick={() => openCourse(selectedCourse)}
                className="px-8 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
              >
                Начать обучение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;