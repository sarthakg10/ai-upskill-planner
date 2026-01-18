'use client';

import { useState, useEffect } from 'react';
import {
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface DashboardProps {
  userName?: string;
  targetRole?: string;
  weekNumber: number;
  currentStreak: number;
  tasksCompleted: number;
  totalTasks: number;
  completionPercentage?: number;
  onTaskComplete?: () => void;
}

export default function ProgressDashboard({
  userName = 'User',
  targetRole = 'Developer',
  weekNumber = 1,
  currentStreak = 5,
  tasksCompleted = 12,
  totalTasks = 60,
  completionPercentage,
  onTaskComplete,
}: DashboardProps) {
  const [showMilestoneUnlock, setShowMilestoneUnlock] = useState(false);
  const completionRate = completionPercentage ?? Math.round((tasksCompleted / totalTasks) * 100);

  useEffect(() => {
    if (tasksCompleted % 5 === 0 && tasksCompleted > 0) {
      setShowMilestoneUnlock(true);
      setTimeout(() => setShowMilestoneUnlock(false), 5000);
    }
  }, [tasksCompleted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Personalized Header */}
        <div className="mb-12">
          <div className="text-sm font-semibold text-indigo-600 mb-2 flex items-center gap-2">
            <Target size={16} />
            Your Journey to {targetRole}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hey {userName}! 👋
          </h1>
          <p className="text-gray-600">
            You're on track. Let's keep this momentum going.
          </p>
        </div>

        {/* Milestone Unlock Toast */}
        {showMilestoneUnlock && (
          <div className="fixed top-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-2xl p-4 animate-bounce z-50 max-w-sm">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-900" size={24} />
              <div>
                <p className="font-bold text-yellow-900">Milestone Unlocked! 🎉</p>
                <p className="text-sm text-yellow-800">{tasksCompleted} tasks completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Streak Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Current Streak</h3>
              <Flame className="text-orange-500" size={24} />
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-2">{currentStreak}</div>
            <p className="text-sm text-gray-600">days in a row</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">🔥 Keep it up! Next milestone: 10 days</p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Overall Progress</h3>
              <TrendingUp className="text-indigo-500" size={24} />
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-bold text-indigo-600">{completionRate}%</span>
                <span className="text-sm text-gray-600">{tasksCompleted}/{totalTasks}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">Great pace! You're ahead of schedule.</p>
          </div>

          {/* Time Invested Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Time Invested</h3>
              <Clock className="text-blue-500" size={24} />
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">24.5h</div>
            <p className="text-sm text-gray-600">of your 60h goal</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">📊 35 hours remaining</p>
            </div>
          </div>

          {/* Next Milestone Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Next Milestone</h3>
              <Trophy size={24} />
            </div>
            <div className="text-3xl font-bold mb-2">Week 3</div>
            <p className="text-sm text-purple-100 mb-4">
              Complete "Intermediate Concepts" module
            </p>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3" />
            </div>
            <p className="text-xs text-purple-100 mt-2">3 days to go</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* This Week's Tasks */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar size={24} className="text-indigo-600" />
                This Week's Tasks
              </h2>
              <span className="text-sm font-medium text-indigo-600">5/12 completed</span>
            </div>

            <div className="space-y-4">
              {/* Sample tasks */}
              {[
                {
                  id: 1,
                  title: 'Watch: LLM Architecture Fundamentals',
                  time: '45 min',
                  completed: true,
                  difficulty: 'Medium',
                },
                {
                  id: 2,
                  title: 'Practice: Prompt Engineering on ChatGPT',
                  time: '30 min',
                  completed: true,
                  difficulty: 'Easy',
                },
                {
                  id: 3,
                  title: 'Read: "Attention is All You Need" Paper Summary',
                  time: '60 min',
                  completed: false,
                  difficulty: 'Hard',
                },
                {
                  id: 4,
                  title: 'Code: Build a simple RAG pipeline',
                  time: '90 min',
                  completed: false,
                  difficulty: 'Hard',
                },
                {
                  id: 5,
                  title: 'Quiz: LLM Fine-tuning Concepts',
                  time: '20 min',
                  completed: false,
                  difficulty: 'Medium',
                },
              ].map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    task.completed
                      ? 'bg-green-50 border-green-200 opacity-75'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <button
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-indigo-500'
                    }`}
                  >
                    {task.completed && (
                      <CheckCircle2 size={16} className="text-white" />
                    )}
                  </button>

                  <div className="flex-grow">
                    <h4
                      className={`font-semibold ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-600">⏱️ {task.time}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          task.difficulty === 'Easy'
                            ? 'bg-green-100 text-green-700'
                            : task.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {task.difficulty}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="text-gray-300" size={20} />
                </div>
              ))}
            </div>
          </div>

          {/* Smart Recommendations */}
          <div className="space-y-6">
            {/* Energy Alert */}
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-5">
              <div className="flex gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-1">Energy Alert</h3>
                  <p className="text-sm text-orange-800">
                    Your energy dips Wednesdays. We've rescheduled the "Hard" task to Friday when you're fresher.
                  </p>
                  <button className="text-xs text-orange-600 font-medium mt-2 hover:text-orange-700">
                    Adjust schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Burnout Prevention */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
              <h3 className="font-semibold text-indigo-900 mb-3">Burnout Prevention</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li className="flex items-start gap-2">
                  <span className="text-lg">✨</span>
                  <span>You're on pace. Take a day off this weekend.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">💪</span>
                  <span>You've crushed 5 days straight—that's amazing!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">🎯</span>
                  <span>Rest isn't failure. It's part of your plan.</span>
                </li>
              </ul>
            </div>

            {/* Social Proof / Peer Comparison */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Peer Insight</h3>
              <p className="text-sm text-gray-700 mb-3">
                💡 Users like you who maintain a 5+ day streak finish their plans <strong>40% faster</strong>.
              </p>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                Join community <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
