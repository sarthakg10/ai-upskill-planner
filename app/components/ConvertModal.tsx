'use client';

import { useState } from 'react';
import { X, Check, Zap, ArrowRight, Users, Award } from 'lucide-react';

interface ConvertModalProps {
  onClose: () => void;
  userName: string;
  targetRole: string;
  completionRate: number;
}

export default function ConvertModal({
  onClose,
  userName,
  targetRole,
  completionRate,
}: ConvertModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'pro',
      name: 'AI-Powered Pro',
      price: '₹499',
      period: '/month',
      description: 'Everything you need to succeed',
      cta: 'Upgrade to Pro',
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Full roadmap with AI adjustments',
        'Calendar sync (Google, Outlook)',
        'Energy tracking & smart scheduling',
        'Weekly progress reports',
        'Chatbot refinement sessions',
        'Email nudges & motivations',
      ],
      badge: 'Most Popular',
      testimonial: {
        name: 'Priya S.',
        role: 'Backend → AI Engineer',
        text: 'Completed my transition 2 months early!',
        avatar: '👩‍💼',
      },
    },
    {
      id: 'premium',
      name: 'Premium + Scaler',
      price: '₹999',
      period: '/month',
      description: 'Everything + guided learning',
      cta: 'Start Premium',
      color: 'from-purple-500 to-pink-500',
      features: [
        'Everything in Pro +',
        'Scaler course integrations',
        '1:1 career consultation calls',
        'Resume optimization AI',
        'Real-time job market alerts',
        'Priority community access',
        'Money-back guarantee',
      ],
      badge: 'Best Value',
      testimonial: {
        name: 'Aditya K.',
        role: 'DevOps → AI Tech Lead',
        text: '₹60L → ₹95L in just 18 months!',
        avatar: '👨‍💼',
      },
    },
  ];

  const handleCheckout = async (planId: string) => {
    setIsProcessing(true);
    // Simulate checkout
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`Upgrading to ${planId} plan`);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between border-b border-indigo-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              You're doing amazing, {userName}! 🚀
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              {completionRate}% through your {targetRole} roadmap
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* CTA Copy */}
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Unlock Your Full Potential
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You've proven you're serious. Now get the tools and guidance to guarantee your transition to {targetRole}.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as 'pro' | 'premium')}
                className={`relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden group ${
                  selectedPlan === plan.id
                    ? 'border-indigo-600 bg-indigo-50 shadow-xl scale-105'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute top-0 right-0 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r ${plan.color}`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 pt-12">
                  {/* Plan Name & Pricing */}
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Cancel anytime</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check
                          size={20}
                          className={`flex-shrink-0 mt-0.5 ${
                            selectedPlan === plan.id
                              ? 'text-indigo-600'
                              : 'text-green-500'
                          }`}
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Testimonial */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                    <div className="text-2xl mb-2">{plan.testimonial.avatar}</div>
                    <p className="text-sm text-gray-900 italic mb-2">
                      "{plan.testimonial.text}"
                    </p>
                    <p className="text-xs font-semibold text-gray-700">
                      {plan.testimonial.name} •{' '}
                      <span className="text-indigo-600">{plan.testimonial.role}</span>
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedPlan === plan.id
                        ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 py-8 border-y border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">2,847+</div>
              <p className="text-sm text-gray-600">Professionals upgraded</p>
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-yellow-400">
                    ⭐
                  </span>
                ))}
                <span className="text-xs text-gray-500 ml-2">(4.9/5)</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">38%</div>
              <p className="text-sm text-gray-600">Faster role transition</p>
              <p className="text-xs text-gray-500 mt-3">vs. self-study</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">₹52L+</div>
              <p className="text-sm text-gray-600">Avg salary increase</p>
              <p className="text-xs text-gray-500 mt-3">within 12 months</p>
            </div>
          </div>

          {/* FAQ / Additional CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Have questions? Our career coaches are here to help.
            </p>
            <button className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center justify-center gap-2 mx-auto">
              <Users size={18} />
              Book a free 15-min consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
