import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChapters } from '../../store/chaptersSlice';

const Sidebar = ({ courseId }) => {
  const dispatch = useDispatch();
  const { chapters, loading } = useSelector((state) => state.chapters);
  const { chapterId, sectionId } = useParams();
  const [expandedChapters, setExpandedChapters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (chapterId) {
      setExpandedChapters((prev) =>
        prev.includes(Number(chapterId)) ? prev : [...prev, Number(chapterId)]
      );
    }
  }, [chapterId]);

  useEffect(() => {
    dispatch(fetchChapters(courseId || null));
  }, [dispatch, courseId]);

  const toggleChapter = (id) => {
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((ch) => ch !== id) : [...prev, id]
    );
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Содержание курса
        </h3>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-200 text-gray-500" aria-label="Закрыть">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {chapters.length === 0 ? (
        <div className="text-sm text-gray-400 space-y-2">
          <p>Материалы не добавлены</p>
          <Link to="/library" className="text-blue-600 hover:text-blue-800 font-medium block">← Вернуться в библиотеку</Link>
        </div>
      ) : (
        <nav className="space-y-4">
          {chapters.map((chapter) => {
            const isExpanded = expandedChapters.includes(chapter.id);
            return (
            <div key={chapter.id}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className={`p-1 rounded transition-colors hover:bg-gray-200 ${
                    chapter.id === parseInt(chapterId) && !sectionId
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <Link
                  to={`/learn/${chapter.id}${courseId ? `?course_id=${courseId}` : ''}`}
                  onClick={() => {
                    if (!isExpanded) toggleChapter(chapter.id);
                    setSidebarOpen(false);
                  }}
                  className={`block text-sm font-medium px-2 py-1 rounded transition-colors flex-1 ${
                    chapter.id === parseInt(chapterId) && !sectionId
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {chapter.title}
                </Link>
              </div>
              
              {chapter.sections && chapter.sections.length > 0 && isExpanded && (
                <ul className="ml-4 space-y-0.5 mt-1">
                  {chapter.sections.map((section) => (
                    <li key={section.id}>
                      <Link
                        to={`/learn/${chapter.id}/${section.id}${courseId ? `?course_id=${courseId}` : ''}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`block text-sm py-1.5 px-2 rounded transition-colors ${
                          section.id === parseInt(sectionId)
                            ? 'text-blue-600 bg-blue-50 font-medium'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                      >
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            );
          })}
        </nav>
      )}
    </>
  );

  if (loading) {
    return (
      <>
        <button onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed bottom-4 left-4 z-30 w-12 h-12 bg-blue-900 text-white rounded-full shadow-lg flex items-center justify-center"
          aria-label="Открыть содержание">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:block w-72 bg-gray-50 border-r border-gray-200 p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <button onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-30 w-12 h-12 bg-blue-900 text-white rounded-full shadow-lg flex items-center justify-center"
        aria-label="Открыть содержание">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className="hidden md:block w-72 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
        {content}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
