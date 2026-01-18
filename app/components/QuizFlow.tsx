'use client';

import { useState } from 'react';
import { ChevronRight, Zap, Brain, Target, Clock } from 'lucide-react';

interface QuizQuestion {
  id: string;
  title: string;
  description?: string;
  options: { label: string; value: string; icon?: React.ReactNode }[];
  type: 'single' | 'multiple';
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'current_role',
    title: 'What\'s your current role?',
    description: 'Help us understand your foundation',
    options: [
      { label: 'Backend Engineer', value: 'backend', icon: '💻' },
      { label: 'Frontend Engineer', value: 'frontend', icon: '🎨' },
      { label: 'DevOps Engineer', value: 'devops', icon: '⚙️' },
      { label: 'Data Engineer', value: 'data', icon: '📊' },
      { label: 'Product Manager', value: 'pm', icon: '🎯' },
      { label: 'Other', value: 'other', icon: '✨' },
    ],
    type: 'single',
  },
  {
    id: 'career_goal',
    title: 'What\'s your dream next role?',
    description: 'Be ambitious—we\'ll make it realistic',
    options: [
      { label: 'AI/ML Engineer', value: 'ai_ml', icon: '🤖' },
      { label: 'Product Manager', value: 'pm_role', icon: '🚀' },
      { label: 'DevOps Expert', value: 'devops_expert', icon: '🔧' },
      { label: 'Tech Founder', value: 'founder', icon: '👑' },
      { label: 'Staff/Principal Engineer', value: 'staff', icon: '⭐' },
      { label: 'Not sure yet', value: 'undecided', icon: '🤔' },
    ],
    type: 'single',
  },
  {
    id: 'pain_point',
    title: 'What\'s slowing you down?',
    description: 'Select all that apply',
    options: [
      { label: 'Not sure where to start', value: 'clarity', icon: '🧭' },
      { label: 'Too tired after work', value: 'energy', icon: '⚡' },
      { label: 'Family/life commitments', value: 'balance', icon: '⚖️' },
      { label: 'Information overload', value: 'info_overload', icon: '📚' },
      { label: 'Can\'t afford paid courses', value: 'cost', icon: '💰' },
      { label: 'No consistent time', value: 'time', icon: '⏰' },
    ],
    type: 'multiple',
  },
  {
    id: 'availability',
    title: 'What\'s your realistic weekly availability?',
    description: 'Be honest—we adapt to real life',
    options: [
      { label: '< 3 hours', value: '0_3', icon: '🌱' },
      { label: '3-5 hours', value: '3_5', icon: '🌿' },
      { label: '5-10 hours', value: '5_10', icon: '🌳' },
      { label: '10+ hours', value: '10_plus', icon: '🏔️' },
    ],
    type: 'single',
  },
];

export default function QuizFlow({
  onComplete,
}: {
  onComplete: (answers: Record<string, string | string[]>) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleSelect = (value: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      if (question.type === 'single') {
        setAnswers({ ...answers, [question.id]: value });
      } else {
        const current = (answers[question.id] as string[]) || [];
        setAnswers({
          ...answers,
          [question.id]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        });
      }
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered =
    question.type === 'single'
      ? !!answers[question.id]
      : (answers[question.id] as string[])?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Let's Find Your Path
              </h1>
              <p className="text-gray-600 mt-2">
                {currentQuestion + 1} of {QUIZ_QUESTIONS.length} questions
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-white rounded-2xl shadow-lg p-8 transition-all duration-500 ${
            isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Question Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {question.title}
            </h2>
            {question.description && (
              <p className="text-gray-600">{question.description}</p>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {question.options.map((option) => {
              const isSelected =
                question.type === 'single'
                  ? answers[question.id] === option.value
                  : (answers[question.id] as string[])?.includes(
                      option.value
                    );

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {option.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {currentQuestion === QUIZ_QUESTIONS.length - 1
                ? 'Generate My Plan'
                : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Reassurance Message */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>⏱️ Takes ~3 minutes | 🔐 Your data stays private | ✨ AI-powered personalization</p>
        </div>
      </div>
    </div>
  );
}
