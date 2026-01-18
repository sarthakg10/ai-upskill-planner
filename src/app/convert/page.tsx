'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function ConvertPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    // Simulate API call (no actual backend in this step)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSubmitted(true);
  };

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
            Check Your Inbox! 📧
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Your personalized AI learning plan has been sent to{' '}
            <span className="font-semibold text-blue-600">{email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">What's Next?</h2>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Check your email for your complete 12-week roadmap</span>
              </li>
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

          <div className="space-y-3">
            <button
              onClick={() => router.push('/plan')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View My Plan Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Create New Plan
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-600 hover:underline"
            >
              try again
            </button>
          </p>
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
            Receive your complete personalized roadmap plus weekly progress reminders and exclusive resources
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
              What you'll receive:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Complete 12-week learning roadmap</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Weekly study schedule tailored to your availability</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Skill priorities ranked by importance</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Burnout prevention strategies</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Access to free live AI career class</span>
              </li>
            </ul>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="newsletter"
              checked={subscribeNewsletter}
              onChange={(e) => setSubscribeNewsletter(e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="newsletter" className="text-sm text-gray-700">
              Also send me weekly AI learning tips, industry insights, and exclusive job opportunities (you can unsubscribe anytime)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Me My Plan'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            We respect your privacy. Your email will never be shared with third parties.
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
