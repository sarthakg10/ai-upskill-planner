'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadPlan, loadInputs } from '@/lib/storage';
import { UpskillPlan, UpskillInputs } from '@/lib/types';

const FREE_CLASS_URL = '#';
const CONSULT_URL = '#';

export default function ConvertPage() {
  const router = useRouter();

  // Page states
  const [plan, setPlan] = useState<UpskillPlan | null>(null);
  const [inputs, setInputs] = useState<UpskillInputs | null>(null);
  const [email, setEmail] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [leadScore, setLeadScore] = useState<number | null>(null);

  // Load plan and inputs on mount
  useEffect(() => {
    const savedPlan = loadPlan();
    const savedInputs = loadInputs();

    setPlan(savedPlan);
    setInputs(savedInputs);

    // Track page view
    trackEvent('convert_page_view', {});

    setPageLoading(false);
  }, []);

  // Helper to track events
  const trackEvent = async (
    eventType: string,
    meta: Record<string, any> = {},
    eventEmail?: string
  ) => {
    try {
      const emailToTrack = eventEmail || email || localStorage.getItem('lead_email') || undefined;

      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToTrack,
          event_type: eventType,
          meta,
        }),
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!subscribeNewsletter) {
      setError('You must agree to receive the plan and reminders');
      return;
    }

    if (!plan || !inputs) {
      setError('Plan data not found. Please create your plan first.');
      return;
    }

    setLoading(true);

    try {
      // POST to /api/leads to save lead and track event
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          inputs,
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save lead');
        setLoading(false);
        return;
      }

      // Send plan via email
      const emailResponse = await fetch('/api/send-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          inputs,
          plan,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email, but lead was saved');
        // Don't fail the whole process if email fails
      }

      // Save email and lead score to localStorage for CTA tracking
      localStorage.setItem('lead_email', email);
      if (data.lead_score !== undefined) {
        localStorage.setItem('lead_score', String(data.lead_score));
        setLeadScore(data.lead_score);
      }

      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleCTAClick = async (ctaType: 'free_class' | 'consult', url: string) => {
    const meta = {
      target_goal: inputs?.targetGoal,
      lead_score: leadScore,
    };

    const eventType = ctaType === 'free_class' ? 'cta_click_free_class' : 'cta_click_consult';
    await trackEvent(eventType, meta);

    window.location.href = url;
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!plan || !inputs) {
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-2xl text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Saved! 📧
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            You can now take the next step.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Your personalized AI learning plan has been saved.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">What's Next?</h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Join our free live class this week</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Book a 1:1 career consultation call</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Explore our premium mentorship program</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleCTAClick('free_class', FREE_CLASS_URL)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Register for Free Live Class
            </button>
            <button
              onClick={() => handleCTAClick('consult', CONSULT_URL)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Book Career Consultation
            </button>
            <button
              onClick={() => router.push('/plan')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              View My Plan Again
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Create New Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-lg shadow-2xl p-10 max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Get Your Plan via Email
          </h1>
          <p className="text-gray-600">
            Save your personalized roadmap and unlock exclusive next steps
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Your personalized plan includes:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>12-week learning roadmap tailored to your goals</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Weekly study schedule based on your availability</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Prioritized skills ranked by importance</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Burnout prevention strategies</span>
              </li>
            </ul>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="subscribe"
              checked={subscribeNewsletter}
              onChange={(e) => setSubscribeNewsletter(e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="subscribe" className="text-sm text-gray-700">
              I agree to receive my personalized AI learning plan and weekly progress reminders (you can unsubscribe anytime)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save My Plan'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            We respect your privacy. Your email will only be used for your learning plan and progress reminders.
          </p>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => router.push('/plan')}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to my plan
          </button>
        </div>
      </div>
    </div>
  );
}
