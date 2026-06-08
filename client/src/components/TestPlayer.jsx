// Расположение: C:\OSPanel\domains\Arduino\client\src\components\TestPlayer.jsx
// Компонент прохождения теста по главе

import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { showAlert, showConfirm } from './Modal';

const TestPlayer = ({ chapterId, onComplete }) => {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const attemptStorageKey = chapterId ? `test_attempt_chapter_${chapterId}` : null;

  useEffect(() => {
    loadTest();
  }, [chapterId]);

  const loadTest = async () => {
    try {
      if (!chapterId) {
        setLoading(false);
        return;
      }
      const response = await API.get(`/tests/chapter/${chapterId}`);
      setTest(response.data.test);
    } catch (error) {
      console.error('Ошибка загрузки теста:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerId, type) => {
    setUserAnswers(prev => {
      if (type === 'single') {
        return { ...prev, [questionId]: answerId };
      } else {
        const current = prev[questionId] || [];
        return {
          ...prev,
          [questionId]: current.includes(answerId)
            ? current.filter(id => id !== answerId)
            : [...current, answerId]
        };
      }
    });
  };

  useEffect(() => {
    if (!attemptStorageKey || !test || result) return;
    try {
      const raw = localStorage.getItem(attemptStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.timestamp && Date.now() - saved.timestamp > 86400000) { localStorage.removeItem(attemptStorageKey); return; }
      if (saved?.testId === test.id && saved?.answers) {
        setUserAnswers(saved.answers);
        if (typeof saved.currentQuestionIndex === 'number') {
          setCurrentQuestionIndex(Math.max(0, Math.min(saved.currentQuestionIndex, test.questions.length - 1)));
        }
      }
    } catch (error) {
      console.warn('Не удалось восстановить попытку теста:', error);
    }
  }, [attemptStorageKey, test, result]);

  useEffect(() => {
    if (!attemptStorageKey || !test || result) return;
    try {
      localStorage.setItem(attemptStorageKey, JSON.stringify({
        testId: test.id,
        answers: userAnswers,
        currentQuestionIndex,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Не удалось сохранить состояние попытки:', error);
    }
  }, [attemptStorageKey, test, userAnswers, currentQuestionIndex, result]);

  const handleSubmit = async () => {
    if (!test) return;
    
    const unanswered = test.questions.filter(q => !userAnswers[q.id]);
    if (unanswered.length > 0) {
      if (!(await showConfirm(`Вы не ответили на ${unanswered.length} вопросов. Отправить?`))) return;
    }

    setSubmitting(true);
    try {
      const response = await API.post('/tests/check', {
        test_id: test.id,
        answers: userAnswers
      });
      setResult(response.data.result);
      if (attemptStorageKey) localStorage.removeItem(attemptStorageKey);
      if (onComplete) onComplete(response.data.result);
    } catch (error) {
      await showAlert('Ошибка проверки теста');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Загрузка теста...</div>;

  if (!test) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Для этой главы пока нет теста</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className={`text-center p-8 rounded-3xl border shadow-sm ${result.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="text-5xl mb-4">{result.passed ? '🎉' : '😔'}</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: result.passed ? '#16a34a' : '#dc2626' }}>
            {result.passed ? 'Тест пройден!' : 'Тест не пройден'}
          </h3>
          <p className="text-lg mb-2">Правильных ответов: <strong>{result.score} из {result.total}</strong></p>
          <p className="text-lg mb-4">Результат: <strong>{result.percent}%</strong></p>
          <p className="text-gray-600 mb-6">{result.message}</p>
          {!result.passed && (
            <button onClick={() => { setResult(null); setUserAnswers({}); setCurrentQuestionIndex(0); if (attemptStorageKey) localStorage.removeItem(attemptStorageKey); }}
              className="px-6 py-2.5 bg-blue-900 text-white rounded-full hover:bg-blue-950 transition-colors shadow-sm">
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    );
  }

  const answeredCount = test.questions.filter((q) => {
    const answer = userAnswers[q.id];
    return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
  }).length;

  const currentQuestion = test.questions[currentQuestionIndex];
  const unansweredIndexes = test.questions
    .map((q, idx) => {
      const answer = userAnswers[q.id];
      const answered = Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
      return answered ? null : idx;
    })
    .filter((idx) => idx !== null);

  const jumpToFirstUnanswered = () => {
    if (unansweredIndexes.length > 0) setCurrentQuestionIndex(unansweredIndexes[0]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{test.title}</h2>
            {test.description && <p className="text-slate-500 mb-4 leading-7 max-w-2xl">{test.description}</p>}
            <p className="text-sm text-slate-400">Для прохождения необходимо {test.pass_percent}%</p>
          </div>
          <div className="min-w-[220px] bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Прогресс</span>
              <span>{answeredCount}/{test.questions.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${test.questions.length ? Math.round((answeredCount / test.questions.length) * 100) : 0}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">Ответьте на все вопросы или отправьте тест досрочно.</p>
            {unansweredIndexes.length > 0 && (
              <button type="button" onClick={jumpToFirstUnanswered} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
                Перейти к первому пропущенному
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-2">
          {test.questions.map((question, idx) => {
            const answer = userAnswers[question.id];
            const answered = Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
            const active = idx === currentQuestionIndex;
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-full text-xs font-medium transition-colors border ${
                   active
                     ? 'bg-blue-900 text-white border-blue-900'
                     : answered
                       ? 'bg-green-50 text-green-700 border-green-200'
                       : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                 }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white/88 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-semibold text-slate-900">{currentQuestionIndex + 1}. {currentQuestion.question}</h3>
          <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap">
            {currentQuestion.type === 'multiple' ? 'Несколько ответов' : 'Один ответ'}
          </span>
        </div>
        <div className="space-y-2">
          {currentQuestion.answers.map((answer) => {
            const isSelected = currentQuestion.type === 'single'
              ? userAnswers[currentQuestion.id] === answer.id
              : (userAnswers[currentQuestion.id] || []).includes(answer.id);
            return (
              <label key={answer.id}
                className={`flex items-center p-3 rounded-2xl cursor-pointer transition-colors border ${
                  isSelected ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}>
                <input
                  type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                  name={`q_${currentQuestion.id}`}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(currentQuestion.id, answer.id, currentQuestion.type)}
                  className="mr-3 w-4 h-4"
                />
                <span className="text-sm text-slate-700">{answer.answer}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentQuestionIndex === 0}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Предыдущий вопрос
          </button>

          <div className="text-xs text-slate-500 text-center">
            Вопрос {currentQuestionIndex + 1} из {test.questions.length}
          </div>

          <button
            type="button"
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, test.questions.length - 1))}
            disabled={currentQuestionIndex === test.questions.length - 1}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Следующий вопрос →
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button onClick={handleSubmit} disabled={submitting}
          className="px-8 py-3 bg-blue-900 text-white font-medium rounded-full hover:bg-blue-950 transition-colors disabled:opacity-50 shadow-sm">
          {submitting ? 'Проверка...' : 'Завершить тест'}
        </button>
      </div>
    </div>
  );
};

export default TestPlayer;
