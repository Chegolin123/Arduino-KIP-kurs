// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Users.jsx
// Просмотр профилей студентов с фильтрацией по группам

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AdminUsers = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { navigate('/login'); }
    else { loadUsers(); }
  }, [isAuthenticated, user, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    const response = await API.get('/auth/users');
    setUsers(response.data.users || []);
    setLoading(false);
  };

  const loadUserStats = async (userId) => {
    const response = await API.get(`/auth/users/${userId}/stats`);
    setUserStats(response.data);
    setSelectedUser(response.data.user);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Изменить роль на "${newRole}"?`)) return;
    await API.put(`/auth/users/${userId}/role`, { role: newRole });
    loadUsers();
    if (selectedUser?.id === userId) loadUserStats(userId);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Уникальные группы из списка пользователей
  const availableGroups = useMemo(() => {
    const groups = new Set();
    users.forEach(u => { if (u.student_group) groups.add(u.student_group); });
    return Array.from(groups).sort();
  }, [users]);

  // Сгруппированные по курсам
  const groupedGroups = useMemo(() => {
    const grouped = { '1 курс': [], '2 курс': [], '3 курс': [] };
    availableGroups.forEach(g => {
      if (g.startsWith('1')) grouped['1 курс'].push(g);
      else if (g.startsWith('2')) grouped['2 курс'].push(g);
      else if (g.startsWith('3')) grouped['3 курс'].push(g);
    });
    return grouped;
  }, [availableGroups]);

  const filteredUsers = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.username.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !(u.student_group && u.student_group.toLowerCase().includes(q)) &&
          !(u.institution && u.institution.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (filterGroup && u.student_group !== filterGroup) return false;
    return true;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const studentCount = users.filter(u => u.role === 'user').length;
  const kipfinCount = users.filter(u => u.institution === 'КИП ФИН').length;

  // Статистика по группам
  const groupStats = useMemo(() => {
    const stats = {};
    users.forEach(u => {
      if (u.student_group) {
        stats[u.student_group] = (stats[u.student_group] || 0) + 1;
      }
    });
    return stats;
  }, [users]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Всего</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Студентов</p>
            <p className="text-2xl font-bold text-green-600">{studentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Админов</p>
            <p className="text-2xl font-bold text-blue-800">{adminCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">КИП ФИН</p>
            <p className="text-2xl font-bold text-purple-600">{kipfinCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Групп</p>
            <p className="text-2xl font-bold text-orange-600">{availableGroups.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Левая колонка — фильтры и список */}
          <div className="lg:col-span-1 space-y-4">
            {/* Фильтр по группе */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Фильтр по группе</h3>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Все группы</option>
                {Object.entries(groupedGroups).map(([course, groups]) => (
                  <optgroup key={course} label={course}>
                    {groups.map(g => (
                      <option key={g} value={g}>{g} ({groupStats[g] || 0})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {filterGroup && (
                <button onClick={() => setFilterGroup('')} className="mt-2 text-xs text-red-600 hover:text-red-800">
                  Сбросить фильтр
                </button>
              )}
            </div>

            {/* Список пользователей */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mb-2">{filteredUsers.length} пользователей</p>

              {loading ? <p className="text-sm text-gray-400">Загрузка...</p> :
               filteredUsers.length === 0 ? <p className="text-sm text-gray-400">Ничего не найдено</p> : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <div key={u.id} onClick={() => loadUserStats(u.id)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === u.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                               style={{ backgroundColor: u.role === 'admin' ? '#1E40AF' : '#10B981' }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{u.username}</p>
                            {u.student_group && (
                              <p className="text-xs text-blue-600">{u.student_group}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-1 ${u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role === 'admin' ? 'A' : 'С'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — детали */}
          <div className="lg:col-span-3">
            {selectedUser ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                           style={{ backgroundColor: selectedUser.role === 'admin' ? '#1E40AF' : '#10B981' }}>
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedUser.username}</h2>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        {selectedUser.institution && (
                          <p className="text-sm text-blue-700 mt-0.5">
                            {selectedUser.institution}{selectedUser.student_group ? ` · ${selectedUser.student_group}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Зарегистрирован: {formatDate(selectedUser.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm px-3 py-1 rounded-full ${selectedUser.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {selectedUser.role === 'admin' ? 'Администратор' : 'Студент'}
                      </span>
                      <button onClick={() => handleRoleChange(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin')}
                        className="text-xs text-blue-600 hover:text-blue-800 underline">
                        {selectedUser.role === 'admin' ? 'Сделать студентом' : 'Сделать админом'}
                      </button>
                    </div>
                  </div>
                </div>

                {userStats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Всего разделов</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.stats.totalSections}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Пройдено</p>
                      <p className="text-2xl font-bold text-green-600">{userStats.stats.completedSections}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Прогресс</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {userStats.stats.totalSections > 0 ? Math.round((userStats.stats.completedSections / userStats.stats.totalSections) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Информация</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">ID</span><span className="text-sm text-gray-900">{selectedUser.id}</span></div>
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">Имя</span><span className="text-sm text-gray-900">{selectedUser.username}</span></div>
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">Email</span><span className="text-sm text-gray-900">{selectedUser.email}</span></div>
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">Учебное заведение</span><span className="text-sm text-gray-900">{selectedUser.institution || '—'}</span></div>
                    {selectedUser.student_group && (
                      <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">Группа</span><span className="text-sm text-gray-900">{selectedUser.student_group}</span></div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">Роль</span><span className="text-sm text-gray-900">{selectedUser.role === 'admin' ? 'Администратор' : 'Студент'}</span></div>
                    <div className="flex justify-between py-2"><span className="text-sm text-gray-500">Регистрация</span><span className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <h3 className="font-semibold text-gray-400 mb-2">Выберите пользователя</h3>
                <p className="text-gray-400 text-sm">Выберите пользователя слева для просмотра информации</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;