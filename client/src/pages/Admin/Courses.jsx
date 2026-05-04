// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Courses.jsx

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AdminCourses = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: '', difficulty: 'beginner', order_index: 0 });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { navigate('/login'); }
    else { loadData(); }
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    const [coursesRes, chaptersRes] = await Promise.all([
      API.get('/courses/admin'),
      API.get('/chapters')
    ]);
    setCourses(coursesRes.data.courses || []);
    setChapters(chaptersRes.data.chapters || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('duration', form.duration);
    formData.append('difficulty', form.difficulty);
    formData.append('order_index', form.order_index);
    if (image) formData.append('image', image);

    if (editingCourse) {
      await API.put(`/courses/${editingCourse.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await API.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    resetForm();
    loadData();
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({ title: course.title, description: course.description || '', duration: course.duration || '', difficulty: course.difficulty || 'beginner', order_index: course.order_index || 0 });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить курс?')) {
      await API.delete(`/courses/${id}`);
      loadData();
    }
  };

  const handleLinkChapter = async (courseId, chapterId) => {
    await API.post(`/courses/${courseId}/chapters/${chapterId}`);
    loadData();
  };

  const handleUnlinkChapter = async (courseId, chapterId) => {
    await API.delete(`/courses/${courseId}/chapters/${chapterId}`);
    loadData();
  };

  const resetForm = () => {
    setEditingCourse(null);
    setForm({ title: '', description: '', duration: '', difficulty: 'beginner', order_index: 0 });
    setImage(null);
    setShowForm(false);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-500">{courses.length} курсов</p>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="px-4 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-900">
            {showForm ? 'Скрыть' : '+ Добавить курс'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">{editingCourse ? 'Редактировать' : 'Новый курс'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Название *</label><input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Длительность</label><input type="text" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="40 часов" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Сложность</label><select value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="beginner">Начальный</option><option value="intermediate">Средний</option><option value="advanced">Продвинутый</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Порядок</label><input type="number" value={form.order_index} onChange={(e) => setForm({...form, order_index: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Описание</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows="3" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label><input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm" /></div>
              <div className="md:col-span-2 flex space-x-3">
                <button type="submit" className="px-6 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-900">{editingCourse ? 'Сохранить' : 'Добавить'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border text-gray-700 text-sm rounded-lg hover:bg-gray-50">Отмена</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? <p className="text-gray-400">Загрузка...</p> :
            courses.length === 0 ? <p className="text-gray-400 col-span-2">Нет курсов</p> :
            courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{course.description?.substring(0, 100)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(course)} className="text-sm text-blue-600">✏️</button>
                    <button onClick={() => handleDelete(course.id)} className="text-sm text-red-600">🗑️</button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Главы курса:</p>
                  <div className="space-y-1">
                    {chapters.filter(ch => ch.course_id === course.id).map(ch => (
                      <div key={ch.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span>{ch.title}</span>
                        <button onClick={() => handleUnlinkChapter(course.id, ch.id)} className="text-red-500 text-xs">Отвязать</button>
                      </div>
                    ))}
                    <select
                      className="w-full text-sm border border-gray-200 rounded p-1 mt-2"
                      onChange={(e) => { if (e.target.value) handleLinkChapter(course.id, e.target.value); e.target.value = ''; }}
                      value=""
                    >
                      <option value="">+ Привязать главу</option>
                      {chapters.filter(ch => !ch.course_id).map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;