// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Admin\Chapters.jsx
// Управление главами и разделами

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import ChapterForm from '../../components/Admin/ChapterForm';
import ChapterList from '../../components/Admin/ChapterList';
import SectionForm from '../../components/Admin/SectionForm';
import SectionList from '../../components/Admin/SectionList';
import ExportImportBar from '../../components/Admin/ExportImportBar';

const AdminChapters = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  
  const [chapterForm, setChapterForm] = useState({ title: '', description: '', sectionsCount: 0, course_id: '' });
  const [sectionForm, setSectionForm] = useState({ title: '', content: '', order_index: 0, video_url: '', images: null });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { navigate('/login'); }
    else { loadData(); }
  }, [isAuthenticated, user, navigate]);

  const loadData = async () => {
    setLoading(true);
    const [chaptersRes, coursesRes] = await Promise.all([API.get('/chapters'), API.get('/courses/admin')]);
    const allChapters = chaptersRes.data.chapters || [];
    const allCourses = coursesRes.data.courses || [];
    setChapters(allChapters);
    setCourses(allCourses);
    if (!selectedCourseId && allCourses.length > 0) setSelectedCourseId(String(allCourses[0].id));
    setLoading(false);
  };

  const loadSelectedChapter = async () => {
    if (!selectedChapter) return;
    try {
      const res = await API.get(`/chapters/${selectedChapter.id}`);
      if (res.data.chapter) setSelectedChapter(res.data.chapter);
    } catch {
      setSelectedChapter(null);
    }
  };

  const filteredChapters = selectedCourseId ? chapters.filter(ch => String(ch.course_id) === String(selectedCourseId)) : [];

  useEffect(() => {
    if (selectedChapter && !filteredChapters.find(ch => ch.id === selectedChapter.id)) setSelectedChapter(null);
  }, [filteredChapters]);

  // Главы
  const handleSaveChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) return;
    if (!chapterForm.course_id) return alert('Выберите курс');
    try {
      const chapterData = { title: chapterForm.title, description: chapterForm.description, order_index: 0 };
      if (editingChapter) {
        await API.put(`/chapters/${editingChapter.id}`, chapterData);
        if (chapterForm.course_id !== String(editingChapter.course_id)) {
          if (editingChapter.course_id) await API.delete(`/courses/${editingChapter.course_id}/chapters/${editingChapter.id}`);
          await API.post(`/courses/${chapterForm.course_id}/chapters/${editingChapter.id}`);
        }
      } else {
        const res = await API.post('/chapters', chapterData);
        await API.post(`/courses/${chapterForm.course_id}/chapters/${res.data.chapter.id}`);
        const count = parseInt(chapterForm.sectionsCount) || 0;
        for (let i = 1; i <= count; i++) {
          await API.post('/sections', { chapter_id: res.data.chapter.id, title: `Раздел ${i}`, content: '', order_index: i });
        }
      }
      resetChapterForm();
      await loadData();
    } catch (error) { alert('Ошибка сохранения главы'); }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({ title: chapter.title, description: chapter.description || '', sectionsCount: chapter.sections?.length || 0, course_id: chapter.course_id || selectedCourseId || '' });
    setSelectedChapter(null);
    setShowSectionForm(false);
  };

  const handleDeleteChapter = async (id) => {
    if (window.confirm('Удалить главу?')) { await API.delete(`/chapters/${id}`); if (selectedChapter?.id === id) setSelectedChapter(null); loadData(); }
  };

  const resetChapterForm = () => { setEditingChapter(null); setChapterForm({ title: '', description: '', sectionsCount: 0, course_id: selectedCourseId || '' }); };
  const handleCourseChange = (courseId) => { setSelectedCourseId(courseId); setSelectedChapter(null); resetChapterForm(); setChapterForm(prev => ({ ...prev, course_id: courseId })); };

  // Разделы
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim() || !selectedChapter) return;
    try {
      const formData = new FormData();
      formData.append('title', sectionForm.title);
      formData.append('content', sectionForm.content);
      formData.append('order_index', sectionForm.order_index);
      formData.append('chapter_id', selectedChapter.id);
      if (sectionForm.video_url !== undefined) {
        if (!sectionForm.video_url.trim()) { formData.append('clear_video', 'true'); formData.append('video_url', ''); }
        else formData.append('video_url', sectionForm.video_url);
      }
      if (sectionForm.images && sectionForm.images.length > 0) {
        formData.append('keep_existing_images', 'true');
        for (let i = 0; i < sectionForm.images.length; i++) formData.append('images', sectionForm.images[i]);
      }
      await (editingSection ? API.put(`/sections/${editingSection.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }) : API.post('/sections', formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
      resetSectionForm();
      await Promise.all([loadData(), loadSelectedChapter()]);
    } catch (error) { alert('Ошибка сохранения раздела'); }
  };

  const handleEditSection = async (section) => {
    try {
      const res = await API.get(`/sections/${section.id}`);
      const full = res.data.section;
      setEditingSection(full);
      setSectionForm({ title: full.title || '', content: full.content || '', order_index: full.order_index || 0, video_url: full.media?.video || '', images: null });
    } catch {
      setEditingSection(section);
      setSectionForm({ title: section.title || '', content: section.content || '', order_index: section.order_index || 0, video_url: section.media?.video || '', images: null });
    }
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (id) => { if (window.confirm('Удалить раздел?')) { await API.delete(`/sections/${id}`); await Promise.all([loadData(), loadSelectedChapter()]); } };
  const handleDeleteImage = async (sectionId, imageIndex) => { await API.delete(`/sections/${sectionId}/images/${imageIndex}`); const res = await API.get(`/sections/${sectionId}`); setEditingSection(res.data.section); await Promise.all([loadData(), loadSelectedChapter()]); };

  // Экспорт/Импорт
  const downloadBlob = (data, filename) => { const url = window.URL.createObjectURL(new Blob([data])); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url); };
  const handleExportExcel = async () => { if (!selectedChapter) return; const res = await API.get(`/sections/export/excel/${selectedChapter.id}`, { responseType: 'blob' }); downloadBlob(res.data, `chapter_${selectedChapter.id}.xlsx`); };
  const handleExportWord = async (sectionId) => { const res = await API.get(`/sections/export/word/${sectionId}`, { responseType: 'blob' }); downloadBlob(res.data, `section_${sectionId}.doc`); };
  const handleExportJson = async () => { if (!selectedChapter) return; const res = await API.get(`/sections/export/json/${selectedChapter.id}`, { responseType: 'blob' }); downloadBlob(res.data, `chapter_${selectedChapter.id}.json`); };
  const handleImportExcel = async (e) => { const file = e.target.files[0]; if (!file || !selectedChapter) return; const fd = new FormData(); fd.append('file', file);   const res = await API.post(`/sections/import/excel/${selectedChapter.id}`, fd); alert(res.data.message); await Promise.all([loadData(), loadSelectedChapter()]); e.target.value = ''; };
  
  // Импорт одного DOCX
  const handleImportDocx = async (e) => { 
    const file = e.target.files[0]; 
    if (!file || !selectedChapter) return; 
    const fd = new FormData(); 
    fd.append('file', file); 
    fd.append('chapter_id', selectedChapter.id); 
    fd.append('title', file.name.replace(/\.docx$/i, '')); 
    try { 
      const res = await API.post('/sections/import/docx', fd); 
      alert(res.data.message); 
      if (res.data.warnings?.length) console.warn('Предупреждения:', res.data.warnings); 
      await Promise.all([loadData(), loadSelectedChapter()]);
    } catch (error) { 
      console.error('Ошибка импорта DOCX:', error);
      alert('Ошибка импорта DOCX: ' + (error.response?.data?.message || error.message)); 
    } 
    e.target.value = ''; 
  };

  // Пакетный импорт DOCX
  const handleImportDocxBatch = async (e) => { 
    const files = e.target.files; 
    if (!files.length || !selectedChapter) return; 
    const fd = new FormData(); 
    fd.append('chapter_id', selectedChapter.id); 
    for (let i = 0; i < files.length; i++) fd.append('files', files[i]); 
    try { 
      const res = await API.post('/sections/import/docx/batch', fd); 
      alert(res.data.message); 
      if (res.data.errors?.length) console.warn('Ошибки:', res.data.errors); 
      await Promise.all([loadData(), loadSelectedChapter()]);
    } catch (error) { 
      console.error('Ошибка пакетного импорта DOCX:', error);
      alert('Ошибка импорта DOCX: ' + (error.response?.data?.message || error.message)); 
    } 
    e.target.value = ''; 
  };

  const resetSectionForm = () => { setEditingSection(null); setSectionForm({ title: '', content: '', order_index: 0, video_url: '', images: null }); setShowSectionForm(false); };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Курс</label>
              <select value={selectedCourseId} onChange={(e) => handleCourseChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {courses.length === 0 && <option value="">Нет курсов</option>}
                {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </div>
            <ChapterForm form={chapterForm} onChange={setChapterForm} onSubmit={handleSaveChapter} onCancel={resetChapterForm} isEditing={!!editingChapter} courses={courses} selectedCourseId={selectedCourseId} />
            <ChapterList chapters={filteredChapters} selectedId={selectedChapter?.id} loading={loading} onSelect={setSelectedChapter} onEdit={handleEditChapter} onDelete={handleDeleteChapter} />
          </div>
          <div className="lg:col-span-2">
            {selectedChapter ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <div><h2 className="font-semibold text-gray-900">{selectedChapter.title}</h2><p className="text-sm text-gray-500 mt-1">{selectedChapter.sections?.length || 0} разделов</p></div>
                    <div className="flex items-center gap-2">
                      <ExportImportBar 
                        onExportExcel={handleExportExcel} 
                        onExportJson={handleExportJson} 
                        onImportExcel={handleImportExcel} 
                        onImportDocx={handleImportDocx} 
                        onImportDocxBatch={handleImportDocxBatch} 
                      />
                      <button onClick={() => { resetSectionForm(); setShowSectionForm(true); }} className="px-4 py-2 bg-blue-800 text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors">+ Раздел</button>
                    </div>
                  </div>
                  {showSectionForm && <SectionForm form={sectionForm} onChange={setSectionForm} onSubmit={handleSaveSection} onCancel={resetSectionForm} isEditing={!!editingSection} existingMedia={editingSection?.media} onDeleteImage={(idx) => handleDeleteImage(editingSection.id, idx)} />}
                </div>
                <SectionList sections={selectedChapter.sections} onExportWord={handleExportWord} onEdit={handleEditSection} onDelete={handleDeleteSection} />
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <h3 className="font-semibold text-gray-400 mb-2">{courses.length === 0 ? 'Нет курсов' : 'Выберите главу'}</h3>
                <p className="text-gray-400 text-sm">{courses.length === 0 ? 'Создайте курс в разделе "Курсы"' : 'Выберите главу слева'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChapters;