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
    <div className="flex-1 min-h-screen" style={{
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Админка</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Пользователи</h1>
          <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-2xl">Поиск пользователей, фильтрация по группам и просмотр статистики.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Всего</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Студентов</p>
            <p className="text-2xl font-bold text-green-600">{studentCount}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Админов</p>
            <p className="text-2xl font-bold text-blue-800">{adminCount}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">КИП ФИН</p>
            <p className="text-2xl font-bold text-purple-600">{kipfinCount}</p>
          </div>
          <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-500">Групп</p>
            <p className="text-2xl font-bold text-orange-600">{availableGroups.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Левая колонка — фильтры и список */}
          <div className="lg:col-span-1 space-y-4">
            {/* Фильтр по группе */}
            <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Фильтр по группе</h3>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
            <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-4 shadow-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl mb-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
              <p className="text-xs text-slate-500 mb-2">{filteredUsers.length} пользователей</p>

              {loading ? <p className="text-sm text-slate-400">Загрузка...</p> :
               filteredUsers.length === 0 ? <p className="text-sm text-slate-400">Ничего не найдено</p> : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {filteredUsers.map((u) => (
                    <div key={u.id} onClick={() => loadUserStats(u.id)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedUser?.id === u.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                               style={{ backgroundColor: u.role === 'admin' ? '#1E40AF' : '#10B981' }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{u.username}</p>
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
                <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                           style={{ backgroundColor: selectedUser.role === 'admin' ? '#1E40AF' : '#10B981' }}>
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedUser.username}</h2>
                        <p className="text-sm text-slate-500">{selectedUser.email}</p>
                        {selectedUser.institution && (
                          <p className="text-sm text-blue-700 mt-0.5">
                            {selectedUser.institution}{selectedUser.student_group ? ` · ${selectedUser.student_group}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">Зарегистрирован: {formatDate(selectedUser.created_at)}</p>
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
                    <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500">Всего разделов</p>
                      <p className="text-2xl font-bold text-slate-900">{userStats.stats.totalSections}</p>
                    </div>
                    <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500">Пройдено</p>
                      <p className="text-2xl font-bold text-green-600">{userStats.stats.completedSections}</p>
                    </div>
                    <div className="bg-white/88 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-xs text-slate-500">Прогресс</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {userStats.stats.totalSections > 0 ? Math.round((userStats.stats.completedSections / userStats.stats.totalSections) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4">Информация</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">ID</span><span className="text-sm text-slate-900">{selectedUser.id}</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">Имя</span><span className="text-sm text-slate-900">{selectedUser.username}</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">Email</span><span className="text-sm text-slate-900">{selectedUser.email}</span></div>
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">Учебное заведение</span><span className="text-sm text-slate-900">{selectedUser.institution || '—'}</span></div>
                    {selectedUser.student_group && (
                      <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">Группа</span><span className="text-sm text-slate-900">{selectedUser.student_group}</span></div>
                    )}
                    <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-500">Роль</span><span className="text-sm text-slate-900">{selectedUser.role === 'admin' ? 'Администратор' : 'Студент'}</span></div>
                    <div className="flex justify-between py-2"><span className="text-sm text-slate-500">Регистрация</span><span className="text-sm text-slate-900">{formatDate(selectedUser.created_at)}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/88 backdrop-blur-sm rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <h3 className="font-semibold text-slate-400 mb-2">Выберите пользователя</h3>
                <p className="text-slate-400 text-sm">Выберите пользователя слева для просмотра информации</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
