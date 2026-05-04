// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Tests.jsx
// Управление тестами с удобным поиском и фильтрацией глав

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AdminTests = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchChapter, setSearchChapter] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [form, setForm] = useState({
    chapter_id: '', section_id: '', title: '', description: '', pass_percent: 70,
    questions: []
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { navigate('/login'); return; }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    const [chaptersRes, coursesRes] = await Promise.all([
      API.get('/chapters'),
      API.get('/courses/admin')
    ]);
    setChapters(chaptersRes.data.chapters || []);
    setCourses(coursesRes.data.courses || []);
    setLoading(false);
  };

  // Фильтрация глав
  const filteredChapters = useMemo(() => {
    return chapters.filter(ch => {
      if (filterCourse && String(ch.course_id) !== String(filterCourse)) return false;
      if (searchChapter) {
        const q = searchChapter.toLowerCase();
        return ch.title.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }, [chapters, filterCourse, searchChapter]);

  // Группировка глав по курсам для отображения
  const groupedChapters = useMemo(() => {
    const grouped = {};
    filteredChapters.forEach(ch => {
      const courseTitle = courses.find(c => c.id === ch.course_id)?.title || 'Без курса';
      if (!grouped[courseTitle]) grouped[courseTitle] = [];
      grouped[courseTitle].push(ch);
    });
    return grouped;
  }, [filteredChapters, courses]);

  const loadTestForChapter = async (chapterId) => {
    try {
      const res = await API.get(`/tests/chapter/${chapterId}`);
      if (res.data.test) {
        setEditingTest(res.data.test);
        setForm({
          chapter_id: res.data.test.chapter_id || '',
          section_id: res.data.test.section_id || '',
          title: res.data.test.title || '',
          description: res.data.test.description || '',
          pass_percent: res.data.test.pass_percent || 70,
          questions: res.data.test.questions || []
        });
      } else {
        setEditingTest(null);
        setForm({
          chapter_id: chapterId, section_id: '', title: '', description: '', pass_percent: 70, questions: []
        });
      }
      setShowForm(true);
    } catch (error) {
      console.error('Ошибка загрузки теста:', error);
    }
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { question: '', type: 'single', answers: [
        { answer: '', is_correct: false },
        { answer: '', is_correct: false },
      ]}]
    });
  };

  const removeQuestion = (idx) => {
    const qs = [...form.questions];
    qs.splice(idx, 1);
    setForm({ ...form, questions: qs });
  };

  const updateQuestion = (idx, field, value) => {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], [field]: value };
    setForm({ ...form, questions: qs });
  };

  const addAnswer = (qIdx) => {
    const qs = [...form.questions];
    qs[qIdx].answers.push({ answer: '', is_correct: false });
    setForm({ ...form, questions: qs });
  };

  const removeAnswer = (qIdx, aIdx) => {
    const qs = [...form.questions];
    qs[qIdx].answers.splice(aIdx, 1);
    setForm({ ...form, questions: qs });
  };

  const updateAnswer = (qIdx, aIdx, field, value) => {
    const qs = [...form.questions];
    qs[qIdx].answers[aIdx] = { ...qs[qIdx].answers[aIdx], [field]: value };
    setForm({ ...form, questions: qs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('Введите название теста');
    if (!form.chapter_id && !form.section_id) return alert('Выберите главу');
    if (form.questions.length === 0) return alert('Добавьте хотя бы один вопрос');

    try {
      await API.post('/tests/manage', {
        chapter_id: form.chapter_id || null,
        section_id: form.section_id || null,
        title: form.title,
        description: form.description,
        pass_percent: form.pass_percent,
        questions: form.questions
      });
      alert('Тест сохранён');
      resetForm();
    } catch (error) {
      alert('Ошибка сохранения теста');
    }
  };

  const handleDelete = async (chapterId) => {
    if (!window.confirm('Удалить тест?')) return;
    await API.delete(`/tests/manage/chapter/${chapterId}`);
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTest(null);
    setForm({ chapter_id: '', section_id: '', title: '', description: '', pass_percent: 70, questions: [] });
  };

  // Проверка, есть ли тест у главы
  const getChapterTestStatus = (chapter) => {
    // В реальном API нужен эндпоинт для проверки, пока заглушка
    return null;
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Левая колонка — список глав */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Главы</h3>
              
              {/* Фильтр по курсу */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Все курсы</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              {/* Поиск по главам */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={searchChapter}
                  onChange={(e) => setSearchChapter(e.target.value)}
                  placeholder="Поиск главы..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchChapter && (
                  <button onClick={() => setSearchChapter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">×</button>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-2">{filteredChapters.length} глав</p>

              {loading ? (
                <div className="space-y-2 animate-pulse">
                  {[1,2,3,4,5].map(n => <div key={n} className="h-12 bg-gray-100 rounded-lg" />)}
                </div>
              ) : filteredChapters.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Ничего не найдено</p>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {Object.entries(groupedChapters).map(([courseTitle, chs]) => (
                    <div key={courseTitle}>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1">
                        {courseTitle}
                      </p>
                      <div className="space-y-0.5">
                        {chs.map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => loadTestForChapter(ch.id)}
                            className={`w-full text-left p-2.5 rounded-lg transition-colors border text-sm ${
                              form.chapter_id === String(ch.id)
                                ? 'bg-blue-50 border-blue-300'
                                : 'hover:bg-gray-50 border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-900 truncate">{ch.title}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                                {ch.sections?.length || 0} разд.
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — редактор теста */}
          <div className="lg:col-span-2">
            {!showForm ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-semibold text-gray-500 mb-2">Выберите главу</h3>
                <p className="text-gray-400 text-sm">Выберите главу слева для создания или редактирования теста</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Карточка теста */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-900">
                      {editingTest ? 'Редактирование теста' : 'Новый тест'}
                    </h2>
                    <div className="flex gap-2">
                      {editingTest && (
                        <button type="button" onClick={() => handleDelete(form.chapter_id)}
                          className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">🗑 Удалить</button>
                      )}
                      <button type="button" onClick={resetForm}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">Закрыть</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Название теста</label>
                      <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Итоговый тест по главе" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Проходной %</label>
                      <input type="number" value={form.pass_percent} onChange={(e) => setForm({...form, pass_percent: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min="0" max="100" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Привязан к главе</label>
                      <select value={form.chapter_id} onChange={(e) => setForm({...form, chapter_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">Выберите главу</option>
                        {courses.map(course => (
                          <optgroup key={course.id} label={course.title}>
                            {chapters.filter(ch => ch.course_id === course.id).map(ch => (
                              <option key={ch.id} value={ch.id}>{ch.title}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Описание</label>
                      <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Необязательно" />
                    </div>
                  </div>
                </div>

                {/* Вопросы */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Вопросы ({form.questions.length})</h3>
                    <button type="button" onClick={addQuestion}
                      className="px-4 py-1.5 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-900">+ Добавить вопрос</button>
                  </div>

                  {form.questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p>Нет вопросов</p>
                      <p className="text-sm mt-1">Нажмите «+ Добавить вопрос» чтобы создать</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {form.questions.map((q, qIdx) => (
                        <div key={qIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-semibold text-gray-700">Вопрос {qIdx + 1}</span>
                            <button type="button" onClick={() => removeQuestion(qIdx)}
                              className="text-xs text-red-500 hover:text-red-700">✕</button>
                          </div>

                          <input type="text" value={q.question} onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 bg-white"
                            placeholder="Введите текст вопроса" />

                          <div className="flex items-center gap-6 mb-3">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input type="radio" name={`type_${qIdx}`} checked={q.type === 'single'}
                                onChange={() => updateQuestion(qIdx, 'type', 'single')} />
                              Один правильный ответ
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input type="radio" name={`type_${qIdx}`} checked={q.type === 'multiple'}
                                onChange={() => updateQuestion(qIdx, 'type', 'multiple')} />
                              Несколько правильных
                            </label>
                          </div>

                          <p className="text-xs text-gray-500 mb-2">Варианты ответов (отметьте правильные):</p>
                          <div className="space-y-2">
                            {q.answers.map((a, aIdx) => (
                              <div key={aIdx} className="flex items-center gap-2">
                                <input
                                  type={q.type === 'single' ? 'radio' : 'checkbox'}
                                  name={`correct_${qIdx}`}
                                  checked={a.is_correct}
                                  onChange={() => {
                                    if (q.type === 'single') {
                                      const as = q.answers.map((ans, i) => ({ ...ans, is_correct: i === aIdx }));
                                      updateQuestion(qIdx, 'answers', as);
                                    } else {
                                      updateAnswer(qIdx, aIdx, 'is_correct', !a.is_correct);
                                    }
                                  }}
                                  className="flex-shrink-0 w-4 h-4"
                                />
                                <input
                                  type="text"
                                  value={a.answer}
                                  onChange={(e) => updateAnswer(qIdx, aIdx, 'answer', e.target.value)}
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                                  placeholder={`Вариант ${aIdx + 1}`}
                                />
                                {q.answers.length > 2 && (
                                  <button type="button" onClick={() => removeAnswer(qIdx, aIdx)}
                                    className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button type="button" onClick={() => addAnswer(qIdx)}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
                            + Добавить вариант ответа
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Кнопка сохранения */}
                <div className="text-center">
                  <button type="submit"
                    className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm">
                    💾 Сохранить тест
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTests;