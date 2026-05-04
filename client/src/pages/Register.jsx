// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Register.jsx
// Регистрация с подтверждением email

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/authSlice';
import API from '../api/axios';

const generateGroups = () => {
  const groups = [];
  for (let i = 1; i <= 13; i++) groups.push(`1ИСИП-${i}25`);
  for (let i = 1; i <= 13; i++) groups.push(`2ИСИП-${i}24`);
  for (let i = 1; i <= 13; i++) groups.push(`3ИСИП-${i}23`);
  return groups;
};

const ALL_GROUPS = generateGroups();

const GROUPED = {
  '1 курс': ALL_GROUPS.filter(g => g.startsWith('1')),
  '2 курс': ALL_GROUPS.filter(g => g.startsWith('2')),
  '3 курс': ALL_GROUPS.filter(g => g.startsWith('3')),
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    institution: '', student_group: '',
  });
  const [errors, setErrors] = useState({});
  const [groupSearch, setGroupSearch] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = 'Введите имя';
    else if (formData.username.length < 3) errs.username = 'Минимум 3 символа';
    if (!formData.email) errs.email = 'Введите email';
    if (!formData.password) errs.password = 'Введите пароль';
    else if (formData.password.length < 6) errs.password = 'Минимум 6 символов';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    if (formData.institution === 'kipfin' && !formData.student_group) {
      errs.student_group = 'Выберите группу';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const { confirmPassword, ...userData } = formData;
    
    try {
      const response = await API.post('/auth/register', {
        ...userData,
        institution: userData.institution === 'kipfin' ? 'КИП ФИН' : null,
        student_group: userData.institution === 'kipfin' ? userData.student_group : null,
      });
      
      if (response.data.success) {
        setSuccessEmail(userData.email);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      setErrors({ general: message });
    }
  };

  const handleInstitutionChange = (value) => {
    setFormData({ ...formData, institution: value, student_group: '' });
    setGroupSearch('');
    setShowGroupDropdown(false);
  };

  const selectGroup = (group) => {
    setFormData({ ...formData, student_group: group });
    setGroupSearch(group);
    setShowGroupDropdown(false);
  };

  const filteredGroups = groupSearch
    ? ALL_GROUPS.filter(g => g.toLowerCase().includes(groupSearch.toLowerCase()))
    : ALL_GROUPS;

  const filteredGrouped = {
    '1 курс': filteredGroups.filter(g => g.startsWith('1')),
    '2 курс': filteredGroups.filter(g => g.startsWith('2')),
    '3 курс': filteredGroups.filter(g => g.startsWith('3')),
  };

  // Экран успешной регистрации
  if (successEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Проверьте почту</h2>
          <p className="text-gray-600 mb-6">
            Мы отправили письмо со ссылкой для подтверждения на <strong>{successEmail}</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Перейдите по ссылке в письме, чтобы завершить регистрацию.
          </p>
          <div className="space-y-3">
            <Link to="/login" className="block w-full py-2.5 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors">
              Перейти ко входу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Регистрация</h2>
        
        {errors.general && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="username"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Учебное заведение */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Учебное заведение</label>
            <select
              value={formData.institution}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Без учебного заведения</option>
              <option value="kipfin">КИП ФИН</option>
            </select>
          </div>

          {/* Группа (только для КИП ФИН) */}
          {formData.institution === 'kipfin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа *</label>
              
              {/* Поиск и выбранная группа */}
              <div className="relative">
                <input
                  type="text"
                  value={groupSearch}
                  onChange={(e) => {
                    setGroupSearch(e.target.value);
                    setShowGroupDropdown(true);
                    if (formData.student_group !== e.target.value) {
                      setFormData({...formData, student_group: ''});
                    }
                  }}
                  onFocus={() => setShowGroupDropdown(true)}
                  placeholder="Начните вводить группу..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                
                {/* Выпадающий список */}
                {showGroupDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {Object.entries(filteredGrouped).map(([course, groups]) => {
                      if (groups.length === 0) return null;
                      return (
                        <div key={course}>
                          <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                            {course}
                          </div>
                          {groups.map(group => (
                            <button
                              key={group}
                              type="button"
                              onClick={() => selectGroup(group)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                                formData.student_group === group ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {group}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                    {filteredGroups.length === 0 && (
                      <p className="px-3 py-2 text-sm text-gray-400">Ничего не найдено</p>
                    )}
                  </div>
                )}
              </div>
              
              {formData.student_group && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Выбрана группа: {formData.student_group}
                </p>
              )}
              {errors.student_group && <p className="text-red-500 text-xs mt-1">{errors.student_group}</p>}
            </div>
          )}

          {/* Пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Минимум 6 символов"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Подтверждение пароля */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подтверждение пароля</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Повторите пароль"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Есть аккаунт?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;