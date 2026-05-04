// Расположение: C:\OSPanel\domains\Arduino\client\src\components\Layout\Sidebar.jsx

import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChapters } from '../../store/chaptersSlice';

const Sidebar = ({ courseId }) => {
  const dispatch = useDispatch();
  const { chapters, loading } = useSelector((state) => state.chapters);
  const { chapterId, sectionId } = useParams();

  useEffect(() => {
    dispatch(fetchChapters(courseId || null));
  }, [dispatch, courseId]);

  if (loading) {
    return (
      <div className="w-72 bg-gray-50 border-r border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Содержание курса
      </h3>
      
      {chapters.length === 0 ? (
        <p className="text-sm text-gray-400">Материалы не добавлены</p>
      ) : (
        <nav className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <Link
                to={`/learn/${chapter.id}`}
                className={`block text-sm font-medium mb-2 px-2 py-1 rounded transition-colors ${
                  chapter.id === parseInt(chapterId) && !sectionId
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {chapter.title}
              </Link>
              
              {chapter.sections && chapter.sections.length > 0 && (
                <ul className="ml-4 space-y-0.5">
                  {chapter.sections.map((section) => (
                    <li key={section.id}>
                      <Link
                        to={`/learn/${chapter.id}/${section.id}`}
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
          ))}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;