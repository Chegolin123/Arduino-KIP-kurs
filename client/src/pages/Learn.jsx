// Расположение: C:\OSPanel\domains\Arduino\client\src\pages\Learn.jsx
// Страница обучения — тест в конце главы, а не раздела

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Layout/Sidebar';
import TestPlayer from '../components/TestPlayer';
import { fetchSection } from '../store/chaptersSlice';
import { sanitizeHtml } from '../utils/sanitizeHtml';

const Learn = () => {
  const { chapterId, sectionId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  
  const dispatch = useDispatch();
  const { currentSection, loading, chapters } = useSelector((state) => state.chapters);
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

  useEffect(() => {
    if (showChapterTest) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showChapterTest]);

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
  const currentChapter = chapters.find((chapter) => chapter.id === Number(chapterId));
  const orderedSections = [...(currentChapter?.sections || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const lastSectionId = orderedSections.length > 0 ? Number(orderedSections[orderedSections.length - 1].id) : null;
  const isLastSection = Boolean(sectionId) && Number(sectionId) === lastSectionId;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTestComplete = (result) => {
    if (result.passed) setTestCompleted(true);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{
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
      }}
    >
      <Sidebar courseId={courseId} />
      
      <div className="flex-1">
        {!sectionId && !chapterId ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center text-slate-500 py-20 bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm px-8">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Выберите раздел</h2>
              <p className="text-slate-400">Выберите раздел в боковом меню для начала обучения</p>
            </div>
          </div>
        ) : loading ? (
          <div className="p-8 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="aspect-video bg-white rounded-3xl border border-slate-200 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : chapterId && !sectionId && !showChapterTest ? (
          /* Информация о главе */
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Глава</p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">{currentChapter?.title}</h1>
              {currentChapter?.description && (
                <p className="text-blue-100/90 mt-4 text-lg leading-relaxed">{currentChapter.description}</p>
              )}
            </div>

            <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Разделы главы</h2>
              <div className="space-y-2">
                {orderedSections.map((s, i) => (
                  <Link
                    key={s.id}
                    to={`/learn/${chapterId}/${s.id}${courseId ? `?course_id=${courseId}` : ''}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-slate-700 hover:text-blue-700 no-underline"
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0">{i + 1}</span>
                    <span className="font-medium">{s.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowChapterTest(true)}
                className="px-6 py-3 bg-blue-900 text-white font-medium rounded-full hover:bg-blue-950 transition-colors shadow-sm"
              >
                Пройти тест по главе
              </button>
            </div>
          </div>
        ) : currentSection && !showChapterTest ? (
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Обучение</p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">{currentSection.title}</h1>
            </div>

            {(videoUrl || images.length > 0) && (
              <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden mb-8 shadow-sm">
                {videoUrl ? (
                  <div className="aspect-video">
                    <iframe src={videoUrl} className="w-full h-full" allowFullScreen title="Видео" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                ) : (
                    <div className="relative">
                      <div className="aspect-video bg-white flex items-center justify-center">
                        <img src={`${images[currentImageIndex]}`} alt=""
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

            <div className="prose max-w-none text-slate-700 leading-relaxed mb-8 bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentSection.content || '') }} />

            {chapterId && !showChapterTest && (
              <div className="border-t border-slate-200 pt-6 mt-8 text-center bg-white/88 backdrop-blur-sm rounded-3xl px-6 py-8 shadow-sm border">
                <button
                  onClick={() => setShowChapterTest(true)}
                  className="px-6 py-3 bg-blue-900 text-white font-medium rounded-full hover:bg-blue-950 transition-colors shadow-sm"
                >
                  Пройти тест по главе
                </button>
              </div>
            )}
          </div>
        ) : chapterId && showChapterTest ? (
          /* Тест в конце главы */
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Тест</p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">Тест по главе</h1>
              <p className="text-blue-100/90 mt-3">Проверьте свои знания по материалу главы</p>
            </div>
            
            {testCompleted && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-green-800">Глава пройдена!</p>
                  <p className="text-sm text-green-600">Вы успешно сдали тест по этой главе</p>
                </div>
              </div>
            )}
            
            <TestPlayer chapterId={chapterId} onComplete={handleTestComplete} />
          </div>
        ) : (
          <div className="text-center text-slate-500 py-20 bg-white/85 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm m-6">
            <p className="text-xl">Раздел не найден</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
