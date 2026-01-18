'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadPlan } from '@/lib/storage';
import { UpskillPlan } from '@/lib/types';
import ProgressDashboard from '@/app/components/ProgressDashboard';
import ConvertModal from '@/app/components/ConvertModal';
import { User } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<UpskillPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const totalWeeks = 12;

  useEffect(() => {
    const loadedPlan = loadPlan();
    setPlan(loadedPlan);
    setLoading(false);
  }, []);

  // Calculate completion percentage
  const completionPercentage = Math.round((tasksCompleted / (totalWeeks * 3)) * 100);
  
  // Show convert modal at 50% and 75% completion
  useEffect(() => {
    if (completionPercentage === 50 || completionPercentage === 75) {
      const timer = setTimeout(() => setShowConvertModal(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [completionPercentage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Plan Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't generated a plan yet. Let's create one for you!
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create My Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* User Profile Button - Top Right */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed top-6 right-6 z-40 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-lg transition-all transform hover:scale-110"
        title="View Dashboard"
      >
        <User size={24} />
      </button>

      <div className="flex">
        {/* Main Plan Content */}
        <div className={`flex-1 transition-all duration-300`}>
          <div className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 mb-8 border-l-4 border-blue-600">
                <div className="mb-4">
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Your Transformation Journey</span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Welcome to your personalized 12-week learning transformation! This carefully crafted roadmap is designed to guide you through every step of your journey. With consistent effort, strategic planning, and hands-on projects, you'll build the skills and confidence needed to excel in your target role. Let's get started! 🚀
                </p>
              </div>

              {/* Prioritized Skills */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  🎯 Top 5 Priority Skills
                </h2>
                <div className="space-y-4">
                  {plan.prioritized_skills.map((skill) => (
                    <div
                      key={skill.priority}
                      className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {skill.priority}. {skill.skill}
                          </h3>
                          <p className="text-gray-700 mt-1">{skill.reason}</p>
                        </div>
                        <span className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          P{skill.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12-Week Roadmap with Topics & Resources */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  📅 12-Week Learning Roadmap
                </h2>
                <div className="space-y-6">
                  {plan.week_plan.map((week) => (
                    <div
                      key={week.week}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-sm font-semibold text-blue-600 block">
                            Week {week.week}
                          </span>
                          <h3 className="font-bold text-xl text-gray-800 mt-1">{week.focus}</h3>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {week.week <= 4 ? 'Foundation' : week.week <= 8 ? 'Intermediate' : 'Advanced'}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4">{week.outcome}</p>

                      {/* Mini Project */}
                      <div className="bg-green-50 border-l-4 border-green-500 rounded p-3 mb-4">
                        <p className="text-sm font-semibold text-green-900">
                          📦 Project: {week.mini_project}
                        </p>
                      </div>

                      {/* Concepts */}
                      {week.concepts && week.concepts.length > 0 && (
                        <div className="mb-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            📚 Key Concepts
                          </p>
                          <div className="space-y-3">
                            {week.concepts.map((concept, idx) => (
                              <div key={idx} className="bg-amber-50 border-l-3 border-amber-400 pl-4 py-3 rounded-r">
                                <p className="font-semibold text-gray-800">{concept.name}</p>
                                <p className="text-sm text-gray-700 mt-1">{concept.description}</p>
                                {concept.resources && concept.resources.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-600 mb-2">Resources:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-2">
                                      {concept.resources.map((resource, ridx) => (
                                        <li key={ridx} className="flex items-start">
                                          <span className="mr-2">•</span>
                                          <a href="#" className="text-blue-600 hover:underline">
                                            {resource}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Topics */}
                      {week.topics && week.topics.length > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            🎓 Detailed Topics to Master
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {week.topics.map((topic, idx) => (
                              <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="font-semibold text-gray-800">{topic.title}</p>
                                  {topic.estimated_hours && (
                                    <span className="text-xs bg-indigo-200 text-indigo-900 px-2 py-1 rounded whitespace-nowrap ml-2">
                                      {topic.estimated_hours}h
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{topic.details}</p>
                                {topic.resources && topic.resources.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2">Learn from:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-2">
                                      {topic.resources.map((resource, ridx) => (
                                        <li key={ridx} className="flex items-start">
                                          <span className="mr-2">→</span>
                                          <a href="#" className="text-blue-600 hover:underline">
                                            {resource}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  🗓️ Your Weekly Study Schedule
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time Slot</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.weekly_schedule.map((schedule, idx) => (
                        <tr key={schedule.day} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium text-gray-900 border-b border-gray-200">{schedule.day}</td>
                          <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{schedule.slot}</td>
                          <td className="px-4 py-3 text-gray-700 border-b border-gray-200">
                            {schedule.duration_min > 0 ? `${schedule.duration_min} min` : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-700 border-b border-gray-200">{schedule.task}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Burnout Prevention */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  💪 Avoiding Burnout
                </h2>
                <ul className="space-y-3">
                  {plan.burnout_tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-3 text-xl">✓</span>
                      <span className="text-gray-700 text-base">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Start?</h2>
                <p className="text-blue-100 mb-6">Click the profile icon to track your progress and unlock premium features</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View My Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Convert Modal */}
        {showConvertModal && (
          <ConvertModal
            tier="pro"
            completionPercentage={completionPercentage}
            onClose={() => setShowConvertModal(false)}
            onUpgrade={() => setShowConvertModal(false)}
          />
        )}
      </div>
    </div>
  );
}
