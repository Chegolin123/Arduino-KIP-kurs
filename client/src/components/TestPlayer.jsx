// Расположение: C:\OSPanel\domains\Arduino\client\src\components\TestPlayer.jsx
// Компонент прохождения теста (поддерживает section_id и chapter_id)

import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const TestPlayer = ({ sectionId, chapterId, onComplete }) => {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTest();
  }, [sectionId, chapterId]);

  const loadTest = async () => {
    try {
      let response;
      if (chapterId) {
        response = await API.get(`/tests/chapter/${chapterId}`);
      } else if (sectionId) {
        response = await API.get(`/tests/section/${sectionId}`);
      } else {
        setLoading(false);
        return;
      }
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

  const handleSubmit = async () => {
    if (!test) return;
    
    const unanswered = test.questions.filter(q => !userAnswers[q.id]);
    if (unanswered.length > 0) {
      if (!window.confirm(`Вы не ответили на ${unanswered.length} вопросов. Отправить?`)) return;
    }

    setSubmitting(true);
    try {
      const response = await API.post('/tests/check', {
        test_id: test.id,
        answers: userAnswers
      });
      setResult(response.data.result);
      if (onComplete) onComplete(response.data.result);
    } catch (error) {
      alert('Ошибка проверки теста');
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
      <div className="max-w-2xl mx-auto p-6">
        <div className={`text-center p-8 rounded-xl ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-5xl mb-4">{result.passed ? '🎉' : '😔'}</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: result.passed ? '#16a34a' : '#dc2626' }}>
            {result.passed ? 'Тест пройден!' : 'Тест не пройден'}
          </h3>
          <p className="text-lg mb-2">Правильных ответов: <strong>{result.score} из {result.total}</strong></p>
          <p className="text-lg mb-4">Результат: <strong>{result.percent}%</strong></p>
          <p className="text-gray-600 mb-6">{result.message}</p>
          {!result.passed && (
            <button onClick={() => { setResult(null); setUserAnswers({}); }}
              className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
              Попробовать снова
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h2>
      {test.description && <p className="text-gray-500 mb-6">{test.description}</p>}
      <p className="text-sm text-gray-400 mb-6">Для прохождения необходимо {test.pass_percent}%</p>

      <div className="space-y-8">
        {test.questions.map((question, qIdx) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{qIdx + 1}. {question.question}</h3>
            <div className="space-y-2">
              {question.answers.map((answer) => {
                const isSelected = question.type === 'single'
                  ? userAnswers[question.id] === answer.id
                  : (userAnswers[question.id] || []).includes(answer.id);
                return (
                  <label key={answer.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}>
                    <input
                      type={question.type === 'single' ? 'radio' : 'checkbox'}
                      name={`q_${question.id}`}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(question.id, answer.id, question.type)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{answer.answer}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={handleSubmit} disabled={submitting}
          className="px-8 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50">
          {submitting ? 'Проверка...' : 'Завершить тест'}
        </button>
      </div>
    </div>
  );
};

export default TestPlayer;