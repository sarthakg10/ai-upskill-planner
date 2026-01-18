'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressDashboard from '@/app/components/ProgressDashboard';
import { ArrowLeft, Mail, Trophy, Flame, TrendingUp, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [tasksCompleted, setTasksCompleted] = useState(18);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const totalWeeks = 12;

  // Calculate completion percentage
  const completionPercentage = Math.round((tasksCompleted / (totalWeeks * 3)) * 100);

  const handleSendEmail = async () => {
    if (!emailInput) return;
    
    try {
      const response = await fetch('/api/send-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      
      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
          setEmailInput('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const stats = [
    { icon: Flame, label: 'Current Streak', value: currentStreak, unit: 'days', color: 'from-orange-500 to-red-500' },
    { icon: Trophy, label: 'Tasks Completed', value: tasksCompleted, unit: `of ${totalWeeks * 3}`, color: 'from-yellow-500 to-orange-500' },
    { icon: TrendingUp, label: 'Progress', value: completionPercentage, unit: '%', color: 'from-green-500 to-emerald-500' },
    { icon: BookOpen, label: 'Weeks Left', value: totalWeeks - Math.ceil((tasksCompleted / 3)), unit: 'weeks', color: 'from-blue-500 to-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors duration-200 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Plan</span>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Learning Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`relative group overflow-hidden rounded-xl bg-gradient-to-br ${stat.color} p-0.5 shadow-xl hover:shadow-2xl transition-all duration-300`}
              >
                <div className="bg-slate-900 rounded-lg p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="text-purple-300" size={28} />
                    <div className={`text-xs font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.unit}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Progress Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                Your Progress
              </h2>
              <ProgressDashboard
                weekNumber={Math.ceil((tasksCompleted / 3) + 1)}
                currentStreak={currentStreak}
                tasksCompleted={tasksCompleted}
                totalTasks={totalWeeks * 3}
                completionPercentage={completionPercentage}
                onTaskComplete={() => setTasksCompleted(t => t + 1)}
              />
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="space-y-6">
            {/* Email Plan */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-blue-400" size={24} />
                <h3 className="text-lg font-bold text-white">Get Plan via Email</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Receive your complete roadmap and weekly progress emails
              </p>
              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Send to Email
              </button>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-2">🚀 Go Premium</h3>
              <p className="text-gray-300 text-sm mb-4">
                Unlock expert mentorship, live sessions, and priority support
              </p>
              <div className="space-y-2 mb-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Weekly 1-on-1 calls
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Job placement help
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Interview prep
                </div>
              </div>
              <button
                onClick={() => router.push('/plan')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Upgrade Now
              </button>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-400/30 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">🏆 Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-300">Week 1 Warrior</span>
                  <span className="text-amber-400">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <span className="text-gray-300">7-Day Streak</span>
                  <span className="text-amber-400">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg opacity-50">
                  <span className="text-gray-500">Halfway There (50%)</span>
                  <span className="text-gray-500">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 You're Making Incredible Progress!</h2>
            <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
              You've completed {completionPercentage}% of your journey. With a {currentStreak}-day streak, you're proving consistency. Keep up this momentum and you'll transform into a {currentStreak > 5 ? '🌟 Learning Machine' : 'Strong Learner'}!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                Continue Learning
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="bg-purple-900/50 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-800/50 transition-all duration-200 border border-white/30"
              >
                Share Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">📧 Send Plan to Email</h3>
            
            {emailSent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-green-400 font-semibold mb-2">Plan sent successfully!</p>
                <p className="text-gray-400 text-sm">Check your email for the complete roadmap</p>
              </div>
            ) : (
              <>
                <p className="text-gray-300 mb-6">
                  Receive your 12-week plan, weekly progress emails, and exclusive tips
                </p>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={!emailInput}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Send Plan
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
