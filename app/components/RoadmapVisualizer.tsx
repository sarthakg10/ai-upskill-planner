'use client';

import { useState } from 'react';
import {
  Calendar,
  Zap,
  CheckCircle2,
  Flame,
  AlertCircle,
  ChevronDown,
  BookOpen,
  Code,
  Brain,
  Target,
} from 'lucide-react';
import { UpskillPlan, WeekPlan } from '@/lib/types';

interface RoadmapVisualizerProps {
  plan: UpskillPlan;
}

export default function RoadmapVisualizer({ plan }: RoadmapVisualizerProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  const currentWeek = plan.week_plan.find((w) => w.week === selectedWeek);

  // Color progression: foundation → core → advanced → capstone
  const getWeekColor = (weekNum: number) => {
    if (weekNum <= 2) return 'from-blue-400 to-cyan-400';
    if (weekNum <= 4) return 'from-purple-400 to-pink-400';
    if (weekNum <= 8) return 'from-orange-400 to-red-400';
    if (weekNum <= 10) return 'from-red-400 to-rose-400';
    return 'from-indigo-500 to-purple-500';
  };

  const getStageLabel = (weekNum: number) => {
    if (weekNum <= 2) return { label: '🌱 Foundation', color: 'bg-blue-100 text-blue-800' };
    if (weekNum <= 4) return { label: '🌿 Core', color: 'bg-purple-100 text-purple-800' };
    if (weekNum <= 8) return { label: '🔥 Practical', color: 'bg-orange-100 text-orange-800' };
    if (weekNum <= 10) return { label: '⚡ Advanced', color: 'bg-red-100 text-red-800' };
    return { label: '👑 Capstone', color: 'bg-indigo-100 text-indigo-800' };
  };

  const energyTrend = [
    { day: 'Mon', level: 85 },
    { day: 'Tue', level: 70 },
    { day: 'Wed', level: 60 },
    { day: 'Thu', level: 75 },
    { day: 'Fri', level: 65 },
    { day: 'Sat', level: 90 },
    { day: 'Sun', level: 88 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame className="text-orange-400" size={24} />
            <span className="text-orange-400 font-semibold text-sm">Your AI-Powered Roadmap</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {plan.summary.split('.')[0]}
          </h1>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-8">
            {[1, 2, 3, 4, 5].map((week) => (
              <div
                key={week}
                className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-indigo-500 cursor-pointer transition-all"
              >
                <div className="text-xs text-slate-400 mb-1">Week</div>
                <div className="text-2xl font-bold text-white">{week}</div>
              </div>
            ))}
            <div className="text-center p-3 rounded-lg bg-slate-700/50 border border-slate-600">
              <div className="text-xs text-slate-400 mb-1">→</div>
              <div className="text-2xl font-bold text-slate-400">...</div>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Timeline Column */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar size={24} className="text-indigo-400" />
                  12-Week Journey
                </h2>
                <div className="text-xs text-slate-400">Week {selectedWeek}</div>
              </div>

              {/* Horizontal Week Cards */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {plan.week_plan.map((week) => {
                  const stage = getStageLabel(week.week);
                  const isSelected = selectedWeek === week.week;

                  return (
                    <div
                      key={week.week}
                      onClick={() => setSelectedWeek(week.week)}
                      className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-102 ${
                        isSelected
                          ? `bg-gradient-to-r ${getWeekColor(week.week)} shadow-lg shadow-indigo-500/30`
                          : 'bg-slate-700/50 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2 ${stage.color}`}>
                            {stage.label}
                          </div>
                          <h3 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            Week {week.week}: {week.focus}
                          </h3>
                          <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {week.outcome}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={20} className="text-white flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Energy Heatmap */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" />
              Your Energy Levels
            </h3>

            <div className="space-y-4">
              {energyTrend.map((item) => (
                <div key={item.day} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-medium">{item.day}</span>
                    <span className="text-slate-400">{item.level}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.level >= 80
                          ? 'bg-green-400'
                          : item.level >= 60
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-300 mb-1">Smart Tip</p>
                  <p className="text-xs text-orange-200">
                    Schedule heavy concepts on Mon/Sat when energy is high. Save revision for Wed evenings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Detail Card */}
        {currentWeek && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-sm text-slate-400 mb-2">Week {currentWeek.week}</div>
                <h2 className="text-3xl font-bold text-white">{currentWeek.focus}</h2>
                <p className="text-slate-300 mt-2">{currentWeek.outcome}</p>
              </div>
              <Target size={48} className="text-indigo-400 opacity-20" />
            </div>

            {/* Mini Project Highlight */}
            <div className="mb-8 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <div className="flex items-start gap-3">
                <Code size={20} className="text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-indigo-300 mb-1">Project This Week</p>
                  <p className="text-sm text-indigo-200">{currentWeek.mini_project}</p>
                </div>
              </div>
            </div>

            {/* Topics Grid */}
            {currentWeek.topics && currentWeek.topics.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-purple-400" />
                  Deep Topics ({currentWeek.topics.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentWeek.topics.slice(0, 6).map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-purple-500 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-100 text-sm group-hover:text-purple-300 transition-colors">
                          {topic.title}
                        </h4>
                        {topic.estimated_hours && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300 whitespace-nowrap">
                            {topic.estimated_hours}h
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{topic.details}</p>
                      {topic.resources && topic.resources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <p className="text-xs font-medium text-slate-500 mb-1">📚 Resources</p>
                          <ul className="text-xs text-slate-400 space-y-1">
                            {topic.resources.slice(0, 2).map((r, i) => (
                              <li key={i} className="truncate">• {r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concepts Timeline */}
            {currentWeek.concepts && currentWeek.concepts.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-400" />
                  Learning Concepts
                </h3>
                <div className="space-y-3">
                  {currentWeek.concepts.map((concept, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-24 text-xs font-semibold text-blue-400 bg-blue-500/10 rounded px-2 py-1 text-center h-fit">
                        {concept.date}
                      </div>
                      <div className="flex-grow p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                        <p className="font-semibold text-slate-100 text-sm mb-1">{concept.name}</p>
                        <p className="text-xs text-slate-400">{concept.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills Prioritization */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Top 5 Priority Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {plan.prioritized_skills.map((skill) => (
              <div
                key={skill.priority}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative p-6 bg-slate-800 rounded-xl border border-slate-700 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-2xl font-bold text-indigo-400 mb-2">
                      #{skill.priority}
                    </div>
                    <h3 className="font-bold text-white text-sm mb-2">{skill.skill}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{skill.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
