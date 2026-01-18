'use client';

import { useEffect, useState } from 'react';
import { UpskillPlan, UpskillInputs } from '@/lib/types';

export default function PlanSharePage({ params }: { params: { token: string } }) {
  const [plan, setPlan] = useState<UpskillPlan | null>(null);
  const [inputs, setInputs] = useState<UpskillInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch(`/api/plan/${params.token}`);

        if (!response.ok) {
          setError('Plan not found or expired');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPlan(data.plan);
        setInputs(data.inputs);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch plan:', err);
        setError('Failed to load plan');
        setLoading(false);
      }
    }

    fetchPlan();
  }, [params.token]);

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

  if (error || !plan || !inputs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The plan link is invalid or has expired. Please generate a new plan.'}
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Your Personalized AI Learning Plan
            </h1>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              📧 Shared Link
            </span>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">{plan.summary}</p>
        </div>

        {/* Prioritized Skills */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {skill.priority}. {skill.skill}
                    </h3>
                    <p className="text-gray-600 mt-1">{skill.reason}</p>
                  </div>
                  <span className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    P{skill.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 12-Week Roadmap */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📅 12-Week Learning Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.week_plan.map((week) => (
              <div
                key={week.week}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600">
                    Week {week.week}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {week.week <= 4 ? 'Foundation' : week.week <= 8 ? 'Intermediate' : 'Advanced'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{week.focus}</h3>
                <p className="text-sm text-gray-600 mb-3">{week.outcome}</p>
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs font-medium text-green-800">
                    📦 Project: {week.mini_project}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🗓️ Your Weekly Study Schedule
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Time Slot
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Task
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.weekly_schedule.map((schedule, idx) => (
                  <tr
                    key={schedule.day}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {schedule.day}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{schedule.slot}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {schedule.duration_min} min
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {schedule.task}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Burnout Prevention */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🛡️ Burnout Prevention Tips
          </h2>
          <ul className="space-y-3">
            {plan.burnout_tips.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200"
              >
                <span className="text-orange-600 font-bold">💡</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🚀 Next Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plan.next_actions.map((action, idx) => (
              <div
                key={idx}
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {idx + 1}. {action.title}
                </h3>
                <p className="text-gray-700">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            This plan was generated for {inputs.fullName}
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Your Own Plan
          </a>
        </div>
      </div>
    </div>
  );
}
