// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Learn.jsx
// Страница обучения — тест в конце главы, а не раздела

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Layout/Sidebar';
import TestPlayer from '../components/TestPlayer';
import { fetchSection } from '../store/chaptersSlice';

const Learn = () => {
  const { chapterId, sectionId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  
  const dispatch = useDispatch();
  const { currentSection, loading } = useSelector((state) => state.chapters);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showChapterTest, setShowChapterTest] = useState(false);

  useEffect(() => {
    if (sectionId) {
      dispatch(fetchSection(sectionId));
      setCurrentImageIndex(0);
    }
  }, [sectionId, dispatch]);

  useEffect(() => {
    setTestCompleted(false);
    setShowChapterTest(false);
  }, [chapterId]);

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    if (url.includes('/embed/')) return url;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const media = currentSection?.media || {};
  const videoUrl = media?.video ? getVideoEmbedUrl(media.video) : null;
  const images = media?.images || [];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTestComplete = (result) => {
    if (result.passed) setTestCompleted(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar courseId={courseId} />
      
      <div className="flex-1">
        {!sectionId && !chapterId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 py-20">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Выберите раздел</h2>
              <p className="text-gray-400">Выберите раздел в боковом меню для начала обучения</p>
            </div>
          </div>
        ) : loading ? (
          <div className="p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : currentSection ? (
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{currentSection.title}</h1>

            {(videoUrl || images.length > 0) && (
              <div className="bg-gray-100 rounded-xl overflow-hidden mb-8">
                {videoUrl ? (
                  <div className="aspect-video">
                    <iframe src={videoUrl} className="w-full h-full" allowFullScreen title="Видео" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <img src={`http://localhost:5000${images[currentImageIndex]}`} alt=""
                        className="max-w-full max-h-full object-contain" />
                    </div>
                    {images.length > 1 && (
                      <>
                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          {images.map((_, idx) => (
                            <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2.5 h-2.5 rounded-full ${idx === currentImageIndex ? 'bg-blue-600' : 'bg-white/60'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="prose max-w-none text-gray-700 leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: currentSection.content }} />

            {/* Кнопка для перехода к тесту главы */}
            {chapterId && !showChapterTest && (
              <div className="border-t border-gray-200 pt-6 mt-8 text-center">
                <p className="text-gray-500 text-sm mb-4">
                  Вы прошли все разделы главы. Проверьте свои знания!
                </p>
                <button
                  onClick={() => setShowChapterTest(true)}
                  className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Пройти тест по главе
                </button>
              </div>
            )}
          </div>
        ) : chapterId && !sectionId ? (
          /* Тест в конце главы */
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Тест по главе</h1>
            <p className="text-gray-500 mb-6">Проверьте свои знания по материалу главы</p>
            
            {testCompleted && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-green-800">Глава пройдена!</p>
                  <p className="text-sm text-green-600">Вы успешно сдали тест по этой главе</p>
                </div>
              </div>
            )}
            
            <TestPlayer sectionId={null} chapterId={chapterId} onComplete={handleTestComplete} />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">Раздел не найден</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;